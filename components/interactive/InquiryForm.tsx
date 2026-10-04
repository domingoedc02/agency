"use client";
import { useState } from "react";

export function InquiryForm() {
  const [status, setStatus] = useState<string>("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setStatus("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.privacyAccepted = form.get("privacyAccepted") === "on" ? "true" : "false";
    payload.idempotencyKey = crypto.randomUUID().replaceAll("-", "");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json() as { message?: string; error?: { message?: string } };
      setStatus(response.ok ? body.message ?? "Thanks. We will follow up soon." : body.error?.message ?? "Check your details and try again.");
      if (response.ok) event.currentTarget.reset();
    } catch { setStatus("We could not send your enquiry. Please try again."); } finally { setPending(false); }
  }
  return <form className="inquiry-form" action="/api/inquiries" method="post" onSubmit={submit} noValidate><div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="honeypot" tabIndex={-1} autoComplete="off" /></div><div className="form-grid"><label htmlFor="name">Name<input id="name" name="name" required minLength={2} maxLength={100} /></label><label htmlFor="email">Work email<input id="email" name="email" type="email" required maxLength={254} /></label><label htmlFor="company">Company<input id="company" name="company" required minLength={2} maxLength={120} /></label><label htmlFor="budgetRange">Budget range<select id="budgetRange" name="budgetRange" required defaultValue=""><option value="" disabled>Select one</option><option value="under-10k">Under $10k</option><option value="10k-25k">$10k–$25k</option><option value="25k-50k">$25k–$50k</option><option value="over-50k">Over $50k</option></select></label><label htmlFor="timeline">Timeline<select id="timeline" name="timeline" required defaultValue=""><option value="" disabled>Select one</option><option value="exploring">Exploring</option><option value="this-quarter">This quarter</option><option value="next-quarter">Next quarter</option><option value="flexible">Flexible</option></select></label></div><label htmlFor="goals">What are you trying to make easier?<textarea id="goals" name="goals" required minLength={20} maxLength={1000} rows={6} /></label><label className="consent"><input type="checkbox" name="privacyAccepted" required /> I agree to the <a href="/privacy">privacy notice</a>.</label><button className="button" type="submit" disabled={pending}>{pending ? "Sending…" : "Send enquiry"}</button><p className="form-status" role="status" aria-live="polite">{status}</p><noscript><p>JavaScript is optional. Submit this form with the button; your browser will send it to our secure enquiry endpoint.</p></noscript></form>;
}
