# PMC Directory User Manual

Official Korean/English end-user documentation for PMC Directory, built with MkDocs Material and published on Read the Docs.

## Local preview

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdocs serve
```

Run the same strict checks used by CI:

```bash
python scripts/validate_docs.py
mkdocs build --strict
```

## Refresh screenshots

Screenshots contain only synthetic fixture data. The self-contained fixture at `capture/fixture.html` has no authentication, network, or application-data dependency:

```bash
npm ci
npm run capture
```

`capture/manifest.json` is the shared registry for review states and future captures. Only entries with `publication: "manual"` are written into the public manual; `board-only` entries never enter the capture job. The fixture is local-only and never reads authentication, network, or Supabase data. It is not copied into the built MkDocs site.

## Member flow review board

The current-UI review board is rendered from the real production components in the sibling `pmc_directory` project. Run `npm run dev` there and open `http://127.0.0.1:3000/review`. Stable fixture screen URLs under `/review/screen?id=...` are intended to become future documentation capture targets.

Private reference captures belong only in the git-ignored `screenshots/` directory. They are used for scale and state validation and are never embedded in review or documentation assets.

## Translation workflow

Every Markdown file under `docs/ko` must have the same relative path under `docs/en`. Update both versions in one pull request. `scripts/validate_docs.py` rejects path drift, broken local links, missing/oversized screenshots, empty image alt text, duplicate H1 titles, and contact strings outside the synthetic allowlist.

## Release workflow

1. Merge paired Korean/English changes to `main`; CI publishes that branch as Read the Docs `latest`.
2. Run the strict checks locally.
3. Tag a reviewed release (`git tag -s vX.Y.Z` when signing is configured, otherwise an annotated tag).
4. Push the tag. Read the Docs builds the activated release as `stable`; keep `stable` as the project default.

Initial public repository: `https://github.com/njpmc-web/pmc_directory_read_the_docs`  
Read the Docs project: `https://pmc-directory-read-the-docs.readthedocs.io/`.
