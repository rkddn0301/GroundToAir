// 카카오 인증 컴포넌트
import axios from "axios";
import KakaoStartImg from "../../img/kakaotalk_sharing_btn_small.png";
import styled from "styled-components";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import {
  federationAccessToken,
  isLoggedInState,
  socialId,
  tokenExpirationTime,
} from "../../utils/atom";
import { startSessionTimeout } from "../../utils/jwtActivityTimer";
import { useHistory } from "react-router-dom";

// KakaoAuth 전체 컴포넌트 구성
const Btn = styled.button<{
  width?: string;
  fontSize?: string;
  padding?: string;
}>`
  width: ${(props) => props.width || "300px"};
  font-size: ${(props) => props.fontSize || "20px"};
  padding: ${(props) => props.padding || "20px"};
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  border-radius: 25px;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 카카오 로고 이미지 구성
const Img = styled.img`
  width: 10%;
  margin: 0 3% -1.5% 0;
`;

function KakaoAuth(props: {
  redirectRoute: string;
  title?: string;
  width?: string;
  fontSize?: string;
  padding?: string;
}) {
  const setIsLoggedIn = useSetRecoilState(isLoggedInState); // 로그인 확인 여부 atom
  const setTokenExpiration = useSetRecoilState(tokenExpirationTime); // 토큰 만료시간 atom
  // 타사인증을 통해 필요한 데이터를 가져옴
  const setSocialId = useSetRecoilState(socialId);
  const setFederationAccessToken = useSetRecoilState(federationAccessToken);

  useEffect(() => {
    // 카카오 페이지에서 로그인 후 Redirect로 돌아올 시 재동작을 위함
    // state는 카카오 로그인이라는걸 확인하기 위함
    // 1. 카카오에서 로그인 후 인가 코드를 받음
    const urlParams = new URL(window.location.href).searchParams;
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    if (code && state === "kakao") {
      console.log("인가 코드:", code);
      kakaoAuthentication(code);
    }
  }, []);

  // 카카오 인증
  const impression = () => {
    window.location.href = `${process.env.REACT_APP_KAKAO_IMPRESSION_URL}?response_type=code&client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}${props.redirectRoute}&scope=account_email&state=kakao`;
  };

  const kakaoAuthentication = async (code: string) => {
    try {
      const response = await axios.post("http://localhost:8080/user/kakao", {
        access_token_url: process.env.REACT_APP_KAKAO_ACCESS_TOKEN_URL, // 액세스 토큰 요청 URL
        grant_type: "authorization_code", // grant_type
        client_id: process.env.REACT_APP_KAKAO_REST_API_KEY, // REST API 키
        redirect_uri: `${process.env.REACT_APP_REDIRECT_URI}${props.redirectRoute}`, // 리다이렉트 URI
        code: code, // 인가 코드
      });

      if (response.data) {
        console.log(response.data);
        const { accessToken, refreshToken, accessTokenExpiration } =
          response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsLoggedIn(true);
        setSocialId(response.data.socialId);
        setFederationAccessToken(response.data.federationAccessToken);
        // 만료시간 변환작업
        const expirationTime =
          new Date(accessTokenExpiration).getTime() - Date.now();

        setTokenExpiration(expirationTime);
        startSessionTimeout(expirationTime);
      }
    } catch (error) {
      console.error("인증 도중 오류:", error);
    }
  };

  return (
    <Btn
      onClick={impression}
      width={props.width}
      fontSize={props.fontSize}
      padding={props.padding}
    >
      <Img src={KakaoStartImg} />
      {props.title}
    </Btn>
  );
}

export default KakaoAuth;
