// 예약정보입력

import { useHistory, useLocation } from "react-router-dom";
import { FlightPricing } from "../../../utils/api";
import { useEffect, useState } from "react";
import styled from "styled-components";
import TravelerInfoWrite from "./TravelerInfoWrite";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../../../utils/atom";
import axios from "axios";

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

const MoreIcon = styled.svg`
  width: 12px;
`;

// 동의 항목 선택란 디자인 구성
const AgreeMenu = styled.div`
  display: flex;
  justify-content: space-around;
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
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
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
    console.log("결제 진행 함수 클릭됨");

    let isError = false;

    // inputData의 모든 key에 대해 확인
    for (const key in inputData) {
      const index = parseInt(key);

      // userEngFN이 비어있으면 오류 메시지 추가
      if (inputData[index].userEngFN === "") {
        setErrorMsg((prevErrorMsg) => ({
          ...prevErrorMsg,
          [index]: {
            ...prevErrorMsg[index], // 기존 오류 메시지를 유지
            userEngFN: "성(영문)을 입력해주세요.", // 오류 메시지 추가
          },
        }));
        isError = true; // 오류가 있으면 isError를 true로 설정
      } else {
        setErrorMsg((prevErrorMsg) => ({
          ...prevErrorMsg,
          [index]: {
            ...prevErrorMsg[index], // 기존 오류 메시지를 유지
            userEngFN: "", // 오류 메시지 제거
          },
        }));
      }
    }

    // 오류가 있으면 결제 진행을 중단
    if (isError) {
      return;
    }

    // 오류가 없다면 결제 진행
    console.log("결제 진행 중...");
  };

  useEffect(() => {
    if (errorMsg) {
      console.log(errorMsg);
    }
  }, [errorMsg]);

  return (
    <Container>
      <DetailList>
        {/* 탑승자 정보 */}
        {data?.data.flightOffers.map(
          (priceOffers: FlightPricing, index: number) => (
            <div key={index} style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
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
                      setErrorMsg={setErrorMsg}
                    />
                  )
                )}
              </div>

              {isLoggedIn && (
                <div>
                  <input
                    type="checkBox"
                    onClick={() => setBooker((prev) => !prev)}
                  />
                  예약자와 동일
                </div>
              )}
            </div>
          )
        )}

        {/* 연락처 상세정보 */}
        <MainTitle>연락처 상세정보</MainTitle>
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

        {/* 동의항목 */}
        <div>
          <MainTitle>동의항목</MainTitle>
          <AgreeMenu>
            <span>이용 약관 동의</span>
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
          </AgreeMenu>
          {isDescriptionMored.termsOfService && (
            <div>
              본 항공편 예약을 진행하기 위해서는 이용 약관에 동의하셔야 합니다.
              예약 과정 중 발생할 수 있는 문제나 분쟁에 대해 규정된 내용을
              확인하시고 동의해 주세요.
            </div>
          )}

          <AgreeMenu>
            <span>개인정보 처리방침 동의</span>
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
          </AgreeMenu>

          {isDescriptionMored.privacyPolicy && (
            <div>
              저희는 예약을 진행하기 위해 필요한 개인정보를 수집하고 처리합니다.
              개인정보 처리방침을 확인하시고 동의해 주세요. 개인정보 보호에 관한
              상세한 내용은 정책을 통해 확인할 수 있습니다.
            </div>
          )}
        </div>

        {/* 결제수단 */}
        <div>
          <MainTitle>결제수단</MainTitle>
          <div>
            <label>
              <input
                type="radio"
                name="kakaoPay"
                value="kakaoPay"
                onChange={paymentMethodChecking}
                checked={isPaymentMethod.kakaoPay === true}
              />
              카카오페이
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tossPayments"
                value="tossPayments"
                onChange={paymentMethodChecking}
                checked={isPaymentMethod.tossPayments === true}
              />
              토스
            </label>
          </div>
        </div>

        <ButtonGroup>
          <ChoiceButton onClick={() => history.goBack()}>이전으로</ChoiceButton>

          <ChoiceButton onClick={proceedToPayment}>결제진행</ChoiceButton>
        </ButtonGroup>
      </DetailList>
    </Container>
  );
}

export default TravelerInfo;
