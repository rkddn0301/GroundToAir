// 회원가입 페이지
import { useHistory, useLocation } from "react-router-dom";
import Title from "../components/Title";
import styled from "styled-components";
import InfoBox from "../components/InfoBox";
import KakaoAuth from "../components/auth/KakaoAuth";
import GoogleAuth from "../components/auth/GoogleAuth";
import { useEffect } from "react";
import { encryptionKey } from "./FlightSearch";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../utils/atom";
import { log } from "../utils/logger";

// Join 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: -15px;
`;

// 클릭 메뉴 버튼 전체 구성
const Menus = styled.div`
  height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  gap: 15px;
  margin-top: 50px;
`;

// 각 버튼 디자인 구성
const BtnBanner = styled.div`
  width: 300px;
  border: 2px solid ${(props) => props.theme.black.bg};
  border-radius: 25px;
  background-color: ${(props) => props.theme.white.bg};
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    button {
      color: ${(props) => props.theme.black.font};
    }
  }
`;

// 버튼
const Btn = styled.button`
  width: 100%;
  font-size: 20px;
  padding: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => props.theme.white.font};
`;
function Join() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 확인 여부 atom
  const history = useHistory();
  const location = useLocation();
  const { data = {}, redirection } = (location.state as {
    data: any;
    redirection: string;
  }) || {
    data: {},
    redirection: "",
  };

  // A 페이지에서 인증 후 B 페이지로 이동을 시도할 때 동작.
  useEffect(() => {
    if (redirection) {
      localStorage.setItem(
        "redirection",
        CryptoJS.AES.encrypt(redirection, encryptionKey).toString()
      );
      localStorage.setItem(
        "data",
        CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString()
      );
    }
  }, []);

  // 로그인 후 다른 페이지로 리다이렉트 될 때 올바른 경로로 전달하기 위한 hook
  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo =
        CryptoJS.AES.decrypt(
          localStorage.getItem("redirection") || "",
          encryptionKey
        ).toString(CryptoJS.enc.Utf8) || "/";

      log(redirectTo);
      const storedData = CryptoJS.AES.decrypt(
        localStorage.getItem("data") || "",
        encryptionKey
      ).toString(CryptoJS.enc.Utf8);
      const parsedData = storedData ? JSON.parse(storedData) : {};

      setTimeout(() => {
        localStorage.removeItem("redirection");
        localStorage.removeItem("data");
      }, 100);

      history.push({
        pathname: redirectTo,
        state:
          parsedData && Object.keys(parsedData).length
            ? { data: parsedData }
            : {},
      });
    }
  }, [isLoggedIn]);

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <Menus>
          <BtnBanner>
            <Btn onClick={() => history.push("/join/info")}>
              GroundToAir 회원가입
            </Btn>
          </BtnBanner>
          <BtnBanner>
            <KakaoAuth
              width="100%"
              redirectRoute={history.location.pathname}
              title={"카카오 시작하기"}
            />
          </BtnBanner>

          <BtnBanner>
            <GoogleAuth
              width="100%"
              redirectRoute={history.location.pathname}
              title={"구글 시작하기"}
            />
          </BtnBanner>
        </Menus>
      </InfoBox>
    </Container>
  );
}

export default Join;
