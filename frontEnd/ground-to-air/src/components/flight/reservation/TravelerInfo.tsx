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

  const [inputData, setInputData] = useState<{ [key: number]: InputData }>({}); // input 입력 state
  const [booker, setBooker] = useState(false); // 예약자 정보 자동 입력 state

  const [countryCodes, setCountryCodes] = useState<CountryCodeProps[]>([]); // 국적 코드 state

  // 초기 렌더링 동작
  useEffect(() => {
    countryCode();
  }, []);

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

  useEffect(() => {
    if (inputData) {
      console.log(inputData);
    }
  }, [inputData]);

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

  return (
    <Container>
      <DetailList>
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
                      booker={booker}
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
        <ButtonGroup>
          <ChoiceButton onClick={() => history.goBack()}>이전으로</ChoiceButton>

          <ChoiceButton>다음으로</ChoiceButton>
        </ButtonGroup>
      </DetailList>
    </Container>
  );
}

export default TravelerInfo;
