// 예약정보입력

import { useHistory, useLocation } from "react-router-dom";
import { FlightPricing } from "../../../utils/api";
import { useEffect, useState } from "react";
import styled from "styled-components";
import TravelerInfoWrite from "./TravelerInfoWrite";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../../../utils/atom";
import axios from "axios";
import { KakaoPayments, TossPayments } from "../../payment/Payments";
import KakaoPayImg from "../../../img/payment_icon_yellow_small.png";
import TossPayImg from "../../../img/Toss_Logo_Primary.png";
import { encryptionKey } from "../../../router/FlightSearch";
import CryptoJS from "crypto-js";

// TravelerInfo 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 예약 상세 목록
const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;
  background-color: ${(props) => props.theme.white.bg};
  padding: 30px 10px 30px 10px;
  margin: 0 auto;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 8px;
`;

// 탑승자 정보 전체 구성
const TravelerInfoGroup = styled.div`
  display: flex;
  width: 100%;
`;

// 탑승자 정보 리스트
const TravelerInfoList = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
`;

// '예약자와 동일' box
const MyInfoCopyBox = styled.div`
  width: 20%;
  color: ${(props) => props.theme.white.font};
  font-weight: 550;
  font-size: 17px;
  margin: 15px;

  input {
    width: 10%;
    transform: scale(1.5);
  }
`;

// 단락 구분
const ParagraphInfo = styled.div`
  margin: 0 2% 30px 8%;
  width: 90%;
`;

// 작성란 폼 전체 디자인 구성
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

// 강조 혹은 작성 오류 안내 메시지 디자인 구성
const GuideLine = styled.div`
  color: ${(props) => props.theme.white.warning};
  font-size: 11px;
  display: flex;
  justify-content: center;
`;

// 제목 구분
const TitleClassfication = styled.div`
  width: 80%;
  margin: 20px 0 20px 15px;
`;

// 제목 디자인 구성
const MainTitle = styled.h3`
  color: ${(props) => props.theme.white.font};
  font-size: 25px;
  font-weight: 600;
`;

// 작은 크기 작성란 전체 디자인 구성
const HalfFields = styled.div`
  width: 80%;
  display: flex;
  justify-content: space-between;
  margin-left: 15px;
  gap: 15px;
`;

// 오류 메시지 출력칸 나눔
const HalfLine = styled.div`
  width: 45%;
`;

// 작은 크기 작성란 구분 디자인 구성
const HalfField = styled.div`
  position: relative;
  width: 45%;
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

// 더 보기 icon
const MoreIcon = styled.svg`
  width: 20px;
  cursor: pointer;
