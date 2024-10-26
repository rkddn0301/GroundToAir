// 카카오 인증 컴포넌트
import axios from "axios";
import KakaoStartImg from "../img/kakaoStart.png";
import styled from "styled-components";
import { useEffect } from "react";

const Container = styled.div`
  width: 80%;
`;

const KakaoBtn = styled.button`
  background-color: transparent;
  border: transparent;
  width: 100%;
  cursor: pointer;
`;

const Img = styled.img`
  width: 100%;
`;

// Redirect URI
const REDIRECT_URI = "http://localhost:3000/join"; // 메인 페이지로 변경되야함

// 앱키 저장
const NATIVE_APP_KEY = "4a2a80ec447b5aba692b394f50d37557"; // 네이티브 앱
const REST_API_KEY = "20624702d5a29dd8501b4a3f25a70d87"; // REST API
const JAVASCRIPT_KEY = "33a797010560d5db7db69acabb0b6211"; // JAVASCRIPT API
const ADMIN_KEY = "60efc8f10fa79f2fdf81e6b50da66afc"; // ADMIN

// 카카오 로그인 인가 URL(GET 방식)
const IMPRESSION_KAKAO_URL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&scope=account_email`;

// 카카오 액세스 토큰 URL(POST 방식)
const ACCESS_TOKEN_KAKAO_URL = "https://kauth.kakao.com/oauth/token";

function KakaoAuth() {
  useEffect(() => {
    // 카카오 페이지에서 로그인 후 Redirect로 돌아올 시 재동작을 위함
    // 1. 카카오에서 로그인 후 인가 코드를 받음
    const code = new URL(window.location.href).searchParams.get("code");

    if (code) {
      console.log("인가 코드:", code);
      kakaoAuthentication(code);
    }
  }, []);

  // 카카오 인증
  const impression = () => {
    window.location.href = IMPRESSION_KAKAO_URL;
  };

  const kakaoAuthentication = async (code: string) => {
    try {
      await axios.post("http://localhost:8080/user/kakao", {
        access_token_url: ACCESS_TOKEN_KAKAO_URL, // 액세스 토큰 요청 URL
        grant_type: "authorization_code", // grant_type
        client_id: REST_API_KEY, // REST API 키
        redirect_uri: REDIRECT_URI, // 리다이렉트 URI
        code: code, // 인가 코드
      });
    } catch (error) {
      console.error("인증 도중 오류:", error);
    }
  };

  return (
    <Container>
      <KakaoBtn onClick={impression}>
        <Img src={KakaoStartImg} />
      </KakaoBtn>
    </Container>
  );
}

export default KakaoAuth;
