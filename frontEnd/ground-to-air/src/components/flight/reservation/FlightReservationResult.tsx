// 예약 상세 결과 요약
import styled from "styled-components";
import {
  AirlineCodes,
  FlightOffer,
  FlightPricing,
  IataCodes,
} from "../../../utils/api";
import { formatDate, formatDuration } from "../../../utils/formatTime";
import FlightReservationOptions from "./FlightReservationOptions";

// 바디 디자인 구성
const Body = styled.div`
  width: 90%;
  margin-bottom: 10px;
`;

// 출발시간
const DepartureTimes = styled.div`
  margin: 10px 0 10px;
`;

// 항공편 박스
const FlightBox = styled.div`
  border: 2px dashed skyblue;
  padding: 15px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
`;

// 종합결과
const FlightSummary = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0px 5px 0px;
  font-size: 14px;

  span:nth-child(2) {
    color: ${(props) => props.theme.white.font};
  }
`;

interface FlightReservationResultProps {
  pricing: FlightPricing; // 항공편 상세 코드
  turnaroundTime?: string; // 가는편 총 소요시간
  reTurnaroundTime?: string; // 오는편 총 소요시간
  offer?: FlightOffer; // 항공편 조회 코드
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 공항 코드 DB
}

function FlightReservationResult({
  pricing,
  turnaroundTime,
  reTurnaroundTime,
  airlineCodeOffers,
  iataCodeOffers,
}: FlightReservationResultProps) {
  // Body
  const isRoundTrip = pricing.itineraries.length > 1 ? "왕복" : "편도"; // 왕복여부

  // 가는편
  const departureDate = formatDate(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발일

  const arrivalDate = formatDate(
    pricing.itineraries[0]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const totalDuration = formatDuration(turnaroundTime); // 총 소요시간

  // 오는편

  const returnDepartureDate = formatDate(
    pricing.itineraries[1]?.segments[0]?.departure?.at
  ); // 출발일

  const returnArrivalDate = formatDate(
    pricing.itineraries[1]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const returnTotalDuration = formatDuration(reTurnaroundTime); // 총 소요시간

  return (
    <>
      <Body>
        {/* 가는편 */}
        <DepartureTimes>
          <span style={{ fontWeight: "600" }}>가는편 출발시간</span>{" "}
          {departureDate}
        </DepartureTimes>
        <FlightBox>
          {pricing.itineraries[0]?.segments.map((segment, index) => (
            <FlightReservationOptions
              segment={segment}
              key={index}
              airlineCodeOffers={airlineCodeOffers}
              iataCodeOffers={iataCodeOffers}
              nextSegment={pricing.itineraries[0]?.segments[index + 1]}
            />
          ))}
          <FlightSummary>
            <span>도착시간 : {arrivalDate}</span>
            <span> | </span>
            <span>총 소요시간 : {totalDuration}</span>
          </FlightSummary>
        </FlightBox>
        {/* 오는편 */}
        {isRoundTrip === "왕복" && (
          <>
            <DepartureTimes>
              <span style={{ fontWeight: "600" }}>오는편 출발시간</span>{" "}
              {returnDepartureDate}
            </DepartureTimes>
            <FlightBox>
              {pricing.itineraries[1]?.segments.map((segment, index) => (
                <FlightReservationOptions
                  segment={segment}
                  key={index}
                  airlineCodeOffers={airlineCodeOffers}
                  iataCodeOffers={iataCodeOffers}
                  nextSegment={pricing.itineraries[1]?.segments[index + 1]}
                />
              ))}
              <FlightSummary>
                <span>도착시간 : {returnArrivalDate}</span>
                <span> | </span>
                <span>총 소요시간 : {returnTotalDuration}</span>
              </FlightSummary>{" "}
            </FlightBox>
          </>
        )}
      </Body>
    </>
  );
}

export default FlightReservationResult;
