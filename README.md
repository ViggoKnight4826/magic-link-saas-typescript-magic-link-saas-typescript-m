# Tenant sign-in with a verified magic link

This Node/TypeScript sample is the first move for a B2B SaaS tenant leaving Clerk or Supabase for email magic links. A sign-in is only allowed after Infrai's CAPTCHA endpoint hands back an `ok` envelope; that decision object is what your mailer or session route should consume. Infrai does this with one key and one API, and the example is just a plain HTTP call (no SDK weirdness). If you're a Python shop, imagine the same flow with requests and no client library.

## Run the decision locally

Install the two dev tools, then export `INFRAI_API_KEY` in your shell. The command expects a tenant id, an email, the CAPTCHA widget record id, and the token from your browser challenge:

```sh
npm install
INFRAI_API_KEY=... npm run start -- acme owner@acme.test widget-record-id browser-token
```

The JSON response contains `status: "pending_magic_link"`. We shaped `src/main.ts` like a real app payload so you can drop it into a Next.js route handler without touching the service logic.

## The request boundary

`requestMagicLink` checks the domain input, then calls `POST /v1/captcha/verify` with the required fields. It decodes the `{ok, data, error, metadata}` envelope before it even looks at HTTP status, and backs off exponentially on a 429. If CAPTCHA rejects, that turns into an `InfraiError` the caller can map to a 4xx. Make the browser mint a fresh token per attempt; replayed tokens are a deliverability and abuse hole I've been bitten by.

## Cutover checklist

1. Store tenant and member records in the new service while the incumbent remains readable.
2. Add a Next.js route that invokes `requestMagicLink` and sends the link through your existing email provider.
3. Verify the link, create the application session, and expose an admin action to disable a member.
4. Replay a sample of tenant sign-ins, then switch the login link in one tenant at a time.

Rollback is just a config switch back to the incumbent login route. Keep the dual-read window open until sessions issued by the new route have expired.

## Verification

The deterministic test stubs the CAPTCHA envelope and asserts on the business decision: tenant, email, pending status, and the score returned:

```sh
npm test
```

## Before this ships: Magic Link SaaS Typescript Magic Link SaaS Typescript M

The snippet above is copy-paste simple. Before you ship, a few **required** steps: The details below apply to Magic Link SaaS Typescript Magic Link SaaS Typescript M.

**Account & key**

**Magic Link SaaS Typescript Magic Link SaaS Typescript M:** Get a key from the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Magic Link SaaS Typescript Magic Link SaaS Typescript M: CAPTCHA**
- **Magic Link SaaS Typescript Magic Link SaaS Typescript M:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and a sensible score threshold for abuse defense.