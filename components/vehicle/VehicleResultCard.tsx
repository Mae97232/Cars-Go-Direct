import { VehicleData } from "@/types/vehicle";

type VehicleResultCardProps = {
  vehicle: VehicleData;
};

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Non renseigné";
  }

  return String(value);
}

function formatMileage(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Non renseigné";
  }

  return `${value.toLocaleString("fr-FR")} km`;
}

export default function VehicleResultCard({
  vehicle,
}: VehicleResultCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {vehicle.brand} {vehicle.model}
          </h2>

          {vehicle.trim ? (
            <p className="mt-1 text-sm text-slate-600">{vehicle.trim}</p>
          ) : null}
        </div>

        <div className="inline-flex w-fit rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {vehicle.plate}
        </div>
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm text-slate-500">Année</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.year)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Carrosserie</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.bodyType)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Couleur</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.color)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Portes</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.doors)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Places</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.seats)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Kilométrage</p>
          <p className="font-medium text-slate-900">
            {formatMileage(vehicle.mileage)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Moteur</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.engine)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Cylindrée</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.engineSize)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Code moteur</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.engineCode)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Puissance</p>
          <p className="font-medium text-slate-900">
            {vehicle.powerHp || vehicle.powerKw
              ? `${vehicle.powerHp ?? "-"} ch / ${vehicle.powerKw ?? "-"} kW`
              : "Non renseigné"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Énergie</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.fuel)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Norme émission</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.emissionStandard)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Boîte</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.gearbox)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Code boîte</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.gearboxCode)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Transmission</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.drivetrain)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">1ère immatriculation</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.firstRegistrationDate)}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Pays d’immatriculation</p>
          <p className="font-medium text-slate-900">
            {formatValue(vehicle.registrationCountry)}
          </p>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-sm text-slate-500">VIN</p>
          <p className="break-all font-medium text-slate-900">
            {formatValue(vehicle.vin)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          Voir les pièces compatibles
        </button>

        <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50">
          Enregistrer ce véhicule
        </button>
      </div>
    </div>
  );
}