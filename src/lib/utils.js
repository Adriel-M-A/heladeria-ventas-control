import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatError(error) {
  if (!error) return "Ocurrió un error desconocido";
  const message = error.message || error.toString();
  return message.replace(/^Error invoking remote method '[^']+': Error: /, "");
}

export function getToday() {
  const now = new Date();
  return now.toLocaleDateString("sv-SE");
}
