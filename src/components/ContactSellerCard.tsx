"use client";

import { useState } from "react";

type ContactSellerCardProps = {
  listingId: string;
  listingTitle: string;
  garageId: string;
  garageName: string;
  garagePhone?: string;
};

export default function ContactSellerCard({
  listingId,
  listingTitle,
  garageId,
  garageName,
  garagePhone,
}: ContactSellerCardProps) {
  const defaultMessage = `Bonjour, je suis intéressé par l’annonce "${listingTitle}". Est-elle toujours disponible ?`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!listingId) {
      setErrorMessage("Annonce introuvable.");
      return;
    }

    if (!garageId) {
      setErrorMessage("Garage introuvable.");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Votre nom est obligatoire.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Votre email est obligatoire.");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Votre message est obligatoire.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          listingTitle,
          garageId,
          garageName,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Impossible d’envoyer le message.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage("Votre message a bien été envoyé au vendeur.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage(defaultMessage);
    } catch {
      setErrorMessage("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToForm() {
    const form = document.getElementById("contact-seller-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const displayedPhone =
    garagePhone?.trim() && showPhone ? garagePhone : null;

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Contacter le vendeur
            </p>
            <h3 className="mt-1 truncate text-[15px] font-semibold text-slate-900 sm:text-[16px]">
              {garageName}
            </h3>
            <p className="mt-1 text-[12px] text-slate-500">
              Réponse rapide par message ou téléphone.
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-600">
            Pro
          </span>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-white transition hover:bg-orange-600 sm:min-h-[46px] sm:text-[14px]"
          >
            Envoyer un message
          </button>

          <button
            type="button"
            onClick={() => setShowPhone((prev) => !prev)}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-[13px] font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 sm:min-h-[46px] sm:text-[14px]"
          >
            {displayedPhone
              ? displayedPhone
              : showPhone
              ? "Numéro non renseigné"
              : "Voir le numéro"}
          </button>

          {displayedPhone ? (
            <a
              href={`tel:${garagePhone}`}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-4 text-[13px] font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 sm:min-h-[46px] sm:text-[14px]"
            >
              Appeler maintenant
            </a>
          ) : null}
        </div>
      </div>

      <form
        id="contact-seller-form"
        onSubmit={handleSubmit}
        className="rounded-md border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5"
      >
        <div className="mb-4">
          <h4 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
            Envoyer un message
          </h4>
          <p className="mt-1 text-[12px] text-slate-500 sm:text-[13px]">
            Remplissez le formulaire pour être recontacté rapidement.
          </p>
        </div>

        <div className="grid gap-3">
          <div>
            <label
              htmlFor="contact-name"
              className="mb-1.5 block text-[12px] font-medium text-slate-700"
            >
              Nom
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-[12px] font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@email.com"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="contact-phone"
              className="mb-1.5 block text-[12px] font-medium text-slate-700"
            >
              Téléphone
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 00 00 00 00"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="mb-1.5 block text-[12px] font-medium text-slate-700"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-md border border-slate-300 bg-white px-3.5 py-3 text-[14px] leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-[12px] text-red-700 sm:text-[13px]">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-3 text-[12px] text-green-700 sm:text-[13px]">
            {successMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center rounded-md bg-orange-500 px-4 text-[14px] font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Envoi..." : "Envoyer le message"}
        </button>
      </form>
    </section>
  );
}