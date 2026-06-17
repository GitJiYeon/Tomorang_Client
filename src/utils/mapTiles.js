export const HIGH_RES_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export const HIGH_RES_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const HIGH_RES_TILE_OPTIONS = {
  attribution: HIGH_RES_TILE_ATTRIBUTION,
  detectRetina: true,
  maxZoom: 20,
  maxNativeZoom: 20,
};
