import styled, { keyframes } from "styled-components";
import { useEffect } from "react";
import { useI18n } from "../i18n/I18nProvider";

export default function ExhibitionNotice({ message, onClose }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => onClose?.(), 2400);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <Overlay onClick={onClose}>
      <Toast role="alert" onClick={(event) => event.stopPropagation()}>
        <p>{t(message)}</p>
      </Toast>
    </Overlay>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(18, 20, 25, 0.16);
  animation: ${fadeIn} 0.2s ease-out forwards;
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(var(--app-bottom-nav-reserved-space) + 24px);
  width: min(calc(var(--app-page-width) - 40px), calc(100vw - 40px));
  padding: 18px 20px;
  border-radius: 16px;
  background: #111;
  color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
  animation: ${slideUp} 0.24s ease-out forwards;
  box-sizing: border-box;

  p {
    margin: 0;
    color: #fff;
    font-family: Pretendard, "Noto Sans KR", sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    word-break: keep-all;
  }
`;
