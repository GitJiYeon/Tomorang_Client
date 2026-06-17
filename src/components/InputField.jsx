import React from "react";
import styled from "styled-components";
import { useI18n } from "../i18n/I18nProvider";

function InputField({ label, type = "text", placeholder, value, onChange }) {
  const { t } = useI18n();

  return (
    <Wrapper>
      <StyledLabel>{t(label)}</StyledLabel>
      <StyledInput
        type={type}
        placeholder={t(placeholder)}
        value={value}
        onChange={onChange}
      />
    </Wrapper>
  );
}

export default InputField;

const Wrapper = styled.div`
  margin-bottom:16px;
  margin-left:21px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledLabel = styled.label`
  color: #4E4E4E;
  font-size: 12px;
  font-weight: 700;
  margin-left: 16px;
`;

const StyledInput = styled.input`
  width: var(--app-content-width);
  height: 56px;
  border: 1px solid #DADADA;
  border-radius: 12px;
  padding: 17px 20px;
  box-sizing: border-box;
  color: #111111;
  font-family: Pretendard;
  font-size: 14px;

  &::placeholder {
    color: #BCBCBC;
  }

  &:focus {
    outline: 1px solid #C5F598;
  }
`;
