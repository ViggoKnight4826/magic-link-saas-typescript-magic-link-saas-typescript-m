import assert from "node:assert/strict";
import { requestMagicLink } from "../src/magic_link_service.js";

process.env.INFRAI_API_KEY = "test-key";
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => {
  const body = JSON.parse(String(options?.body));
  assert.equal(body.widget_record_id, "widget-record-id");
  assert.equal(body.token, "captcha-token");
  return new Response(JSON.stringify({ ok: true, data: { score: 0.91 }, metadata: {} }), { status: 200 });
};

const decision = await requestMagicLink({ tenantId: "acme", email: "owner@acme.test", widgetRecordId: "widget-record-id", captchaToken: "captcha-token" });
assert.deepEqual(decision, { tenantId: "acme", email: "owner@acme.test", status: "pending_magic_link", captchaScore: 0.91 });
globalThis.fetch = originalFetch;
console.log("magic-link decision test passed");
