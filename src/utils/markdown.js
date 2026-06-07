const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const resolveImageSrc = (src, imageMap) => {
  const localMatch = src.match(/^tomorang-content-image:\/\/(.+)$/);
  if (localMatch) return imageMap[localMatch[1]] ?? "";
  return src;
};

const renderInlineMarkdown = (value, imageMap) =>
  escapeHtml(value)
    .replace(/!\[([^\]]*)]\((https?:\/\/[^)\s]+|tomorang-content-image:\/\/[^)\s]+)\)/g, (_, alt, src) => {
      const resolvedSrc = resolveImageSrc(src, imageMap);
      return resolvedSrc ? `<img src="${resolvedSrc}" alt="${alt}" />` : "";
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

export function markdownToHtml(markdown = "", options = {}) {
  const imageMap = options.imageMap ?? {};
  const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listType = null;
  let paragraph = [];

  const closeParagraph = () => {
    if (paragraph.length === 0) return;
    html.push(`<p>${paragraph.map((line) => renderInlineMarkdown(line, imageMap)).join("<br />")}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeList();
      return;
    }

    const heading = trimmed.match(/^(#{1,3})\s*(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2], imageMap)}</h${level}>`);
      return;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      closeParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInlineMarkdown(unordered[1], imageMap)}</li>`);
      return;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      closeParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInlineMarkdown(ordered[1], imageMap)}</li>`);
      return;
    }

    closeList();
    paragraph.push(line);
  });

  closeParagraph();
  closeList();

  return html.join("");
}
