#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
LANGUAGES = ("ko", "en")
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
HTML_IMAGE_RE = re.compile(r"<img\b([^>]*)>", re.I)
HTML_ATTR_RE = re.compile(r'''\b(src|alt)=["']([^"']*)["']''', re.I)
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)")
TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
PHONE_RE = re.compile(r"(?<!\d)(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}(?!\d)")
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
ALLOWED_DOMAINS = {"example.test"}
MAX_IMAGE_BYTES = 900_000
UNHAPPY_PATH_IMAGES = {
    "auth-otp-expired.png", "auth-otp-invalid.png",
    "phone-change-cancel.png", "phone-change-cancelled.png",
    "phone-change-otp-expired.png", "phone-change-otp-failure.png", "phone-change-otp-invalid.png",
    "photo-family-cancel.png", "photo-family-cancelled.png",
    "photo-family-error-format.png", "photo-family-error-read.png", "photo-family-error-size.png",
}

def resolve_image(page: Path, target: str) -> Path:
    clean_target = target.split("#", 1)[0]
    asset_offset = clean_target.find("assets/")
    return (DOCS / clean_target[asset_offset:]).resolve() if asset_offset >= 0 else (page.parent / clean_target).resolve()

def png_ihdr(image: Path) -> tuple[int, int, int]:
    with image.open("rb") as stream:
        if stream.read(8) != b"\x89PNG\r\n\x1a\n":
            raise ValueError("invalid PNG signature")
        length, chunk = struct.unpack(">I4s", stream.read(8))
        if chunk != b"IHDR" or length != 13:
            raise ValueError("missing PNG IHDR")
        width, height, _depth, color_type, _compression, _filter, _interlace = struct.unpack(">IIBBBBB", stream.read(13))
        return width, height, color_type

errors: list[str] = []
paths = {lang: {p.relative_to(DOCS / lang) for p in (DOCS / lang).rglob("*.md")} for lang in LANGUAGES}
if paths["ko"] != paths["en"]:
    errors.append(f"Translation paths differ: ko-only={sorted(paths['ko']-paths['en'])}, en-only={sorted(paths['en']-paths['ko'])}")

for lang in LANGUAGES:
    titles: dict[str, Path] = {}
    for relative in sorted(paths[lang]):
        page = DOCS / lang / relative
        text = page.read_text(encoding="utf-8")
        page_titles = TITLE_RE.findall(text)
        if len(page_titles) != 1:
            errors.append(f"{page}: expected exactly one H1, found {len(page_titles)}")
        elif page_titles[0] in titles:
            errors.append(f"{page}: duplicate H1 '{page_titles[0]}' (also {titles[page_titles[0]]})")
        else:
            titles[page_titles[0]] = page
        images = list(IMAGE_RE.findall(text))
        for tag in HTML_IMAGE_RE.findall(text):
            attributes = {key.lower(): value for key, value in HTML_ATTR_RE.findall(tag)}
            images.append((attributes.get("alt", ""), attributes.get("src", "")))
        for alt, target in images:
            if not alt.strip(): errors.append(f"{page}: empty image alt text")
            if not target.strip():
                errors.append(f"{page}: image missing src")
                continue
            image = resolve_image(page, target)
            if not image.is_file(): errors.append(f"{page}: missing image {target}")
            if "/member/" in page.as_posix() and image.suffix.lower() == ".webp":
                errors.append(f"{page}: legacy member screenshot {target}")
            if "/member/" in page.as_posix() and image.name in UNHAPPY_PATH_IMAGES:
                errors.append(f"{page}: unhappy-path screenshot {target}")
            if "review-framed" in image.parts and image.is_file():
                try:
                    width, height, color_type = png_ihdr(image)
                    if (width, height) != (454, 920):
                        errors.append(f"{page}: framed image must be 454x920: {target} is {width}x{height}")
                    if color_type not in {4, 6}:
                        errors.append(f"{page}: framed image must have an alpha channel: {target}")
                except (OSError, ValueError, struct.error) as cause:
                    errors.append(f"{page}: invalid framed PNG {target}: {cause}")
        for target in LINK_RE.findall(text):
            if "://" in target or target.startswith("mailto:"): continue
            linked = (page.parent / target).resolve()
            if linked.suffix == "": linked = linked / "index.md"
            if not linked.is_file(): errors.append(f"{page}: broken internal link {target}")
        for email in EMAIL_RE.findall(text):
            if email.rsplit("@", 1)[-1].lower() not in ALLOWED_DOMAINS:
                errors.append(f"{page}: non-fixture email {email}")
        for phone in PHONE_RE.findall(text):
            digits = re.sub(r"\D", "", phone)[-10:]
            if not digits.startswith("20155501"):
                errors.append(f"{page}: non-fixture phone {phone}")

