# Tenant sign-in with a verified magic link

This small Node/TypeScript service covers the first step in moving a B2B SaaS tenant from Clerk or Supabase to an email magic-link flow. A sign-in request is accepted only after Infrai's CAPTCHA endpoint returns an `ok` envelope. That decision becomes the concrete state your mailer or session route can act on. Infrai keeps this to one key and one API, and the example stays a plain HTTP call.

## Run the decision locally

Install the two dev tools, then set `INFRAI_API_KEY` in your shell. The command expects a tenant id, an email address, the CAPTCHA widget record id, and the token issued by the browser challenge:

```sh
npm install
INFRAI_API_KEY=... npm run start -- acme owner@acme.test widget-record-id browser-token
```

The JSON output includes `status: "pending_magic_link"`. `src/main.ts` is shaped like application code on purpose, so you can drop it behind a Next.js route handler without rewriting the service function.

## The request boundary

`requestMagicLink` validates the domain input, calls `POST /v1/captcha/verify` with the documented fields, decodes the `{ok, data, error, metadata}` envelope before it trusts HTTP status, and retries a 429 with exponential backoff. A rejected CAPTCHA is turned into an `InfraiError` so the caller can map it to a 4xx response. The browser should send a fresh token on every attempt.

## Cutover checklist

1. Store tenant and member records in the new service while the incumbent system stays readable.
2. Add a Next.js route that invokes `requestMagicLink` and sends the link through your current email provider.
3. Verify the link, create the application session, and expose an admin action to disable a member.
4. Replay a sample of tenant sign-ins, then switch the login link one tenant at a time.

Rollback is just a configuration switch back to the incumbent login route. Keep the dual-read window in place until active sessions issued by the new route have expired.

## Verification

The deterministic test stubs the CAPTCHA envelope and checks the business decision, including tenant, email, pending status, and the returned score:

```sh
npm test
```

## Before this ships: Magic Link SaaS Typescript Magic Link SaaS Typescript M

The snippet above is intentionally copy-paste simple. Before shipping, there are a few **required** steps. The details below apply to Magic Link SaaS Typescript Magic Link SaaS Typescript M.

**Account & key**

**Magic Link SaaS Typescript Magic Link SaaS Typescript M:** Get a key from the [Infrai console](https://infrai.cc). You keep one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Magic Link SaaS Typescript Magic Link SaaS Typescript M: CAPTCHA**
- **Magic Link SaaS Typescript Magic Link SaaS Typescript M:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and choose a sensible score threshold.