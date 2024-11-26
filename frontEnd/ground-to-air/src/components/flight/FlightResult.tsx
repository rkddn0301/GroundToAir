import styled from "styled-components";
import { InputData, LocationData } from "../../router/FlightSearch";
import { useEffect, useState } from "react";
import { formatDuration, formatTime } from "../../utils/formatTime";
import { AirlineCodes, FlightOffer, IataCodes } from "../../utils/api";
import axios from "axios";

// FlightResult 전체 컴포넌트 구성
const Banner = styled.div`
  width: 60%;
  max-height: 250px;
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  margin: 0 auto;
  box-shadow: 3px 2px 4px rgba(0, 0, 0, 0.2); // 그림자 순서 : x축, y축, 흐림효과, 색상
  //border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 25px;
  padding: 25px;
  margin-bottom: 20px;
  gap: 25px;
`;
/*
* flex : {flex-grow} {flex-shrink} {flex-basis}
* flex-grow : flex-basis 크기를 기준으로 안에 있는 자식끼리 주어진 비율에 따라 나눔.
--> 부모 크기가 자식들의 기본 크기(flex-basis)보다 클 때 작동.
* flex-shrink : 부모 크기가 자식들의 기본 크기(flex-basis)보다 작을 때 축소
--> 단, flex-basis가 %면 어짜피 축소되기 때문에 영향 받지 않음.
EX) ((flex-basis * 자식개수) - 부모 크기) / 자식개수
* flex-basis : 부모 크기를 얼마나 차지할지 정함
*/
// 항공 정보 디자인 구성
const FlightInfo = styled.div`
  width: 100%;
  //flex: 1 0 27.5%;
  height: 30%;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

// 항공 예약 관련 디자인 구성
const ReservationDetails = styled.div`
  width: 100%;
  //flex: 0 0 5%;
  height: 10%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 1px solid #ccc;
  padding: 5px 10px 0 0;
`;

// 항공사 라인
const Airline = styled.div`
  width: 30%;
`;

// 출발지
const OriginLine = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

// 도착지
const DestinationLine = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

// 중간라인(소요시간, 경유지) 구성
const MiddleInfoLine = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

// 항공사 정보 관련 디자인 구성
const AirlineCode = styled.div`
  font-size: 12px;
`;

// 출발지/도착지 공항 코드 디자인 구성
const IataCode = styled.div`
  font-weight: 600;
`;

// 경유지 라인
const StopLine = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid ${(props) => props.theme.white.font};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 50%;
`;

// 경유지 여부에 따라 생성되는 원형 디자인
const StopLineCircle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: ${(props) => props.theme.white.font};
  border-radius: 50%;
  z-index: 1;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%; // left+transform 을 통해 Tooltip을 출력시키는 부모 요소의 수평 중앙에 위치
  transform: translateX(-50%);
  background-color: ${(props) => props.theme.black.bg};
  color: ${(props) => props.theme.black.font};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 100;
  margin-top: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.2; // 글자 사이의 간격
`;

// 예약 버튼 디자인
const ReservationBtn = styled.button`
  padding: 10px;
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 조회 결과 컴포넌트에 필요한 props
interface FlightResultProps {
  offer: FlightOffer;
  inputData: InputData; // inputData의 타입을 참조
  locationData: LocationData; // locationData 타입을 참조
  dictionaries: {
    carriers: { [key: string]: string };
  };
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 항공편 코드 DB
  setFilterMismatchCount: React.Dispatch<React.SetStateAction<number>>;
  showTooltip: {
    departureDate: boolean;
    returnDate: boolean;
  };
  setShowTooltip: (
    field: "departureDate" | "returnDate",
    value: boolean
  ) => void; // field를 value로 업데이트만 해주면 showTooltip으로 확인할 수 있어서 미반환 처리
}

