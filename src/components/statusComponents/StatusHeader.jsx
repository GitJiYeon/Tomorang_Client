/**
 * StatusHeader - 예약 상태 상단 영역
 */

import styled, { keyframes } from "styled-components";
import CheckIcon from "../../assets/bookStatusIcons/checkIcon.svg";
import XIcon from "../../assets/bookStatusIcons/xIcon.svg";
import StarOutlineIcon from "../../assets/bookStatusIcons/starOutlineIcon.svg";

const STATUS_CONFIG = {
  PENDING: {
    icon: null,
    iconBg: "#C5F598",
    title: "안내자가 확인 중이에요",
    desc: "안내자가 예약을 확정할 지 확인중이에요\n조금만 기다려주세요",
    step: 0,
    isRejected: false,
  },
  CONFIRMED: {
    icon: CheckIcon,
    iconBg: "#C5F598",
    title: "예약이 확정되었어요",
    desc: "안내자와 채팅을 통해\n요청사항과 정보에 대해 확인해보세요",
    step: 1,
    isRejected: false,
  },
  REJECTED: {
    icon: XIcon,
    iconBg: "#FFCBA4",
    title: "예약이 거절되었어요",
    desc: "안내자가 시간이 없나봐요\n잠시 다른 투어를 찾아봐요",
    step: 0,
    isRejected: true,
  },
  COMPLETED: {
    icon: StarOutlineIcon,
    iconBg: "#C5F598",
    title: "투어가 완료 되었어요",
    desc: "투어의 경험을 리뷰를 통해\n다른 분들과 나눠보세요!",
    step: 2,
    isRejected: false,
  },
};

const STEPS = ["안내자 확인", "예약 확정", "투어 완료"];

export default function StatusHeader({ status,}) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const isPending = status === "PENDING";

  return (
    <Wrapper>
      <IconCircle $bg={config.iconBg}>
        {isPending ? (
          <Spinner />
        ) : (
          config.icon && <img src={config.icon} alt="status" width={28} height={28} />
        )}
      </IconCircle>

      <Title>{config.title}</Title>
      <Desc>{config.desc}</Desc>

      <StepBarWrapper>
        {STEPS.map((label, idx) => {
          const isDone = config.isRejected ? idx === 0 : idx <= config.step;
          const isRejectedStep = config.isRejected && idx === 0;
          const isLast = idx === STEPS.length - 1;

          return (
            <StepItem key={label}>
              <StepCircle $done={isDone} $rejected={isRejectedStep}>
                {isDone && !isRejectedStep && (
                  <img src={CheckIcon} alt="done" width={12} height={12} />
                )}
                {isRejectedStep && (
                  <img src={XIcon} alt="rejected" width={12} height={12} />
                )}
                {!isDone && <InnerDot />}
              </StepCircle>
              <StepLabel $done={isDone}>{label}</StepLabel>
              {!isLast && (
                <StepLine $done={!config.isRejected && idx < config.step} />
              )}
            </StepItem>
          );
        })}
      </StepBarWrapper>
    </Wrapper>
  );
}

const spin = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 0 30px;
`;

const IconCircle = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 23px;
  height: 23px;
  border: 4px solid rgba(255, 255, 255);
  border-top-color: #C5F598;
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`;

const Title = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 700;
  font-size: 21px;
  line-height: 29px;
  letter-spacing: -0.735px;
  color: #111;
  text-align: center;
  margin-top: 4px;
`;

const Desc = styled.div`
  font-family: "Pretendard", sans-serif;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.49px;
  color: #ACACAC;
  text-align: center;
  white-space: pre-line;
`;

const StepBarWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  width: 124%;
  padding: 0 -20px;
  box-sizing: border-box;
  margin-top: 20px;
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
`;

const StepCircle = styled.div`
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ $done, $rejected }) =>
    $rejected ? "#FFCBA4" : $done ? "#C5F598" : "#DADADA"};
  border: 2px solid ${({ $done, $rejected }) =>
    $rejected ? "#FFCBA4" : $done ? "#C5F598" : "#DADADA"};
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  z-index: 1;
`;

const StepLine = styled.div`
  position: absolute;
  top: 11px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: ${({ $done }) => ($done ? "#C5F598" : "#DADADA")};
  z-index: 0;
`;

const InnerDot = styled.div`
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff;
`;

const StepLabel = styled.div`
  font-family: "Pretendard", sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.012px;
  color: ${({ $done }) =>
    $done ? "#4E4E4E" : "#ACACAC"};
  text-align: center;
  white-space: nowrap;
  margin-top: 6px;
`;