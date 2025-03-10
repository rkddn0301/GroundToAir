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
  const [countryCodes, setCountryCodes] = useState<CountryCodeProps[]>([]); // 국적 코드 state

  useEffect(() => {
    countryCode();
  }, []);

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
                    />
                  )
                )}
              </div>

              {isLoggedIn && (
                <div>
                  <input type="checkBox" />
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
