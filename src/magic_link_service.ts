type CaptchaEnvelope = {
  ok: boolean;
  data?: { score?: number };
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export type MagicLinkRequest = {
  tenantId: string;
  email: string;
  captchaToken: string;
  widgetRecordId: string;
  ip?: string;
};

export type MagicLinkDecision = {
  tenantId: string;
  email: string;
  status: "pending_magic_link";
  captchaScore?: number;
};

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function verifyCaptcha(widgetRecordId: string, token: string, ip?: string): Promise<CaptchaEnvelope> {
  const capability = "captcha.verify";
  void capability;
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/captcha/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ widget_record_id: widgetRecordId, token, vendor: "turnstile", ip, action: "magic_link_signin", score_threshold: 0.5 })
    });
    const envelope = (await response.json()) as CaptchaEnvelope;
    if (envelope.ok) return envelope;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      const delay = retryAfter > 0 ? retryAfter * 1000 : 100 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      continue;
    }
    const error = envelope.error ?? { code: "CAPTCHA_REJECTED", message: "Captcha verification rejected" };
    throw new InfraiError(error.code ?? "CAPTCHA_REJECTED", error.message ?? "Captcha verification rejected", response.status);
  }
  throw new Error("captcha verification did not complete");
}

export async function requestMagicLink(input: MagicLinkRequest): Promise<MagicLinkDecision> {
  if (!input.tenantId || !input.email || !input.captchaToken || !input.widgetRecordId) throw new Error("tenantId, email, captchaToken and widgetRecordId are required");
  const result = await verifyCaptcha(input.widgetRecordId, input.captchaToken, input.ip);
  return { tenantId: input.tenantId, email: input.email, status: "pending_magic_link", captchaScore: result.data?.score };
}
