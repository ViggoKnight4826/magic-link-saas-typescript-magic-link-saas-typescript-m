import { requestMagicLink } from "./magic_link_service.js";

const [tenantId, email, widgetRecordId, captchaToken] = process.argv.slice(2);
if (!tenantId || !email || !widgetRecordId || !captchaToken) {
  console.error("Usage: npm run start -- <tenant-id> <email> <widget-record-id> <captcha-token>");
  process.exit(1);
}

const decision = await requestMagicLink({ tenantId, email, widgetRecordId, captchaToken });
console.log(JSON.stringify(decision, null, 2));
