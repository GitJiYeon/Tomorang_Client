import React from "react";
import styled from "styled-components";

// 칩에 들어갈 옵션들
const STATUS_OPTIONS = ["대기중", "확정됨", "완료됨", "취소/거절"];

export default function StatusFilter({ selectedStatus, onStatusChange }) {
  return (
    <FilterWrapper>
      {STATUS_OPTIONS.map((status) => (
        <StatusChip
          key={status}
          $isSelected={status === selectedStatus}
          onClick={() => onStatusChange(status)}
        >
          {status}
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
`;

const StatusChip = styled.button`
  /* 공통 스타일 */
  display: flex;
  padding: 10px 14px;
  justify-content: center;
  align-items: center;
  border-radius: 60px;
  font-family: "Pretendard", sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

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
    gap: 10px;
    border: none; /* 선택 시 배경색이 채워지므로 테두리는 제거하는 것이 깔끔합니다 */
  `}

  &:focus {
    outline: none;
  }

  &:hover {
    opacity: 0.9;
  }
`;