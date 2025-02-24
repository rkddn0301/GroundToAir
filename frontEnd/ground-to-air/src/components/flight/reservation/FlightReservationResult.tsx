// 예약 상세 데이터
import styled from "styled-components";
import { AirlineCodes, FlightPricing, IataCodes } from "../../../utils/api";
import { formatDateTime, formatTime } from "../../../utils/formatTime";

// 헤더 디자인 구성
const Header = styled.div``;

interface FlightReservationResultProps {
  pricing: FlightPricing; // 항공편 상세 코드
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 공항 코드 DB
}

function FlightReservationResult({
  pricing,
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

  const validatingCode = pricing.itineraries[0]?.segments[0]?.carrierCode; // 판매 항공사\

  // 가는편
  const departureDateTime = formatDateTime(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발일

  const carrierCodeLogo =
    airlineCodeOffers.find((airline) => {
      const matchesIata = airline.iata === validatingCode || "";
      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || ""; // 항공사 로고

  const carrierCode =
    airlineCodeOffers.find((airline) => airline.iata === validatingCode)
      ?.airlinesKor || ""; // 항공사명

  const airlineCode = `${
    pricing.itineraries?.[0]?.segments?.[0]?.carrierCode || ""
  }${pricing.itineraries?.[0]?.segments?.[0]?.number || ""}`; // 항공편 번호

  const departureTime = formatTime(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발시간

  const originLocationCode =
    pricing.itineraries[0]?.segments[0]?.departure?.iataCode; // 출발지 공항코드

  const originLocationAirport =
    iataCodeOffers.find((iata) => iata.iata === originLocationCode)
      ?.airportKor || ""; // 출발지 공항명

  const originLocationTerminal = `터미널 ${pricing.itineraries[0]?.segments[0]?.departure?.terminal}`; // 출발지 터미널

  const arrieveTime = pricing.itineraries[0]?.segments.at(-1)?.arrival?.at; // 도착시간

  // 오는편

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
      <div>
        <div>
          <p>가는편 출발시간 {departureDateTime}</p>
          <div>
            <div>
              <div>
                {carrierCodeLogo !== "" ? (
                  <>
                    <img src={carrierCodeLogo.airlinesLogo} />{" "}
                    <span>{carrierCodeLogo.airlinesKor}</span>
                  </>
                ) : (
                  carrierCode
                )}
              </div>
              <div>{airlineCode}</div>
            </div>
            <div>줄</div>
            <div>
              {departureTime} {originLocationCode} {originLocationAirport}{" "}
              {originLocationTerminal}
            </div>
          </div>
        </div>
        <div>오는편 출발시간</div>
      </div>
    </>
  );
}

export default FlightReservationResult;