privacy_sources = [ROOT / "capture/manifest.json", *sorted((ROOT / "review").glob("*.html")), *sorted((ROOT / "review").glob("*.js"))]
for source in privacy_sources:
    text = source.read_text(encoding="utf-8")
    for email in EMAIL_RE.findall(text):
        if email.rsplit("@", 1)[-1].lower() not in ALLOWED_DOMAINS:
            errors.append(f"{source}: non-fixture email {email}")
    for phone in PHONE_RE.findall(text):
        digits = re.sub(r"\D", "", phone)[-10:]
        if not digits.startswith("20155501"):
            errors.append(f"{source}: non-fixture phone {phone}")

manifest = json.loads((ROOT / "capture/manifest.json").read_text(encoding="utf-8"))
required_manifest_keys = {"id", "flow", "route", "state", "viewport", "fixtureVariant", "documentationTarget", "publication"}
ids: set[str] = set()
for item in manifest:
    missing = required_manifest_keys - item.keys()
    if missing: errors.append(f"manifest: {item.get('id', '<unknown>')} missing {sorted(missing)}")
    if item.get("id") in ids: errors.append(f"manifest: duplicate id {item.get('id')}")
    ids.add(item.get("id"))
    if item.get("viewport", {}).get("width") == 390 and item.get("flow") != "admin" and item.get("viewport", {}).get("height") != 844:
        errors.append(f"manifest: {item.get('id')} must use 390x844")
    for target in item.get("documentationTarget", {}).values():
        if not (DOCS / target).is_file(): errors.append(f"manifest: {item.get('id')} missing documentation target {target}")
    if item.get("publication") not in {"manual", "board-only"}:
        errors.append(f"manifest: {item.get('id')} has invalid publication")

manual = [item for item in manifest if item.get("publication") == "manual"]
declared = {item["file"] for item in manual}
for item in manual:
    if not item.get("file") or not item.get("screen"):
        errors.append(f"manifest: manual entry {item['id']} requires file and screen")
        continue
    image = DOCS / "assets/images" / item["file"]
    if not image.is_file(): errors.append(f"manifest: missing capture {item['file']}")
for image in (DOCS / "assets/images").rglob("*.webp"):
    relative = image.relative_to(DOCS / "assets/images").as_posix()
    if relative not in declared: errors.append(f"undeclared screenshot {relative}")
    if image.stat().st_size > MAX_IMAGE_BYTES: errors.append(f"oversized screenshot {relative}: {image.stat().st_size} bytes")

private_screenshots = ROOT / "screenshots"
tracked = set(subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.splitlines())
tracked_screenshots = [path for path in private_screenshots.rglob("*") if path.is_file() and path.relative_to(ROOT).as_posix() in tracked]
if tracked_screenshots: errors.append(f"private screenshots are tracked: {tracked_screenshots}")

if errors:
    print("Documentation validation failed:", file=sys.stderr)
    print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
    raise SystemExit(1)
print(f"Documentation validation passed ({len(paths['ko'])} paired pages, {len(manual)} publishable captures, {len(manifest)} registry entries).")
