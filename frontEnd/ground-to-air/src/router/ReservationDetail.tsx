// 예약 상세

import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Alert, Confirm } from "../utils/sweetAlert";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FlightReservation } from "./ReservationList";
import { AirlineCodes, CountryCodes, IataCodes, Travelers } from "../utils/api";
import FlightReservationResult from "../components/flight/reservation/FlightReservationResult";
import {
  fetchAirlineCodes,
  fetchCountryCodes,
  fetchIataCodes,
} from "../utils/useAirCodeData";
import { formatDate, formatTime } from "../utils/formatTime";
import { seatKor } from "../utils/seatClass";

// 예약상세 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 항공편 로딩 중 전체 디자인 구성
const Loading = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// 로딩 중... 원형 디자인 구성
const Spinner = styled(motion.div)`
  border: 4px solid ${(props) => props.theme.white.font};
  border-top: 4px solid ${(props) => props.theme.background}; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
  border-radius: 50%;
  width: 16px;
  height: 16px;
`;

// 예약상세 구성 박스
const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  background-color: ${(props) => props.theme.white.bg};
  padding: 30px 10px 30px 20px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.2);
`;

// 제목 디자인
const MainTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
`;

// 예약 정보
const RevInfo = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 18px;
  margin-bottom: 20px;
`;

// 예약 정보 자간
const RevInfoGroupsSpace = styled.div`
  display: flex;

  span:first-child {
    flex: 1;
  }

  span:last-child {
    flex: 1;
    text-align: left;
  }
`;

// 예약 정보 요소 제목
const RevInfoElementTitle = styled.label`
  font-weight: 550;
`;

// 요소 제목
const ElementTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isWidth"].includes(prop),
})<{
  isWidth: string;
}>`
  display: flex;
  width: ${(props) => props.isWidth};
  justify-content: center;
  align-items: center;
  padding: 5px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid ${(props) => props.theme.white.font};
`;

// 요소 값
const ElementValue = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isWidth"].includes(prop),
})<{
  isWidth: string;
}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.isWidth};
  justify-content: center;
  align-items: center;
  border: 1px solid ${(props) => props.theme.white.font};
  gap: 10px;
  font-size: 90%;
  padding: 5px;
  word-break: break-word;
`;

// 요금 정보
const PriceInfo = styled.div`
  border: 1px solid ${(props) => props.theme.black.font};
  background-color: ${(props) => props.theme.black.bg};
  padding: 5px;
  color: ${(props) => props.theme.black.font};
  opacity: 80%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

// 상세요금
const DetailedPrice = styled.div`
  width: 100%;
  display: flex;
  //justify-content: space-around;

  span:first-child {
    flex: 1;
  }

  span:nth-child(2) {
    flex: 1;
    text-align: left;
    //transform: translateX(15%);
  }

  span:nth-child(3) {
    flex: 1;
    text-align: right;
    //transform: translateX(50%);
  }

  span:last-child {
    flex: 1;
  }
`;

// 버튼 전체 구성
const ButtonGroup = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

// 버튼 디자인 구성
const ChoiceButton = styled.button`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 20%;
  padding: 15px 5px 15px 5px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

