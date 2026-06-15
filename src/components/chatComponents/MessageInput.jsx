import React, { useRef } from "react";
import styled from "styled-components";

export default function MessageInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  onImageSelect,
  addIcon,
  sendIcon,
  disabled = false,
}) {
  const fileInputRef = useRef(null);

  return (
    <Wrapper>
      <CircleBtn type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
        <img src={addIcon} alt="add" width={20} height={20} />
      </CircleBtn>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImageSelect?.(file);
          event.target.value = "";
        }}
      />
      <InputBox
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={disabled ? "완료된 투어입니다" : "메세지 입력"}
        disabled={disabled}
      />
      <CircleBtn type="button" onClick={onSend} disabled={disabled}>
        <img src={sendIcon} alt="send" width={20} height={20} />
      </CircleBtn>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 24px;
  background: #fff;
`;

const CircleBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 81px;
  border: 1px solid #DADADA;
  background: #F3F4F3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
`;

const HiddenInput = styled.input`
  display: none;
`;

const InputBox = styled.input`
  flex: 1;
  height: 42px;
  border-radius: 81px;
  border: 1px solid #DADADA;
  background: #F3F4F3;
  padding: 0 16px;
  outline: none;
  color: #111;
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: Pretendard;
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
  &::placeholder { color: #ACACAC; }
  &:disabled {
    color: #acacac;
    cursor: default;
  }
  box-sizing: border-box;
`;
