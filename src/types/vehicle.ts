export type VehicleData = {
  plate: string;
  brand: string;
  model: string;
  trim?: string | null;

  year?: number | null;
  bodyType?: string | null;
  doors?: number | null;
  seats?: number | null;
  color?: string | null;

  engine?: string | null;
  engineSize?: string | null;
  engineCode?: string | null;
  powerHp?: number | null;
  powerKw?: number | null;
  fuel?: string | null;
  emissionStandard?: string | null;

  gearbox?: string | null;
  gearboxCode?: string | null;
  drivetrain?: string | null;

  firstRegistrationDate?: string | null;
  registrationCountry?: string | null;
  vin?: string | null;
  mileage?: number | null;
};