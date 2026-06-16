/**
 * WarningBanner - 경고/안내 배너 컴포넌트
 *
 * 사용법:
 * <WarningBanner
 *   icon={WarningIcon}   // 아이콘 svg import (선택)
 *   message="결제는 만남 후 현장에서 가이드와 직접 진행됩니다."
 * />
 */

import styled from "styled-components";
import WarningIconSrc from "../assets/warningIcon.svg";

export default function WarningBanner({ message, icon }) {
  return (
    <Banner>
      <img src={icon || WarningIconSrc} alt="warning" width={16} height={16} />
      <Message>{message}</Message>
    </Banner>
  );
}

const Banner = styled.div`
  width: var(--app-content-width);
  height: 50px;
  border-radius: 42px;
  background: #FFF7EC;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  box-sizing: border-box;
`;

const Message = styled.span`
  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 12px;
  color: #FF6800;
  line-height: normal;
`;