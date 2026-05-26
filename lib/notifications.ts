import { formatRupees } from './utils';

type CreatorEmailNotification = {
  recipientEmail?: string | null;
  creatorName: string;
  supporterName: string;
  amount: number;
  cups: number;
  message?: string | null;
  creatorUrl?: string;
};

export async function sendCreatorEmailNotification(notification: CreatorEmailNotification) {
  const recipientEmail = notification.recipientEmail?.trim();

  if (!recipientEmail) {
    return { sent: false, reason: 'missing_recipient' };
  }

  const subject = `${notification.supporterName} supported ${notification.creatorName}`;
  const lines = [
    `${notification.supporterName} just bought ${notification.cups} cup${notification.cups > 1 ? 's' : ''}.`,
    `Amount: ${formatRupees(notification.amount)}`,
    notification.message ? `Message: ${notification.message}` : null,
    notification.creatorUrl ? `Profile: ${notification.creatorUrl}` : null
  ].filter(Boolean) as string[];

  const text = lines.join('\n');

  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [recipientEmail],
        subject,
        text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email notification: ${errorText}`);
    }

    return { sent: true, provider: 'resend' };
  }

  console.info('[Ek Cup] Email notification', { recipientEmail, subject, text });
  return { sent: true, provider: 'console' };
}