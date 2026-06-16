/* BackButton step={1}*/
import React from 'react';
import styled from 'styled-components';
import BackArrow from "../assets/backarrow.svg";

const ProgressBar = ({ step = 1, onBack }) => {
  const totalSteps = [1, 2, 3, 4];

  return (
    <Container>
      {/* 1. 뒤로가기 버튼 */}
      <BackButton onClick={onBack} type="button">
        <img src={BackArrow} alt="뒤로가기" />
      </BackButton>

      {/* 2. 진행바 영역 (가운데 정렬됨) */}
      <ProgressWrapper>
        {totalSteps.map((i) => (
          <Step 
            key={i} 
            $active={i <= step} 
          />
        ))}
      </ProgressWrapper>
      <Spacer />
    </Container>
  );
};

export default ProgressBar;


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

  img {
    width: 24px;
    height: 24px;
  }

  &:active {
    opacity: 0.6;
  }
`;

const ProgressWrapper = styled.div`
  display: flex;
  flex: 1; 
  justify-content: center;
  gap: 3px; 
  margin: 0 47px;
`;

const Step = styled.div`
  height: 4px;
  width:52px;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? '#B1DD89' : '#DADADA')};
  transition: background-color 0.3s ease;
`;


const Spacer = styled.div`
  width: 40px; 
`;