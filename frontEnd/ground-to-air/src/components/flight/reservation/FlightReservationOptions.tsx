// 항공편 선택 목록

import { AirlineCodes, IataCodes, Segments } from "../../../utils/api";
import {
  formatDelayTime,
  formatDuration,
  formatTime,
} from "../../../utils/formatTime";
import styled from "styled-components";

// FlightReservationOptions 컴포넌트 전체 구성
const Banner = styled.div`
  width: 90%;
`;

// 항공편 전체 디자인
const FlightInfo = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: center;
`;

// 항공편 라인
const AirlineInfoLine = styled.div`
  width: 25%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
`;

// 나눔선 라인
const DividingLine = styled.div`
  position: relative;
  height: 100%;
  border: 1px solid ${(props) => props.theme.white.font};
  display: flex;
  opacity: 50%;
`;

// 타임 라인
const TimeLine = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// 대기시간 정보 디자인
const DelayInfo = styled.div`
  display: flex;
  margin: 20px 0px 20px 0px;
  justify-content: center;
  gap: 10px;
`;

// 일정 라인
const ScheduleLine = styled.div`
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 35px;
`;

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
  // ! 표시하는데에는 문제없어 보류함. (올바른 공항을 표시하지 않을 시 dictionaries를 가져와야함. 2/27)
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
        {/* 항공사 정보 구간 */}
        <AirlineInfoLine>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              gap: "5px",
            }}
          >
            <span style={{ fontSize: "17px", fontWeight: "600" }}>
              {" "}
              {carrierCode}
            </span>
          </div>
          <div style={{ fontSize: "14px" }}>{airlineCode}</div>
          {operatingCode !== validatingCode && (
            <div>실제운항 : {getCodeShare(operatingCode)}</div>
          )}
        </AirlineInfoLine>
        {/* 나눔선 구간 */}
        <div style={{ marginRight: "10%" }}>
          <DividingLine />
        </div>

        {/* 타임라인 구간 */}
        <TimeLine>
          <div>{departureTime}</div>
          <div
            style={{ fontSize: "15px", color: "skyblue", fontWeight: "600" }}
          >
            {duration} 소요
          </div>
          <div>{arrivalTime}</div>
        </TimeLine>
        {/* 일정 구간 */}
        <ScheduleLine>
          <div>
            {originLocationCode} {originLocationAirport}{" "}
            {originLocationTerminal}
          </div>

          <div>
            {destinationLocationCode} {destinationLocationAirport}{" "}
            {destinationLocationTerminal}
          </div>
        </ScheduleLine>
      </FlightInfo>
      {/* 경유지가 존재할 시 대기시간을 기재한다. */}
      {nextSegment && (
        <DelayInfo>
          <div style={{ width: "25%" }}></div>
          <div style={{ marginRight: "10%" }}>
            <DividingLine />
          </div>
          <div
            style={{
              width: "20%",
              fontSize: "15px",
              color: "skyblue",
              fontWeight: "900",
            }}
          >
            {formatDelayTime(segment.arrival?.at, nextSegment?.departure?.at)}{" "}
            대기
          </div>
          <div style={{ width: "35%" }}></div>
        </DelayInfo>
      )}
    </Banner>
  );
}

export default FlightReservationOptions;
