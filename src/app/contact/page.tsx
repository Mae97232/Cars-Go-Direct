"use client";

export default function ContactPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("Message envoyé (démo). Le backend sera branché plus tard.");
  }

  return (
    <div className="mx-auto max-w-3xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Contact
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Une question sur la plateforme, une demande professionnelle ou un besoin d’assistance ?
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Nom"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <input
              required
              type="email"
              placeholder="Email"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <input
            placeholder="Sujet"
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <textarea
            required
            rows={6}
            placeholder="Votre message"
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600 sm:w-auto"
          >
            Envoyer le message
          </button>
        </form>

        {/* INFOS */}
        <div className="mt-8 grid gap-2 text-sm text-slate-600">
          <p>Email : cargodirect.contact@gmail.com</p>
          <p>Téléphone : 00 00 00 00 00</p>
          <p>Zone de lancement : Normandie / Seine-Maritime</p>
        </div>

      </div>
    </div>
  );
}