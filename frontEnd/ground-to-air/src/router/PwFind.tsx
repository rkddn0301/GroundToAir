// 비밀번호 찾기 페이지

import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { Alert } from "../utils/sweetAlert";
import InfoBox from "../components/InfoBox";
import Title from "../components/Title";
import { motion } from "framer-motion";

// PwFind 전체 컴포넌트 구성
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

// 버튼 전체 디자인 구성
const SubmitField = styled.div`
  width: 50%;
`;

// 버튼 디자인 구성
const SubmitBtn = styled(motion.button)`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 100%;
  padding: 15px 5px 15px 5px;
  border-radius: 10px;
  cursor: pointer;

  /* 로딩 애니메이션 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 로딩 중... 원형 디자인 구성
const Spinner = styled(motion.div)`
  border: 4px solid ${(props) => props.theme.white.font};
  border-top: 4px solid skyblue; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
  border-radius: 50%;
  width: 16px;
  height: 16px;
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

  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
            <SubmitBtn
              onClick={infoSubmit}
              whileHover={{ scale: 1.05 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner
                  animate={{ rotate: [0, 360] }} // 회전 애니메이션
                  transition={{
                    duration: 1, // 1초 동안
                    ease: "linear", // 일정한 속도
                    repeat: Infinity, // 무한반복
                  }}
                />
              ) : (
                "비밀번호 찾기"
              )}
            </SubmitBtn>
          </SubmitField>
        </Form>
      </InfoBox>
    </Container>
  );
}

export default PwFind;
