// 항공편 선택 목록

import { AirlineCodes, IataCodes, Segments } from "../../../utils/api";
import {
  formatDelayTime,
  formatDuration,
  formatTime,
} from "../../../utils/formatTime";
import styled from "styled-components";

// FlightReservationOptions 컴포넌트 전체 구성
const Banner = styled.div``;

// 항공편 정보 디자인
const FlightInfo = styled.div`
  display: flex;
  gap: 5px;
`;

// 대기시간 정보 디자인
const DelayInfo = styled.div``;

interface FlightReservationOptionsProps {
  segment: Segments;
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 공항 코드 DB
  nextSegment?: Segments;
}

function FlightReservationOptions({
  segment,
  airlineCodeOffers,
  iataCodeOffers,
  nextSegment,
}: FlightReservationOptionsProps) {
  const operatingCode = segment.operating?.carrierCode; // 운항 항공사
  const validatingCode = segment.carrierCode; // 판매 항공사

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

  const airlineCode = `${segment.carrierCode || ""}${segment.number || ""}`; // 항공편 번호

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
    iataCodeOffers.find((iata) => iata.iata === destinationLocationCode)
      ?.airportKor || ""; // 도착지 공항명
  const destinationLocationTerminal = segment.arrival?.terminal
    ? `터미널 ${segment.arrival?.terminal}`
    : ""; // 도착지 터미널

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

  return (
    <Banner>
      <FlightInfo>
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
            {departureTime} {originLocationCode} {originLocationAirport}{" "}
            {originLocationTerminal}
          </div>
          <div>{duration}</div>
          <div>
            {arrivalTime} {destinationLocationCode} {destinationLocationAirport}{" "}
            {destinationLocationTerminal}
          </div>
        </div>
      </FlightInfo>
      {/* 경유지가 존재할 시 대기시간을 기재한다. */}
      {nextSegment && (
        <DelayInfo>
          {formatDelayTime(segment.arrival?.at, nextSegment?.departure?.at)}{" "}
          대기
        </DelayInfo>
      )}
    </Banner>
  );
}

export default FlightReservationOptions;
