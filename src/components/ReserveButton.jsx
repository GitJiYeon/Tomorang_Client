/*
호출방법
  const handleNext = () => {
    navigate("/make-traveler-profile", { state: { interests: selected } });
  };
*/

/* <ReserveButton isValid={true} onClick={handleNext} /> */
import styled from "styled-components";

function ReserveButton({ isValid, onClick, label = "예약하기" }) {
  return (
    <Button disabled={!isValid} onClick={isValid ? onClick : undefined}>
      {label}
    </Button>
  );
}

const Button = styled.button`
  width: 100%;
  max-width: var(--app-content-width);
  height: 56px;
  border-radius: 12px;
  border: none;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ disabled }) => (disabled ? "#EDFCDF" : "#C5F598")};

  color: ${({ disabled }) => (disabled ? "#fff" : "#111")};

  font-family: "Pretendard", sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0%;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

  ${({ disabled }) =>
    !disabled &&
    `
    &:active {
      border: 1px solid #000;
    }
  `}
`;

export default ReserveButton;