function ReservationDetail() {
  const location = useLocation<{ revName?: string; revCode?: string }>();
  const { revName, revCode } = location.state || {};

  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const [revData, setRevData] = useState<FlightReservation | null>(null);

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출
  const [iataCodeOffers, setIataCodeOffers] = useState<IataCodes[]>([]); // 공항 코드 추출

  const [countryCodes, setCountryCodes] = useState<CountryCodes[]>([]); // 국적 코드 추출

  useEffect(() => {
    if (revName !== undefined && revCode !== undefined) {
      // 항공편 데이터 추출
      const airCodeFetch = async () => {
        const airlineCodes = await fetchAirlineCodes();
        const iataCodes = await fetchIataCodes();
        const countryCodes = await fetchCountryCodes();
        setAirlineCodeOffers(airlineCodes); // 항공사 코드
        setIataCodeOffers(iataCodes); // 공항 코드
        setCountryCodes(countryCodes); // 국적 코드
      };
      airCodeFetch();
      reservationDataExtraction(revName, revCode);
    }
  }, [revName, revCode]);

  // 예약 상세 데이터 추출
  const reservationDataExtraction = async (
    revName: string,
    revCode: string
  ) => {
    try {
      console.log("reservationDataExtraction");
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8080/reservation/reservationDetail`,
        {
          revName: revName,
          revCode: revCode,
        }
      );
      // 예약자명, 예약코드가 일치하지 않을 경우
      if (response.data.length === 0) {
        const errorAlert = await Alert(
          "예약자명 혹은 예약코드가 일치하지 않습니다.",
          "error"
        );

        if (errorAlert.isConfirmed || errorAlert.isDismissed) {
          history.goBack();
          return;
        }
      } else {
        setRevData(response.data[0]);
      }
    } catch (error) {
      console.error("예약 상세 데이터 가져오기 실패 : ", error);
    }
  };

  useEffect(() => {
    if (revData && iataCodeOffers.length > 0 && airlineCodeOffers.length > 0) {
      console.log(revData);
      setIsLoading(false);
    }
  }, [revData, iataCodeOffers, airlineCodeOffers]);

  // 예약취소 함수
  const revListDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const deleteConfirm = await Confirm("삭제하시겠습니까?", "question");

    if (deleteConfirm.isConfirmed) {
      try {
        const response = await axios.post(
          "http://localhost:8080/reservation/revDelete",
          {
            revId: revData?.revId,
          }
        );
        console.log(response.data);
        if (response.data) {
          const successAlert = await Alert("삭제가 완료되었습니다.", "success");

          if (successAlert.isConfirmed || successAlert.isDismissed) {
            history.replace("/");
          }
        }
      } catch (error) {
        console.error("예약내역 삭제 실패 : ", error);
        Alert("삭제 도중 오류가 발생하였습니다.", "error");
      }
    }
  };

  // 예약정보

  // 가는편
  const carrierCode =
    airlineCodeOffers.find((airline) => airline.iata === revData?.airlinesIata)
      ?.airlinesKor || ""; // 항공사명

  // 오는편

  const returnCarrierCode =
    airlineCodeOffers.find(
      (airline) => airline.iata === revData?.reAirlinesIata
    )?.airlinesKor || ""; // 항공사명

  const travelerPricings =
    revData?.orders?.data.flightOffers?.at(-1)?.travelerPricings ?? []; // 탑승자 결제정보

  const phoneNumber =
    revData?.orders?.data.travelers[0].contact.phones[0].number ?? ""; // 연락처
  const emergencyNumber =
    revData?.orders?.data.travelers[0].emergencyContact.number ?? ""; // 비상연락처

  // 요금 관련
  // reduce는 첫 번째 매개변수로 누적값을 받고, 두 번째 매개변수로 배열의 각 요소를 처리해 누적값을 계산하며, 초기값은 숫자, 문자 등 어떤 값도 될 수 있음.
  // forEach는 배열 내부 각 요소에 대해 반복적으로 순환시킬 수 있으나 반환은 하지 않는다. 따라서 reduce에서 누적해야 할 값을 forEach에 넣으면 계산만 해주고 reduce가 별도로 누적된 값을 return 할 수 있다.

  const peoples = travelerPricings.length ?? 0; // 인원 수

  const base =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      travelerPricings.reduce(
        (sum, traveler) => sum + parseFloat(traveler.price.base),
        0
      ) ?? 0
    ); // 항공 요금

  const fuelSurcharge =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      travelerPricings.reduce((sum, traveler) => {
        traveler.price.taxes?.forEach((tax) => {
          // code가 "YQ" 혹은 "YR" 일 경우 sum에 amount 값을 누적 계산함.
          if (tax.code === "YQ" || tax.code === "YR") {
            sum += parseFloat(tax.amount);
          }
        });
        return sum;
      }, 0) ?? 0
    ); // 유류할증료(YQ/YR)

  const taxFees =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      travelerPricings.reduce((sum, traveler) => {
        traveler.price.taxes?.forEach((tax) => {
          // code 중 "YQ","YR"를 제외한 모든 amount 값을 sum에 누적 계산함.
          if (tax.code !== "YQ" && tax.code !== "YR") {
            sum += parseFloat(tax.amount);
          }
        });
        return sum;
      }, 0) ?? 0
    ); // 제세공과금

  const total =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      travelerPricings.reduce(
        (sum, traveler) => sum + parseFloat(traveler.price.total),
        0
      ) ?? 0
    ); // 총 요금

  const revListDeleteChk = new Date(revData?.departureTime!) > new Date(); // 예약내역 삭제 여부 체크

  return (
    <Container>
      {isLoading ? (
        <Loading>
          <Spinner
            animate={{ rotate: [0, 360] }} // 회전 애니메이션
            transition={{
              duration: 1, // 1초 동안
              ease: "linear", // 일정한 속도
              repeat: Infinity, // 무한반복
            }}
          />
        </Loading>
      ) : revData &&
        iataCodeOffers.length > 0 &&
        airlineCodeOffers.length > 0 ? (
        <DetailList>
          {/* 예약정보 */}
          <RevInfo>
            <MainTitle>{revData.revName}님의 예약정보</MainTitle>
            <RevInfoGroupsSpace>
              <span>
                <RevInfoElementTitle>예약날짜</RevInfoElementTitle> :{" "}
                {formatDate(revData.regDate)}
              </span>
              <span>
                <RevInfoElementTitle>예약코드</RevInfoElementTitle> :{" "}
                {revData.revCode}
              </span>
            </RevInfoGroupsSpace>
            <div>
              <span>
                <RevInfoElementTitle>
                  가는편{revData.reStopLine ? "/오는편" : ""}
                </RevInfoElementTitle>{" "}
                :{" "}
              </span>
              <span>
                {carrierCode} {revData.departureIata} -&gt;{" "}
                {revData.arrivalIata}
              </span>{" "}
              {revData.reStopLine ? (
                <span>
                  / {returnCarrierCode} {revData.reDepartureIata} -&gt;{" "}
                  {revData.reArrivalIata}
                </span>
              ) : (
                ""
              )}
            </div>
            <RevInfoGroupsSpace>
              <span>
                <RevInfoElementTitle>출국일</RevInfoElementTitle> :{" "}
                {formatDate(revData.departureTime)}{" "}
                {formatTime(revData.departureTime)}
              </span>
              <span>
                <RevInfoElementTitle>탑승인원</RevInfoElementTitle> :{" "}
                {`${
                  (revData.adults ?? 0) +
                  (revData.childrens ?? 0) +
                  (revData.infants ?? 0)
                }명`}
              </span>
            </RevInfoGroupsSpace>
            <RevInfoGroupsSpace>
              {revData.reStopLine ? (
                <span>
                  <RevInfoElementTitle>귀국일</RevInfoElementTitle> :{" "}
                  {formatDate(revData.reDepartureTime)}{" "}
                  {formatTime(revData.reDepartureTime)}
                </span>
              ) : (
                ""
              )}
              <span>
                <RevInfoElementTitle>좌석등급</RevInfoElementTitle> :{" "}
                {seatKor(revData.seatClass)}
              </span>
            </RevInfoGroupsSpace>
          </RevInfo>

          {/* 상세일정 */}
          <div style={{ width: "100%", marginBottom: "20px" }}>
            <MainTitle>상세일정</MainTitle>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <FlightReservationResult
                pricing={revData.orders?.data.flightOffers[0]!}
                turnaroundTime={revData.turnaroundTime}
                reTurnaroundTime={revData.reTurnaroundTime}
                airlineCodeOffers={airlineCodeOffers}
                iataCodeOffers={iataCodeOffers}
              />
            </div>
          </div>

          {/* 탑승자정보 */}
          <div style={{ marginBottom: "20px", width: "100%" }}>
            <MainTitle>탑승자정보</MainTitle>
            <div style={{ display: "flex" }}>
              <ElementTitle isWidth={"5%"}>번호</ElementTitle>
              <ElementTitle isWidth={"15%"}>성명(영문)</ElementTitle>
              <ElementTitle isWidth={"10%"}>탑승자유형</ElementTitle>
              <ElementTitle isWidth={"10%"}>생년월일</ElementTitle>
              <ElementTitle isWidth={"5%"}>성별</ElementTitle>
              <ElementTitle isWidth={"17%"}>여권번호/국적</ElementTitle>
              <ElementTitle isWidth={"18%"}>여권만료일/여권발행국</ElementTitle>
              <ElementTitle isWidth={"20%"}>이메일</ElementTitle>
            </div>
            {revData.orders?.data.travelers.map(
              (traveler: Travelers, index) => (
                <div key={index} style={{ display: "flex" }}>
                  <ElementValue isWidth={"5%"}>{traveler.id}</ElementValue>
                  <ElementValue isWidth={"15%"}>
                    {traveler.name.firstName} {traveler.name.lastName}
                  </ElementValue>
                  <ElementValue isWidth={"10%"}>
                    {travelerPricings[index].travelerType === "ADULT"
                      ? "성인"
                      : travelerPricings[index].travelerType === "CHILD"
                      ? "어린이"
                      : travelerPricings[index].travelerType === "HELD_INFANT"
                      ? "유아"
                      : "알 수 없음"}
                  </ElementValue>
                  <ElementValue isWidth={"10%"}>
                    {traveler.dateOfBirth}
                  </ElementValue>
                  <ElementValue isWidth={"5%"}>
                    {traveler.gender === "MALE" ? "남" : "여"}
                  </ElementValue>
                  <ElementValue isWidth={"17%"}>
                    {traveler.documents.at(-1)?.number} /{" "}
                    {countryCodes.find(
                      (country) =>
                        country.isoAlpha2 ===
                        traveler.documents.at(-1)?.nationality
                    )?.countryKor || ""}
                  </ElementValue>
                  <ElementValue isWidth={"18%"}>
                    {traveler.documents.at(-1)?.expiryDate} /{" "}
                    {countryCodes.find(
                      (country) =>
                        country.isoAlpha2 ===
                        traveler.documents.at(-1)?.issuanceCountry
                    )?.countryKor || ""}
                  </ElementValue>
                  <ElementValue isWidth={"20%"}>
                    {traveler.contact.emailAddress}
                  </ElementValue>
                </div>
              )
            )}
          </div>
          {/* 연락처 상세정보 */}
          <div style={{ marginBottom: "20px", width: "100%" }}>
            <MainTitle>연락처 상세정보</MainTitle>
            <div style={{ display: "flex" }}>
              <ElementTitle isWidth={"20%"}>예약자명</ElementTitle>
              <ElementTitle isWidth={"20%"}>연락처</ElementTitle>
              <ElementTitle isWidth={"20%"}>비상연락처</ElementTitle>
            </div>
            <div style={{ display: "flex" }}>
              <ElementValue isWidth={"20%"}>{revData.revName}</ElementValue>
              <ElementValue isWidth={"20%"}>
                {phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}
              </ElementValue>
              <ElementValue isWidth={"20%"}>
                {emergencyNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}
              </ElementValue>
            </div>
          </div>
          {/* 결제내역 */}
          <div>
            <MainTitle>결제내역</MainTitle>
          </div>
          {/* 항공 요금 */}
          <PriceInfo>
            <DetailedPrice>
              <span />
              <span>항공요금 {peoples > 1 && `X ${peoples}`}</span>
              <span>{base}</span>
              <span />
            </DetailedPrice>
            <DetailedPrice>
              <span />
              <span>유류할증료 {peoples > 1 && `X ${peoples}`}</span>
              <span>{fuelSurcharge}</span>
              <span />
            </DetailedPrice>
            <DetailedPrice>
              <span />
              <span>제세공과금 {peoples > 1 && `X ${peoples}`}</span>
              <span>{taxFees}</span>
              <span />
            </DetailedPrice>
            <DetailedPrice>
              <span />
              <span>총 금액 {peoples > 1 && `X ${peoples}`}</span>
              <span>{total}</span>
              <span />
            </DetailedPrice>
          </PriceInfo>

          <ButtonGroup>
            <ChoiceButton onClick={() => history.goBack()}>
              이전으로
            </ChoiceButton>
            {revListDeleteChk && (
              <ChoiceButton onClick={revListDelete}>예약취소</ChoiceButton>
            )}
          </ButtonGroup>
        </DetailList>
      ) : (
        ""
      )}
    </Container>
  );
}

export default ReservationDetail;
