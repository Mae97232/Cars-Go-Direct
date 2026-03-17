import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || "Cars Go Direct <contact@cargodirect.fr>";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}