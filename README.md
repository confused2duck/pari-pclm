# PCLM live application

This version runs as a hosted application with persistent D1 records and R2 originals. It preserves the supplied PCLM interface while replacing the local Python dependency. Sign-in is managed by the hosting platform; use your authorised ChatGPT account.

The private workspace starts empty. Add your customer/site/equipment, or choose **profile → Load example records** while the fleet is empty to review the complete workflow with labelled examples. There is no shared demo password.

Read [REVIEW.md](REVIEW.md) for the repairs, verification evidence and remaining release requirements. Email/WhatsApp/push providers and the live Pari marketing website are not connected. Private Site access and in-app role membership are separate checks.

## Development and checks

Requires Node 22.13+ and pnpm. Production publication is managed through Sites and `.openai/hosting.json`.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run check
pnpm run build
pnpm run test:worker
```

Schema migrations are under `drizzle/`. Never put credentials in source or the hosting manifest. Customer files and runtime data are held in the hosted bindings, not the source tree.
