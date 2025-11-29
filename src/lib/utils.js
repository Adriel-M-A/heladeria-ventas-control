import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatError(error) {
  if (!error) return "Ocurrió un error desconocido";

  const message = error.message || error.toString();

  // Elimina el prefijo técnico que Electron agrega automáticamente:
  // "Error invoking remote method 'nombre-metodo': Error: Mensaje real"
  return message.replace(/^Error invoking remote method '[^']+': Error: /, "");
}
