// 개인정보 페이지

import styled from "styled-components";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Confirm } from "../utils/sweetAlert";
import { useHistory } from "react-router-dom";
import {
  federationAccessToken,
  isLoggedInState,
  socialId,
} from "../utils/atom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { inactivityTimer, refreshInterval } from "../utils/jwtActivityTimer";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import { format } from "date-fns";

// MyInfo 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 개인정보/여권/회원탈퇴 구분 카드 구성
const Card = styled.div`
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 5px;
  width: 80%;
  margin: 0 auto;
`;

// 강조 혹은 작성 오류 안내 메시지 디자인 구성
const GuideLine = styled.div`
  color: red;
  font-size: 11px;
  display: flex;
  justify-content: center;
`;

// 작성 성공 안내 메시지 디자인 구성
const SuccessLine = styled.div`
  color: skyblue;
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

// 카드 구분별 제목 디자인 구성
const MainTitle = styled.h3`
  color: ${(props) => props.theme.white.font};
  font-size: 25px;
  font-weight: 600;
`;

// 작성란 구분 디자인 구성
const Field = styled.div`
  position: relative;
  width: 80%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

// 작은 크기 작성란 전체 디자인 구성
const HalfFields = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-between;
`;

// 작은 크기 작성란 구분 디자인 구성
const HalfField = styled.div`
  position: relative;
  width: 45%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  padding: 15px;
`;

// 성별 선택란 디자인 구성
const GenderMenu = styled.div`
  display: flex;
  justify-content: space-around;
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

// 달력 전체 디자인 구성
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

// 선택란 전체 디자인 구성
const SelectMenu = styled.div`
  display: flex;
  justify-content: center;
`;

// 국적, 여권발행국 선택란 디자인 구성
const SelectInput = styled.select`
  width: 80%;
  border-radius: 5px;
  padding: 5px;
  font-size: 14px;
  // text-align: center;
`;

