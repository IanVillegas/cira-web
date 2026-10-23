/** Une clases condicionales (como clsx, sin dependencia). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
