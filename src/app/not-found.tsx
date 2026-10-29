import Link from "next/link";
import { Textseite } from "./textseite";

export default function NichtGefunden() {
  return (
    <Textseite titel="Diese Seite gibt es nicht.">
      <p><Link className="btn btn-dark" href="/">Zur Startseite</Link></p>
    </Textseite>
  );
}
