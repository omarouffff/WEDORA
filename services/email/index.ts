import { BRAND } from "@/lib/brand";

export type EmailMessage = { to: string; subject: string; html: string; text: string };

export type SentEmail = EmailMessage & { sentAt: string };

interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<void>;
}

const globalForOutbox = globalThis as unknown as { __wedoraOutbox?: SentEmail[] };

/** Dev provider: logs to the console and keeps a short in-memory outbox (viewable at /dev/outbox). */
const consoleProvider: EmailProvider = {
  name: "console",
  async send(message) {
    const box = (globalForOutbox.__wedoraOutbox ??= []);
    box.unshift({ ...message, sentAt: new Date().toISOString() });
    box.length = Math.min(box.length, 25);
    console.info(`[email:mock] to=${message.to} subject="${message.subject}"\n${message.text}`);
  },
};

/** Resend-compatible provider using the REST API (no SDK needed). */
const resendProvider = (apiKey: string): EmailProvider => ({
  name: "resend",
  async send(message) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `${BRAND.name} <${BRAND.supportEmail}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  },
});

function provider(): EmailProvider {
  const key = process.env.RESEND_API_KEY;
  return key ? resendProvider(key) : consoleProvider;
}

/** Never throws: email failure must not break sign-up, booking, etc. */
export async function sendEmail(message: EmailMessage) {
  try {
    await provider().send(message);
    return true;
  } catch (error) {
    console.error("[email] send failed", error);
    return false;
  }
}

export function getOutbox() {
  return globalForOutbox.__wedoraOutbox ?? [];
}
