import Resend from 'resend';

const resend = new (Resend as any)(process.env.RESEND_API_KEY || '');

export async function handleContactForm(req: any, res: any) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { name, email, message, company } = body as {
    name?: string;
    email?: string;
    message?: string;
    company?: string;
  };

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    await resend.emails.send({
      from: 'Wtp Navigator <noreply@wtpnavigator.nl>',
      to: 'info@wtpnavigator.nl',
      subject: `Contact form: ${name || 'Anonymous'}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\n${message}`,
    });

    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
