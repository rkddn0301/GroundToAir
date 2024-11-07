// 비밀번호 찾기 페이지

import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { Alert } from "../utils/sweetAlert";
import InfoBox from "../components/InfoBox";
import Title from "../components/Title";

const Container = styled.div`
  margin-top: -15px;
`;

const GuideLine = styled.div`
  color: red;
  font-size: 11px;
  display: flex;
  justify-content: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 15px;
  gap: 15px;
`;

const Field = styled.div`
  position: relative;
  width: 80%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

const Label = styled.label`
  position: absolute;
  top: -7px;
  left: 8px;
  padding: 0 5px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) => props.theme.white.bg};
`;

const WriteInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 5px 0 0 0;
  outline: none;
`;

const SubmitField = styled.div`
  width: 50%;
`;

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

function PwFind() {
  const [inputData, setInputData] = useState({
    userName: "",
    email: "",
  }); // input 입력 state

  const [errorMsg, setErrorMsg] = useState({
    userName: "",
    email: "",
  }); // 오류 메시지 표시 state

  const history = useHistory();

  // 성명 입력란 변경 시 동작
  const userNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 성명 입력 시 오류메시지 비활성화
    setErrorMsg({
      ...errorMsg,
      userName: "",
    });

    const value = e.target.value;
    setInputData({ ...inputData, userName: value });
  };

  // 이메일 입력란 변경 시 동작
  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 이메일 입력 시 오류메시지 비활성화
    setErrorMsg({
      ...errorMsg,
      email: "",
    });

    const value = e.target.value;
    setInputData({ ...inputData, email: value });
  };

  // 비밀번호 찾기 버튼 클릭 시 동작
  const infoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지
    console.log(inputData.userName, inputData.email);

    // 1. 작성란이 비어있을 경우
    if (!inputData.userName) {
      document.getElementById("userName")?.focus();
      setErrorMsg((prev) => ({ ...prev, userName: "성명을 입력해주세요." }));

      return;
    } else if (!inputData.email) {
      document.getElementById("email")?.focus();
      setErrorMsg((prev) => ({
        ...prev,
        email: "이메일을 입력해주세요.",
      }));
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/user/pwFind`, {
        params: {
          userName: inputData.userName,
          email: inputData.email,
        },
      });
      console.log(response);
      if (response.data === true) {
        Alert("임시비밀번호가 이메일로 전송되었습니다", "success");
        history.push("/login");
      } else {
        Alert("성명 혹은 이메일이 일치하지 않습니다.", "warning");
      }
    } catch (error) {
      console.error("비밀번호 찾기 오류: ", error);
      Alert("비밀번호 찾기 요청에 실패하였습니다.", "error");
    }
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <Form>
          <Field>
            <Label htmlFor="userName">성명</Label>
            <WriteInput
              type="text"
              id="userName"
              placeholder="홍길동"
              value={inputData.userName}
              onChange={userNameChange}
              minLength={1}
              maxLength={15}
            />
          </Field>
          {errorMsg.userName && <GuideLine>{errorMsg.userName}</GuideLine>}

          <Field>
            <Label htmlFor="email">이메일</Label>
            <WriteInput
              type="email"
              id="email"
              placeholder="gildong1231@email.com"
              value={inputData.email}
              onChange={emailChange}
              minLength={1}
              maxLength={30}
            />
          </Field>
          {errorMsg.email && <GuideLine>{errorMsg.email}</GuideLine>}

          <SubmitField>
            <SubmitBtn onClick={infoSubmit}>비밀번호 찾기</SubmitBtn>
          </SubmitField>
        </Form>
      </InfoBox>
    </Container>
  );
}

export default PwFind;
