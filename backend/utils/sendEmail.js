const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendEmail = async ({ to, subject, htmlContent, senderName = 'MedCare AI' }) => {
  if (!BREVO_API_KEY) {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }

  try {
    const response = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: 'noreply@medcare-ai.com' },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });

    if (!response.ok) throw new Error(`Brevo API error: ${response.status}`);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = (to, name, email, password) => {
  return sendEmail({
    to,
    subject: 'Bienvenue sur MedCare AI — Vos identifiants de connexion',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Bienvenue ${name} !</h1>
        <p>Votre compte MedCare AI a été créé avec succès.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Mot de passe :</strong> ${password}</p>
        </div>
        <p style="color: #ef4444;"><strong>Important :</strong> Changez votre mot de passe lors de votre première connexion.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Se connecter</a>
      </div>`
  });
};

export const sendSubscriptionReminder = (to, name, daysLeft, endDate) => {
  const urgency = daysLeft <= 3 ? 'URGENT' : daysLeft <= 15 ? 'IMPORTANT' : 'Rappel';
  return sendEmail({
    to,
    subject: `${urgency} : Votre abonnement expire dans ${daysLeft} jours`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${daysLeft <= 3 ? '#ef4444' : daysLeft <= 15 ? '#f97316' : '#7c3aed'};">${urgency}</h1>
        <p>Bonjour ${name},</p>
        <p>Votre abonnement MedCare AI expire le <strong>${new Date(endDate).toLocaleDateString('fr-FR')}</strong>.</p>
        <p>Il vous reste <strong>${daysLeft} jours</strong>.</p>
        <p>Contactez la clinique pour renouveler votre abonnement.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Se connecter</a>
      </div>`
  });
};
