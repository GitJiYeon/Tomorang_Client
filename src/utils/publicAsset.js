export function resolvePublicAsset(path) {
  if (typeof path !== "string" || !path.trim()) return path;
  if (path.trim().toLowerCase() === "string") return "";
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;
  if (!path.startsWith("/assets/") && !path.startsWith("assets/")) return path;

  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBase}${normalizedPath}`;
}
