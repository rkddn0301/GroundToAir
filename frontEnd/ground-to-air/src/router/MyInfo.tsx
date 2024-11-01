// 개인정보 페이지

import styled from "styled-components";
import InfoBox from "../components/InfoBox";
import Title from "../components/Title";
import { useEffect, useState } from "react";
import axios from "axios";

const Container = styled.div`
  padding-top: 50px;
`;

function MyInfo() {
  const [inputData, setInputData] = useState({
    userId: "",
    password: "",
    passwordChk: "",
    userName: "",
    birth: "",
    gender: "",
    email: "",
    userEngFN: "", // 성(영문)
    userEngLN: "", // 명(영문)
    passportNo: "", // 여권번호
    nationality: "", // 국적
    passportExDate: "", // 여권만료일
    passportCOI: "", // 여권발행국
  }); // input 입력 state

  useEffect(() => {
    defaultMyInfoHandler();
  }, []);

  const defaultMyInfoHandler = async () => {
    console.log("개인정보 가져옴");
    const refreshToken = localStorage.getItem("refreshToken");
    console.log(refreshToken);
    if (!refreshToken) return; // 기존 리프레시 토큰이 없으면 로그아웃

    try {
      const response = await axios.post<{
        accessToken: string;
        refreshToken: string;
        userId: string;
        userName: string;
        birth: string;
        gender: string;
        email: string;

        passportNo: string;
        passportUserEngName: string;
        nationality: string;
        expirationDate: string;
        countryOfIssue: string;
      }>(
        "http://localhost:8080/user/myInfo",
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      console.log(response.data);

      setInputData((prevState) => ({
        ...prevState, // 기존 상태 유지
        userId: response.data.userId,
        password: "", // 비밀번호는 따로 가져오지 않음
        passwordChk: "",
        userName: response.data.userName,
        birth: response.data.birth,
        gender: response.data.gender,
        email: response.data.email,
        userEngFN: response.data.passportUserEngName.split(" ")[0], // 성
        userEngLN: response.data.passportUserEngName.split(" ")[1], // 명
        passportNo: response.data.passportNo,
        nationality: response.data.nationality,
        passportExDate: response.data.expirationDate,
        passportCOI: response.data.countryOfIssue,
      }));
    } catch (error) {
      console.error("개인정보 추출 실패:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [name]: value, // 변경된 필드만 업데이트
    }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputData((prevState) => ({
      ...prevState,
      gender: e.target.value, // 성별 변경
    }));
  };

  return (
    <Container>
      <InfoBox>
        <Title parentBgColor="white" />
        <form>
          <input
            type="text"
            id="userId"
            name="userId"
            value={inputData.userId}
            onChange={handleChange}
          />
          <input
            type="text"
            id="userName"
            name="userName"
            value={inputData.userName}
            onChange={handleChange}
          />
          <label>
            <input
              type="radio"
              name="gender"
              value="M"
              checked={inputData.gender === "M"}
              onChange={handleGenderChange}
            />{" "}
            남
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="F"
              checked={inputData.gender === "F"}
              onChange={handleGenderChange}
            />{" "}
            여
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="N"
              checked={inputData.gender === "N"}
              onChange={handleGenderChange}
            />{" "}
            비공개
          </label>
          <input
            type="text"
            id="birth"
            name="birth"
            value={inputData.birth}
            onChange={handleChange}
          />
          <input
            type="email"
            id="email"
            name="email"
            value={inputData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            id="userEngFN"
            name="userEngFN"
            value={inputData.userEngFN}
            onChange={handleChange}
          />
          <input
            type="text"
            id="userEngLN"
            name="userEngLN"
            value={inputData.userEngLN}
            onChange={handleChange}
          />
          <input
            type="text"
            id="passportNo"
            name="passportNo"
            value={inputData.passportNo}
            onChange={handleChange}
          />
          <input
            type="text"
            id="passportExDate"
            name="passportExDate"
            value={inputData.passportExDate}
            onChange={handleChange}
          />
          <input
            type="text"
            id="passportCOI"
            name="passportCOI"
            value={inputData.passportCOI}
            onChange={handleChange}
          />
        </form>
      </InfoBox>
    </Container>
  );
}

export default MyInfo;
