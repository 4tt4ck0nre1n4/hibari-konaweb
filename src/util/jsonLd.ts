export function stripHtml(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function nonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : undefined;
}

export function toAbsoluteUrl(value: unknown, siteBaseHref: string): string | undefined {
  const raw = nonEmptyString(value);
  if (raw === undefined) {
    return undefined;
  }

  try {
    return new URL(raw, `${siteBaseHref.replace(/\/$/, "")}/`).href;
  } catch {
    return undefined;
  }
}

export function toIsoDate(value: unknown): string | undefined {
  const raw = nonEmptyString(value);
  if (raw === undefined) {
    return undefined;
  }

  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
}

export function uniqueNonEmptyStrings(values: unknown[]): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    const stripped = stripHtml(value);
    if (stripped !== "") {
      unique.add(stripped);
    }
  }

  return [...unique];
}

export function compactJsonLd(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item: unknown) => compactJsonLd(item)).filter((item) => !isEmptyJsonLdValue(item));
  }

  if (typeof value === "object" && value !== null) {
    const compacted: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value)) {
      const compactedEntry = compactJsonLd(entry);
      if (!isEmptyJsonLdValue(compactedEntry)) {
        compacted[key] = compactedEntry;
      }
    }

    return compacted;
  }

  return value;
}

function isEmptyJsonLdValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && value !== null && Object.keys(value).length === 0)
  );
}
