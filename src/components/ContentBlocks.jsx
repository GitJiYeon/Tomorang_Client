import styled from "styled-components";
import MarkdownContent from "./MarkdownContent";

export default function ContentBlocks({ blocks }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <Wrapper>
      {blocks.map((block, idx) => {
        const type = String(block?.type ?? "text").toLowerCase();
        const value =
          block?.value ??
          block?.content ??
          block?.text ??
          block?.url ??
          block?.imageUrl ??
          block?.image_url ??
          "";

        if (type !== "image") {
          return <BlockText key={idx} value={value} />;
        }
        if (value) {
          return <BlockImage key={idx} src={value} alt={`content-${idx}`} />;
        }
        return null;
      })}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 21px;
  padding: 0 16px 24px;
`;

const BlockText = styled(MarkdownContent)`
  font-size: 15px;
  line-height: 1.7;
  color: #333;
  text-align: center;

  ul,
  ol {
    display: inline-block;
    padding-left: 18px;
    text-align: left;
  }
`;

const BlockImage = styled.img`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
`;
