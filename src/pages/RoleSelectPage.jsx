import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";

// 컴포넌트 및 에셋 임포트
import StartComent from '../components/StartComent';
import NextButton from '../components/NextButton1';
import BackArrow from "../assets/backarrow.svg";
import GuideCharacter from '../assets/guidecharacter.svg';
import TravelerCharacter from '../assets/travelercharacter.svg';

function RoleSelectPage() {
  const navigate = useNavigate();
  // 'traveler' 또는 'guide' 상태 저장
  const [selectedRole, setSelectedRole] = useState(null);

  const handleBack = () => {
    navigate(-1);
  };
  const handleNext = () => {
    if (selectedRole === 'traveler') {
      navigate("/travelersignup");
    } else if (selectedRole === 'guide') {
      navigate("/guidesignup");
    }
  };

  return (
    <PageContainer>
      {/* 상단 뒤로가기 버튼 */}
      <ButtonWrap>
        <BackButton src={BackArrow} alt="뒤로가기" onClick={handleBack} />
        <Space></Space>
      </ButtonWrap>

      {/* 메인 텍스트 영역 */}
      <Middle>
        <StartComent coment={'처음 만났네요,<br/>반가워요'} />
      </Middle>
      <SubTitle>오늘부터 어떤 여행을 시작할까요?</SubTitle>

      {/* 카드 선택 영역 */}
      <CardList>
        <SelectCard 
          $isSelected={selectedRole === 'traveler'} 
          onClick={() => setSelectedRole('traveler')}
        >
          <Character src={TravelerCharacter} alt="발견자" />
          <TextGroup>
            <RoleTitle>발견자</RoleTitle>
            <RoleDesc $isSelected={selectedRole === 'traveler'}>숨은 여행지를 찾아요</RoleDesc>
          </TextGroup>
        </SelectCard>

        <SelectCard 
          $isSelected={selectedRole === 'guide'} 
          onClick={() => setSelectedRole('guide')}
        >
          <Character src={GuideCharacter} alt="안내자" />
          <TextGroup>
            <RoleTitle>안내자</RoleTitle>
            <RoleDesc $isSelected={selectedRole === 'guide'}>나만 아는 여행지를 나눠요</RoleDesc>
          </TextGroup>
        </SelectCard>
      </CardList>

      {/* 하단 다음 버튼 */}
      <Footer>
      <NextButton 
        isValid={!!selectedRole} onClick={handleNext} />
      </Footer>
    </PageContainer>
  );
}

export default RoleSelectPage;

/** 스타일 컴포넌트 **/

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  box-sizing: border-box;
  padding-top: 24px;
`;

const ButtonWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  width: var(--app-page-width);
  height: 56px;
`
const BackButton = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
const Space = styled.div`
  width: 24px;
  height: 24px;
`
const Middle = styled.div`
  padding-top: 49px;
`
const SubTitle = styled.p`
    color: #ACACAC;
    font-family: Pretendard;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: -0.49px;
    margin-left:31px;
    margin-top:12px;
    margin-bottom:24px;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const SelectCard = styled.div`
  width:var(--app-content-width);
  height: 160px;

  background: ${({ $isSelected}) =>
    $isSelected? '#C5F598' : '#FFFFFF'};

  border: 1px solid
    ${({ $isSelected }) =>
      $isSelected ? '#111' : '#E0E0E0'};


  border-radius: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;

`;

const Character = styled.img`
  width: 80px;
  height: auto;
  margin-right: 44px;
  margin-left:34px;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RoleTitle = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #000;
`;

const RoleDesc = styled.span`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  color: ${({ $isSelected }) =>
    $isSelected ? '#4E4E4E' : '#ACACAC'};
`;

const Footer = styled.div`
  margin-top: auto;
  padding-bottom: 40px;
  display: flex;
  justify-content: center;
`;