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

// 헤더 디자인 구성
const Header = styled.div``;

// 바디 디자인 구성
const Body = styled.div`
  margin-bottom: 10px;
`;

// 항공편 박스
const FlightBox = styled.div`
  border: 1px solid skyblue;
  border-radius: 5px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

interface FlightReservationResultProps {
  pricing: FlightPricing; // 항공편 상세 코드
  offer?: FlightOffer; // 항공편 조회 코드
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 공항 코드 DB
}

function FlightReservationResult({
  pricing,
  offer,
  airlineCodeOffers,
  iataCodeOffers,
}: FlightReservationResultProps) {
  // Header
  const destination = iataCodeOffers.find(
    (iata) =>
      pricing.itineraries[0]?.segments.at(-1)?.arrival?.iataCode === iata.iata
  ); // 목적지 레코드
  const peoples = pricing.travelerPricings.length; // 인원 수
  const isRoundTrip = pricing.itineraries.length > 1 ? "왕복" : "편도"; // 왕복여부
  const seatClass =
    pricing.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin === "FIRST"
      ? "일등석"
      : pricing.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ===
        "BUSINESS"
      ? "비즈니스석"
      : pricing.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ===
        "PREMIUM_ECONOMY"
      ? "프리미엄 일반석"
      : "일반석"; // 좌석등급

  // Body

  // 가는편
  const departureDate = formatDate(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발일

  const arrivalDate = formatDate(
    pricing.itineraries[0]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const totalDuration = formatDuration(offer?.itineraries[0]?.duration); // 총 소요시간

  // 오는편

  const returnDepartureDate = formatDate(
    pricing.itineraries[1]?.segments[0]?.departure?.at
  ); // 출발일

  const returnArrivalDate = formatDate(
    pricing.itineraries[1]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const returnTotalDuration = formatDuration(offer?.itineraries[1]?.duration); // 총 소요시간

  return (
    <>
      <Header>
        <div>
          {/* 목적지 추출 : 도시명이 없다면 공항명으로 대체. */}
          {destination ? destination.cityKor ?? destination?.airportKor : ""}
        </div>
        <div>
          인원 {peoples}명 | {isRoundTrip} | {seatClass}
        </div>
        <hr />
      </Header>
      <Body>
        {/* 가는편 */}
        <FlightBox>
          <p>가는편 출발시간 {departureDate}</p>
          {pricing.itineraries[0]?.segments.map((segment, index) => (
            <FlightReservationOptions
              segment={segment}
              key={index}
              airlineCodeOffers={airlineCodeOffers}
              iataCodeOffers={iataCodeOffers}
              nextSegment={pricing.itineraries[0]?.segments[index + 1]}
            />
          ))}
          <p>
            <span>도착 : {arrivalDate}</span>{" "}
            <span>총 소요시간 : {totalDuration}</span>
          </p>
        </FlightBox>
        {/* 오는편 */}
        {isRoundTrip === "왕복" && (
          <FlightBox>
            <p>오는편 출발시간 {returnDepartureDate}</p>
            {pricing.itineraries[1]?.segments.map((segment, index) => (
              <FlightReservationOptions
                segment={segment}
                key={index}
                airlineCodeOffers={airlineCodeOffers}
                iataCodeOffers={iataCodeOffers}
                nextSegment={pricing.itineraries[1]?.segments[index + 1]}
              />
            ))}
            <p>
              <span>도착 : {returnArrivalDate}</span>{" "}
              <span>총 소요시간 : {returnTotalDuration}</span>
            </p>{" "}
          </FlightBox>
        )}
      </Body>
    </>
  );
}

export default FlightReservationResult;
