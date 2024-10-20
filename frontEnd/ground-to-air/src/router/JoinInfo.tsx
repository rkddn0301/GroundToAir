// 회원정보입력 페이지

import styled from "styled-components";
import Title from "../components/Title";
import InfoBox from "../components/InfoBox";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Swal, { SweetAlertIcon } from "sweetalert2";

const Container = styled.div`
  padding-top: 50px;
`;

const GuideLine = styled.div`
  color: red;
  font-size: 14px;
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

const Filed = styled.div`
  position: relative;
  width: 80%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

const GenderMenu = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Label = styled.label`
  position: absolute;
  top: -5px;
  left: 10px;
  padding: 0 5px;
  font-size: 12px;
  background-color: ${(props) => props.theme.white.bg};
`;

const WriteInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  padding: 5px 0 0 0;
  outline: none;
`;

const CalendarInput = styled.div`
  display: flex;
  justify-content: center;

  input {
    width: 600px;
  }
  @media (max-width: 480px) {
    input {
      width: 100px;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    input {
      width: 150px;
    }
  }

  @media (min-width: 769px) and (max-width: 1280px) {
    input {
      width: 300px;
    }
  }

  @media (min-width: 1281px) and (max-width: 1579px) {
    input {
      width: 500px;
    }
  }
`;

const IdCheckField = styled.div`
  display: flex;
`;

const IdCheckBtn = styled.button`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 30%;
  margin: 5px 0 0 0;

  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
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

function JoinInfo() {
  const [inputData, setInputData] = useState({
    userId: "",
    password: "",
    userName: "",
    birth: "",
    gender: "",
    email: "",
  }); // input 입력 state

  const [errorMsg, setErrorMsg] = useState({
    userId: "",
    password: "",
    userName: "",
    email: "",
  }); // 오류 메시지 표시 state

  const [idChecking, setIdChecking] = useState(false); // 아이디 체크 여부 스위칭

  const history = useHistory();

  const Alert = (textAlert: string, type: SweetAlertIcon) => {
    Swal.fire({
      text: textAlert,
      icon: type,
      confirmButtonText: "확인",
    });
  };

  // 아이디 입력란 변경 시 동작
  const userIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 아이디 변경 시 기존 중복체크 내용은 자동으로 비활성화
    setIdChecking(false);

    const value = e.target.value;
    setInputData({ ...inputData, userId: value });

    // 아이디 규칙 : 영문자 및 숫자, 길이 6~15
    if (!/^[a-zA-Z0-9]{6,15}$/.test(value)) {
      setErrorMsg({
        ...errorMsg,
        userId: "아이디는 영문자 및 숫자로 6~15자여야 합니다.",
      });
    } else {
      setErrorMsg({ ...errorMsg, userId: "" });
    }
  };

  // 비밀번호 입력란 변경 시 동작
  const passwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, password: value });

    // 비밀번호 규칙 : 영문자+숫자+특수문자, 길이 8~15자
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,15}$/.test(value)) {
      setErrorMsg({
        ...errorMsg,
        password: "비밀번호는 영문자, 숫자, 특수문자로 8~15자여야 합니다.",
      });
    } else {
      setErrorMsg({ ...errorMsg, password: "" });
    }
  };

  // 성명 입력란 변경 시 동작
  const userNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, userName: value });

    // 성명 규칙: 문자만, 길이 1~15
    if (!/^[가-힣]{1,15}$/.test(value)) {
      setErrorMsg((prev) => ({
        ...prev,
        userName: "성명은 1~15자의 한글만 입력 가능합니다.",
      }));
    } else {
      setErrorMsg((prev) => ({ ...prev, userName: "" }));
    }
  };

  // 성별 선택란 변경 시 동작
  const genderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, gender: value });
  };

  // 생년월일 달력 변경 시 동작
  const birthChange = (date: Date | null) => {
    if (date) {
      setInputData({ ...inputData, birth: format(date, "yyyy-MM-dd") }); // Date --> String 변환하여 birth에 삽입
    } else {
      setInputData({ ...inputData, birth: "" });
    }
  };

  // 이메일 입력란 변경 시 동작
  const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, email: value });

    // 이메일 규칙: 이메일 형식
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setErrorMsg((prev) => ({
        ...prev,
        email: "올바른 이메일 형식을 입력해주세요.",
      }));
    } else {
      setErrorMsg((prev) => ({ ...prev, email: "" }));
    }
  };

  // 아이디 중복체크 클릭 시 동작
  const IdCheckHandle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지

    // 아이디 비어 있을 경우
    if (inputData.userId === "") {
      document.getElementById("userId")?.focus();
      setErrorMsg((prev) => ({ ...prev, userId: "아이디를 입력해주세요." }));

      return;
    } else if (!/^[a-zA-Z0-9]{6,15}$/.test(inputData.userId)) {
      setErrorMsg({
        ...errorMsg,
        userId: "아이디는 영문자 및 숫자로 6~15자여야 합니다.",
      });
      return;
    } else {
      setErrorMsg({ ...errorMsg, userId: "" });
    }

    try {
      const response = await axios.get(`http://localhost:8080/user/idCheck`, {
        params: {
          userId: inputData.userId,
        },
      });

      if (response.data > 0) {
        setIdChecking(true);
        Alert("사용 가능한 아이디입니다.", "success");
      } else {
        setIdChecking(false);
        setErrorMsg({
          ...errorMsg,
          userId: "이미 존재하는 아이디입니다.",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 회원가입 버튼 클릭 시 동작
  const infoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 새로고침 방지
    console.log(
      inputData.userId,
      inputData.password,
      inputData.userName,
      inputData.birth,
      inputData.gender,
      inputData.email
    );

    // 1. 작성란이 비어있을 경우 확인
    if (inputData.userId === "") {
      document.getElementById("userId")?.focus();
      setErrorMsg((prev) => ({ ...prev, userId: "아이디를 입력해주세요." }));

      return;
    } else if (inputData.password === "") {
      document.getElementById("password")?.focus();
      setErrorMsg((prev) => ({
        ...prev,
        password: "비밀번호를 입력해주세요.",
      }));
      return;
    } else if (inputData.userName === "") {
      document.getElementById("userName")?.focus();
      setErrorMsg((prev) => ({ ...prev, userName: "성명을 입력해주세요." }));
      return;
    } else if (inputData.email === "") {
      document.getElementById("email")?.focus();
      setErrorMsg((prev) => ({ ...prev, email: "이메일을 입력해주세요." }));
      return;
    }

    // 2. 오류 메시지가 존재할 경우 확인
    if (errorMsg.userId !== "") {
      document.getElementById("userId")?.focus();

      return;
    } else if (errorMsg.password !== "") {
      document.getElementById("password")?.focus();

      return;
    } else if (errorMsg.userName !== "") {
      document.getElementById("userName")?.focus();

      return;
    } else if (errorMsg.email !== "") {
      document.getElementById("email")?.focus();
      return;
    }

    // 3. 중복체크 확인
    if (!idChecking) {
      Alert("아이디 중복체크 버튼을 클릭하십시오.", "warning");
      return;
    }

    try {
      await axios.post(`http://localhost:8080/user/register`, {
        userId: inputData.userId,
        password: inputData.password,
        userName: inputData.userName,
        birth: inputData.birth,
        gender: inputData.gender,
        email: inputData.email,
      });
      alert("회원가입이 완료되었습니다.");
      history.push("/");
    } catch (error) {
      console.error("회원가입 실패: ", error);
      alert("회원가입에 실패했습니다.");
    }
  };

  useEffect(() => {
    console.log(idChecking);
  }, [idChecking]);

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <GuideLine>*은 필수 입력란입니다.</GuideLine>
        <Form>
          <Filed>
            <Label htmlFor="userId">*아이디</Label>
            <IdCheckField>
              <WriteInput
                type="text"
                id="userId"
                placeholder="gildong1231"
                value={inputData.userId}
                onChange={userIdChange}
                minLength={6}
                maxLength={15}
              />
              <IdCheckBtn onClick={IdCheckHandle}>중복체크</IdCheckBtn>
            </IdCheckField>
          </Filed>
          {errorMsg.userId && <GuideLine>{errorMsg.userId}</GuideLine>}

          <Filed>
            <Label htmlFor="password">*비밀번호</Label>
            <WriteInput
              type="password"
              id="password"
              value={inputData.password}
              onChange={passwordChange}
              minLength={8}
              maxLength={15}
            />
          </Filed>
          {errorMsg.password && <GuideLine>{errorMsg.password}</GuideLine>}

          <Filed>
            <Label htmlFor="userName">*성명</Label>
            <WriteInput
              type="text"
              id="userName"
              placeholder="홍길동"
              value={inputData.userName}
              onChange={userNameChange}
              minLength={1}
              maxLength={15}
            />
          </Filed>
          {errorMsg.userName && <GuideLine>{errorMsg.userName}</GuideLine>}
          <Filed>
            <Label htmlFor="gender">성별</Label>
            <GenderMenu>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  onChange={genderChange}
                />{" "}
                남
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  onChange={genderChange}
                />{" "}
                여
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="N"
                  onChange={genderChange}
                  defaultChecked
                />{" "}
                비공개
              </label>
            </GenderMenu>
          </Filed>

          <Filed>
            <Label>생년월일</Label>
            <CalendarInput>
              <DatePicker
                selected={inputData.birth ? new Date(inputData.birth) : null}
                showIcon // 달력 아이콘 활성화
                locale={ko} // 한국어로 변경
                onChange={birthChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                showYearDropdown // 연도 선택 기능
                scrollableYearDropdown // 연도 선택 스크롤 기능
                minDate={new Date(1900, 0, 1)} // 1900년 1월 1일
                maxDate={new Date()} // 현재 날짜
                yearDropdownItemNumber={new Date().getFullYear() - 1900 + 1} // 1900년 ~ 현재년도 까지 표시
                showMonthDropdown // 월 선택 기능
              />
            </CalendarInput>
          </Filed>

          <Filed>
            <Label htmlFor="email">*이메일</Label>
            <WriteInput
              type="email"
              id="email"
              placeholder="gildong1231@email.com"
              value={inputData.email}
              onChange={emailChange}
              minLength={1}
              maxLength={30}
            />
          </Filed>
          {errorMsg.email && <GuideLine>{errorMsg.email}</GuideLine>}

          <SubmitField>
            <SubmitBtn onClick={infoSubmit}>회원가입</SubmitBtn>
          </SubmitField>
        </Form>
      </InfoBox>
    </Container>
  );
}

export default JoinInfo;
