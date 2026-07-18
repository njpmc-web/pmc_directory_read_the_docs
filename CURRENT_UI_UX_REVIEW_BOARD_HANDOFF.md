# Current UI/UX Review Board Handoff

Date: 2026-07-17  
Application repository: `../pmc_directory`  
This document: `pmc_directory_read_the_docs/CURRENT_UI_UX_REVIEW_BOARD_HANDOFF.md`

## Purpose

The review board provides a privacy-safe catalog of the **current member UI** at an iPhone 14 logical viewport of 390 × 844 CSS pixels.

It is intended for:

- reviewing the current member workflows before requesting UI/UX changes;
- comparing related states together on a desktop canvas;
- testing 320px, 390px, and 430px mobile behavior;
- providing stable fixture URLs for future Read the Docs screenshots;
- discussing additional workflows without exposing real member data.

The board is deliberately **Current UI only**. It does not contain a “Proposed” or “정돈된 시스템” column.

## Source-of-truth decision

The production Next.js implementation is the visual source of truth. The board does not reconstruct the application from screenshots.

- Login screens render the real `LoginForm` component.
- Login page framing follows the production route layout, while the form itself is the real `LoginForm` component.
- Administrator-confirmation screens render the real `NonmemberLookupForm` and `GoogleAddressAutocomplete` components inside the production route framing.
- Family screens render the real `FamilyProfile` component.
- Family fixtures render the real `FamilyProfile` component inside the same production layout classes.
- Existing edit buttons, photo controls, verification indicators, request cards, and cancellation dialogs therefore retain production markup and styles.

The private screenshots `IMG_7353.PNG`–`IMG_7359.PNG` were used only to verify scale, scrolling position, browser context, and visible states. They are not embedded in the board or copied into public assets.

## Running the board

