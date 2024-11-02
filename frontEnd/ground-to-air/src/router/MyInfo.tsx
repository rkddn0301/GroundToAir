// 개인정보 페이지

import styled from "styled-components";
import { useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "../utils/sweetAlert";
import { useHistory } from "react-router-dom";
import { isLoggedInState } from "../utils/atom";
import { useSetRecoilState } from "recoil";
import { inactivityTimer, refreshInterval } from "../utils/jwtActivityTimer";

const Container = styled.div``;

function MyInfo() {
  const setIsLoggedIn = useSetRecoilState(isLoggedInState); // 로그인 여부 atom
  const [inputData, setInputData] = useState({
    userNo: "", // 회원번호
    userId: "", // 아이디
    password: "", // 비밀번호
    passwordChk: "", // 비밀번호 확인
    userName: "", // 성명
    birth: "", // 생년월일
    gender: "", // 성별
    email: "", // 이메일

    userEngFN: "", // 성(영문)
    userEngLN: "", // 명(영문)
    passportNo: "", // 여권번호
    nationality: "", // 국적
    passportExDate: "", // 여권만료일
    passportCOI: "", // 여권발행국
  }); // input 입력 state

  const [defaultData, setDefaultData] = useState({
    userId: "", // 아이디
    password: "", // 비밀번호
    passwordChk: "", // 비밀번호 확인
    userName: "", // 성명
    birth: "", // 생년월일
    gender: "", // 성별
    email: "", // 이메일

    userEngFN: "", // 성(영문)
    userEngLN: "", // 명(영문)
    passportNo: "", // 여권번호
    nationality: "", // 국적
    passportExDate: "", // 여권만료일
    passportCOI: "", // 여권발행국
  }); // 기존 정보 저장 state

  const history = useHistory();

  // 개인정보 페이지 접속 시 기존 정보를 가져오기 위해 동작
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
        userNo: string;
        userId: string;
        userName: string;
        birth: string;
        gender: string;
        email: string;

        passportNo: string;
        passportUserEngName: string;
        nationality: string;
        passportExpirationDate: string;
        passportCountryOfIssue: string;
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

      // 입력용 데이터 삽입
      setInputData((prevState) => ({
        ...prevState, // 기존 상태 유지
        userNo: response.data.userNo || "",
        userId: response.data.userId || "",
        userName: response.data.userName || "",
        birth: response.data.birth || "",
        gender: response.data.gender || "",
        email: response.data.email || "",
        userEngFN: response.data.passportUserEngName.split(" ")[0] || "", // 성
        userEngLN: response.data.passportUserEngName.split(" ")[1] || "", // 명
        passportNo: response.data.passportNo || "",
        nationality: response.data.nationality || "",
        passportExDate: response.data.passportExpirationDate || "",
        passportCOI: response.data.passportCountryOfIssue || "",
      }));

      // 기존 데이터 저장
      setDefaultData((prevState) => ({
        ...prevState, // 기존 상태 유지
        userId: response.data.userId || "",
        userName: response.data.userName || "",
        birth: response.data.birth || "",
        gender: response.data.gender || "",
        email: response.data.email || "",
        userEngFN: response.data.passportUserEngName.split(" ")[0] || "", // 성
        userEngLN: response.data.passportUserEngName.split(" ")[1] || "", // 명
        passportNo: response.data.passportNo || "",
        nationality: response.data.nationality || "",
        passportExDate: response.data.passportExpirationDate || "",
        passportCOI: response.data.passportCountryOfIssue || "",
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

  // 개인정보 수정
  const myInfoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("개인정보 수정");
    console.log(
      inputData.userNo,
      inputData.userId,
      inputData.password,
      inputData.email
    );
    try {
      const response = await axios.post(
        `http://localhost:8080/user/myInfoUpdate`,
        {
          userNo: inputData.userNo,
          userId: inputData.userId,
          password: inputData.password,
          email: inputData.email,
        }
      );

      if (response.data) {
        const successAlert = await Alert(
          "개인정보 수정이 완료되었습니다. 다시 로그인 해주십시오.",
          "success"
        );

        if (successAlert.isConfirmed) {
          setIsLoggedIn(false);
          clearTimeout(inactivityTimer);
          clearInterval(refreshInterval);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          history.push("/login");
        }
      } else {
        Alert("변경내역이 존재하지 않습니다.", "info");
      }
    } catch (error) {
      console.error("개인정보 수정 실패", error);
      Alert(
        "알 수 없는 오류로 인하여 개인정보 수정에 실패하였습니다.",
        "error"
      );
    }
  };

  // 여권정보 수정
  const passportInfoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("여권정보 수정");

    const engFullName = inputData.userEngFN + " " + inputData.userEngLN;
    console.log(
      inputData.userNo,
      inputData.passportNo,
      engFullName,
      inputData.nationality,
      inputData.passportExDate,
      inputData.passportCOI
    );
    try {
      const response = await axios.post(
        `http://localhost:8080/user/passportInfoUpdate`,
        {
          userNo: inputData.userNo,
          passportNo: inputData.passportNo,
          engName: engFullName,
          nationality:
            inputData.nationality === "" ? null : inputData.nationality, // null은 외래키 무결성 위반이 되지 않아 변환 후 전송
          expirationDate: inputData.passportExDate,
          countryOfIssue:
            inputData.passportCOI === "" ? null : inputData.passportCOI,
        }
      );
      console.log(response.data);
      if (response.data) {
        const successAlert = await Alert(
          "여권정보 수정이 완료되었습니다.",
          "success"
        );

        if (successAlert.isConfirmed) {
          history.push("/");
        }
      } else {
        Alert("변경내역이 존재하지 않습니다.", "info");
      }
    } catch (error) {
      console.error("여권정보 수정 실패", error);
      Alert(
        "알 수 없는 오류로 인하여 여권정보 수정에 실패하였습니다.",
        "error"
      );
    }
  };

  // 개인정보 원래대로
  const myInfoReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setInputData((prevState) => ({
      ...prevState,
      userId: defaultData.userId,
      password: "",
      passwordChk: "",
      userName: defaultData.userName,
      email: defaultData.email,
    }));
  };

  // 여권정보 원래대로
  const passPortInfoReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setInputData((prevState) => ({
      ...prevState,
      userEngFN: defaultData.userEngFN,
      userEngLN: defaultData.userEngLN,
      passportNo: defaultData.passportNo,
      nationality: defaultData.nationality,
      passportExDate: defaultData.passportExDate,
      passportCOI: defaultData.passportCOI,
    }));
  };

  return (
    <Container>
      {/* 개인정보 입력 */}
      <form>
        <input
          type="text"
          id="userId"
          name="userId"
          value={inputData.userId}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          name="password"
          value={inputData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          id="passwordChk"
          name="passwordChk"
          value={inputData.passwordChk}
          onChange={handleChange}
        />
        <input
          type="text"
          id="userName"
          name="userName"
          value={inputData.userName}
          onChange={handleChange}
          readOnly
        />
        <label>
          <input
            type="radio"
            name="gender"
            value="M"
            checked={inputData.gender === "M"}
            readOnly
          />{" "}
          남
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="F"
            checked={inputData.gender === "F"}
            readOnly
          />{" "}
          여
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="N"
            checked={inputData.gender === "N"}
            readOnly
          />{" "}
          비공개
        </label>
        <input
          type="text"
          id="birth"
          name="birth"
          value={inputData.birth}
          onChange={handleChange}
          readOnly
        />
        <input
          type="email"
          id="email"
          name="email"
          value={inputData.email}
          onChange={handleChange}
        />
        <button onClick={myInfoSubmit}>개인정보 수정</button>
        <button onClick={myInfoReset}>개인정보 원래대로</button>
      </form>
      {/* 여권정보 입력 */}
      <form>
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
          id="nationality"
          name="nationality"
          value={inputData.nationality}
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
        <button onClick={passportInfoSubmit}>여권정보 수정</button>
        <button onClick={passPortInfoReset}>여권정보 원래대로</button>
      </form>
      {/* 회원탈퇴 */}
      <button>회원탈퇴 진행</button>
    </Container>
  );
}

export default MyInfo;
