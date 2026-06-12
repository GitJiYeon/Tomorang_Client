const asArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

const stripMarkdown = (value) =>
  String(value ?? "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_~>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function getPostDescription(post) {
  const textBlock = asArray(post?.contentBlocks)
    .filter((block) => String(block?.type ?? "text").toLowerCase() !== "image")
    .map((block) => block?.value ?? block?.content ?? block?.text)
    .find((value) => stripMarkdown(value));

  return (
    stripMarkdown(textBlock) ||
    stripMarkdown(post?.description) ||
    stripMarkdown(post?.content) ||
    stripMarkdown(post?.detail) ||
    stripMarkdown(post?.body) ||
    stripMarkdown(post?.subtitle)
  );
}

export function getPostImages(post) {
  const images = asArray(post?.images).filter(Boolean);
  if (images.length > 0) return images;

  return asArray(post?.contentBlocks)
    .filter((block) => String(block?.type ?? "").toLowerCase().includes("image"))
    .map((block) => block?.value ?? block?.url ?? block?.imageUrl ?? block?.image_url)
    .filter(Boolean);
}
