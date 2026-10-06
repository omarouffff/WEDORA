import { BRAND } from "@/lib/brand";
import { appUrl } from "@/lib/utils";
import type { EmailMessage } from "@/services/email";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string, cta?: { label: string; href: string }) {
  return `<!doctype html><html><body style="margin:0;background:#faf8f5;font-family:Georgia,serif;color:#27231f">
<div style="max-width:520px;margin:0 auto;padding:40px 24px">
<div style="letter-spacing:.2em;font-size:22px;margin-bottom:28px">${BRAND.name}</div>
<h1 style="font-weight:400;font-size:26px;margin:0 0 16px">${esc(title)}</h1>
<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#4a443d">${body}</div>
${cta ? `<p style="margin:28px 0"><a href="${cta.href}" style="background:#302d29;color:#fff;padding:13px 26px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px">${esc(cta.label)}</a></p>` : ""}
<p style="font-family:Arial,sans-serif;font-size:12px;color:#8a8279;margin-top:36px">${BRAND.name} — ${BRAND.tagline}</p>
</div></body></html>`;
}

export function verifyEmailTemplate(to: string, name: string, token: string): EmailMessage {
  const href = appUrl(`/verify-email?token=${token}`);
  return {
    to,
    subject: `Confirm your email for ${BRAND.name}`,
    html: layout(`Welcome, ${name}`, "<p>Please confirm your email address to finish setting up your account. This link expires in 24 hours.</p>", {
      label: "Confirm email",
      href,
    }),
    text: `Welcome to ${BRAND.name}, ${name}.\nConfirm your email (valid 24h): ${href}`,
  };
}

export function resetPasswordTemplate(to: string, token: string): EmailMessage {
  const href = appUrl(`/reset-password?token=${token}`);
  return {
    to,
    subject: `Reset your ${BRAND.name} password`,
    html: layout("Reset your password", "<p>We received a request to reset your password. This link expires in 1 hour. If this wasn't you, you can safely ignore this email.</p>", {
      label: "Choose a new password",
      href,
    }),
    text: `Reset your ${BRAND.name} password (valid 1h): ${href}\nIf you didn't ask for this, ignore this email.`,
  };
}

export function notificationTemplate(to: string, title: string, message: string, path?: string): EmailMessage {
  const href = path ? appUrl(path) : undefined;
  return {
    to,
    subject: title,
    html: layout(title, `<p>${esc(message)}</p>`, href ? { label: "View on " + BRAND.name, href } : undefined),
    text: `${title}\n${message}${href ? `\n${href}` : ""}`,
  };
}
