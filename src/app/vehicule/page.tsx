import PlateLookupForm from "@/components/vehicle/PlateLookupForm";

export default function VehiclePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Trouver votre véhicule
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Identifiez votre voiture à partir de l’immatriculation et accédez
            aux pièces ou services compatibles.
          </p>
        </div>

        <PlateLookupForm />
      </div>
    </main>
  );
}