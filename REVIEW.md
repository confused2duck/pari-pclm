# PCLM code review and repair record

Reviewed 20 October 2026. This review covers the active hosted implementation and the retained PCLM interface. The original PHP/Laravel archive is not the deployed runtime.

## Findings and repairs

| Priority | Finding | Repair and verification |
| --- | --- | --- |
| P1 | The previous package required a running local Python server. Static/file previews could show a screen without its API. | Hosted Worker serves the HTML and injects authenticated bootstrap data; durable database and object storage replace local runtime files. Built-runtime tests request all 36 application pages and critical scripts. |
| P1 | Plant preference was restored after an API response rather than at initial page load. | Restore the selected permitted plant before computing page data. Controller test verifies navigation retains selection. |
| P1 | Fast successive edits reused stale row versions. | Rebase queued edits only onto acknowledged versions from the same client's successful writes. Competing users' changes still cause conflicts. Rapid-save and concurrency tests cover both cases. |
| P1 | A lost response could lead to duplicate mutation attempts. | Stable transaction identifiers, payload hashes and a durable receipt ledger prevent double application. Command actions also require the displayed record version. |
| P1 | Server errors could be obscured by a following refresh/success status. | Keep the error visible after refreshing authoritative data; display an application-load failure with a working reload action rather than leaving inert controls. |
| P1 | Approved engineering decisions needed protection independent of UI controls. | Server validates approval roles, immutable approved records, checklist snapshots, commissioning evidence and handover prerequisites. |
| P1 | Uploaded files needed durable storage and coherent metadata. | R2 stores original bytes. Database metadata tracks uploading/ready state, ownership, hashes and references. File IDs cannot overwrite originals; referenced files cannot be deleted. |
| P1 | Stock totals could diverge from movement history. | Receipts are versioned commands, over-receipts are rejected, stock changes must balance new movements, and movement history is immutable. Opening balances are recorded. |
| P1 | Example identities/passwords were unsuitable for live access. | Use Sites-managed ChatGPT identity and explicit workspace membership. No shared demo password is deployed. Invitation tokens are hashed, expire, match the signed-in email and are single-use. |
| P1 | Customer and technician access needed server enforcement. | Filter reads, validate writes and file access by membership, customer, site and assignment. API tests use separate identities and reject out-of-scope records and actions. |
| P2 | Reference selectors allowed combinations that the server would reject. | Filter dependent customer/site/equipment/document selections and guide users to missing prerequisite records. |
| P2 | Customer detail controls exposed engineering actions that could only fail. | Show actions according to the current role; server permission checks remain authoritative. |
| P2 | Checklist limits, conditional items and RCA structure could not rely on client validation. | Server checks responses, recomputes measurement failures, requires failed-item evidence and rejects cyclic component/fault-tree hierarchies. |
| P2 | Empty and newly added assets could appear to have a verified health score. | New assets remain unassessed. Empty fleets show no assessed score. Fabricated mini-trends are removed; only recorded score history can be plotted. |
| P2 | Original mobile shell reserved space for a hidden sidebar. | Retain the additive mobile grid and horizontally scrollable table corrections. |
| P2 | Native downloads needed a robust document link. | Append, click and remove the download anchor; retain exact upload bytes and working CSV/PDF generation. |

## Deployment shape

- One private Pari workspace, with customer/site/technician scopes inside it.
- D1 stores normalized records, workspace revisions, memberships, hashed invitations, file metadata, audit records and transaction receipts.
- R2 stores original files and record snapshots after changes. Workspace JSON exports contain records, not original file bytes.
- Mutations use atomic database batches with a workspace revision guard, CSRF checks and same-origin validation.
- Existing visual tokens and layouts are retained. Sign-in uses the hosted identity provider instead of inactive Google/Microsoft/password controls.
- The initial workspace is empty, with one editable customer and site. Example records can be loaded explicitly from the administrator profile while the fleet is empty.

## Verification evidence

1. `verification/runtime-results.txt`: 27 workflow/controller subtests, plus the parent suite, passing. Covers enquiry → quotation → customer decision → contract → engineering → handover → service → customer acceptance; also inspection, PM, supply, modernization, permissions, rollback, concurrency and idempotency.
2. `verification/worker-results.txt`: tests the actual compiled Worker in workerd with D1/R2. Requests all 36 application pages, validates bootstrap/script serving and exercises a database write/read through HTTP requests.
3. `pnpm run check`: TypeScript check passed.
4. `pnpm run build`: production build passed.
5. All 82 explicit UI action references resolve to actual registered handlers, and all application Alpine controllers initialise in the controller-contract test.

## Verification limits and external connections

The available managed hosting environment does not expose its required browser-control capability. No fresh browser click-through or visual QA is claimed for this hosted revision. The API/compiled-runtime/controller checks above are distinct from browser interaction tests. A production URL and passing tests do not certify every browser, input or business process.

The Site starts owner-private. Customer/technician invitations also require that the person has access through the Site's sharing settings; workspace membership does not override the platform access gate. The deployment does not silently make customer records public.

Email, WhatsApp and push providers are not configured. Invitation links are usable directly; the outbox reports their actual state. The webhook test makes a real HTTPS delivery only when a webhook URL is configured. External delivery controls identify their connection requirement instead of claiming delivery. The live parisolutions.in marketing website, DNS, ERP, payments and IoT systems have not been changed.

Before using live operational data, complete browser acceptance on your supported devices, authorize the intended users through Site sharing, configure the required delivery providers, and confirm your retention/recovery process. These are explicit remaining release requirements, not completed checks.

## Vercel migration correction — 20 October 2026

The GitHub snapshot initially used the Sites/Vinext build. Vercel's Next.js autodetection then required `.next/routes-manifest.json`, which that build cannot generate. The native Vercel target now runs Next.js, serves the retained pages with a catch-all server route, and traces the HTML into the function package. Explicit Vercel settings override framework/output detection. Node is pinned to 22.x.

Vercel runtime adapters use Turso/libSQL atomic write batches, private Vercel Blob storage and verified Clerk identity. Internet-supplied Sites identity headers are stripped. The configured owner email gates first workspace creation, and original file uploads use scoped, short-lived browser upload tokens plus server checksum verification. Browser session refresh is initialized on retained HTML pages. Missing integrations fail closed with setup guidance.

Verification: native Next.js production build and TypeScript check pass; 27 existing workflow/controller subtests also pass against the actual libSQL client with a local database; nine Vercel integration subtests pass, covering all 36 pages, owner gate, forged identity, batch rollback, upload authorization, 6 MB original bytes, tampering, missing configuration and storage labels. These are runtime/adapter tests, not external Turso, Blob or Clerk service acceptance tests.

Production provider credentials, live schema migration and Vercel browser sign-in remain unverified. The Vercel account connection currently returns no teams and cannot inspect the user's new deployment. See VERCEL.md for the six required configuration keys.
