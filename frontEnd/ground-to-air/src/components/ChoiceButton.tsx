// 항공편/호텔 페이지 전환 버튼 컴포넌트
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 15px;
`;

const Btn = styled.button<{ isActive: boolean }>`
  width: 100px;
  background-color: ${(props) =>
    props.isActive ? props.theme.black.bg : props.theme.white.bg};
  color: ${(props) =>
    props.isActive ? props.theme.black.font : props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  font-weight: 600;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

function ChoiceButton() {
  const location = useLocation();
  return (
    <Container>
      <Link to="/">
        <Btn isActive={location.pathname === "/"}>항공편</Btn>
      </Link>
      <Link to="/hotels">
        <Btn isActive={location.pathname === "/hotels"}>호텔</Btn>
      </Link>
    </Container>
  );
}

export default ChoiceButton;
