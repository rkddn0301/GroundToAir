// 구글 인증 컴포넌트
import axios from "axios";
import GoogleStartImg from "../img/g-logo.png";
import styled from "styled-components";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { isLoggedInState, tokenExpirationTime } from "../utils/atom";
import { startSessionTimeout } from "../utils/jwtActivityTimer";
import { useHistory } from "react-router-dom";

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

const Img = styled.img`
  width: 10%;
  margin: 0 5px -5px 0;
`;

function GoogleAuth(props: { redirectRoute: string; title: string }) {
  const setIsLoggedIn = useSetRecoilState(isLoggedInState); // 로그인 확인 여부 atom
  const setTokenExpiration = useSetRecoilState(tokenExpirationTime); // 토큰 만료시간 atom
  const history = useHistory();

  useEffect(() => {
    console.log(`${process.env.REACT_APP_REDIRECT_URI}${props.redirectRoute}`);
    // 구글 페이지에서 로그인 후 Redirect로 돌아올 시 재동작을 위함
    // state는 구글 로그인이라는걸 확인하기 위함
    // 1. 구글에서 로그인 후 인가 코드를 받음
    const urlParams = new URL(window.location.href).searchParams;
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    if (code && state === "google") {
      console.log("인가 코드:", code);
      googleAuthentication(code);
    }
  }, []);

  // 구글 인증
  const impression = () => {
    window.location.href = `${process.env.REACT_APP_GOOGLE_IMPRESSION_URL}?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}${props.redirectRoute}&response_type=code&scope=openid email&state=google`;
  };

  const googleAuthentication = async (code: string) => {
    try {
      const response = await axios.post("http://localhost:8080/user/google", {
        access_token_url: process.env.REACT_APP_GOOGLE_ACCESS_TOKEN_URL,
        grant_type: "authorization_code",
        client_secret: process.env.REACT_APP_GOOGLE_SECRET,
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        redirect_uri: `${process.env.REACT_APP_REDIRECT_URI}${props.redirectRoute}`,
        code: code,
      });

      if (response.data) {
        console.log(response.data);
        const { accessToken, refreshToken, accessTokenExpiration } =
          response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsLoggedIn(true);
        // 만료시간 변환작업
        const expirationTime =
          new Date(accessTokenExpiration).getTime() - Date.now();

        setTokenExpiration(expirationTime);
        startSessionTimeout(expirationTime);

        history.push("/");
      }
    } catch (error) {
      console.error("인증 도중 오류: ", error);
    }
  };

  return (
    <Btn onClick={impression}>
      <Img src={GoogleStartImg} />
      {props.title}
    </Btn>
  );
}

export default GoogleAuth;
