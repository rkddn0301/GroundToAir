// 예약 상세

import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Alert } from "../utils/sweetAlert";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FlightReservation } from "./ReservationList";
import { AirlineCodes, IataCodes, Travelers } from "../utils/api";
import FlightReservationResult from "../components/flight/reservation/FlightReservationResult";
import { CountryCodeProps } from "../components/flight/reservation/TravelerInfo";

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
  border-top: 4px solid skyblue; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
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

  const [countryCodes, setCountryCodes] = useState<CountryCodeProps[]>([]); // 국적 코드 추출

  useEffect(() => {
    if (revName !== undefined && revCode !== undefined) {
      airCodeFetch();
      reservationDataExtraction(revName, revCode);
    }
  }, [revName, revCode]);

  // 항공사 코드 추출 함수
  const airCodeFetch = async () => {
    const airlineCodeResponse = await axios.get(
      `http://localhost:8080/air/airlineCode`
    );
    const iataCodeResponse = await axios.get(
      `http://localhost:8080/air/iataCode`
    );
    const countryCodeResponse = await axios.get(
      `http://localhost:8080/country/code`
    );

    setAirlineCodeOffers(airlineCodeResponse.data); // 항공사 코드
    setIataCodeOffers(iataCodeResponse.data); // 항공편 코드
    setCountryCodes(countryCodeResponse.data); // 국적 코드
  };

  // 예약 상세 데이터 추출
  const reservationDataExtraction = async (
    revName: string,
    revCode: string
  ) => {
    try {
      console.log("reservationDataExtraction");
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8080/user/reservationDetail`,
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

  const travelerPricings =
    revData?.orders?.data.flightOffers?.at(-1)?.travelerPricings ?? []; // 탑승자 결제정보

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
          <div>
            <h3>{revData.revName}님의 예약정보</h3>
            <div>
              <span>예약날짜 : {revData.regDate}</span>
              <span>예약코드 : {revData.revCode}</span>
            </div>
            <div>
              <div>가는편{revData.reStopLine ? "/오는편" : ""} : </div>
              <div>
                {revData.airlinesIata} {revData.departureIata} -&gt;{" "}
                {revData.arrivalIata}
              </div>{" "}
              {revData.reStopLine ? (
                <div>
                  {revData.reAirlinesIata} {revData.reDepartureIata} -&gt;{" "}
                  {revData.reArrivalIata}
                </div>
              ) : (
                ""
              )}
            </div>
            <div>
              <span>출국일 : {revData.departureTime}</span>
              <span>
                탑승인원 :{" "}
                {`${
                  (revData.adults ?? 0) +
                  (revData.childrens ?? 0) +
                  (revData.infants ?? 0)
                }명`}
              </span>
            </div>
            <div>
              {revData.reStopLine ? (
                <span>귀국일 : {revData.reDepartureTime}</span>
              ) : (
                ""
              )}
              <span>
                좌석등급 :{" "}
                {revData.seatClass === "FIRST"
                  ? "일등석"
                  : revData.seatClass === "BUSINESS"
                  ? "비즈니스석"
                  : revData.seatClass === "PREMIUM_ECONOMY"
                  ? "프리미엄 일반석"
                  : "일반석"}
              </span>
            </div>
          </div>

          {/* 상세일정 */}
          <div>
            <h3>상세일정</h3>
            <FlightReservationResult
              pricing={revData.orders?.data.flightOffers[0]!}
              turnaroundTime={revData.turnaroundTime}
              reTurnaroundTime={revData.reTurnaroundTime}
              airlineCodeOffers={airlineCodeOffers}
              iataCodeOffers={iataCodeOffers}
            />
          </div>

          {/* 탑승자정보 */}
          <div>
            <h3>탑승자정보</h3>
            <div style={{ display: "flex", gap: "5px" }}>
              <div>번호</div>
              <div>성명(영문)</div>
              <div>탑승자유형</div>
              <div>생년월일</div>
              <div>성별</div>
              <div>여권번호/국적</div>
              <div>여권만료일/여권발행국</div>
              <div>이메일</div>
            </div>
            {revData.orders?.data.travelers.map(
              (traveler: Travelers, index) => (
                <div key={index} style={{ display: "flex", gap: "5px" }}>
                  <div>{traveler.id}</div>
                  <div>
                    {traveler.name.firstName} {traveler.name.lastName}
                  </div>
                  <div>
                    {travelerPricings[index].travelerType === "ADULT"
                      ? "성인"
                      : travelerPricings[index].travelerType === "CHILD"
                      ? "어린이"
                      : travelerPricings[index].travelerType === "HELD_INFANT"
                      ? "유아"
                      : "알 수 없음"}
                  </div>
                  <div>{traveler.dateOfBirth}</div>
                  <div>{traveler.gender === "MALE" ? "남" : "여"}</div>
                  <div>
                    {traveler.documents.at(-1)?.number} /{" "}
                    {countryCodes.find(
                      (country) =>
                        country.isoAlpha2 ===
                        traveler.documents.at(-1)?.nationality
                    )?.countryKor || ""}
                  </div>
                  <div>
                    {traveler.documents.at(-1)?.expiryDate} /{" "}
                    {countryCodes.find(
                      (country) =>
                        country.isoAlpha2 ===
                        traveler.documents.at(-1)?.issuanceCountry
                    )?.countryKor || ""}
                  </div>
                  <div>{traveler.contact.emailAddress}</div>
                </div>
              )
            )}
          </div>
          {/* 연락처 상세정보 */}
          <div>
            <h3>연락처 상세정보</h3>
          </div>
          {/* 결제내역 */}
          <div>
            <h3>결제내역</h3>
          </div>
        </DetailList>
      ) : (
        ""
      )}
    </Container>
  );
}

export default ReservationDetail;
