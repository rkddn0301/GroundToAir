// 로그인 페이지
import styled from "styled-components";
import InfoBox from "../components/InfoBox";
import Title from "../components/Title";
import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { isLoggedInState, tokenExpirationTime } from "../utils/atom";
import { startSessionTimeout } from "../utils/jwtActivityTimer";
import { Alert } from "../utils/sweetAlert";
import KakaoAuth from "../components/auth/KakaoAuth";
import GoogleAuth from "../components/auth/GoogleAuth";

// Login 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: -15px;
`;

// 강조 혹은 작성 오류 안내 메시지 디자인 구성
const GuideLine = styled.div`
  color: ${(props) => props.theme.white.warning};
  font-size: 11px;
  display: flex;
  justify-content: center;
`;

// 작성란 폼 전체 디자인 구성
const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15px;
  gap: 15px;
`;

// 작성란 구분 디자인 구성
const Field = styled.div`
  position: relative;
  width: 80%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

// 작성란 제목 디자인 구성
const Label = styled.label`
  position: absolute;
  top: -7px;
  left: 8px;
  padding: 0 5px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.theme.white.bg};
`;

// 작성란 디자인 구성
const WriteInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 5px 0 0 0;
  outline: none;
`;

// 버튼 전체 구분 디자인 구성
const SubmitField = styled.div`
  width: 50%;
`;

// 버튼 디자인 구성
const SubmitBtn = styled.button`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 100%;
  padding: 15px 5px 15px 5px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 타사 인증 전체 디자인 구성
const FederationField = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

// 타사 인증 버튼 전체 디자인 구성
const FederationBtnField = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;
`;

function Login() {
  const [inputData, setInputData] = useState({
    userId: "",
    password: "",
  }); // input 입력 state

  const [errorMsg, setErrorMsg] = useState({
    userId: "",
    password: "",
  }); // 오류 메시지 표시 state

  const setIsLoggedIn = useSetRecoilState(isLoggedInState); // 로그인 확인 여부 atom
  const setTokenExpiration = useSetRecoilState(tokenExpirationTime); // 토큰 만료시간 atom

  const history = useHistory();

  // 아이디 입력란 변경 시 동작
  const userIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 아이디 입력 시 오류메시지 비활성화
    setErrorMsg({
      ...errorMsg,
      userId: "",
    });

    const value = e.target.value;
    setInputData({ ...inputData, userId: value });
  };

  // 비밀번호 입력란 변경 시 동작
  const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 비밀번호 입력 시 오류메시지 비활성화
    setErrorMsg({
      ...errorMsg,
      password: "",
    });

    const value = e.target.value;
    setInputData({ ...inputData, password: value });
  };

  // 로그인 버튼 클릭 시 동작
  const infoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지
    console.log(inputData.userId, inputData.password);

    // 1. 작성란이 비어있을 경우
    if (!inputData.userId) {
      document.getElementById("userId")?.focus();
      setErrorMsg((prev) => ({ ...prev, userId: "아이디를 입력해주세요." }));

      return;
    } else if (!inputData.password) {
      document.getElementById("password")?.focus();
      setErrorMsg((prev) => ({
        ...prev,
        password: "비밀번호를 입력해주세요.",
      }));

      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/user/login", {
        userId: inputData.userId,
        password: inputData.password,
      });
      if (response.data) {
        Alert("로그인 되었습니다.", "success");
        const { accessToken, accessTokenExpiration, refreshToken } =
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
      } else {
        Alert(
          "아이디 혹은 비밀번호가 잘못 입력되었습니다.<br>다시 확인해주십시오.",
          "error"
        );
      }
    } catch (error) {
      Alert("알 수 없는 오류로 인하여 로그인에 실패하였습니다.", "warning");
    }
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <Form>
          <Field>
            <Label htmlFor="userId">아이디</Label>
            <WriteInput
              type="text"
              id="userId"
              placeholder="gildong1231"
              value={inputData.userId}
              onChange={userIdChange}
            />
          </Field>
          {errorMsg.userId && <GuideLine>{errorMsg.userId}</GuideLine>}

          <Field>
            <Label htmlFor="password">비밀번호</Label>
            <WriteInput
              type="password"
              id="password"
              value={inputData.password}
              onChange={passwordChange}
            />
          </Field>
          {errorMsg.password && <GuideLine>{errorMsg.password}</GuideLine>}

          <SubmitField>
            <SubmitBtn onClick={infoSubmit}>로그인</SubmitBtn>
          </SubmitField>
        </Form>
        <FederationField>
          <p style={{ marginTop: "10px" }}>간편 로그인</p>
          <FederationBtnField>
            <KakaoAuth
              redirectRoute={history.location.pathname}
              title="카카오 로그인"
              width="50%"
              fontSize="16px"
              padding="10px"
            />
            <GoogleAuth
              redirectRoute={history.location.pathname}
              title="구글 로그인"
              width="50%"
              fontSize="16px"
              padding="10px"
            />
          </FederationBtnField>
        </FederationField>
      </InfoBox>
    </Container>
  );
}

export default Login;
