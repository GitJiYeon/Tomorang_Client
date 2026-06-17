const REGION_ALIASES = {
  1: ["미즈호", "미즈호시", "瑞穂", "瑞穂市", "mizuho", "mizuhoshi"],
  2: ["이나자와", "이나자와시", "稲沢", "稲沢市", "inazawa"],
  3: ["교토", "京都", "京都市", "kyoto"],
  4: ["오사카", "大阪", "大阪市", "osaka"],
  5: ["홋카이도", "훗카이도", "北海道", "hokkaido"],
};

const normalizeText = (value) =>
  String(value ?? "")
    .toLocaleLowerCase()
    .replace(/\s+/g, "");

const withoutCitySuffix = (value) => String(value ?? "").replace(/(시|市)$/u, "");

export function getEmergingRegionAliases(region) {
  const translatedNames = Object.values(region?.translations ?? {})
    .map((translation) => translation?.cityName)
    .filter(Boolean);
  const aliases = [
    ...(REGION_ALIASES[region?.regionId] ?? []),
    ...translatedNames,
    ...translatedNames.map(withoutCitySuffix),
  ];

  return [...new Set(aliases.map(normalizeText).filter(Boolean))];
}

export function postMatchesEmergingRegion(post, region) {
  const title = normalizeText(
    [
      post?.title,
      post?.postTitle,
      post?.post_title,
      post?.courseTitle,
      post?.course_title,
    ].filter(Boolean).join(" ")
  );

  if (!title) return false;
  return getEmergingRegionAliases(region).some((alias) => title.includes(alias));
}

export function filterEmergingRegionsByPosts(regions, posts) {
  return regions.filter((region) =>
    posts.some((post) => postMatchesEmergingRegion(post, region))
  );
}

export function filterPostsByEmergingRegion(posts, region) {
  return posts.filter((post) => postMatchesEmergingRegion(post, region));
}
