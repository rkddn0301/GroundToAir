// 회원가입 페이지
import { Link, useHistory } from "react-router-dom";
import Title from "../components/Title";
import styled from "styled-components";
import InfoBox from "../components/InfoBox";
import KakaoAuth from "../components/KakaoAuth";

const Container = styled.div`
  padding-top: 50px;
`;

const Menus = styled.div`
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 50px;
`;

const Btn = styled.button`
  width: 300px;
  padding: 20px;
  font-size: 20px;
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  border-radius: 25px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;
function Join() {
  const history = useHistory();
  console.log(history.location.pathname);

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <Menus>
          <Link to="/join/info">
            <Btn>GroundToAir 회원가입</Btn>
          </Link>
          <KakaoAuth props={history.location.pathname} />
          <Link to="/join/info">
            <Btn>구글로 회원가입</Btn>
          </Link>
        </Menus>
      </InfoBox>
    </Container>
  );
}

export default Join;