// 버튼 전체 디자인 구성
const SubmitField = styled.div`
  width: 50%;
  display: flex;
  gap: 30px;
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

// 국적, 여권발행국 Select 값
interface CountryCodeProps {
  codeNo: number;
  country: string;
  countryKor: string;
}

function MyInfo() {
  const setIsLoggedIn = useSetRecoilState(isLoggedInState); // 로그인 여부 atom
  const [inputData, setInputData] = useState({
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

    socialType: "", // 인증 타입
  }); // 기존 정보 저장 state

  const [errorMsg, setErrorMsg] = useState({
    userId: "",
    password: "",
    passwordChk: "",
    userName: "",
    email: "",
  }); // 오류 메시지 표시 state

  const [successMsg, setSuccessMsg] = useState({
    userId: "",
    email: "",
  }); // 성공 메시지 표시 state

  const history = useHistory();

  // 타사인증 데이터 가져옴
  const defaultSocialId = useRecoilValue(socialId);
  const defaultFederationAccessToken = useRecoilValue(federationAccessToken);

  const [countryCodes, setCountryCodes] = useState<CountryCodeProps[]>([]); // 국적 코드 state

  const [idExisting, setIdExisting] = useState(false); // 아이디 중복 여부 스위칭
  const [emailExisting, setEmailExisting] = useState(false); // 이메일 중복 여부 스위칭
  const [passwordExisting, setPasswordExisting] = useState(false); // 비밀번호 중복 여부 스위칭
  const [passwordChecking, setPasswordChecking] = useState(false); // 비밀번호 체크 여부 스위칭

  // 개인정보 페이지 접속 시 기존 정보를 가져오기 위해 동작
  useEffect(() => {
    defaultMyInfoHandler();
    countryCode();
  }, []);

  useEffect(() => {
    console.log(defaultSocialId);
    console.log(defaultFederationAccessToken);
  }, [defaultFederationAccessToken]);

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

        socialType: string;
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
        socialType: response.data.socialType || "",
      }));
    } catch (error) {
      console.error("개인정보 추출 실패:", error);
    }
  };

  // 국적 데이터 가져오기
  const countryCode = async () => {
    const response = await axios.get(`http://localhost:8080/country/code`);

    setCountryCodes(response.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setInputData((prevState) => ({
      ...prevState,
      [name]: value, // 변경된 필드만 업데이트
    }));

    // 아이디 입력
    if (name === "userId") {
      setIdExisting(false); // 아이디 변경 시 기존 중복체크 내용은 자동으로 비활성화
      setSuccessMsg({
        ...successMsg,
        userId: "",
      });

      // 아이디 규칙 : 영문자 및 숫자, 길이 6~15
      if (!/^[a-zA-Z0-9]{6,15}$/.test(value)) {
        setErrorMsg({
          ...errorMsg,
          userId: "아이디는 영문자 및 숫자로 6~15자여야 합니다.",
        });
      } else {
        setErrorMsg({ ...errorMsg, userId: "" });
      }
    }
    // 비밀번호 입력
    else if (name === "password") {
      setPasswordExisting(false); // 비밀번호 변경 시 기존 중복체크 내용은 자동으로 비활성화

      // 비밀번호 규칙 : 영문자+숫자+특수문자, 길이 8~15자

      if (value === "") {
        // 1. 비밀번호가 비어 있을 시 password errorMsg 제거
        setErrorMsg((prev) => ({ ...prev, password: "" }));
        setErrorMsg((prev) => ({
          // 3. 비밀번호가 비어있던 적혀있던 비밀번호 확인란이랑 일치하지 않으면 passwordChk에 errorMsg 표시
          ...prev,
          passwordChk:
            inputData.passwordChk !== ""
              ? "비밀번호가 일치하지 않습니다. 다시 확인해주세요."
              : "",
        }));
      } else {
        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_]).{8,15}$/.test(value)) {
          // 2. 비밀번호가 적혀있을 때 규칙에 어긋나면 password에 erorrMsg를 표시
          setErrorMsg((prev) => ({
            ...prev,
            password: "비밀번호는 영문자, 숫자, 특수문자로 8~15자여야 합니다.",
          }));
        } else {
          setErrorMsg((prev) => ({ ...prev, password: "" }));
        }

        // 비밀번호 입력 시 비밀번호 확인도 체크
        if (inputData.passwordChk !== value) {
          setErrorMsg((prev) => ({
            ...prev,
            passwordChk: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
          }));
        } else {
          setErrorMsg((prev) => ({ ...prev, passwordChk: "" }));
        }
      }
    }

    // 비밀번호 확인 입력
    else if (name === "passwordChk") {
      setPasswordChecking(false);
      if (inputData.password !== e.target.value) {
        setErrorMsg({
          ...errorMsg,
          passwordChk: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
        });
      } else {
        setPasswordChecking(true);
        setErrorMsg({ ...errorMsg, passwordChk: "" });
      }
    }

    //  이메일 입력
    else if (name === "email") {
      setEmailExisting(false); // 이메일 변경 시 기존 중복체크 내용은 자동으로 비활성화
      setSuccessMsg({
        ...successMsg,
        email: "",
      });
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
    }

    // 성(영문) 입력
    else if (name === "userEngFN") {
      setInputData({
        ...inputData,
        userEngFN: value.toUpperCase().replace(/[^A-Z]/g, ""),
      }); // 대문자로만 작성
    }

    // 명(영문) 입력
    else if (name === "userEngLN") {
      setInputData({
        ...inputData,
        userEngLN: value.toUpperCase().replace(/[^A-Z]/g, ""),
      });
    }

    // 여권번호 입력
    else if (name === "passportNo") {
      setInputData((prevData) => ({
        ...prevData,
        passportNo: value,
        nationality: value === "" ? "" : prevData.nationality,
        passportExDate: value === "" ? "" : prevData.passportExDate,
        passportCOI: value === "" ? "" : prevData.passportCOI,
      }));
    }
  };

  // 국적 선택란 변경 시 동작
  const nationalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, nationality: value });
  };

  // 여권만료일 달력 변경 시 동작
  const passPortExDateChange = (date: Date | null) => {
    if (date) {
      setInputData({
        ...inputData,
        passportExDate: format(date, "yyyy-MM-dd"),
      }); // Date --> String 변환하여 passPortExDate에 삽입
    } else {
      setInputData({ ...inputData, passportExDate: "" });
    }
  };

  // 여권발행국 선택란 변경 시 동작
  const passportCOIChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setInputData({ ...inputData, passportCOI: value });
  };

  // 아이디 입력란 벗어날 시 동작
  const userIdBlur = async () => {
    // 기존 아이디와 동일하면 동작 할 필요 없음
    if (inputData.userId !== defaultData.userId) {
      if (inputData.userId && !idExisting && !errorMsg.userId) {
        const response = await axios.get(`http://localhost:8080/user/idCheck`, {
          params: {
            userId: inputData.userId,
          },
        });

        if (response.data > 0) {
          setIdExisting(true);
          setErrorMsg({
            ...errorMsg,
            userId: "",
          });

          setSuccessMsg({
            ...successMsg,
            userId: "사용 가능한 아이디입니다.",
          });
        } else {
          setIdExisting(false);
          setSuccessMsg({
            ...successMsg,
            userId: "",
          });

          setErrorMsg({
            ...errorMsg,
            userId: "이미 존재하는 아이디입니다.",
          });
        }
      }
    }
  };

  // 비밀번호 입력란 벗어날 시 동작
  const passwordBlur = async () => {
    if (inputData.password && !passwordExisting && !errorMsg.password) {
      console.log("비밀번호 입력란 띄움");
      const response = await axios.get(`http://localhost:8080/user/pwCheck`, {
        params: {
          userNo: defaultData.userNo,
          password: inputData.password,
        },
      });

      if (response.data > 0) {
        setPasswordExisting(true);
        setErrorMsg({
          ...errorMsg,
          password: "",
        });
      } else {
        setPasswordExisting(false);

        setErrorMsg({
          ...errorMsg,
          password: "이전 비밀번호와 동일합니다.",
        });
      }
    }
  };

  // 이메일 작성란을 벗어날 시 동작
  const emailBlur = async () => {
    // 기존 이메일과 동일하면 동작 할 필요 없음
    if (inputData.email !== defaultData.email) {
      if (inputData.email && !emailExisting && !errorMsg.email) {
        const response = await axios.get(
          `http://localhost:8080/user/emailCheck`,
          {
            params: {
              email: inputData.email,
            },
          }
        );

        if (response.data > 0) {
          setEmailExisting(true);
          setErrorMsg({
            ...errorMsg,
            email: "",
          });
          setSuccessMsg({
            ...successMsg,
            email: "사용 가능한 이메일입니다.",
          });
        } else {
          setEmailExisting(false);
          setSuccessMsg({
            ...successMsg,
            email: "",
          });
          setErrorMsg({
            ...errorMsg,
            email: "이미 존재하는 이메일입니다.",
          });
        }
      }
    }
  };

  // 개인정보 수정
  const myInfoSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("개인정보 수정");
    console.log(
      defaultData.userNo,
      inputData.userId,
      inputData.password,
      inputData.email
    );

    // 1. 작성란이 비어있을 경우 확인
    if (inputData.userId === "") {
      document.getElementById("userId")?.focus();
      setErrorMsg((prev) => ({ ...prev, userId: "아이디를 입력해주세요." }));

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
    } else if (errorMsg.passwordChk !== "") {
      document.getElementById("passwordChk")?.focus();

      return;
    } else if (errorMsg.email !== "") {
      document.getElementById("email")?.focus();
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/user/myInfoUpdate`,
        {
          userNo: defaultData.userNo,
          userId: inputData.userId,
          password: inputData.password,
          email: inputData.email,
        }
      );

      if (response.data) {
        const successAlert = await Alert(
          "개인정보 수정이 완료되었습니다.<br>다시 로그인 해주십시오.",
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
      defaultData.userNo,
      inputData.passportNo,
      engFullName,
      inputData.nationality,
      inputData.passportExDate,
      inputData.passportCOI
    );

    // 여권번호가 작성된 상태에서 국적, 여권만료일, 여권발행국 중 비어있을 경우
    if (
      inputData.passportNo &&
      (!inputData.nationality ||
        !inputData.passportExDate ||
        !inputData.passportCOI)
    ) {
      Alert(
        "여권번호가 입력된 경우 국적, 여권만료일, 여권발행국이 모두 작성되어야 합니다.",
        "warning"
      );
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/user/passportInfoUpdate`,
        {
          userNo: defaultData.userNo,
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

    setErrorMsg((prevState) => ({
      ...prevState,
      userId: "",
      password: "",
      passwordChk: "",
      userName: "",
      email: "",
    }));

    setSuccessMsg((prevState) => ({
      ...prevState,
      userId: "",
      email: "",
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

  // 회원탈퇴
  const memberDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("회원 탈퇴 클릭");

    const deleteConfirm = await Confirm(
      "회원탈퇴를 진행하시겠습니까?<br>진행하시면 더 이상 되돌리실 수 없습니다.",
      "question"
    );

    if (deleteConfirm.isConfirmed) {
      if (defaultData.socialType === "KAKAO") {
        kakaoUnlink();
      } else if (defaultData.socialType === "GOOGLE") {
        googleUnlink();
      }

      try {
        const response = await axios.post("http://localhost:8080/user/delete", {
          userNo: defaultData.userNo,
        });
        console.log(response.data);

        if (response.data) {
          const successAlert = await Alert(
            "회원탈퇴가 완료되었습니다.<br>그동안 이용해주셔서 감사합니다.",
            "success"
          );
          if (successAlert.isConfirmed) {
            setIsLoggedIn(false);
            clearTimeout(inactivityTimer);
            clearInterval(refreshInterval);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            history.push("/");
          }
        }
      } catch (error) {
        console.error("회원탈퇴 실패 : ", error);
        Alert("회원 탈퇴하는 도중 오류가 발생하였습니다.", "error");
      }
    }
  };

  // 카카오 로그인 연결 끊기
  const kakaoUnlink = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/user/kakaoUnlink",
        {
          target_id_type: "user_id",
          target_id: defaultSocialId,
          accessToken: defaultFederationAccessToken,
        }
      );

      if (response.data) {
        console.log("연결 끊기 성공");
      }
    } catch (error) {
      console.error("카카오 연결 끊기 실패", error);
    }
  };

  // 구글 로그인 연결 끊기
  const googleUnlink = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/user/googleUnlink",
        {
          accessToken: defaultFederationAccessToken,
        }
      );

      if (response.data) {
        console.log("연결 끊기 성공");
      }
    } catch (error) {
      console.error("구글 연결 끊기 실패", error);
    }
  };

  return (
    <Container>
      {/* 개인정보 입력 */}
      {defaultData.socialType === "DIRECT" && (
        <Card>
          <Form>
            <MainTitle>개인정보 입력</MainTitle>
            <Field>
              <Label htmlFor="userId">아이디</Label>
              <WriteInput
                type="text"
                id="userId"
                name="userId"
                placeholder="gildong1231"
                value={inputData.userId}
                onChange={handleChange}
                minLength={6}
                maxLength={15}
                onBlur={userIdBlur}
              />
            </Field>
            {errorMsg.userId && <GuideLine>{errorMsg.userId}</GuideLine>}
            {successMsg.userId && (
              <SuccessLine>{successMsg.userId}</SuccessLine>
            )}
            <Field>
              <Label htmlFor="password">비밀번호</Label>
              <WriteInput
                type="password"
                id="password"
                name="password"
                value={inputData.password}
                onChange={handleChange}
                minLength={8}
                maxLength={15}
                onBlur={passwordBlur}
              />
            </Field>
            {errorMsg.password && <GuideLine>{errorMsg.password}</GuideLine>}
            <Field>
              <Label htmlFor="passwordChk">비밀번호 확인</Label>
              <WriteInput
                type="password"
                id="passwordChk"
                name="passwordChk"
                value={inputData.passwordChk}
                onChange={handleChange}
                minLength={8}
                maxLength={15}
              />
            </Field>
            {errorMsg.passwordChk && (
              <GuideLine>{errorMsg.passwordChk}</GuideLine>
            )}
            <HalfFields>
              <HalfField>
                <Label htmlFor="userName">성명</Label>
                <WriteInput
                  type="text"
                  id="userName"
                  name="userName"
                  placeholder="홍길동"
                  value={inputData.userName}
                  disabled
                />
              </HalfField>
              <HalfField>
                <Label htmlFor="gender">성별</Label>
                <GenderMenu>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={inputData.gender === "M"}
                      disabled
                    />{" "}
                    남
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={inputData.gender === "F"}
                      disabled
                    />{" "}
                    여
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="N"
                      checked={inputData.gender === "N"}
                      disabled
                    />{" "}
                    비공개
                  </label>
                </GenderMenu>
              </HalfField>
            </HalfFields>
            <Field>
              <Label>생년월일</Label>
              <CalendarInput>
                <DatePicker
                  selected={inputData.birth ? new Date(inputData.birth) : null}
                  showIcon // 달력 아이콘 활성화
                  locale={ko} // 한국어로 변경
                  dateFormat="yyyy-MM-dd"
                  placeholderText="YYYY-MM-DD"
                  showYearDropdown // 연도 선택 기능
                  scrollableYearDropdown // 연도 선택 스크롤 기능
                  minDate={new Date(1900, 0, 1)} // 1900년 1월 1일
                  maxDate={new Date()} // 현재 날짜
                  yearDropdownItemNumber={new Date().getFullYear() - 1900 + 1} // 1900년 ~ 현재년도 까지 표시
                  showMonthDropdown // 월 선택 기능
                  id="birth"
                  name="birth"
                  disabled
                />
              </CalendarInput>
            </Field>
            <Field>
              <Label htmlFor="email">이메일</Label>
              <WriteInput
                type="email"
                id="email"
                name="email"
                placeholder="gildong1231@email.com"
                value={inputData.email}
                onChange={handleChange}
                minLength={1}
                maxLength={30}
                onBlur={emailBlur}
              />
            </Field>
            {errorMsg.email && <GuideLine>{errorMsg.email}</GuideLine>}
            {successMsg.email && <SuccessLine>{successMsg.email}</SuccessLine>}
            <SubmitField>
              <SubmitBtn onClick={myInfoSubmit}>개인정보 수정</SubmitBtn>
              <SubmitBtn onClick={myInfoReset}>개인정보 원래대로</SubmitBtn>
            </SubmitField>
          </Form>
        </Card>
      )}

      {/* 여권정보 입력 */}
      <Card>
        <Form>
          <MainTitle>여권정보 입력</MainTitle>
          <HalfFields>
            <HalfField>
              <Label htmlFor="userEngFN">성&#40;영문&#41;</Label>
              <WriteInput
                type="text"
                id="userEngFN"
                name="userEngFN"
                placeholder="HONG"
                value={inputData.userEngFN}
                onChange={handleChange}
                minLength={1}
                maxLength={10}
              />
            </HalfField>
            <HalfField>
              <Label htmlFor="userEngLN">명&#40;영문&#41;</Label>
              <WriteInput
                type="text"
                id="userEngLN"
                name="userEngLN"
                placeholder="GILDONG"
                value={inputData.userEngLN}
                onChange={handleChange}
                minLength={1}
                maxLength={15}
              />
            </HalfField>
          </HalfFields>
          <Field>
            <Label htmlFor="passportNo">여권번호</Label>
            <WriteInput
              type="text"
              id="passportNo"
              name="passportNo"
              placeholder="A12345678"
              value={inputData.passportNo}
              onChange={handleChange}
              minLength={6}
              maxLength={10}
            />
          </Field>
          <Field>
            <Label htmlFor="nationality">국적</Label>
            <SelectMenu>
              <SelectInput
                value={inputData.nationality}
                onChange={nationalityChange}
                disabled={!inputData.passportNo}
              >
                <option value="">-- 국적을 선택해주세요. --</option>
                {countryCodes.map((code) => (
                  <option key={code.codeNo} value={code.country}>
                    {code.countryKor}
                  </option>
                ))}
              </SelectInput>
            </SelectMenu>
          </Field>
          <Field>
            <Label htmlFor="passportExDate">여권만료일</Label>
            <CalendarInput>
              <DatePicker
                selected={
                  inputData.passportExDate
                    ? new Date(inputData.passportExDate)
                    : null
                }
                showIcon // 달력 아이콘 활성화
                isClearable // 초기화
                locale={ko} // 한국어로 변경
                onChange={passPortExDateChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="YYYY-MM-DD"
                showYearDropdown // 연도 선택 기능
                scrollableYearDropdown // 연도 선택 스크롤 기능
                minDate={new Date()} // 현재 날짜
                maxDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() + 10)
                  )
                } // 10년 뒤
                yearDropdownItemNumber={
                  new Date().getFullYear() + 10 - new Date().getFullYear()
                } // 현재년도 ~ 10년 뒤 현재일 까지 표시
                showMonthDropdown // 월 선택 기능
                disabled={!inputData.passportNo}
              />
            </CalendarInput>
          </Field>
          <Field>
            <Label htmlFor="passportCOI">여권발행국</Label>
            <SelectMenu>
              <SelectInput
                value={inputData.passportCOI}
                onChange={passportCOIChange}
                disabled={!inputData.passportNo}
              >
                <option value="">-- 국적을 선택해주세요. --</option>
                {countryCodes.map((code) => (
                  <option key={code.codeNo} value={code.country}>
                    {code.countryKor}
                  </option>
                ))}
              </SelectInput>
            </SelectMenu>
          </Field>
          <SubmitField>
            <SubmitBtn onClick={passportInfoSubmit}>여권정보 수정</SubmitBtn>
            <SubmitBtn onClick={passPortInfoReset}>여권정보 원래대로</SubmitBtn>
          </SubmitField>
        </Form>
      </Card>
      {/* 회원탈퇴 */}
      <Card>
        <Form>
          <MainTitle>회원탈퇴</MainTitle>
          <SubmitField>
            <SubmitBtn onClick={memberDelete}>회원탈퇴 진행</SubmitBtn>
          </SubmitField>
        </Form>
      </Card>
    </Container>
  );
}

export default MyInfo;
