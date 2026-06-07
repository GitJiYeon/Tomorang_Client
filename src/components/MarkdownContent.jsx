import styled from "styled-components";
import { markdownToHtml } from "../utils/markdown";

export default function MarkdownContent({ value, className, imageMap = {} }) {
  return (
    <MarkdownBody
      className={className}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(value, { imageMap }) }}
    />
  );
}

const MarkdownBody = styled.div`
  color: #333;
  font-family: Pretendard, "Noto Sans KR", sans-serif;
  font-size: 14px;
  line-height: 1.7;

  h1,
  h2,
  h3,
  p,
  ul,
  ol {
    margin: 0;
  }

  h1 {
    font-size: 22px;
    line-height: 1.35;
    font-weight: 800;
  }

  h2 {
    font-size: 18px;
    line-height: 1.4;
    font-weight: 800;
  }

  h3 {
    font-size: 16px;
    line-height: 1.45;
    font-weight: 700;
  }

  p + p,
  p + h1,
  p + h2,
  p + h3,
  ul + p,
  ol + p,
  h1 + p,
  h2 + p,
  h3 + p {
    margin-top: 12px;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  li + li {
    margin-top: 4px;
  }

  strong {
    font-weight: 800;
  }

  code {
    padding: 2px 5px;
    border-radius: 4px;
    background: #f3f4f3;
    font-size: 13px;
  }

  a {
    color: #5f9f38;
    text-decoration: underline;
  }

  img {
    width: 100%;
    border-radius: 12px;
    object-fit: cover;
    display: block;
    margin: 18px 0;
  }
`;
