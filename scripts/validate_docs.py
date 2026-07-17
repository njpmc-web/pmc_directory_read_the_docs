#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
LANGUAGES = ("ko", "en")
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^)]+)\)")
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)")
TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
PHONE_RE = re.compile(r"(?<!\d)(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}(?!\d)")
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
ALLOWED_DOMAINS = {"example.test"}
MAX_IMAGE_BYTES = 900_000

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
        for alt, target in IMAGE_RE.findall(text):
            if not alt.strip(): errors.append(f"{page}: empty image alt text")
            clean_target = target.split("#", 1)[0]
            asset_offset = clean_target.find("assets/")
            image = (DOCS / clean_target[asset_offset:]).resolve() if asset_offset >= 0 else (page.parent / clean_target).resolve()
            if not image.is_file(): errors.append(f"{page}: missing image {target}")
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

manifest = json.loads((ROOT / "capture/manifest.json").read_text(encoding="utf-8"))
declared = {item["file"] for item in manifest}
for item in manifest:
    image = DOCS / "assets/images" / item["file"]
    if not image.is_file(): errors.append(f"manifest: missing capture {item['file']}")
for image in (DOCS / "assets/images").rglob("*.webp"):
    relative = image.relative_to(DOCS / "assets/images").as_posix()
    if relative not in declared: errors.append(f"undeclared screenshot {relative}")
    if image.stat().st_size > MAX_IMAGE_BYTES: errors.append(f"oversized screenshot {relative}: {image.stat().st_size} bytes")

if errors:
    print("Documentation validation failed:", file=sys.stderr)
    print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
    raise SystemExit(1)
print(f"Documentation validation passed ({len(paths['ko'])} paired pages, {len(manifest)} captures).")
