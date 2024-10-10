// GroundToAir 제목 컴포넌트

import { Link } from "react-router-dom";
import styled from "styled-components";
import FlightImg from "../img/Flight.png";

const Home = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
`;

const Circle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #f7fcfc;
  border-radius: 50%;

  width: 60px;
  height: 60px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // 그림자 효과 추가
`;

const Flight = styled.img`
  width: 35px;
  height: 35px;
`;

const TitleFont = styled.h3`
  font-size: 35px;
  margin-left: -10px;
  z-index: 1;
  font-weight: 600;
  color: #f7fcfc;
  text-shadow: -1px -1px 0 #595959, 1px -1px 0 #595959, -1px 1px 0 #595959,
    1px 3px 0 #595959; // 스트로크 색상과 두께 조절
`;

function Title() {
  return (
    <Link to="/">
      <Home>
        <Circle>
          <Flight src={FlightImg} alt="Flight"></Flight>
        </Circle>
        <TitleFont>GroundToAir</TitleFont>
      </Home>
    </Link>
  );
}

export default Title;
