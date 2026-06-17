/*호출방법 <Header coment={"떠오르는 여행지"}></Header>*/
import styled from 'styled-components';
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

function Header({coment, path, onBack}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    path ? navigate(path) : navigate(-1);
  };

  return (
    <>
      <Container>
        <BackButton 
          onClick={handleBack}
          type="button"
        >
          <img src={BackArrow} alt={t("뒤로가기")} />
        </BackButton>

        <TitleWrapper>
          <TitleText dangerouslySetInnerHTML={{ __html: coment }} />
        </TitleWrapper>
        <Spacer />
      </Container>
      <Border />
      </>
  );
}
const Container = styled.div`
  width: var(--app-page-width);
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #ffffff;
  box-sizing: border-box;
  margin: 0 auto;
  justify-content: space-between; 
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; 
  height: 40px;
  transition: none;

  img {
    width: 24px;
    height: 24px;
  }

  &:active {
    opacity: 1;
    transform: none;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex: 1; 
  min-width: 0;
  justify-content: center;
  gap: 3px; 
  margin: 0 47px;
  color: #111;
  text-align: center;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px; /* 137.5% */
`;

const TitleText = styled.span`
  min-width: 0;
  max-width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Spacer = styled.div`
  width: 40px; 
`;
const Border = styled.div`
  width: var(--app-page-width);
  height: 1px;
  background: #F3F4F3;
  margin: 0 auto;
`
export default Header;
