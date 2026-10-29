import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, cookieGueltig } from "./auth";

/** In jeder Verwaltungsseite und -aktion aufrufen: leitet ohne Anmeldung zum Login. */
export async function pflichtAdmin(): Promise<void> {
  const c = await cookies();
  if (!cookieGueltig(c.get(COOKIE)?.value)) redirect("/admin/login");
}

export async function istAdmin(): Promise<boolean> {
  const c = await cookies();
  return cookieGueltig(c.get(COOKIE)?.value);
}