From `pmc_directory`:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000/review
```

The old documentation-repository page at `pmc_directory_read_the_docs/review/` redirects to this application route.

In production builds, review fixtures return 404 unless explicitly enabled:

```text
ENABLE_REVIEW_FIXTURES=true
```

Do not enable the fixture routes in the public production deployment unless a reviewed use case requires it.

## Desktop board behavior

The board shows multiple current screens in each desktop row:

- approximately four screens per row at 60% on a 1440px desktop;
- approximately three screens per row at 75%;
- approximately three screens per row at 100%, depending on available width.

Available display controls:

- 60%
- 75% (default)
- 100%
- flow filter
- screen ID/title search
- direct “open screen” link

Zoom changes only the desktop presentation. Every iframe remains logically 390 × 844. Zoom controls use URL-backed links, for example:

```text
/review?zoom=0.6
/review?zoom=0.75
/review?zoom=1
```

This URL-backed approach remains usable while the live application iframes are loading and does not depend on the parent board hydrating first.

## Stable screen URLs

Each state is available independently:

```text
http://127.0.0.1:3000/review/screen?id=<screen-id>
```

### Authentication

| Screen ID | State |
| --- | --- |
| `auth-phone-empty` | Empty phone login |
| `auth-phone-complete` | Completed phone input and active submit button |
| `auth-otp-sent` | OTP entry with sent-success feedback |
| `auth-otp-entry` | Empty six-digit OTP entry |
| `auth-otp-invalid` | Invalid OTP feedback |
| `auth-otp-expired` | Expired OTP feedback |
| `auth-email` | Email login |
| `auth-email-otp` | Email OTP with a long fixture address |
| `auth-unregistered` | Unregistered-number recovery link |

### 관리자 확인요청

| Screen ID | State |
| --- | --- |
| `lookup-phone` | Prefilled unregistered phone and interactive fixture workflow start |
| `lookup-otp-sent` | OTP sent success feedback |
| `lookup-otp-entry` | OTP entry prefilled with the valid fixture code `123456` |
| `lookup-profile-empty` | Empty profile after phone verification |
| `lookup-profile-filled` | Completed profile with manual synthetic address |
| `lookup-profile-searching` | Debounced candidate search in progress |
| `lookup-profile-candidates` | Matching candidate selected |
| `lookup-submitting` | Locked request submission in progress |
| `lookup-success` | Request number and successful receipt feedback |

### Family information

| Screen ID | State |
| --- | --- |
| `family-summary` | Family header, household summary, and first member card |
| `family-members` | Multiple adult/child member cards, automatically positioned at the member-card section |
| `family-long-values` | Long email and address wrapping |

### Editing and verification

| Screen ID | State |
| --- | --- |
| `phone-change-edit` | New phone number in the real inline editor |
| `phone-change-verify-now` | Verify-now/verify-later confirmation modal with a review-only blue circle and hand pointer on “나중에 하기,” indicating continuation to the next screen |
| `phone-change-verify-later` | Deferred-verification success modal |
| `phone-change-pending-unverified` | Pending request with a review-only blue circle and hand pointer on the actionable Unverified status |
| `phone-change-pending-verify-now` | Confirmation modal after selecting Unverified, with a review-only blue circle and hand pointer on “지금 인증” |
| `phone-change-otp-sent` | OTP sent success feedback |
| `phone-change-otp-entry` | Phone-change OTP modal prefilled with the valid six-digit fixture code `123456` |
| `phone-change-otp-success` | Successful verification with a review-only neutral arrow descending from above to the Verified request badge |
| `phone-change-otp-invalid` | Invalid OTP feedback |
| `phone-change-otp-expired` | Expired OTP feedback |
| `phone-change-otp-resent` | OTP resend success feedback |
| `phone-change-otp-failure` | OTP send failure and retry control |
| `phone-change-pending-verified` | Pending request with Verified status |
| `phone-change-cancel` | Real cancellation confirmation for a phone request |
| `phone-change-cancelled` | Cancelled phone request and success feedback |
| `family-pending` | Overview of pending field and photo requests |
| `edit-verification` | Overview of pending phone/email verification indicators |

### Photos

| Screen ID | State |
| --- | --- |
| `photo-family` | Real family-photo control |
| `photo-family-select` | Empty family-photo selection workflow |
| `photo-family-crop` | Real 4:3 Cropper.js editor with pan, resize, zoom, rotation, and reset controls |
| `photo-family-selected` | Cropped-photo preview and replacement control |
| `photo-family-notes` | Selected photo with an optional request note |
| `photo-family-uploading` | Locked upload-in-progress state |
| `photo-family-error-format` | Unsupported file-format validation error |
| `photo-family-error-size` | Source-file size validation error |
| `photo-family-error-read` | Unreadable or damaged-image validation error |
| `photo-family-success` | New family-photo request success feedback |
| `photo-family-pending` | Pending family-photo request and Requested thumbnail |
| `photo-family-replace` | Replacement of an already-pending family-photo request |
| `photo-family-replace-success` | Pending-request replacement success feedback |
| `photo-family-cancel` | Real cancellation confirmation dialog for the pending photo request |
| `photo-family-cancelled` | Cancelled family-photo request and success feedback |
| `photo-member` | Real member-photo and requested-photo controls |
| `photo-member-select` | Real member-photo request screen immediately before the native picker |
| `photo-member-crop` | Real 3:4 Cropper.js editor with a fictional photo preloaded, corresponding to `IMG_7372.PNG` |
| `photo-member-selected` | Real cropped preview and Crop/photo-change controls corresponding to `IMG_7373.PNG` |

### Request history

| Screen ID | State |
| --- | --- |
| `requests-statuses` | Pending, acknowledged, verified, and rejected requests |
| `requests-cancel` | Request history with the real Cancel action available |
| `requests-feedback` | Pending request feedback context |

## Current interaction coverage

The board currently provides stable starting states and real interactive controls. Some modal states are intentionally reached through the production interaction rather than duplicated as separate markup:

- `phone-change-edit` opens the real phone inline editor directly, so a separate unchanged screen that only highlights the `수정` button is not included.
- On `photo-family`, select the family camera control to inspect the family-photo workflow. The complete workflow also has deterministic URLs from `photo-family-select` through `photo-family-cancelled`, including the real cropping UI.
- On `photo-member`, select a member camera control to inspect the member-photo workflow. Deterministic app-owned states are also available at `photo-member-select`, `photo-member-crop`, and `photo-member-selected`.
- On `requests-cancel`, select `Cancel` to inspect the real cancellation confirmation dialog.
- The complete phone-number change workflow has deterministic URLs from `phone-change-edit` through `phone-change-cancelled`. These screens initialize the real inline editor, verification-choice dialog, OTP modal, status badges, deferred-verification dialog, and cancellation dialog. Review interactions use only fixture endpoints; entering `123456` completes OTP verification in fixture mode.
- Email verification indicators use the actual production components.
- The clean 관리자 확인요청 workflow has deterministic URLs from `lookup-phone` through `lookup-success`. `lookup-phone` is also interactive: review-mode OTP and candidate matching are simulated locally, `123456` is accepted, and submission returns synthetic request `#2051`. Candidate states use the production card, radio, badge, address, loading, and feedback UI. Error, expiration, no-match, and candidate-without-selection states are intentionally deferred to a later pass.

Follow-up work may make remaining interaction results deterministic on initial load, for example dedicated URLs that automatically open the inline editor and verification dialogs. This should be done by driving or initializing the real components—not by creating lookalike HTML.

### Native iOS photo-picker boundary

