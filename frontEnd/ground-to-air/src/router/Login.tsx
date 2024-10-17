// 로그인 페이지
import styled from "styled-components";
import InfoBox from "../components/InfoBox";
import Title from "../components/Title";
import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Container = styled.div`
  padding-top: 50px;
`;

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const history = useHistory();

  const infoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지
    try {
      const response = await axios.post("http://localhost:8080/user/login", {
        userId,
        password,
      });
      // 로그인 성공 시 JWT 토큰을 로컬 스토리지에 저장
      localStorage.setItem("token", response.data);
      console.log("로그인 성공:", response.data);
      history.push("/");
    } catch (error) {
      console.error("로그인 실패 : ", error);
    }
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <form>
          <div>
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              placeholder="gildong1231"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button onClick={infoSubmit}>로그인</button>
          </div>
        </form>
      </InfoBox>
    </Container>
  );
}

export default Login;
