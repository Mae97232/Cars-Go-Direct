"use client";

export default function ContactPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Message envoyé (démo). Le backend sera branché plus tard.");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-slate-600">
          Une question sur la plateforme, une demande professionnelle ou un besoin d’assistance ?
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Nom"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <input
            placeholder="Sujet"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <textarea
            required
            rows={6}
            placeholder="Votre message"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <button type="submit" className="btn btn-primary w-full sm:w-auto">
            Envoyer le message
          </button>
        </form>

        <div className="mt-8 grid gap-3 text-sm text-slate-600">
          <p>Email : contact@carsgodirect.fr</p>
          <p>Téléphone : 00 00 00 00 00</p>
          <p>Zone de lancement : Normandie / Seine-Maritime</p>
        </div>
      </div>
    </div>
  );
}