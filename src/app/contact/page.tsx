"use client";

export default function ContactPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Message envoyé (démo). Le backend sera branché plus tard.");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Contact
        </h1>

        <p className="text-3d-soft mt-2 text-sm text-slate-600">
          Une question sur la plateforme, une demande professionnelle ou un besoin d’assistance ?
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Nom"
              className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
            />
          </div>

          <input
            placeholder="Sujet"
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          <textarea
            required
            rows={6}
            placeholder="Votre message"
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          <button
            type="submit"
            className="text-3d-button inline-flex w-full items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] sm:w-auto"
          >
            Envoyer le message
          </button>
        </form>

        <div className="mt-8 grid gap-3 text-sm text-slate-600">
          <p className="text-3d-soft">Email : cargodirect.contact@gmail.com</p>
          <p className="text-3d-soft">Téléphone : 00 00 00 00 00</p>
          <p className="text-3d-soft">Zone de lancement : Normandie / Seine-Maritime</p>
        </div>
      </div>
    </div>
  );
}