`;

// 동의 항목 선택란 디자인 구성
const AgreeMenu = styled.div`
  width: 100%;
  display: flex;
  margin: 5px 0 5px 20px;

  // 동의 안내란
  span:first-child {
    flex: 1;
    font-size: 18px;
    font-weight: 550;
  }

  // 동의 선택란
  span:nth-child(2) {
    flex: 1;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
`;

// 동의 안내
const AgreementNotice = styled.div`
  width: 70%;
  margin-left: 10%;
  margin-right: 10%;
  padding: 15px;
  display: flex;
  justify-content: center;
  opacity: 0.7;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 8px;
  box-shadow: inset 2px 2px 15px rgba(0, 0, 0, 0.1);
`;

// 요금 정보
const PriceInfo = styled.div`
  border: 1px solid ${(props) => props.theme.black.font};
  background-color: ${(props) => props.theme.black.bg};
  padding: 15px;
  color: ${(props) => props.theme.black.font};
  opacity: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 20px;
`;

// 상세요금
const DetailedPrice = styled.div`
  width: 100%;
  display: flex;
  //justify-content: space-around;
  align-items: center;

  span:first-child {
    flex: 0.5;
  }

  span:nth-child(2) {
    flex: 1;
    text-align: left;
    //transform: translateX(15%);
  }

  div:nth-child(1) {
    flex: 1;
    text-align: right;
    //transform: translateX(50%);
  }

  span:last-child {
    flex: 0.5;
  }
`;

// 버튼 전체 구성
const ButtonGroup = styled.div`
  margin-top: 10px;
  width: 50%;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

// 버튼 디자인 구성
const ChoiceButton = styled.button`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 25%;
  padding: 15px 5px 15px 5px;
  border-radius: 10px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "skyblue" : props.theme.black.bg};
    color: ${(props) =>
      props.disabled ? props.theme.white.font : props.theme.black.font};
  }
`;

interface TravelerInfoProps {
  data: {
    flightOffers: FlightPricing[]; // Flight Offer Price 데이터
  };
}

// 탑승자 정보 입력란 타입
export interface InputData {
  userEngFN: string; // 성(영문)
  userEngLN: string; // 명(영문)
  birth: string; // 생년월일
  gender: string; // 성별
  passportNo: string; // 여권번호
  nationality: string; // 국적
  passportExDate: string; // 여권만료일
  passportCOI: string; // 여권발행국
  email: string; // 이메일
}

// 국적, 여권발행국 Select 값
export interface CountryCodeProps {
  codeNo: number;
  country: string;
  countryKor: string;
}

function TravelerInfo() {
  const isLoggedIn = useRecoilValue(isLoggedInState);

  const location = useLocation<{ data?: TravelerInfoProps }>();
  const { data } = location.state || {};

  const history = useHistory();

  // 정보 입력 관련 state
  const [inputData, setInputData] = useState<{ [key: number]: InputData }>({}); // input 입력 state
  const [errorMsg, setErrorMsg] = useState<{ [key: number]: InputData }>({}); // inputData 오류 메시지 state
  const [booker, setBooker] = useState(false); // 예약자 정보 자동 입력 state
  const [contactData, setContactData] = useState({
    userName: "", // 성명
    phoneNumber: "", // 연락처
    emergencyNumber: "", // 비상연락처
  }); // 연락처 상세정보 입력 state
  const [contactErrorMsg, setContactErrorMsg] = useState({
    userName: "", // 성명
    phoneNumber: "", // 연락처
    emergencyNumber: "", // 비상연락처
  }); // 연락처 상세정보 오류 state

  const [countryCodes, setCountryCodes] = useState<CountryCodeProps[]>([]); // 국적 코드 state

  // 동의 항목 관련 state
  const [isAgreed, setIsAgreed] = useState({
    termsOfService: false, // 이용 약관
    privacyPolicy: false, // 개인정보 처리방침
  }); // 동의 여부 state

  const [isDescriptionMored, setIsDescriptionMored] = useState({
    termsOfService: false, // 이용 약관
    privacyPolicy: false, // 개인정보 처리방침
  }); // 설명 더 보기 여부 state

  // 결제 수단 관련 state
  const [isPaymentMethod, setIsPaymentMethod] = useState({
    kakaoPay: false, // 카카오페이
    tossPayments: false, // 토스
  }); // 결제 수단 선택 여부 state

  // 초기 렌더링 동작
  useEffect(() => {
    countryCode();
  }, []);

  // data가 존재할 시 초기 인원 수에 맞게 데이터 초기화
  useEffect(() => {
    if (data) {
      console.log(data);
      const travelerPricings = data?.data.flightOffers[0].travelerPricings; // 인원 수

      // inputData를 배열로 초기화
      setInputData(
        travelerPricings.map(() => ({
          userEngFN: "", // 성(영문)
          userEngLN: "", // 명(영문)
          birth: "", // 생년월일
          gender: "", // 성별
          passportNo: "", // 여권번호
          nationality: "", // 국적
          passportExDate: "", // 여권만료일
          passportCOI: "", // 여권발행국
          email: "", // 이메일
        }))
      );
    }
  }, [data]);

  // 예약자와 동일 체크 여부
  useEffect(() => {
    if (booker) {
      bookerInfoCopy();
    } else {
      setInputData((prevState) => ({
        ...prevState,
        [0]: {
          ...prevState[0],
          userEngFN: "", // 성
          userEngLN: "", // 명
          birth: "",
          gender: "",
          passportNo: "",
          nationality: "",
          passportExDate: "",
          passportCOI: "",
          email: "",
        },
      }));
    }
  }, [booker]);

  // 오류 메시지 적용 필드
  // !!!!(typeof inputData)[number]는 inputData 배열 요소의 타입을 가져오고,
  // keyof는 그 요소 안의 가능한 키(userEngFN 등)를 가져온다.
  // 이렇게 쓰는 이유는 배열 요소 안의 키를 확실히 추론할 수 없기 때문에 타입을 명확히 제한하려는 목적임.
  const validateField = (
    index: number,
    field: keyof (typeof inputData)[number],
    message: string
  ) => {
    let isError = false;
    if (inputData[index][field] === "") {
      // 오류 메시지가 입력되기 전에 isError를 true로 설정
      isError = true;
    }
    setErrorMsg((prevErrorMsg) => ({
      ...prevErrorMsg,
      [index]: {
        ...prevErrorMsg[index],
        [field]: inputData[index][field] === "" ? message : "",
      },
    }));
    return isError;
  };

  // 국적 데이터 가져오기
  const countryCode = async () => {
    const response = await axios.get(`http://localhost:8080/country/code`);

    setCountryCodes(response.data);
  };

  // 예약자 정보 자동 입력 함수
  const bookerInfoCopy = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
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
        [0]: {
          ...prevState[0],
          userEngFN: response.data.passportUserEngName.split(" ")[0] || "", // 성
          userEngLN: response.data.passportUserEngName.split(" ")[1] || "", // 명
          birth: response.data.birth || "",
          gender: response.data.gender || "",
          passportNo: response.data.passportNo || "",
          nationality: response.data.nationality || "",
          passportExDate: response.data.passportExpirationDate || "",
          passportCOI: response.data.passportCountryOfIssue || "",
          email: response.data.email || "",
        },
      }));
    } catch (error) {
      console.error("개인정보 추출 실패 : ", error);
    }
  };

  // 연락처 상세정보 입력 함수
  const contactInfoWrite = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData((prevState) => ({
      ...prevState,
      [name]: value, // 변경된 필드만 업데이트
    }));

    // 성명 입력
    if (name === "userName") {
      setContactData((prevState) => ({
        ...prevState,
        userName: value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, ""),
      }));
    }

    // 연락처 입력
    else if (name === "phoneNumber") {
      setContactData((prevState) => ({
        ...prevState,
        phoneNumber: value.replace(/[^0-9]/g, ""),
      }));
    }

    // 비상연락처 입력
    else if (name === "emergencyNumber") {
      setContactData((prevState) => ({
        ...prevState,
        emergencyNumber: value.replace(/[^0-9]/g, ""),
      }));
    }
  };

  // 동의 여부 함수
  const agreeChecking = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const isValue = value === "true"; // value 값이 true, false 문자열 중 어떤 것인지 체크 후 boolean 값으로 변환

    // 이용 약관
    if (name === "termOfService") {
      setIsAgreed((prevState) => ({
        ...prevState,
        termsOfService: isValue,
      }));
    } else if (name === "privacyPolicy") {
      // 개인정보 처리방침
      setIsAgreed((prevState) => ({
        ...prevState,
        privacyPolicy: isValue,
      }));
    }
  };

  // 결제 수단 함수
  const paymentMethodChecking = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // 카카오페이
    if (value === "kakaoPay") {
      setIsPaymentMethod({
        kakaoPay: true,
        tossPayments: false,
      });
    }

    // 토스
    else if (value === "tossPayments") {
      setIsPaymentMethod({
        kakaoPay: false,
        tossPayments: true,
      });
    }
  };

  // 결제 진행 함수
  const proceedToPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let isError = false;

    /* 탑승자 정보 */
    // ! for-in은 객체의 key를 순회하기에 적합함
    for (const key in inputData) {
      const index = parseInt(key);

      isError =
        validateField(index, "userEngFN", "성(영문)을 입력해주세요.") ||
        isError;
      isError =
        validateField(index, "userEngLN", "명(영문)을 입력해주세요.") ||
        isError;
      isError =
        validateField(index, "birth", "생년월일을 선택해주세요.") || isError;
      isError =
        validateField(index, "gender", "성별을 선택해주세요.") || isError;
      isError =
        validateField(index, "passportNo", "여권번호를 입력해주세요.") ||
        isError;
      isError =
        validateField(index, "nationality", "국적을 선택해주세요.") || isError;
      isError =
        validateField(index, "passportExDate", "여권만료일을 선택해주세요.") ||
        isError;
      isError =
        validateField(index, "passportCOI", "여권발행국을 선택해주세요.") ||
        isError;
      isError =
        validateField(index, "email", "이메일을 입력해주세요.") || isError;

      // 추가적인 예외 검증

      const traveler = inputData[index];

      // 영문명 검증
      if (traveler.userEngFN && traveler.userEngFN?.length < 2) {
        isError = true;
        setErrorMsg((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            userEngFN: "영문 성은 최소 2글자 이상이어야 합니다.",
          },
        }));
      }

      if (traveler.userEngLN && traveler.userEngLN?.length < 2) {
        isError = true;
        setErrorMsg((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            userEngLN: "영문 이름은 최소 2글자 이상이어야 합니다.",
          },
        }));
      }

      // 생년월일 검증

      /*
      * 생년월일 규정
      EX) 2025년 3월 29일 ~ 2025년 3월 30일 여행
      - 성인
      > 성인끼리만 갈 경우 : 오는날 기준 만 12세 이상 (2013년 3월 30일 생 이후)
      > 어린이, 유아 동반 할 경우 : 가는날 기준 만 18세 이상 (2007년 3월 29일 생 이후)

      - 어린이 : 오는날 기준 만 2세 이상 ~ 만 12세 미만 (2013년 3월 31일 생 ~ 2023년 3월 30일 생)
      - 유아 : 오는날 기준 만 2세 미만 (2023년 3월 31일 생 이전)
      */

      if (traveler.birth) {
        // travelerPricings에서 해당 인덱스의 항목 가져오기
        const travelerPricing =
          data?.data?.flightOffers[0]?.travelerPricings[index];

        const departureDate =
          data?.data.flightOffers.at(-1)?.itineraries[0].segments[0].departure
            .at || ""; // 가는편 출발일 기준
        const reDepartureDate =
          data?.data.flightOffers.at(-1)?.itineraries[1].segments[0].departure
            .at || ""; // 오는편 출발일 기준
        const birthDay = new Date(traveler.birth); // 생년월일
        birthDay.setHours(0, 0, 0, 0); // 시간을 0시로 맞춤(기본으로 한국시간 +9:00로 되어있어서 수정함)
        const departure = new Date(departureDate); // 출발일
        const reDeparture = new Date(reDepartureDate); // 출발일

        if (travelerPricing) {
          let errorMsg = ""; // 오류메시지

          // ADULT, CHILD, INFANT에 대한 생년월일 조건 체크
          if (travelerPricing.travelerType === "ADULT") {
            // 어린이 혹은 유아가 동반 할 경우
            const childOrInfant =
              data?.data?.flightOffers[0]?.travelerPricings.some(
                (traveler) =>
                  traveler.travelerType === "CHILD" ||
                  traveler.travelerType === "HELD_INFANT"
              );

            const adultCutOffDate = childOrInfant
              ? new Date(
                  departure.getFullYear() - 18,
                  departure.getMonth(),
                  departure.getDate()
                )
              : new Date(
                  reDeparture.getFullYear() - 12,
                  reDeparture.getMonth(),
                  reDeparture.getDate()
                );
            adultCutOffDate.setHours(0, 0, 0, 0); // 시간을 0시로 맞춤(기본으로 한국시간 +9:00로 되어있어서 수정함)
            if (birthDay > adultCutOffDate) {
              isError = true;
              errorMsg = childOrInfant
                ? "성인의 생년월일을 확인해주세요. (어린이 혹은 유아 동반 시 만 18세 이상)"
                : "성인의 생년월일을 확인해주세요. (만 12세 이상)";
            }
          } else if (travelerPricing.travelerType === "CHILD") {
            const childMinDate = new Date(
              reDeparture.getFullYear() - 12,
              reDeparture.getMonth(),
              reDeparture.getDate()
            );
            const childMaxDate = new Date(
              reDeparture.getFullYear() - 2,
              reDeparture.getMonth(),
              reDeparture.getDate()
            );

            childMinDate.setHours(0, 0, 0, 0); // 시간을 0시로 맞춤(기본으로 한국시간 +9:00로 되어있어서 수정함)
            childMaxDate.setHours(0, 0, 0, 0); // 시간을 0시로 맞춤(기본으로 한국시간 +9:00로 되어있어서 수정함)
            if (birthDay <= childMinDate || birthDay > childMaxDate) {
              isError = true;
              errorMsg =
                "어린이의 생년월일을 확인해주세요. (만 2세 이상 ~ 만 12세 미만)";
            }
          } else if (travelerPricing.travelerType === "HELD_INFANT") {
            const infantMaxDate = new Date(
              reDeparture.getFullYear() - 2,
              reDeparture.getMonth(),
              reDeparture.getDate()
            );

            infantMaxDate.setHours(0, 0, 0, 0); // 시간을 0시로 맞춤(기본으로 한국시간 +9:00로 되어있어서 수정함)
            if (birthDay <= infantMaxDate) {
              isError = true;
              errorMsg = "유아의 생년월일을 확인해주세요. (만 2세 미만)";
            }
          }

          // setErrorMsg로 오류 메시지를 저장
          setErrorMsg((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              birth: errorMsg,
            },
          }));
        }
      }

      // 여권번호 검증 (6글자 이상)
      if (traveler.passportNo && traveler.passportNo?.length < 6) {
        isError = true;
        setErrorMsg((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            passportNo: "여권번호는 최소 6글자여야 합니다.",
          },
        }));
      }

      // 이메일 검증 (형식 맞는지)
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (traveler.email && !emailRegex.test(traveler.email)) {
        isError = true;
        setErrorMsg((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            email: "이메일 형식이 잘못되었습니다.",
          },
        }));
      }

      // 여권 만료일 검증
      if (traveler.passportExDate) {
        const departureDate =
          data?.data.flightOffers.at(-1)?.itineraries[0].segments[0].departure
            .at || "";

        const passportExDate = new Date(traveler.passportExDate); // 여권 만료일
        const departure = new Date(departureDate); // 출발일

        const sixMonthsLater = new Date(
          departure.setMonth(departure.getMonth() + 6)
        ); // 출발일 기준 6개월 후

        if (passportExDate < sixMonthsLater) {
          isError = true;
          setErrorMsg((prev) => ({
            ...prev,
            [index]: {
              ...prev[index],
              passportExDate: "여권 만료일이 출발일 기준으로 6개월 미만입니다.",
            },
          }));
        }
      }
    }

    /* 연락처 상세정보 */

    setContactErrorMsg((prevErrorMsg) => ({
      ...prevErrorMsg,
      userName: !contactData.userName ? "성명을 입력해주세요." : "",
      phoneNumber: !contactData.phoneNumber ? "연락처를 입력해주세요." : "",
      emergencyNumber: !contactData.emergencyNumber
        ? "비상연락처를 입력해주세요."
        : "",
    }));
    // contactData가 비어있는 경우 isError를 true로 설정
    if (
      !contactData?.userName ||
      !contactData?.phoneNumber ||
      !contactData?.emergencyNumber
    ) {
      isError = true;
    }

    // 성명 검증
    if (contactData.userName && contactData.userName?.length < 2) {
      isError = true;
      setContactErrorMsg((prevErrorMsg) => ({
        ...prevErrorMsg,
        userName: "성명은 최소 2글자 이상이어야 합니다.",
      }));
    }

    // 오류가 있으면 결제 진행을 중단
    if (isError) {
      return;
    }

    // 오류가 없다면 결제 진행
    try {
      if (isPaymentMethod.kakaoPay) {
        // 카카오페이
        KakaoPayments(total);
      } else if (isPaymentMethod.tossPayments) {
        // 토스페이먼츠
        TossPayments(
          total,
          inputData[0].email,
          contactData.userName,
          contactData.phoneNumber
        );
      }
      // 예약에 필요한 데이터 전송을 위해 sessionStorage에 등록
      sessionStorage.setItem(
        "pricing",
        CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString()
      );
      sessionStorage.setItem(
        "inputData",
        CryptoJS.AES.encrypt(
          JSON.stringify(inputData),
          encryptionKey
        ).toString()
      );
      sessionStorage.setItem(
        "contactData",
        CryptoJS.AES.encrypt(
          JSON.stringify(contactData),
          encryptionKey
        ).toString()
      );

      sessionStorage.setItem(
        "redirection",
        CryptoJS.AES.encrypt(
          JSON.stringify(history.location.pathname),
          encryptionKey
        ).toString()
      );
    } catch (error) {
      console.error("결제 진행 실패 : ", error);
    }
  };

  useEffect(() => {
    if (errorMsg) {
      console.log(errorMsg);
    }
  }, [errorMsg]);

  /* 결제금액 */

  const total = (data?.data?.flightOffers?.[0]?.travelerPricings ?? []).reduce(
    (sum, traveler) => sum + parseFloat(traveler.price.total),
    0
  ); // 총 요금

  useEffect(() => {
    console.log(isAgreed, isPaymentMethod);
  }, [isAgreed, isPaymentMethod]);

  return (
    <Container>
      <DetailList>
        {/* 탑승자 정보 */}
        {data?.data.flightOffers.map(
          (priceOffers: FlightPricing, index: number) => (
            <TravelerInfoGroup key={index}>
              <TravelerInfoList>
                {priceOffers.travelerPricings.map(
                  (travelerPricings, index: number) => (
                    <TravelerInfoWrite
                      key={index}
                      index={index}
                      travelerPricings={travelerPricings}
                      inputData={
                        inputData[index] || {
                          userEngFN: "",
                          userEngLN: "",
                          birth: "",
                          gender: "",
                          passportNo: "",
                          nationality: "",
                          passportExDate: "",
                          passportCOI: "",
                          email: "",
                        }
                      }
                      setInputData={setInputData}
                      countryCodes={countryCodes}
                      errorMsg={
                        errorMsg[index] || {
                          userEngFN: "",
                          userEngLN: "",
                          birth: "",
                          gender: "",
                          passportNo: "",
                          nationality: "",
                          passportExDate: "",
                          passportCOI: "",
                          email: "",
                        }
                      }
                    />
                  )
                )}
              </TravelerInfoList>

              {isLoggedIn && (
                <MyInfoCopyBox>
                  <input
                    type="checkBox"
                    checked={booker === true}
                    onClick={() => setBooker((prev) => !prev)}
                  />
                  예약자와 동일
                </MyInfoCopyBox>
              )}
            </TravelerInfoGroup>
          )
        )}

        {/* 연락처 상세정보 */}
        <ParagraphInfo>
          <Form>
            <TitleClassfication>
              <MainTitle>연락처 상세정보</MainTitle>
            </TitleClassfication>

            <HalfFields>
              <HalfField>
                <Label htmlFor="userName">성명</Label>
                <WriteInput
                  type="text"
                  id="userName"
                  name="userName"
                  placeholder="홍길동"
                  value={contactData.userName || ""}
                  onChange={contactInfoWrite}
                  minLength={1}
                  maxLength={15}
                />
              </HalfField>
              <HalfField>
                <Label htmlFor="phoneNumber">연락처</Label>
                <WriteInput
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="01011112222"
                  value={contactData.phoneNumber || ""}
                  onChange={contactInfoWrite}
                  maxLength={11}
                />
              </HalfField>
              <HalfField>
                <Label htmlFor="emergencyNumber">비상연락처</Label>
                <WriteInput
                  type="tel"
                  id="emergencyNumber"
                  name="emergencyNumber"
                  placeholder="01011112222"
                  value={contactData.emergencyNumber || ""}
                  onChange={contactInfoWrite}
                  maxLength={11}
                />
              </HalfField>
            </HalfFields>
            {(contactErrorMsg.userName ||
              contactErrorMsg.phoneNumber ||
              contactErrorMsg.emergencyNumber) && (
              <HalfFields>
                <HalfLine>
                  {contactErrorMsg.userName && (
                    <GuideLine>{contactErrorMsg.userName}</GuideLine>
                  )}
                </HalfLine>
                <HalfLine>
                  {contactErrorMsg.phoneNumber && (
                    <GuideLine>{contactErrorMsg.phoneNumber}</GuideLine>
                  )}
                </HalfLine>
                <HalfLine>
                  {contactErrorMsg.emergencyNumber && (
                    <GuideLine>{contactErrorMsg.emergencyNumber}</GuideLine>
                  )}
                </HalfLine>
              </HalfFields>
            )}
          </Form>
        </ParagraphInfo>

        {/* 동의항목 */}
        <ParagraphInfo>
          <Form>
            <TitleClassfication>
              <MainTitle>동의항목</MainTitle>
            </TitleClassfication>
            <AgreeMenu>
              <span>이용 약관 동의</span>
              <span>
                <label>
                  <input
                    type="radio"
                    name="termOfService"
                    value="true"
                    onChange={agreeChecking}
                    checked={isAgreed.termsOfService === true}
                  />
                  동의
                </label>
                <label>
                  <input
                    type="radio"
                    name="termOfService"
                    value="false"
                    onChange={agreeChecking}
                    checked={isAgreed.termsOfService === false}
                  />
                  동의 안함
                </label>

                {isDescriptionMored.termsOfService ? (
                  <MoreIcon
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6"
                    onClick={() =>
                      setIsDescriptionMored({
                        ...isDescriptionMored,
                        termsOfService: false,
                      })
                    }
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 15.75 7.5-7.5 7.5 7.5"
                    />
                  </MoreIcon>
                ) : (
                  <MoreIcon
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6"
                    onClick={() =>
                      setIsDescriptionMored({
                        ...isDescriptionMored,
                        termsOfService: true,
                      })
                    }
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </MoreIcon>
                )}
              </span>
            </AgreeMenu>
            {isDescriptionMored.termsOfService && (
              <AgreementNotice>
                본 항공편 예약을 진행하기 위해서는 이용 약관에 동의하셔야
                합니다. 예약 과정에서 입력하신 개인정보는 항공편 예약 및 서비스
                제공을 위해 사용됩니다. 또한 예약 완료 후 발생할 수 있는 일정
                변경, 취소, 지연 및 기타 문제에 대해 규정된 내용을 반드시
                확인하시고 동의해 주세요. 항공사 및 서비스 제공자의 규정에 따라
                추가 비용이 발생할 수 있으며, 이에 대한 책임은 고객에게
                있습니다.
              </AgreementNotice>
            )}

            <AgreeMenu>
              <span>개인정보 처리방침 동의</span>
              <span>
                <label>
                  <input
                    type="radio"
                    name="privacyPolicy"
                    value="true"
                    onChange={agreeChecking}
                    checked={isAgreed.privacyPolicy === true}
                  />
                  동의
                </label>
                <label>
                  <input
                    type="radio"
                    name="privacyPolicy"
                    value="false"
                    onChange={agreeChecking}
                    checked={isAgreed.privacyPolicy === false}
                  />
                  동의 안함
                </label>

                {isDescriptionMored.privacyPolicy ? (
                  <MoreIcon
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6"
                    onClick={() =>
                      setIsDescriptionMored({
                        ...isDescriptionMored,
                        privacyPolicy: false,
                      })
                    }
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 15.75 7.5-7.5 7.5 7.5"
                    />
                  </MoreIcon>
                ) : (
                  <MoreIcon
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="size-6"
                    onClick={() =>
                      setIsDescriptionMored({
                        ...isDescriptionMored,
                        privacyPolicy: true,
                      })
                    }
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </MoreIcon>
                )}
              </span>
            </AgreeMenu>

            {isDescriptionMored.privacyPolicy && (
              <AgreementNotice>
                저희는 예약을 진행하기 위해 필요한 개인정보를 수집하고
                처리합니다. 개인정보 처리방침을 확인하시고 동의해 주세요.
                개인정보 보호에 관한 상세한 내용은 정책을 통해 확인할 수
                있습니다.
              </AgreementNotice>
            )}
          </Form>
        </ParagraphInfo>

        {/* 결제수단 */}
        <ParagraphInfo>
          <Form>
            <TitleClassfication>
              <MainTitle>결제수단</MainTitle>
            </TitleClassfication>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="kakaoPay"
                    value="kakaoPay"
                    onChange={paymentMethodChecking}
                    checked={isPaymentMethod.kakaoPay === true}
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "15px",
                    }}
                  />
                  <img src={KakaoPayImg} />
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="tossPayments"
                    value="tossPayments"
                    onChange={paymentMethodChecking}
                    checked={isPaymentMethod.tossPayments === true}
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                  <img src={TossPayImg} />
                </label>
              </div>
            </div>
          </Form>
          {/* 결제금액 */}
          <PriceInfo>
            <DetailedPrice>
              <span />
              <span>결제금액</span>
              <div>
                <div>{"\\" + new Intl.NumberFormat("ko-KR").format(total)}</div>
                <div
                  style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}
                >
                  유류할증료 및 제세공과금 포함
                </div>
              </div>
              <span />
            </DetailedPrice>
          </PriceInfo>
        </ParagraphInfo>

        <ButtonGroup>
          <ChoiceButton onClick={() => history.goBack()}>이전으로</ChoiceButton>

          <ChoiceButton
            onClick={proceedToPayment}
            disabled={
              !Object.values(isAgreed).every((value) => value === true) ||
              !Object.values(isPaymentMethod).some((value) => value === true)
            }
          >
            결제진행
          </ChoiceButton>
        </ButtonGroup>
      </DetailList>
    </Container>
  );
}

export default TravelerInfo;
