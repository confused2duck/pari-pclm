# Deploy PCLM to Vercel

## Why the previous build failed

The repository includes a Next.js dependency, so Vercel selected its Next.js builder. The previous `build` command ran Vinext, which generated a Cloudflare Worker rather than `.next/routes-manifest.json`. Changing Output Directory to `dist` does not port the Worker or supply its storage and identity bindings.

`vercel.json` now selects Next.js explicitly, runs `pnpm run build:vercel`, and uses `.next`. That command bundles the private upload browser SDK and runs a real `next build --webpack`. Node is pinned to 22.x. The original Worker sources are retained for reference. The existing Sites deployment is separate and is not changed by this Vercel migration.

## Required service configuration

The Vercel deployment uses the same PCLM business rules and database schema with adapters for these services:

| Vercel environment key | Set up |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk application publishable key |
| `CLERK_SECRET_KEY` | Matching Clerk server key; mark sensitive |
| `PCLM_OWNER_EMAIL` | Your administrator email. Only this verified address may initialize the empty workspace. |
| `TURSO_DATABASE_URL` | Remote Turso/libSQL database URL |
| `TURSO_AUTH_TOKEN` | Database credential; mark sensitive |
| `BLOB_READ_WRITE_TOKEN` | Token for a **private** Vercel Blob store; mark sensitive |

Add these keys to the intended Vercel project and environments. Use separate development/preview data where appropriate. Configure Clerk's allowed production domain, email verification, and sign-in/sign-up paths `/sign-in` and `/sign-up`. Clerk must verify the primary email; browser-supplied identity headers are stripped and never authenticate a request. Do not put secret values in GitHub or paste them into chat.

No provider is provisioned by this source change. Connect the providers through the Vercel dashboard/Marketplace or your provider account, checking their plan terms before creating resources. A missing connection produces a `503 setup_required` response and names the missing keys. It does not open a demo workspace.

## Apply the database schema

After linking your checkout to the correct Vercel project and verifying the required environment keys:

```sh
vercel env pull .env.local
node --env-file=.env.local scripts/migrate-vercel.mjs --apply
node --env-file=.env.local scripts/migrate-vercel.mjs
```

The first command that applies schema is explicitly `--apply`. Migration statements and their checksum receipt execute together in a write transaction. Re-running skips completed migrations and refuses a changed applied migration. The read-only check should list all seven `pclm_` tables.

## Build and publish

Keep Framework Preset **Next.js**, Root Directory the repository root, Build Command `pnpm run build:vercel`, and Output Directory `.next` (or let committed `vercel.json` select them). Remove any dashboard override that still invokes Vinext directly. Push/redeploy the newest `main` commit, not the old `f494102` deployment. Run:

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm run test:vercel
pnpm run build:vercel
```

Native Next.js serves every retained PCLM HTML page through a server route. Uploaded bytes go directly from the browser to private Blob storage to support the existing 20 MB maximum without crossing Vercel's function request-body limit. The server authorizes a scoped, short-lived upload token, verifies size/checksum on finalization, and serves downloads only after record access checks. Offline attachments use the same upload path when reconnecting.

## First use and acceptance

1. Sign in/sign up through Clerk with the verified `PCLM_OWNER_EMAIL` address.
2. The first owner creates a new empty workspace. Existing Sites data and original file bytes are **not** automatically transferred to these new providers.
3. Load labeled examples from the administrator profile if needed, or add customer/site/equipment records.
4. Invite other accounts in Users & Roles; they must sign in with the invited verified email. Vercel deployment protection may separately restrict their access.
5. Verify health, actual sign-in/out, owner/customer/technician access, create/save/reload, uploads/downloads, approvals, inventory and the workflows you use on supported devices.

Email/WhatsApp/push integrations remain unconfigured. This migration has no production service credentials in the source tree. Local adapter and build checks do not certify external-provider setup or browser acceptance on your Vercel deployment.
