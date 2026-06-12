import { useState } from "react";
import styled, { keyframes } from "styled-components";
import CloseIcon from "../assets/CloseIcon.svg";
import ArrowIcon from "../assets/graynextarrow.svg";
import { createReport, hideUser } from "../api/tomorang";
import { hideGuide } from "../utils/hiddenGuides";

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

const REPORT_REASONS = [
  { label: "부적절한 내용 또는 사진", value: "INAPPROPRIATE" },
  { label: "허위 정보 또는 과장된 설명", value: "FRAUD" },
  { label: "불쾌한 행동", value: "HARASSMENT" },
  { label: "스팸 또는 광고", value: "SPAM" },
  { label: "기타", value: "OTHER" },
];

const getReportMessage = (error, targetType) => {
  if (error?.status === 401) return "로그인 후 신고할 수 있어요.";
  if (error?.status === 400) {
    return targetType === "USER"
      ? "본인은 신고할 수 없어요."
      : "본인이 작성한 게시물은 신고할 수 없어요.";
  }
  if (error?.status === 404) return "신고 대상을 찾을 수 없어요.";
  if (error?.status === 409) return "이미 신고한 대상이에요.";
  return error?.message || "신고 접수에 실패했어요.";
};

export default function ReportSystem({
  isOpen,
  onClose,
  postId,
  targetId,
  targetType = "POST",
  hiddenGuide,
  onReported,
}) {
  const reportTargetType = String(targetType || "POST").toUpperCase();
  const reportTargetId = targetId ?? postId;
  const isUserReport = reportTargetType === "USER";
  const [isClosing, setIsClosing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingReason, setSubmittingReason] = useState("");

  if (!isOpen && !showToast) return null;

  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setErrorMessage("");
      onClose?.();
    }, 400);
  };

  const showResultToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const rememberHiddenUser = async () => {
    if (!hiddenGuide) return;

    hideGuide(hiddenGuide);
    const hiddenUserId =
      hiddenGuide.id ??
      hiddenGuide.userId ??
      hiddenGuide.user_id ??
      hiddenGuide.guideId ??
      hiddenGuide.guide_id ??
      reportTargetId;

    if (!hiddenUserId) return;

    try {
      await hideUser(hiddenUserId, isUserReport ? "REPORT_USER" : "REPORT");
    } catch (error) {
      console.warn("숨김 사용자 서버 저장 실패", error);
    }
  };

  const finishReport = (message) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setSubmittingReason("");
      onClose?.();
      onReported?.();
      showResultToast(message);
    }, 400);
  };

  const handleReport = async (reason) => {
    if (!reportTargetId) {
      setErrorMessage(isUserReport ? "신고할 사용자 정보를 찾을 수 없어요." : "신고할 게시물 정보를 찾을 수 없어요.");
      return;
    }

    setErrorMessage("");
    setSubmittingReason(reason.value);

    try {
      await createReport({
        targetType: reportTargetType,
        targetId: reportTargetId,
        reason: reason.value,
        content: reason.label,
      });
      await rememberHiddenUser();
      finishReport(isUserReport ? "사용자를 신고하고 숨겼어요." : "신고가 접수되었어요. 해당 안내자를 숨겼어요.");
    } catch (error) {
      if (isUserReport) {
        await rememberHiddenUser();
        console.warn("사용자 신고 API가 실패해 숨김 처리만 완료했습니다.", error);
        finishReport("사용자를 숨겼어요.");
        return;
      }

      if (error?.status === 409 && hiddenGuide) {
        await rememberHiddenUser();
        finishReport("이미 신고한 게시물이에요. 해당 안내자를 숨겼어요.");
        return;
      }

      setErrorMessage(getReportMessage(error, reportTargetType));
      setSubmittingReason("");
    }
  };

  return (
    <>
      {isOpen && (
        <Overlay $isClosing={isClosing} onClick={closeWithAnimation}>
          <ModalSheet $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <TitleArea>
                <h2>신고 사유 선택</h2>
              </TitleArea>
              <CloseBtn type="button" onClick={closeWithAnimation}>
                <img src={CloseIcon} alt="닫기" />
              </CloseBtn>
            </ModalHeader>

            <Description>
              {isUserReport
                ? "이 사용자를 신고하고 숨기는 사유를 선택해주세요."
                : "이 게시물을 신고하는 사유를 선택해주세요."}
            </Description>

            {errorMessage && <ErrorText>{errorMessage}</ErrorText>}

            <ReasonList>
              {REPORT_REASONS.map((reason) => {
                const isSubmitting = submittingReason === reason.value;
                return (
                  <ReasonItem
                    key={reason.value}
                    type="button"
                    disabled={!!submittingReason}
                    onClick={() => handleReport(reason)}
                  >
                    <span>{isSubmitting ? "접수 중..." : reason.label}</span>
                    <span className="arrow">
                      <img src={ArrowIcon} alt="" />
                    </span>
                  </ReasonItem>
                );
              })}
            </ReasonList>
          </ModalSheet>
        </Overlay>
      )}

      {showToast && (
        <Toast>
          <p>{toastMessage}</p>
        </Toast>
      )}
    </>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(18, 20, 25, 0.6);
  backdrop-filter: blur(3px);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ${({ $isClosing }) => ($isClosing ? fadeOut : fadeIn)} 0.3s ease-in-out forwards;
`;

const ModalSheet = styled.div`
  width: min(390px, 100vw);
  min-height: 430px;
  background: #fff;
  border-radius: 24px 24px 0 0;
  position: relative;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  animation: ${({ $isClosing }) => ($isClosing ? slideDown : slideUp)} 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 21px 9px;
`;

const TitleArea = styled.div`
  h2 {
    color: #111;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }
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

const Description = styled.p`
  padding: 0 24px 16px;
  color: #acacac;
  font-size: 14px;
  margin: 0;
`;

const ErrorText = styled.p`
  margin: 0 24px 12px;
  color: #d93025;
  font-size: 13px;
  line-height: 18px;
`;

const ReasonList = styled.div`
  padding-bottom: 16px;
`;

const ReasonItem = styled.button`
  width: 100%;
  min-height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-sizing: border-box;
  background: transparent;
  border: 0;
  transition: background 0.15s;

  &:hover,
  &:active {
    background: #c5f598;
  }

  &:disabled {
    cursor: default;
    opacity: 0.55;
  }

  span {
    color: #111;
    font-size: 14px;
    font-weight: 500;
    text-align: left;
  }

  .arrow {
    display: flex;
    width: 22px;
    height: 22px;
    justify-content: center;
    align-items: center;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 83px;
  left: 50%;
  transform: translateX(-50%);
  width: 348px;
  min-height: 72px;
  background: #c5f598;
  border-radius: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.4s ease-out, ${fadeOut} 0.4s ease-in 2.6s forwards;

  p {
    width: 230px;
    color: #111;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    line-height: 22px;
    margin: 0;
  }
`;