`IMG_7369.PNG`, `IMG_7370.PNG`, and `IMG_7371.PNG` show UI owned by iOS/Safari: the file-source action sheet, Photos library, and system photo confirmation preview. A webpage cannot deterministically initialize those operating-system screens inside a review-board iframe, and the private screenshots are not embedded or copied into public assets. `photo-member-select` represents the real web-app handoff into that native sequence. After the user returns from iOS, `photo-member-crop` and `photo-member-selected` represent the real app-owned states shown in `IMG_7372.PNG` and `IMG_7373.PNG`, using fictional local artwork.

## Synthetic fixture policy

Review fixtures use only:

- fictional Korean names;
- `example.test` email addresses;
- reserved synthetic phone values in the `201-555-01xx` range;
- generic sample addresses;
- fixture IDs and request numbers;
- locally generated SVG illustrations under `public/review/`.

The fixture routes must not call production APIs. Fixture-aware login and 관리자 확인요청 actions simulate local state changes. Family fixture endpoints point to non-production `/api/review-fixture/...` paths so accidental submissions cannot reach member endpoints.

## Files added or refactored

### Application repository

- `app/review/page.tsx` — development-only review route.
- `app/review/review-board.tsx` — responsive multi-screen Current UI board.
- `app/review/screen/page.tsx` — stable 390 × 844 fixture screen route.
- `app/review/fixtures.ts` — screen registry and synthetic member/request fixtures.
- `app/login/login-form.tsx` — optional fixture initial state and inert fixture actions.
- `app/nonmember-lookup/nonmember-lookup-form.tsx` — optional deterministic 관리자 확인요청 states and local-only review interactions.
- `app/components/google-address-autocomplete.tsx` — optional initial review value while preserving normal production behavior when omitted.
- `app/family/family-profile.tsx` — optional family-photo fixture initialization; production behavior is unchanged when omitted.
- `app/components/photo-upload-card.tsx` — optional synthetic crop/preview sources for deterministic real-component states.
- `app/components/cancel-request-button.tsx` — optional initial-open state for deterministic confirmation-dialog review.
- `app/components/phone-request-verification.tsx` — optional synthetic OTP state for deterministic real-modal review without production API calls.
- `app/family/family-profile.tsx` — optional phone-change fixture initialization for editing, confirmation, deferred verification, OTP, pending, success, and cancellation states.
- `app/api/review-fixture/[[...path]]/route.ts` — development-only synthetic submit/cancel responses.
- `public/review/*.svg` — fictional local photo illustrations.

The production `/login`, `/login-email`, `/nonmember-lookup`, and `/family` route files are unchanged. `LoginForm`, `NonmemberLookupForm`, `GoogleAddressAutocomplete`, `FamilyProfile`, `PhotoUploadCard`, and `CancelRequestButton` expose optional fixture interfaces; when those props are absent, normal authentication, lookup, photo, request, and API behavior is unchanged.

### Documentation repository

- `screenshots/` is git-ignored and remains private.
- `capture/manifest.json` contains stable review/capture metadata.
- Capture automation processes only entries with `publication: "manual"`.
- Documentation validation checks registry structure, fixture contact domains/ranges, and accidental tracked private screenshots.
- `review/index.html` redirects to the real application review board.

Existing public manual screenshots were not replaced during this work.

## Verification completed

- TypeScript: `npm run typecheck`
- Application diff formatting: `git diff --check`
- Documentation/privacy registry validation: `npm run check`
- Strict MkDocs build completed successfully during the initial review-board work.
- Existing documentation Playwright suite: 3 tests passed.
- Login and family fixture screens were visually inspected at 390 × 844.
- The family-photo crop editor, selected-photo state, and cancellation dialog were browser-verified at 390 × 844.
- The member-photo selection handoff, real 3:4 crop editor, and selected-photo Crop control were browser-verified at 390 × 844 against `IMG_7369.PNG`–`IMG_7373.PNG`.
- The review-only family-photo submit and cancellation endpoints were verified with synthetic responses.
- The complete phone-change registry, fixture-only OTP behavior, and all stable screen routes were type-checked in the application.
- The clean 관리자 확인요청 registry and fixture-only OTP/candidate/submission behavior were type-checked and browser-verified end to end at 390 × 844 without production API calls.
- Desktop board was visually inspected at 1440px with three screens in a row.
- URL-backed 60% zoom was browser-tested and displayed a 390 × 844 frame at 234 × 506.4 pixels.

## Recommended next work

1. Add deterministic real-component URLs for inline editing, verification dialogs, member-photo dialogs, and remaining cancellation workflows.
2. Add current UI workflows not yet represented, such as request-detail screens that become documentation targets.
3. Add Playwright coverage in the application repository for board filtering, search, zoom, exact logical viewport size, and deterministic state activation.
4. Add a capture script that reads stable screen IDs and writes approved screenshots to the documentation repository.
5. Review and approve each screen before changing existing public manual screenshots.

