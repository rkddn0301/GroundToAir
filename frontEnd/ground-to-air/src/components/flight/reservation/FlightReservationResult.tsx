// 예약 상세 데이터
import styled from "styled-components";
import {
  AirlineCodes,
  FlightOffer,
  FlightPricing,
  IataCodes,
} from "../../../utils/api";
import {
  formatDate,
  formatDelayTime,
  formatDuration,
  formatTime,
} from "../../../utils/formatTime";

// 헤더 디자인 구성
const Header = styled.div``;

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

  /* const operatingCode =
    pricing.itineraries?.[0]?.segments?.[0]?.operating?.carrierCode; // 운항 항공사
  const validatingCode = pricing.itineraries[0]?.segments[0]?.carrierCode; // 판매 항공사 */

  // 가는편
  const departureDate = formatDate(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발일

  const arrivalDate = formatDate(
    pricing.itineraries[0]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const totalDuration = formatDuration(offer?.itineraries[0]?.duration); // 총 소요시간

  // 공동운항
  const getCodeShare = (carrierCode: string | undefined): string => {
    // carrierCode가 undefined일 경우 처리
    if (!carrierCode) {
      return "알 수 없음"; // carrierCode가 없으면 기본값으로 "알 수 없음" 반환
    }

    // 항공사 코드와 일치하는 데이터 필터링
    const airline = airlineCodeOffers.filter(
      (item) => item.iata === carrierCode
    );

    // 2개 이상일 경우 : 공항코드가 겹치므로 아래 조건에 따름
    /*  if (airline.length > 1) {
      const dictionariesCarrier = dictionaries?.carriers?.[carrierCode] ?? ""; // undefined일 경우 빈 문자열로 처리

      // API 데이터의 항공사명과 비교하여 일치하는 항공사명 추출
      let matchingAirline = airline.find(
        (matchingAirline) =>
          matchingAirline.airlines.trim().toLowerCase() ===
          dictionariesCarrier.trim().toLowerCase()
      );

      if (matchingAirline) {
        return matchingAirline.airlinesKor;
      }
    }
    // 1개 일 경우 : 추출된 코드 그대로 출력
    else if (airline.length === 1) {
      return airline[0].airlinesKor;
    } */
    if (airline.length) {
      return airline[0].airlinesKor;
    }
    // 항공사가 없을 경우 : '알 수 없음'으로 처리
    return "알 수 없음";
  };

  /* const carrierCodeLogo =
    airlineCodeOffers.find((airline) => {
      const matchesIata = airline.iata === validatingCode || "";
      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || ""; // 항공사 로고

  const carrierCode =
    airlineCodeOffers.find((airline) => airline.iata === validatingCode)
      ?.airlinesKor || ""; // 항공사명 */

  /* const airlineCode = `${
    pricing.itineraries?.[0]?.segments?.[0]?.carrierCode || ""
  }${pricing.itineraries?.[0]?.segments?.[0]?.number || ""}`; // 항공편 번호 */

  /*  const departureTime = formatTime(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발시간 */

  /* const originLocationCode =
    pricing.itineraries[0]?.segments[0]?.departure?.iataCode; // 출발지 공항코드 */

  /*   const originLocationAirport =
    iataCodeOffers.find((iata) => iata.iata === originLocationCode)
      ?.airportKor || ""; // 출발지 공항명 */

  /* const originLocationTerminal = `터미널 ${pricing.itineraries[0]?.segments[0]?.departure?.terminal}`; // 출발지 터미널 */

  /*  const arrieveTime = pricing.itineraries[0]?.segments.at(-1)?.arrival?.at; // 도착시간 */

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
          <p>가는편 출발시간 {departureDate}</p>
          <div>
            {pricing.itineraries[0]?.segments.map((segment, index) => {
              const operatingCode = segment.operating?.carrierCode; // 운항 항공사
              const validatingCode = segment.carrierCode; // 판매 항공사

              const carrierCodeLogo =
                airlineCodeOffers.find((airline) => {
                  const matchesIata = airline.iata === validatingCode || "";
                  const isLogoValid =
                    airline.airlinesLogo &&
                    airline.airlinesLogo.split("images/")[1] !==
                      "pop_sample_img03.gif";

                  return matchesIata && isLogoValid;
                }) || ""; // 항공사 로고

              const carrierCode =
                airlineCodeOffers.find(
                  (airline) => airline.iata === validatingCode
                )?.airlinesKor || ""; // 항공사명

              const airlineCode = `${segment.carrierCode || ""}${
                segment.number || ""
              }`; // 항공편 번호

              const departureTime = formatTime(segment.departure?.at); // 출발시간

              const originLocationCode = segment.departure?.iataCode; // 출발지 공항코드

              const originLocationAirport =
                iataCodeOffers.find((iata) => iata.iata === originLocationCode)
                  ?.airportKor || ""; // 출발지 공항명

              const originLocationTerminal = segment.departure?.terminal
                ? `터미널 ${segment.departure?.terminal}`
                : ""; // 출발지 터미널

              const duration = formatDuration(segment.duration); // 소요시간

              const arrivalTime = formatTime(segment.arrival?.at); // 도착시간
              const destinationLocationCode = segment.arrival?.iataCode; // 도착지 공항코드
              const destinationLocationAirport =
                iataCodeOffers.find(
                  (iata) => iata.iata === destinationLocationCode
                )?.airportKor || ""; // 도착지 공항명
              const destinationLocationTerminal = segment.arrival?.terminal
                ? `터미널 ${segment.arrival?.terminal}`
                : ""; // 도착지 터미널

              return (
                <>
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
                      {operatingCode !== validatingCode && (
                        <div>실제운항 : {getCodeShare(operatingCode)}</div>
                      )}
                    </div>
                    <div>줄</div>
                    <div>
                      <div>
                        {departureTime} {originLocationCode}{" "}
                        {originLocationAirport} {originLocationTerminal}
                      </div>
                      <div>{duration}</div>
                      <div>
                        {arrivalTime} {destinationLocationCode}{" "}
                        {destinationLocationAirport}{" "}
                        {destinationLocationTerminal}
                      </div>
                    </div>
                  </div>
                  {/* 경유지가 존재할 시 대기시간을 기재한다. */}
                  {index < pricing.itineraries[0]?.segments.length - 1 && (
                    <div>
                      {formatDelayTime(
                        segment.arrival?.at,
                        pricing.itineraries[0]?.segments[index + 1]?.departure
                          ?.at
                      )}{" "}
                      대기
                    </div>
                  )}
                </>
              );
            })}
          </div>
          <p>
            <span>도착 : {arrivalDate}</span>{" "}
            <span>총 소요시간 : {totalDuration}</span>
          </p>
        </div>
        <div>오는편 출발시간</div>
      </div>
    </>
  );
}

export default FlightReservationResult;
