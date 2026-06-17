import styled from "styled-components";
import { useI18n } from "../i18n/I18nProvider";

const LEVELS = [
  { key: "beginner",     label: "초보", dots: 1 },
  { key: "intermediate", label: "기본", dots: 2 },
  { key: "advanced",     label: "능숙", dots: 3 },
];

function LanguageButton({ icon, title, subtitle, languageCode, selectedLevel, onSelect }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const handleToggle = () => setOpen((prev) => !prev)

  const handleSelect = (levelKey) => {
    const next = selectedLevel === levelKey ? null : levelKey;
    onSelect({ languageCode, level: next });
  };

  const isSelected = !!selectedLevel;
  const showActive = isSelected && !isOpen;

  return (
    <Wrapper $active={showActive}>
      <Button onClick={handleToggle} $active={showActive}>
        <IconImg src={icon} alt={title} />
        <TextWrapper>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TextWrapper>
      </Button>

      {isOpen &&
        LEVELS.map(({ key, label, dots }) => (
          <StepWrapper key={key}>
            <Divider />
            <StepRow
              $selected={selectedLevel === key}
              onClick={() => handleSelect(key)}
            >
              <StepText>{t(label)}</StepText>
              <DotsRow>
                {[0, 1, 2].map((i) => (
                  <Dot key={i} $active={i < dots} />
                ))}
              </DotsRow>
            </StepRow>
          </StepWrapper>
        ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 21.75rem;
  border-radius: 12px;
  border: none;
  outline: ${({ $active }) => ($active ? "1px solid #111" : "1px solid #DADADA")};
  overflow: hidden;
  margin-bottom: 0.5rem;
  font-family: "Pretendard", sans-serif;
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 3.75rem;
  padding: 0 12px;
  box-sizing: border-box;
  cursor: pointer;
  background-color: ${({ $active }) => ($active ? "#C5F598" : "#fff")};
`;

const IconImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111;
`;

const Subtitle = styled.span`
  font-size: 0.75rem;
  font-weight: 400;
  color: #acacac;
`;

const StepWrapper = styled.div``;

const Divider = styled.div`
  height: 1px;
  background-color: #e8e8e8;
  margin: 0 14px;
`;

const StepRow = styled.div`
  padding: 13px 16px;
  background-color: ${({ $selected }) => ($selected ? "#C5F598" : "#fff")};
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:active {
    background-color: #d8f5b0;
  }
`;

const StepText = styled.span`
  display: block;
  font-size: 0.875rem;
  font-weight: 400;
  color: #ACACAC;
  margin-bottom: 5px;
`;

const DotsRow = styled.div`
  display: flex;
  gap: 4px;
  padding-left: 1px;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $active }) => ($active ? "#B1DD89" : "#DADADA")};
`;

export default LanguageButton;
