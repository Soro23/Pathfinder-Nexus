/**
 * La UI está fija en español. Para contenido con traducción parcial (3rd
 * party sin traducir) se usa el campo en inglés como respaldo.
 */
export function pickLocalized(es: string | null | undefined, en: string): string {
  return es && es.trim().length > 0 ? es : en
}
