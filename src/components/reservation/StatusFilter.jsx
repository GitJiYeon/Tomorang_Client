import React from "react";
import styled from "styled-components";
import { useI18n } from "../../i18n/I18nProvider";

const STATUS_OPTIONS = ["대기중", "확정됨", "완료됨", "취소/거절"];

export default function StatusFilter({ selectedStatus, onStatusChange, options }) {
  const list = options ?? STATUS_OPTIONS; // ← 이 줄이 핵심
  const { t } = useI18n();

  return (
    <FilterWrapper>
      {list.map((status) => (  // ← STATUS_OPTIONS 대신 list 사용
        <StatusChip
          key={status}
          $isSelected={status === selectedStatus}
          onClick={() => onStatusChange(status)}
        >
          {t(status)}
        </StatusChip>
      ))}
    </FilterWrapper>
  );
}

/* ── Styled Components ── */

const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px; /* 칩 사이의 간격 */
  padding: 10px 20px;
  background-color: #fff;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const StatusChip = styled.button`
  /* 공통 스타일 */
  display: flex;
  flex-shrink: 0;
  padding: 10px 14px;
  justify-content: center;
  align-items: center;
  border-radius: 60px;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: none;

  /* 기본 상태 (Default) */
  border: 1px solid #DADADA;
  background: #ffffff;
  gap: 6px;
  color: #4E4E4E;

  /* 선택된 상태 (Selected) */
  ${({ $isSelected }) =>
    $isSelected &&
    `
    background: #C5F598;
    color: #111111;
    gap: 6px;
    border: 1px solid #C5F598;
  `}

  &:focus {
    outline: none;
  }

  &:hover,
  &:active {
    opacity: 1;
    transform: none;
  }
`;
