const ROLE = {
  GUIDE: "GUIDE",
  DISCOVERER: "DISCOVERER",
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const collectRoleValues = (value, depth = 0) => {
  if (value === null || value === undefined || depth > 3) return [];
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((item) => collectRoleValues(item, depth + 1));
  if (typeof value === "object") {
    return [
      value.role,
      value.authority,
      value.name,
      value.type,
      value.memberRole,
      value.userRole,
      value.roles,
      value.authorities,
    ].flatMap((item) => collectRoleValues(item, depth + 1));
  }
  return [];
};

export const normalizeRole = (...sources) => {
  const values = sources.flatMap((source) => collectRoleValues(source));
  const joined = values.join(" ").toUpperCase();

  if (joined.includes("GUIDE") || joined.includes("ROLE_GUIDE") || joined.includes("안내")) {
    return ROLE.GUIDE;
  }
  if (
    joined.includes("DISCOVERER") ||
    joined.includes("TRAVELER") ||
    joined.includes("ROLE_DISCOVERER") ||
    joined.includes("ROLE_TRAVELER") ||
    joined.includes("발견")
  ) {
    return ROLE.DISCOVERER;
  }

  return "";
};

export const getCurrentRole = () => {
  let profile = null;
  try {
    profile = JSON.parse(localStorage.getItem("profile") || "null");
  } catch {
    profile = null;
  }

  return normalizeRole(
    localStorage.getItem("role"),
    profile,
    decodeJwtPayload(localStorage.getItem("accessToken"))
  );
};

export const isCurrentGuide = () => getCurrentRole() === ROLE.GUIDE;