## Simple prompts for future workflow requests

Use one of these prompts in a new conversation. They contain enough context even when the previous conversation is unavailable.

### General prompt

```text
In /Users/jshin/Documents/pmc_directory, add the complete <workflow name> workflow to the Current UI review board at /review.

Use the real production components and synthetic fixture data. Include the normal path and all meaningful verification, success, error, expiration, cancellation, and pending states that apply. Give each state a stable /review/screen?id=... URL, add it to the multi-screen desktop board, keep the logical viewport at 390×844, preserve the 60%/75%/100% controls, and do not call production APIs or use real member data.

Use /Users/jshin/Documents/pmc_directory_read_the_docs/CURRENT_UI_UX_REVIEW_BOARD_HANDOFF.md as the implementation reference. Test the workflow and update both copies of the handoff document.
```

Only replace `<workflow name>`.

### Phone-number change

```text
In /Users/jshin/Documents/pmc_directory, add the complete phone-number change workflow to the Current UI review board at /review.

Use the real production phone-edit and verification components with synthetic data. Include editing, verify-now, verify-later, OTP entry, invalid and expired codes, resend, success, failure, pending verified/unverified, and cancellation states. Give every state a stable review URL, add them to the desktop board, preserve 390×844 frames and 60%/75%/100% controls, and never call production APIs.

Use /Users/jshin/Documents/pmc_directory_read_the_docs/CURRENT_UI_UX_REVIEW_BOARD_HANDOFF.md as the reference. Test the workflow and update both handoff documents.
```

### Email change

```text
In /Users/jshin/Documents/pmc_directory, add the complete email-change and verification workflow to the Current UI review board at /review.

Reuse the real production components, use example.test fixture addresses, cover all normal, verification, error, expiration, success, pending, and cancellation states, and create stable review URLs for each state. Do not call production APIs. Preserve the existing board layout, 390×844 frames, and zoom controls. Test the workflow and update both handoff documents.
```

### Family photo change

```text
In /Users/jshin/Documents/pmc_directory, add the complete family-photo change workflow to the Current UI review board at /review.

Reuse the real production photo components with fictional local assets. Cover selection, cropping, replacement, notes, upload progress, validation errors, success, pending request, replacement of a pending request, and cancellation. Do not upload to production storage or call production APIs. Add stable URLs for every state, preserve 390×844 frames and zoom controls, test the workflow, and update both handoff documents.
```

### Member photo change

```text
In /Users/jshin/Documents/pmc_directory, add the complete member-photo change workflow to the Current UI review board at /review.

Reuse the real production member-photo components with fictional local assets. Include member selection, photo selection, cropping, notes, upload progress, errors, success, pending replacement, and cancellation. Use stable review URLs and synthetic data only; do not call production APIs or storage. Preserve the board layout, 390×844 frames, and zoom controls. Test it and update both handoff documents.
```

### Request cancellation

```text
In /Users/jshin/Documents/pmc_directory, add the complete request-cancellation workflow to the Current UI review board at /review.

Reuse the real production request and cancellation components. Include cancellable, confirmation-dialog, cancelling, success, failure, already-processed, cancelled, and delete-record states where applicable. Use synthetic requests and review-only behavior, never production APIs. Add stable URLs, preserve 390×844 frames and zoom controls, test the workflow, and update both handoff documents.
```

## Template for requesting additional workflow UI/UX review

Copy and edit this request:

```text
Use docs/2026-07-17-current-ui-ux-review-board.md as the current implementation reference.

Add a Current UI/UX review flow for: <workflow name>.

Requirements:
- Reuse the real production components; do not recreate the UI from screenshots.
- Use synthetic fixture data that follows the existing privacy policy.
- Add stable /review/screen?id=<id> URLs for every meaningful state.
- Add the states to the multi-screen /review desktop board.
- Keep every logical mobile viewport at 390 × 844.
- Preserve the 60%, 75%, and 100% desktop display controls.
- Use screenshots only for scale and state validation; never embed private screenshots.
- Do not add a Proposed column unless explicitly requested.
- Document which states are directly initialized and which require interaction.
- Typecheck and visually verify the new screens.

Workflow states to cover:
1. <state>
2. <state>
3. <state>

Future Read the Docs targets:
- Korean page: <path>
- English page: <path>
```

Korean shorthand:

```text
docs/2026-07-17-current-ui-ux-review-board.md를 기준으로 <workflow>의 Current UI/UX 검토 화면을 추가해 주세요. 실제 production component만 재사용하고, synthetic fixture data와 안정적인 /review/screen?id=... URL을 제공해 주세요. 390×844 viewport와 60%/75%/100% board controls를 유지하고 Proposed 화면은 추가하지 마세요.
```
