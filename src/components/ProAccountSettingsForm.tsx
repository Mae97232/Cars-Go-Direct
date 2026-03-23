"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  userId: string;
  userEmail: string;
  garageName: string;
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
  initialGarageSettings: {
    garagePhone: string;
    garageEmail: string;
    website: string;
    garageAddress: string;
    zipCode: string;
    openingHours: string;
    description: string;
  };
};

function getInitial(name: string, email: string) {
  const source = (name || email || "G").trim();
  return source.charAt(0).toUpperCase();
}

function maskIban(value: string) {
  if (!value) return "";
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)} **** **** **** ${value.slice(-4)}`;
}

export default function ProAccountSettingsForm({
  userEmail,
  garageName,
  initialProfile,
  initialPrivateSettings,
  initialGarageSettings,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState(initialProfile.firstName);
  const [lastName, setLastName] = useState(initialProfile.lastName);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [city, setCity] = useState(initialProfile.city);
  const [address, setAddress] = useState(initialProfile.address);
  const [birthdate, setBirthdate] = useState(initialProfile.birthdate);
  const [gender, setGender] = useState(initialProfile.gender);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);

  const [iban, setIban] = useState(initialPrivateSettings.iban);
  const [notificationsMessages, setNotificationsMessages] = useState(
    initialPrivateSettings.notificationsMessages
  );
  const [notificationsEmails, setNotificationsEmails] = useState(
    initialPrivateSettings.notificationsEmails
  );

  const [garagePhone, setGaragePhone] = useState(initialGarageSettings.garagePhone);
  const [garageEmail, setGarageEmail] = useState(initialGarageSettings.garageEmail);
  const [website, setWebsite] = useState(initialGarageSettings.website);
  const [garageAddress, setGarageAddress] = useState(initialGarageSettings.garageAddress);
  const [zipCode, setZipCode] = useState(initialGarageSettings.zipCode);
  const [openingHours, setOpeningHours] = useState(initialGarageSettings.openingHours);
  const [description, setDescription] = useState(initialGarageSettings.description);

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const displayName = garageName?.trim() || `${firstName} ${lastName}`.trim();
  const initial = getInitial(displayName, userEmail);

  const profileCompleted = Boolean(
    initialProfile.firstName &&
      initialProfile.lastName &&
      initialProfile.phone &&
      initialProfile.city &&
      initialProfile.address
  );

  const lockProfileFields = profileCompleted;

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
      setSuccessMessage("Photo du compte pro mise à jour.");
      router.refresh();
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
          firstName,
          lastName,
          phone,
          city,
          address,
          birthdate,
          gender,
          iban,
          notificationsMessages,
          notificationsEmails,
          garagePhone,
          garageEmail,
          website,
          garageAddress,
          zipCode,
          openingHours,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Impossible d’enregistrer.");
        return;
      }

      setSuccessMessage("Paramètres professionnels enregistrés avec succès.");
      router.refresh();
    } catch {
      setErrorMessage("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const firstConfirm = window.confirm(
      "Voulez-vous vraiment supprimer votre compte professionnel ?"
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "Cette action est définitive. Votre compte, votre profil, votre compte pro, vos annonces, vos messages, vos favoris et toutes les données liées seront supprimés. Continuer ?"
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
        setErrorMessage(data?.reason || "Impossible de supprimer le compte.");
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
    <div className="mx-auto grid max-w-5xl gap-6">
      <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/pro/dashboard"
              className="text-3d-soft inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard pro
            </Link>

            <p className="text-3d-soft mt-4 text-sm text-slate-500">
              Paramètres professionnels
            </p>
            <h1 className="text-3d-hero mt-1 text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Gérer mon compte pro
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Mets à jour les informations du responsable et la fiche publique du garage.
            </p>

            {profileCompleted ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-800">
                  Votre profil professionnel est complété. Seul le numéro de téléphone
                  du responsable reste modifiable.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">
                  Complétez votre profil une première fois pour finaliser votre compte
                  professionnel.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] px-4 py-3 text-right">
            <p className="text-3d-soft text-xs font-semibold uppercase tracking-wide text-slate-500">
              Garage
            </p>
            <p className="text-3d-title mt-1 text-sm font-semibold text-black">
              {garageName || "Nom du garage non renseigné"}
            </p>
            <p className="text-3d-soft mt-1 text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>
      </section>

      <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Photo de profil"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-[#f5f3ef]"
              />
            ) : (
              <div className="text-3d-button grid h-20 w-20 place-items-center rounded-full bg-[#171311] text-4xl font-bold text-white ring-4 ring-[#f5f3ef]">
                {initial}
              </div>
            )}

            <div>
              <h2 className="text-3d-title text-xl font-bold tracking-tight text-black">
                Photo du compte pro
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Ajoute ou remplace la photo affichée sur ton espace professionnel.
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
                if (file) {
                  handlePhotoChange(file);
                }
                e.currentTarget.value = "";
              }}
            />
            <button
              className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? "Envoi..." : "Ajouter / changer la photo"}
            </button>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
          <div>
            <h2 className="text-3d-title text-xl font-bold tracking-tight text-black">
              Informations du responsable
            </h2>
            <p className="text-3d-soft mt-1 text-sm text-slate-600">
              Après validation, seul le numéro de téléphone du responsable reste modifiable.
            </p>
          </div>

          <div className="mt-6 grid gap-6">
            <div className="grid gap-3">
              <label className="text-3d-soft text-sm font-semibold">Civilité</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={lockProfileFields}
                    className="h-5 w-5 accent-black"
                  />
                  <span className="text-3d-soft">Madame</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={lockProfileFields}
                    className="h-5 w-5 accent-black"
                  />
                  <span className="text-3d-soft">Monsieur</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="gender"
                    value="unspecified"
                    checked={gender === "unspecified"}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={lockProfileFields}
                    className="h-5 w-5 accent-black"
                  />
                  <span className="text-3d-soft">Non spécifiée</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Nom</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  readOnly={lockProfileFields}
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition read-only:bg-[#f8f6f3] read-only:text-slate-500 focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Prénom</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  readOnly={lockProfileFields}
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition read-only:bg-[#f8f6f3] read-only:text-slate-500 focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Date de naissance</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  readOnly={lockProfileFields}
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition read-only:bg-[#f8f6f3] read-only:text-slate-500 focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Téléphone du responsable</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-3d-soft text-sm font-semibold">Adresse personnelle</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nom de la rue et ville/code postal"
                readOnly={lockProfileFields}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition read-only:bg-[#f8f6f3] read-only:text-slate-500 focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Ville</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Le Havre"
                  readOnly={lockProfileFields}
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition read-only:bg-[#f8f6f3] read-only:text-slate-500 focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">E-mail</label>
                <div className="flex min-h-[52px] items-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3">
                  <span className="text-sm text-slate-800">{userEmail}</span>
                </div>
                <p className="text-3d-soft text-xs text-slate-500">
                  L’email du compte professionnel n’est pas affiché publiquement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
          <div>
            <h2 className="text-3d-title text-xl font-bold tracking-tight text-black">
              Fiche publique du garage
            </h2>
            <p className="text-3d-soft mt-1 text-sm text-slate-600">
              Ces informations seront visibles sur la page publique du garage.
            </p>
          </div>

          <div className="mt-6 grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Téléphone du garage</label>
                <input
                  value={garagePhone}
                  onChange={(e) => setGaragePhone(e.target.value)}
                  placeholder="02 00 00 00 00"
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Email professionnel</label>
                <input
                  value={garageEmail}
                  onChange={(e) => setGarageEmail(e.target.value)}
                  placeholder="contact@garage.fr"
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Site web</label>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.monsite.fr"
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-3d-soft text-sm font-semibold">Code postal</label>
                <input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="76600"
                  className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-3d-soft text-sm font-semibold">Adresse du garage</label>
              <input
                value={garageAddress}
                onChange={(e) => setGarageAddress(e.target.value)}
                placeholder="12 rue Exemple"
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-3d-soft text-sm font-semibold">Horaires d’ouverture</label>
              <textarea
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder={
                  "Lundi - Vendredi : 09:00 - 18:00\nSamedi : 09:00 - 12:00\nDimanche : Fermé"
                }
                rows={4}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-3d-soft text-sm font-semibold">Présentation du garage</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez votre garage, vos spécialités, vos services et votre façon de travailler."
                rows={6}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
            <h2 className="text-3d-title text-xl font-bold tracking-tight text-black">
              Moyens de paiement
            </h2>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-[#e4ddd4] p-5">
                <h3 className="text-3d-title text-lg font-bold tracking-tight text-black">
                  IBAN
                </h3>
                <p className="text-3d-soft mt-2 text-sm text-slate-600">
                  Cet IBAN reste privé et n’est jamais affiché publiquement.
                </p>

                <div className="mt-4 grid gap-2">
                  <label className="text-3d-soft text-sm font-semibold">IBAN</label>
                  <input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="FR76..."
                    className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                  {iban ? (
                    <p className="text-3d-soft text-xs text-slate-500">
                      Aperçu masqué : {maskIban(iban)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
            <h2 className="text-3d-title text-xl font-bold tracking-tight text-black">
              Notifications
            </h2>

            <div className="mt-5 rounded-2xl border border-[#e4ddd4] p-5">
              <h3 className="text-3d-title text-lg font-bold tracking-tight text-black">
                Messagerie
              </h3>

              <div className="mt-5 grid gap-4">
                <label className="flex items-center justify-between gap-3 rounded-xl border border-[#e4ddd4] p-4">
                  <div>
                    <p className="text-3d-title text-sm font-semibold text-black">
                      Nouveaux messages
                    </p>
                    <p className="text-3d-soft text-xs text-slate-500">
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

                <label className="flex items-center justify-between gap-3 rounded-xl border border-[#e4ddd4] p-4">
                  <div>
                    <p className="text-3d-title text-sm font-semibold text-black">
                      Emails d’information
                    </p>
                    <p className="text-3d-soft text-xs text-slate-500">
                      Recevoir des informations utiles sur votre compte.
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
            </div>
          </div>
        </section>

        {(successMessage || errorMessage) && (
          <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {successMessage ? (
              <p className="text-sm font-medium text-green-700">{successMessage}</p>
            ) : null}
            {errorMessage ? (
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            ) : null}
          </section>
        )}

        <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3d-title text-xl font-bold tracking-tight text-black">
                Confidentialité
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Les informations privées du compte professionnel ne sont pas affichées publiquement.
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

        <section className="animate-fade-up rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold tracking-tight text-red-700">
                Supprimer mon compte
              </h2>
              <p className="mt-2 text-sm leading-6 text-red-700/90">
                Cette action est définitive. Votre profil, votre compte professionnel,
                vos annonces, vos photos d’annonces, vos messages, vos favoris et toutes
                les données liées à votre compte seront supprimés. Vous pourrez recréer
                un compte plus tard avec la même adresse email.
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
    </div>
  );
}