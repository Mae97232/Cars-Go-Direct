"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  userEmail: string;
  initialProfile: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    address: string;
    birthdate: string;
    gender: string;
    avatarUrl: string | null;
  };
  initialPrivateSettings: {
    iban: string;
    notificationsMessages: boolean;
    notificationsEmails: boolean;
  };
};

function getInitial(name: string, email: string) {
  const source = (name || email || "U").trim();
  return source.charAt(0).toUpperCase();
}

function maskIban(value: string) {
  if (!value) return "";
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)} **** **** **** ${value.slice(-4)}`;
}

function formatGender(value: string) {
  switch (value) {
    case "male":
      return "Masculin";
    case "female":
      return "Féminin";
    case "unspecified":
      return "Non renseigné";
    default:
      return value || "Non renseigné";
  }
}

function displayValue(value: string) {
  return value && value.trim() !== "" ? value : "Non renseigné";
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="animate-fade-up">
      <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="text-3d-soft flex min-h-[52px] items-center rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] px-4 py-3 text-sm text-slate-600">
        {displayValue(value)}
      </div>
    </div>
  );
}

export default function AccountSettingsForm({
  userEmail,
  initialProfile,
  initialPrivateSettings,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [city, setCity] = useState(initialProfile.city || "");
  const [birthdate, setBirthdate] = useState(initialProfile.birthdate || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);

  const [iban, setIban] = useState(initialPrivateSettings.iban || "");
  const [notificationsMessages, setNotificationsMessages] = useState(
    initialPrivateSettings.notificationsMessages
  );
  const [notificationsEmails, setNotificationsEmails] = useState(
    initialPrivateSettings.notificationsEmails
  );

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fullName = `${initialProfile.firstName} ${initialProfile.lastName}`.trim();
  const initial = getInitial(fullName, userEmail);
  const birthdateLocked = !!initialProfile.birthdate;

  async function handlePhotoChange(file: File) {
    setUploadingPhoto(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/compte/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          `${data.step ? `[${data.step}] ` : ""}${data.error || "Impossible d’envoyer la photo."}`
        );
        return;
      }

      setAvatarUrl(data.avatarUrl);
      setSuccessMessage("Photo de profil mise à jour.");
      window.location.href = "/compte";
    } catch {
      setErrorMessage("Erreur réseau pendant l’envoi de la photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/compte/parametres", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          city,
          birthdate: birthdateLocked ? undefined : birthdate,
          iban,
          notificationsMessages,
          notificationsEmails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Impossible d’enregistrer.");
        return;
      }

      setSuccessMessage("Paramètres enregistrés avec succès.");
      window.location.href = "/compte";
    } catch {
      setErrorMessage("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const firstConfirm = window.confirm(
      "Voulez-vous vraiment supprimer votre compte ?"
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "Cette action est définitive. Votre profil, vos messages, vos favoris et toutes vos données liées au compte seront supprimés. Continuer ?"
    );
    if (!secondConfirm) return;

    setDeletingAccount(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data?.reason || "Impossible de supprimer le compte."
        );
        return;
      }

      alert("Votre compte a été supprimé définitivement.");
      window.location.href = "/";
    } catch {
      setErrorMessage("Erreur réseau pendant la suppression du compte.");
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <>
      <section className="animate-fade-up border-b border-[#ece7e0] pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Photo de profil"
                className="h-20 w-20 rounded-full object-cover ring-1 ring-[#e4ddd4]"
              />
            ) : (
              <div className="text-3d-button grid h-20 w-20 place-items-center rounded-full bg-[#171311] text-3xl font-bold text-white">
                {initial}
              </div>
            )}

            <div>
              <h2 className="text-3d-title text-2xl font-semibold tracking-tight text-black">
                Photo de profil
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Ajoutez une photo pour personnaliser votre compte.
              </p>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoChange(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingPhoto ? "Envoi..." : "Ajouter / changer la photo"}
            </button>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-10 py-8">
        <section className="animate-fade-up" style={{ animationDelay: "0.06s" }}>
          <div className="border-b border-[#ece7e0] pb-4">
            <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
              Informations de compte
            </h2>
            <p className="text-3d-soft mt-1 text-sm text-slate-600">
              Vous pouvez modifier votre téléphone et votre ville. La date de naissance
              peut être renseignée une seule fois.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-5 py-6 sm:grid-cols-2">
            <ReadOnlyField label="Civilité" value={formatGender(initialProfile.gender)} />
            <ReadOnlyField label="Nom" value={initialProfile.lastName} />
            <ReadOnlyField label="Prénom" value={initialProfile.firstName} />
            <ReadOnlyField label="Adresse" value={initialProfile.address} />

            <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                Date de naissance
              </label>
              <input
                type="date"
                value={birthdate}
                disabled={birthdateLocked}
                onChange={(e) => setBirthdate(e.target.value)}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4] disabled:cursor-not-allowed disabled:bg-[#f5f3ef] disabled:text-slate-500"
              />
              {birthdateLocked ? (
                <p className="text-3d-soft mt-2 text-xs text-slate-500">
                  La date de naissance ne peut plus être modifiée.
                </p>
              ) : (
                <p className="text-3d-soft mt-2 text-xs text-slate-500">
                  Vous pouvez renseigner votre date de naissance une seule fois.
                </p>
              )}
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                Ville
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Votre ville"
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                Téléphone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 00 00 00 00"
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.14s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                E-mail
              </label>
              <div className="text-3d-soft flex min-h-[52px] items-center rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] px-4 py-3 text-sm text-slate-600">
                {displayValue(userEmail)}
              </div>
              <p className="text-3d-soft mt-2 text-xs text-slate-500">
                L’email n’est pas affiché publiquement aux autres utilisateurs.
              </p>
            </div>
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
          <div className="border-b border-[#ece7e0] pb-4">
            <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
              Moyens de paiement
            </h2>
            <p className="text-3d-soft mt-1 text-sm text-slate-600">
              Vos informations bancaires restent privées.
            </p>
          </div>

          <div className="grid gap-8 py-6 lg:grid-cols-2">
            <div>
              <h3 className="text-3d-title text-base font-semibold text-black">IBAN</h3>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Cet IBAN n’est jamais affiché publiquement.
              </p>

              <div className="mt-4">
                <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                  IBAN
                </label>
                <input
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="FR76..."
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
                <p className="text-3d-soft mt-2 text-xs text-slate-500">
                  {iban
                    ? `Aperçu masqué : ${maskIban(iban)}`
                    : "Aucun IBAN renseigné pour le moment."}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-3d-title text-base font-semibold text-black">
                Carte bancaire
              </h3>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Vous n’avez pas de carte bancaire enregistrée.
              </p>

              <div className="text-3d-soft mt-4 rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] px-4 py-4 text-sm text-slate-500">
                Aucun moyen de paiement par carte enregistré pour le moment.
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: "0.18s" }}>
          <div className="border-b border-[#ece7e0] pb-4">
            <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
              Notifications
            </h2>
            <p className="text-3d-soft mt-1 text-sm text-slate-600">
              Gérez les alertes et emails liés à votre compte.
            </p>
          </div>

          <div className="grid gap-4 py-6">
            <label className="animate-fade-up flex items-center justify-between gap-4 rounded-2xl border border-[#e4ddd4] bg-white px-4 py-4">
              <div>
                <p className="text-3d-title text-sm font-semibold text-black">
                  Nouveaux messages
                </p>
                <p className="text-3d-soft mt-1 text-xs text-slate-500">
                  Être prévenu lorsqu’un nouveau message arrive.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationsMessages}
                onChange={(e) => setNotificationsMessages(e.target.checked)}
                className="h-5 w-5 accent-black"
              />
            </label>

            <label
              className="animate-fade-up flex items-center justify-between gap-4 rounded-2xl border border-[#e4ddd4] bg-white px-4 py-4"
              style={{ animationDelay: "0.05s" }}
            >
              <div>
                <p className="text-3d-title text-sm font-semibold text-black">
                  Emails d’information
                </p>
                <p className="text-3d-soft mt-1 text-xs text-slate-500">
                  Recevoir des emails utiles concernant le compte et la plateforme.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notificationsEmails}
                onChange={(e) => setNotificationsEmails(e.target.checked)}
                className="h-5 w-5 accent-black"
              />
            </label>
          </div>
        </section>

        {(successMessage || errorMessage) && (
          <section className="animate-fade-up" style={{ animationDelay: "0.22s" }}>
            {successMessage ? (
              <div className="text-3d-soft rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="text-3d-soft rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </section>
        )}

        <section
          className="animate-fade-up border-t border-[#ece7e0] pt-6"
          style={{ animationDelay: "0.26s" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
                Confidentialité
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Vos informations personnelles ne sont pas affichées publiquement sur la plateforme.
              </p>
            </div>

            <button
              type="submit"
              className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </section>

        <section
          className="animate-fade-up rounded-[28px] border border-red-200 bg-red-50 p-6"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight text-red-700">
                Supprimer mon compte
              </h2>
              <p className="mt-2 text-sm leading-6 text-red-700/90">
                Cette action est définitive. Votre profil, vos messages, vos favoris,
                vos paramètres privés et toutes les données liées à votre compte seront
                supprimés. Vous pourrez recréer un compte plus tard avec la même adresse
                email.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingAccount
                ? "Suppression en cours..."
                : "Supprimer définitivement mon compte"}
            </button>
          </div>
        </section>
      </form>
    </>
  );
}