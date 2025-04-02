// 비회원 예약하기 조회

import styled from "styled-components";
import InfoBox from "../components/InfoBox";
import Title from "../components/Title";
import { useState } from "react";
import { useHistory } from "react-router-dom";

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

function GuestReservationList() {
  const history = useHistory();

  const [inputData, setInputData] = useState({
    revName: "", // 예약자명
    revCode: "", // 예약코드
  }); // input 입력 state

  const [errorMsg, setErrorMsg] = useState({
    revName: "", // 예약자명
    revCode: "", // 예약코드
  }); // 오류 메시지 표시 state

  // 정보 입력 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 예약자명 입력
    if (name === "revName") {
      // 예약자명 입력 시 오류메시지 비활성화
      if (errorMsg.revName) {
        setErrorMsg({ ...errorMsg, revName: "" });
      }
      setInputData((prevState) => ({
        ...prevState,
        revName: value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, ""),
      }));
    }

    // 예약코드 입력
    if (name === "revCode") {
      // 예약코드 입력 시 오류메시지 비활성화
      if (errorMsg.revCode) {
        setErrorMsg({ ...errorMsg, revCode: "" });
      }
      setInputData((prevState) => ({
        ...prevState,
        revCode: value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      }));
    }
  };

  // 예약조회 함수
  const bookingLookup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. 작성란이 비어있을 경우
    if (!inputData.revName) {
      document.getElementById("revName")?.focus();
      setErrorMsg((prev) => ({ ...prev, revName: "예약자명을 입력해주세요." }));

      return;
    } else if (!inputData.revCode) {
      document.getElementById("revCode")?.focus();
      setErrorMsg((prev) => ({
        ...prev,
        revCode: "예약코드를 입력해주세요.",
      }));

      return;
    }

    // 2. 작성란 규칙에 일치하지 않을 경우
    // 예약자명 검증
    if (inputData.revName && inputData.revName?.length < 2) {
      setErrorMsg((prev) => ({
        ...prev,
        revName: "예약자명은 최소 2글자 이상이어야 합니다.",
      }));

      return;
    }

    // 예약코드 검증
    if (inputData.revCode && inputData.revCode?.length < 17) {
      setErrorMsg((prev) => ({
        ...prev,
        revCode: "예약코드는 17자리 이어야 합니다.",
      }));

      return;
    }

    history.push({
      pathname: `/reservationDetail/${inputData.revCode}`,
      state: {
        revName: inputData.revName,
        revCode: inputData.revCode,
      },
    });
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <Form>
          <Field>
            <Label htmlFor="revName">예약자명</Label>
            <WriteInput
              type="text"
              id="revName"
              name="revName"
              placeholder="홍길동"
              value={inputData.revName || ""}
              onChange={handleChange}
            />
          </Field>
          {errorMsg.revName && <GuideLine>{errorMsg.revName}</GuideLine>}
          <Field>
            <Label htmlFor="revCode">예약코드</Label>
            <WriteInput
              type="text"
              id="revCode"
              name="revCode"
              placeholder="GTA20251231AAAAAA"
              value={inputData.revCode || ""}
              onChange={handleChange}
            />
          </Field>
          {errorMsg.revCode && <GuideLine>{errorMsg.revCode}</GuideLine>}
          <SubmitField>
            <SubmitBtn onClick={bookingLookup}>예약조회</SubmitBtn>
          </SubmitField>
        </Form>
      </InfoBox>
    </Container>
  );
}

export default GuestReservationList;