function FlightResult({
  offer,
  inputData,
  locationData,
  dictionaries,
  airlineCodeOffers,
  iataCodeOffers,
  setFilterMismatchCount,
  showTooltip,
  setShowTooltip,
}: FlightResultProps) {
  // 가는날

  /*
   * 운행항공사 로고 로직
   * 1. matchesIata, isLogoValid가 일치하는 값이 나올 때까지 진행
   * 2. matchesIata : 항공사 테이블(airlineCodeOffers)에서 일치하는 항공사 코드랑 일치하는지 확인
   * 3. isLogoValid : 항공사 테이블에서 일치하는 로고가 있는지 확인
   */
  const operatingCarrierCode =
    airlineCodeOffers.find((airline) => {
      const matchesIata =
        airline.iata ===
          offer.itineraries[0]?.segments[0]?.operating?.carrierCode ||
        airline.iata ===
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.operating?.carrierCode ||
        "";

      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || ""; // 기본값을 객체로 설정

  const airlineCode = `${
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.carrierCode
  }${
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.number
  }`; // 항공편 번호

  const departureTime = formatTime(
    offer.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발시간
  const arrieveTime = formatTime(
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.arrival?.at
  ); // 도착시간

  const originLocationCode =
    offer.itineraries[0]?.segments[0]?.departure?.iataCode; // 출발지 공항코드
  const destinationLocationCode =
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.arrival?.iataCode; // 도착지 공항코드

  const duration = formatDuration(offer.itineraries[0]?.duration); // 소요시간
  const numberOfStops = offer.itineraries[0]?.segments.length - 1; // 경유지 수
  const airportStopover = offer.itineraries[0]; // 경유지 공항코드

  // 오는날

  const returnOperatingCarrierCode =
    airlineCodeOffers.find((airline) => {
      const matchesIata =
        airline.iata ===
          offer.itineraries[1]?.segments[0]?.operating?.carrierCode ||
        airline.iata ===
          offer.itineraries[1]?.segments[
            offer.itineraries[1]?.segments.length - 1
          ]?.operating?.carrierCode ||
        "";

      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || "";

  const returnAirlineCode = `${
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.carrierCode
  }${
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.number
  }`; // 항공편 번호

  const returnDepartureTime = formatTime(
    offer.itineraries[1]?.segments[0]?.departure?.at
  ); // 출발시간

  const returnArrieveTime = formatTime(
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.arrival?.at
  ); // 도착시간

  const returnOriginLocationCode =
    offer.itineraries[1]?.segments[0]?.departure?.iataCode; // 출발지 공항코드
  const returnDestinationLocationCode =
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.arrival?.iataCode; // 도착지 공항코드

  const returnDuration = formatDuration(offer.itineraries[1]?.duration); // 소요시간
  const returnNumberOfStops = offer.itineraries[1]?.segments.length - 1; // 경유지 수
  const returnAirportStopover = offer.itineraries[1]; // 경유지 공항코드

  // 공통
  const numberOfBookableSeats = offer.numberOfBookableSeats; // 예약 가능한 좌석
  const totalPrice = offer.price.total; // 총 가격

  /* 
  - 검색결과는 아래 조건대로 출력됨.
  1. 출발지 공항 코드가 검색된 값과 같아야함 .
  2. 도착지 공항 코드가 검색된 값과 같아야함.
  3. 왕복 날짜가 있고, 오는날 출발지 공항 코드가 가는날 도착지 검색된 값과 같아야 함.
  4. 왕복 날짜가 있고, 오는날 도착지 공항 코드가 가는날 출발지 검색된 값과 같아야 함.

  --> 위 결과는 공항코드로 검색했을 경우이며, 도시코드로 검색 할 경우 해당되지 않음. 
  EX) 출발지를 도시로 검색 할 경우 1, 3번은 해당되지 않음
  EX) 도착지를 도시로 검색 할 경우 2, 4번은 해당되지 않음
  EX) 전부 도시로 검색 할 경우 아예 해당되지 않음  
  
  */

  const isOriginAirportSearch = locationData.originLocationIataCodeChecking; // 출발지 공항코드 체킹
  const isDestinationAirportSearch =
    locationData.destinationLocationIataCodeChecking; // 도착지 공항코드 체킹

  // 카운팅 처리
  const shouldReturnNull =
    (isOriginAirportSearch &&
      originLocationCode !== locationData.originIataCode) ||
    (isDestinationAirportSearch &&
      destinationLocationCode !== locationData.destinationIataCode) ||
    (inputData.returnDate !== "" &&
      isOriginAirportSearch &&
      returnDestinationLocationCode !== originLocationCode) ||
    (inputData.returnDate !== "" &&
      isDestinationAirportSearch &&
      returnOriginLocationCode !== destinationLocationCode);

  useEffect(() => {
    if (shouldReturnNull) {
      /*   console.log("틀림");
      console.log(offer.id);
      console.log(returnOriginLocationCode);
      console.log(returnDestinationLocationCode); */
      setFilterMismatchCount((prev) => prev + 1); // 카운팅만 업데이트
    }
  }, [shouldReturnNull]); // shouldReturnNull 값이 변경될 때만 실행

  if (shouldReturnNull) {
    return null; // 조건에 맞지 않으면 결과를 출력하지 않음
  }

  return (
    <Banner key={offer.id}>
      <FlightInfo>
        <Airline>
          {operatingCarrierCode !== "" ? (
            <img src={operatingCarrierCode.airlinesLogo} />
          ) : (
            <>
              {
                dictionaries.carriers[
                  offer.itineraries[0]?.segments[
                    offer.itineraries[0]?.segments.length - 1
                  ]?.operating?.carrierCode || ""
                ]
              }
            </>
          )}

          <AirlineCode>{airlineCode}</AirlineCode>
        </Airline>
        <OriginLine>
          {departureTime}
          <div style={{ fontWeight: "600" }}>{originLocationCode}</div>
        </OriginLine>
        <MiddleInfoLine>
          {duration}

          <StopLine>{numberOfStops > 0 && <StopLineCircle />}</StopLine>
          <div style={{ position: "relative" }}>
            {numberOfStops === 0 ? (
              "직항"
            ) : (
              <>
                {`${numberOfStops}회 경유`}{" "}
                {airportStopover.segments.map((segments: any, index: number) =>
                  index < numberOfStops ? (
                    <span
                      key={index}
                      onMouseEnter={() => setShowTooltip("departureDate", true)}
                      onMouseLeave={() =>
                        setShowTooltip("departureDate", false)
                      }
                    >
                      {segments.arrival.iataCode}{" "}
                      {showTooltip.departureDate &&
                        iataCodeOffers
                          .filter(
                            (iata) => iata.iata === segments.arrival.iataCode
                          )
                          .map((filteredIata, i) => (
                            <Tooltip key={i}>{filteredIata.airportKor}</Tooltip>
                          ))}
                    </span>
                  ) : null
                )}
              </>
            )}
          </div>
        </MiddleInfoLine>
        <DestinationLine>
          {arrieveTime}
          <IataCode>{destinationLocationCode}</IataCode>
        </DestinationLine>
      </FlightInfo>

      {/* 왕복일경우 */}
      {offer.itineraries[1] && (
        <FlightInfo>
          <Airline>
            {returnOperatingCarrierCode !== "" ? (
              <img src={returnOperatingCarrierCode.airlinesLogo} />
            ) : (
              <>
                {
                  dictionaries.carriers[
                    offer.itineraries[1]?.segments[
                      offer.itineraries[1]?.segments.length - 1
                    ]?.operating?.carrierCode || ""
                  ]
                }
              </>
            )}

            <AirlineCode>{returnAirlineCode}</AirlineCode>
          </Airline>
          <OriginLine>
            {returnDepartureTime}
            <div style={{ fontWeight: "600" }}>{returnOriginLocationCode}</div>
          </OriginLine>
          <MiddleInfoLine>
            {returnDuration}

            <StopLine>{returnNumberOfStops > 0 && <StopLineCircle />}</StopLine>

            <div>
              {returnNumberOfStops === 0 ? (
                "직항"
              ) : (
                <div style={{ position: "relative" }}>
                  {`${returnNumberOfStops}회 경유`}{" "}
                  {returnAirportStopover.segments.map(
                    (segments: any, index: any) =>
                      index < returnNumberOfStops ? (
                        <span
                          key={index}
                          onMouseEnter={() =>
                            setShowTooltip("returnDate", true)
                          }
                          onMouseLeave={() =>
                            setShowTooltip("returnDate", false)
                          }
                        >
                          {segments.arrival.iataCode}{" "}
                          {showTooltip.returnDate &&
                            iataCodeOffers
                              .filter(
                                (iata) =>
                                  iata.iata === segments.arrival.iataCode
                              )
                              .map((filteredIata, i) => (
                                <Tooltip key={i}>
                                  {filteredIata.airportKor}
                                </Tooltip>
                              ))}
                        </span>
                      ) : null
                  )}
                </div>
              )}
            </div>
          </MiddleInfoLine>
          <DestinationLine>
            {returnArrieveTime}
            <IataCode>{returnDestinationLocationCode}</IataCode>
          </DestinationLine>
        </FlightInfo>
      )}

      <ReservationDetails>
        {/* <div style={{ fontSize: "12px" }}>{numberOfBookableSeats}석 남음</div> */}

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <ReservationBtn>예약하기</ReservationBtn>
          {`\\${new Intl.NumberFormat().format(parseFloat(totalPrice))}`}
        </div>
      </ReservationDetails>
    </Banner>
  );
}

export default FlightResult;
