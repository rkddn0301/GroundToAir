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
  display: flex;
  justify-content: center;
  align-items: center;
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

const BuildingIcon = styled.svg`
  width: 14px;
  height: 14px;
  margin-right: 8px;
`;

const Flight = styled.span`
  margin-right: 8px;
`;

function ChoiceButton() {
  const location = useLocation();
  return (
    <Container>
      <Link to="/">
        <Btn isActive={location.pathname === "/"}>
          <Flight>✈</Flight>항공편
        </Btn>
      </Link>
      <Link to="/hotels">
        <Btn isActive={location.pathname === "/hotels"}>
          <BuildingIcon
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
            />
          </BuildingIcon>
          호텔
        </Btn>
      </Link>
    </Container>
  );
}

export default ChoiceButton;
