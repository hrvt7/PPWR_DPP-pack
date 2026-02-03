import { Resend } from "resend";
import type { Lead, Profile } from "./types";

export async function sendFollowupEmail(params: {
  lead: Lead;
  profile: Profile;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return { status: "skipped", reason: "Missing RESEND_API_KEY or RESEND_FROM" };
  }
  const resend = new Resend(apiKey);
  const subject = `Köszi a kapcsolatfelvételt, ${params.lead.name}!`;
  const body = `Szia ${params.lead.name},\n\nÖrülök, hogy kapcsolatba léptünk! Ha szeretnél gyorsan haladni, itt tudunk időpontot egyeztetni: https://cal.com/signalcard\n\nÜdv,\n${params.profile.title}\n${params.profile.role} @ ${params.profile.company}`;

  await resend.emails.send({
    from,
    to: params.lead.email,
    subject,
    text: body
  });
  return { status: "sent" };
}
