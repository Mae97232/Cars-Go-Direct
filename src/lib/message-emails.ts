import { resend, getFromEmail, getAppUrl } from "@/lib/resend";

type BuyerToSellerEmailParams = {
  to: string;
  garageName: string;
  buyerName: string;
  buyerEmail: string;
  listingTitle: string;
  message: string;
  conversationId: string;
};

type SellerToBuyerEmailParams = {
  to: string;
  garageName: string;
  listingTitle: string;
  message: string;
  conversationId: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendBuyerToSellerEmail({
  to,
  garageName,
  buyerName,
  buyerEmail,
  listingTitle,
  message,
  conversationId,
}: BuyerToSellerEmailParams) {
  if (!resend) {
    throw new Error("RESEND_API_KEY manquante.");
  }

  const appUrl = getAppUrl();
  const messagesUrl = `${appUrl}/pro/messages`;

  const safeGarageName = escapeHtml(garageName);
  const safeBuyerName = escapeHtml(buyerName);
  const safeBuyerEmail = escapeHtml(buyerEmail);
  const safeListingTitle = escapeHtml(listingTitle);
  const safeMessage = escapeHtml(message);

  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `Nouveau message pour votre annonce : ${listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 16px;">Nouveau message reçu</h2>
        <p>Bonjour ${safeGarageName},</p>
        <p>Vous avez reçu un nouveau message pour votre annonce :</p>
        <p><strong>${safeListingTitle}</strong></p>

        <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <p style="margin: 0 0 8px;"><strong>Nom :</strong> ${safeBuyerName}</p>
          <p style="margin: 0 0 8px;"><strong>Email :</strong> ${safeBuyerEmail}</p>
          <p style="margin: 0;"><strong>Message :</strong><br>${safeMessage.replaceAll("\n", "<br>")}</p>
        </div>

        <p>
          <a href="${messagesUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 600;">
            Voir la conversation
          </a>
        </p>

        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          Référence conversation : ${escapeHtml(conversationId)}
        </p>
      </div>
    `,
    text: `Bonjour ${garageName},

Vous avez reçu un nouveau message pour votre annonce "${listingTitle}".

Nom : ${buyerName}
Email : ${buyerEmail}

Message :
${message}

Voir la conversation : ${messagesUrl}

Référence conversation : ${conversationId}`,
  });
}

export async function sendSellerToBuyerEmail({
  to,
  garageName,
  listingTitle,
  message,
  conversationId,
}: SellerToBuyerEmailParams) {
  if (!resend) {
    throw new Error("RESEND_API_KEY manquante.");
  }

  const appUrl = getAppUrl();
  const messagesUrl = `${appUrl}/messages`;

  const safeGarageName = escapeHtml(garageName);
  const safeListingTitle = escapeHtml(listingTitle);
  const safeMessage = escapeHtml(message);

  return resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `${garageName} vous a répondu`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 16px;">Nouvelle réponse du vendeur</h2>
        <p>Bonjour,</p>
        <p>Le vendeur <strong>${safeGarageName}</strong> vous a répondu au sujet de l’annonce :</p>
        <p><strong>${safeListingTitle}</strong></p>

        <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <p style="margin: 0;"><strong>Réponse :</strong><br>${safeMessage.replaceAll("\n", "<br>")}</p>
        </div>

        <p>
          <a href="${messagesUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 600;">
            Voir la conversation
          </a>
        </p>

        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          Référence conversation : ${escapeHtml(conversationId)}
        </p>
      </div>
    `,
    text: `Bonjour,

${garageName} vous a répondu au sujet de l’annonce "${listingTitle}".

Réponse :
${message}

Voir la conversation : ${messagesUrl}

Référence conversation : ${conversationId}`,
  });
}