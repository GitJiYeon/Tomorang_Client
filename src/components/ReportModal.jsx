import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import CloseIcon from '../assets/CloseIcon.svg';
import ArrowIcon from '../assets/graynextarrow.svg';

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const slideDown = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
`;

// --- Styled Components ---

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(18, 20, 25, 0.60);
  backdrop-filter: blur(3px);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ${({ $isClosing }) => $isClosing ? fadeOut : fadeIn} 0.3s ease-in-out forwards;
`;

const ModalSheet = styled.div`
  width: 390px;
  height: 508px;
  background: #FFF;
  border-radius: 24px 24px 0 0;
  position: relative;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.1);
  animation: ${({ $isClosing }) => $isClosing ? slideDown : slideUp} 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 21px 9px 21px;
`;

const CloseBtn = styled.button`
  width: 25px;
  height: 25px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  img {
    width: 25px;
    height: 25px;
    display: block;
  }
`;

const TitleArea = styled.div`
  h2 {
    color: #111;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }
`;

const ReasonItem = styled.div`
  width: 390px;
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
  background: transparent;
  transition: background 0.15s;

  &:hover, &:active {
    background: #C5F598;
  }

  span {
    color: #111;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.014px;
  }

  .arrow {
    display: flex;
    width: 12px;
    height: 12px;
    padding: 5px;
    justify-content: center;
    align-items: center;
  }
`;

const Toast = styled.div`
  position: fixed;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 348px;
  height: 72px;
  background: #C5F598;
  border-radius: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.4s ease-out, ${fadeOut} 0.4s ease-in 2.6s forwards;

  p {
    width: 199px;
    color: #111;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    line-height: 19px;
    margin: 0;
  }
`;

// --- Main Component ---

// ✅ guideId prop 추가
const ReportSystem = ({ isOpen, onClose, guideId }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  if (!isOpen && !showToast) return null;

  const reasons = [
    "부적절한 내용 또는 사진",
    "허위 정보/ 과장된 설명",
    "불쾌한 언행",
    "사기 의심",
    "안전 문제 우려",
    "기타"
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  };

  const handleReportAction = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();

      // ✅ 신고된 가이드 id를 localStorage에 저장
      const hidden = JSON.parse(localStorage.getItem("hiddenGuides") ?? "[]");
      if (!hidden.includes(guideId)) {
        localStorage.setItem("hiddenGuides", JSON.stringify([...hidden, guideId]));
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 400);
    
    setTimeout(() => {
        navigate('/main');
    }, 400);
    };

  return (
    <>
      {isOpen && (
        <Overlay $isClosing={isClosing} onClick={handleClose}>
          <ModalSheet $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>

            <ModalHeader>
              <TitleArea>
                <h2>신고 사유 선택</h2>
              </TitleArea>
              <CloseBtn onClick={handleClose}>
                <img src={CloseIcon} alt="close" />
              </CloseBtn>
            </ModalHeader>

            <div style={{ padding: "0 24px 16px 24px" }}>
              <p style={{ color: "#ACACAC", fontSize: "14px", margin: 0 }}>
                이 게시물을 신고하는 사유를 선택해주세요.
              </p>
            </div>

            {reasons.map((text, index) => (
              <ReasonItem key={index} onClick={handleReportAction}>
                <span>{text}</span>
                <div className="arrow">
                  <img src={ArrowIcon} alt="arrow" />
                </div>
              </ReasonItem>
            ))}
          </ModalSheet>
        </Overlay>
      )}

      {showToast && (
        <Toast>
          <p>신고가 정상적으로 접수되었습니다. 해당가이드는 숨김처리 됩니다.</p>
        </Toast>
      )}
    </>
  );
};

export default ReportSystem;