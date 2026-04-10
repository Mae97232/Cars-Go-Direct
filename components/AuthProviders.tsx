"use client";

export default function AuthProviders({
  mode,
  onGoogle,
  loading,
}: {
  mode: "signup" | "signin";
  onGoogle: () => void;
  loading?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={onGoogle}
        disabled={loading}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
      >
        {mode === "signup"
          ? "Continuer avec Google"
          : "Se connecter avec Google"}
      </button>

      <div className="flex items-center gap-3 py-2">
        <div className="h-px w-full bg-slate-200" />
        <span className="text-xs text-slate-500">ou</span>
        <div className="h-px w-full bg-slate-200" />
      </div>

      <p className="text-xs text-slate-500">
        {mode === "signup"
          ? "En continuant, vous acceptez les conditions d’utilisation."
          : "Connectez-vous pour accéder à votre espace."}
      </p>
    </div>
  );
}