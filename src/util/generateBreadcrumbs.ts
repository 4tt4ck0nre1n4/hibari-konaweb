export interface Crumb {
  name: string;
  path?: string;
}

const labelMap: Record<string, string> = {
  about: "About",
  blog: "Blog",
  contact: "Contact",
  works: "Works",
  service: "Service",
  privacy: "Privacy Policy",
  thanks: "Thanks",
  category: "Category",
  "404": "404 Not Found",
  "500": "500 Server Error",
};

function toTitleCase(text: string): string {
  return text.replace(/-/g, " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
}

export function generateBreadcrumbs(urlPath: string): Crumb[] {
  const segments: string[] = urlPath
    .split("/")
    .filter((value): value is string => typeof value === "string" && value.trim() !== "");

  const crumbs: Crumb[] = [{ name: "Home", path: "/" }];

  let pathAccumulator = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i] ?? "";
    const isLast = i === segments.length - 1;

    pathAccumulator += `/${segment}`;

    // .html拡張子を削除してlabelMapのキーとして使用
    const cleanSegment = segment.replace(/\.html$/i, "");
    const key = segments
      .slice(0, i + 1)
      .join("/")
      .replace(/\.html$/i, "");
    const rawLabel = labelMap[key] ?? labelMap[cleanSegment] ?? toTitleCase(cleanSegment);
    const label: string = typeof rawLabel === "string" ? rawLabel : String(rawLabel);

    crumbs.push(isLast ? { name: label } : { name: label, path: pathAccumulator });
  }

  return crumbs;
}
