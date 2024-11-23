// GroundToAir 제목 컴포넌트

import { Link } from "react-router-dom";
import styled from "styled-components";
import FlightImg from "../img/Flight.png";

// Title 전체 컴포넌트 구성
const Home = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
`;

// 상위 컴포넌트의 배경색(parentBgColor)에 따라 반전 색상으로 조정
/*  ! theme은 객체인데 'theme[parentBgColor].font'로 사용되는 이유는 
 parentBgColor 자체가 props로 전달받는 문자열 변수이기 때문에 
 객체 지정하듯이 'theme.parentBgColor.font'로 사용하면 안된다. */
const Circle = styled.div<{ parentbgcolor: "black" | "white" }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme, parentbgcolor }) => theme[parentbgcolor].font};
  border-radius: 50%;

  width: 60px;
  height: 60px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 그림자 효과 추가
`;

// 아이콘 로고 구성
const Flight = styled.img`
  width: 35px;
  height: 35px;
`;

// 제목 폰트 구성
const TitleFont = styled.h3<{ parentbgcolor: "black" | "white" }>`
  font-size: 35px;
  margin-left: -10px;
  z-index: 1;
  font-weight: 600;
  color: ${({ theme, parentbgcolor }) => theme[parentbgcolor].font};
`;

function Title({ parentBgColor }: { parentBgColor: "black" | "white" }) {
  return (
    <Home>
      <Link to="/" style={{ display: "flex", alignItems: "center" }}>
        <Circle parentbgcolor={parentBgColor}>
          <Flight src={FlightImg} alt="Flight"></Flight>
        </Circle>
        <TitleFont parentbgcolor={parentBgColor}>GroundToAir</TitleFont>
      </Link>
    </Home>
  );
}

export default Title;
