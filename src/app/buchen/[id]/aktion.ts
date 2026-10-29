"use server";

import { redirect } from "next/navigation";
import { buchen } from "@/lib/buchung";

export type Zustand = { fehler: string | null };

export async function buchenAktion(sessionId: number, _vorher: Zustand, fd: FormData): Promise<Zustand> {
  // Honigtopf gegen Bots: echte Menschen lassen das versteckte Feld leer.
  if (String(fd.get("firma") ?? "") !== "") return { fehler: "Die Anfrage konnte nicht verarbeitet werden." };
  const r = await buchen(sessionId, {
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    phone: String(fd.get("phone") ?? ""),
    message: String(fd.get("message") ?? ""),
    seats: Number(fd.get("seats") ?? 1),
    agb: fd.get("agb") === "on",
  });
  if (!r.ok) return { fehler: r.fehler };
  redirect(r.weiter);
}
