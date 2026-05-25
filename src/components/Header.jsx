/*호출방법 <Header coment={"떠오르는 여행지"}></Header>*/
import styled from 'styled-components';
import BackArrow from "../assets/backarrow.svg";
import { useNavigate } from "react-router-dom";
function Header({coment, path}) {
  const navigate = useNavigate();
  return (
    <>
      <Container>
        <BackButton 
          onClick={() => (path ? navigate(path) : navigate(-1))} 
          type="button"
        >
          <img src={BackArrow} alt="뒤로가기" />
        </BackButton>

        <TitleWrapper>
          <span dangerouslySetInnerHTML={{ __html: coment }} />
        </TitleWrapper>
        <Spacer />
      </Container>
      <Border />
      </>
  );
}
const Container = styled.div`
  width: 390px;
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

  img {
    width: 24px;
    height: 24px;
  }

  &:active {
    opacity: 0.6;
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  flex: 1; 
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

const Spacer = styled.div`
  width: 40px; 
`;
const Border = styled.div`
  width: 390px;
  height: 1px;
  background: #F3F4F3;
  margin: 0 auto;
`
export default Header;
