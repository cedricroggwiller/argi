import nodemailer, { type Transporter } from "nodemailer";

type Anhang = { filename: string; content: string; contentType: string };

let transport: Transporter | null | undefined;

function getTransport(): Transporter | null {
  if (transport === undefined) {
    transport = process.env.SMTP_URL ? nodemailer.createTransport(process.env.SMTP_URL) : null;
  }
  return transport;
}

/** Schickt eine Mail. Ohne SMTP_URL nur ins Log (Entwicklung). Gibt true bei Erfolg. */
export async function sendeMail(o: { an: string; betreff: string; text: string; antwortAn?: string; anhaenge?: Anhang[] }): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.log(`[argi] Mail (nicht verschickt, SMTP_URL fehlt) an ${o.an}: ${o.betreff}\n${o.text}`);
    return true;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || "argi <kurse@localhost>",
      to: o.an,
      replyTo: o.antwortAn || process.env.ADMIN_EMAIL || undefined,
      subject: o.betreff,
      text: o.text,
      attachments: o.anhaenge,
    });
    return true;
  } catch (e) {
    console.error(`[argi] Mail an ${o.an} fehlgeschlagen:`, e);
    return false;
  }
}
