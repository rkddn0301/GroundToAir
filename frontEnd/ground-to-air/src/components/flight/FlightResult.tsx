import styled from "styled-components";
import {
  FlightOffer,
  InputData,
  LocationData,
  SeatClass,
} from "../../router/FlightSearch";
import { useEffect } from "react";

const Banner = styled.div`
  width: 80%;
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  margin: 0 auto;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 25px;
  padding: 25px;
  margin-bottom: 20px;
`;

interface FlightResultProps {
  offer: FlightOffer;
  inputData: InputData; // inputData의 타입을 참조
  locationData: LocationData; // locationData 타입을 참조
  dictionaries: {
    carriers: { [key: string]: string };
  };
  setFilterMismatchCount: React.Dispatch<React.SetStateAction<number>>;
}

function FlightResult({
  offer,
  inputData,
  locationData,
  dictionaries,
  setFilterMismatchCount,
}: FlightResultProps) {
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

  // 가는날
  const originLocationCode =
    offer.itineraries[0]?.segments[0]?.departure?.iataCode; // 출발지 공항코드 삽입
  const destinationLocationCode =
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.arrival?.iataCode; // 도착지 공항코드 삽입

  // 오는날
  const returnOriginLocationCode =
    offer.itineraries[1]?.segments[0]?.departure?.iataCode; // 출발지 공항코드 삽입
  const returnDestinationLocationCode =
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.arrival?.iataCode; // 도착지 공항코드 삽입

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
      console.log("틀림");
      console.log(offer.id);
      console.log(returnOriginLocationCode);
      console.log(returnDestinationLocationCode);
      setFilterMismatchCount((prev) => prev + 1); // 카운팅만 업데이트
    }
  }, [shouldReturnNull, setFilterMismatchCount]); // shouldReturnNull 값이 변경될 때만 실행

  if (shouldReturnNull) {
    return null; // 조건에 맞지 않으면 결과를 출력하지 않음
  }
  return (
    <Banner key={offer.id}>
      <p>
        항공사 :{" "}
        {
          dictionaries.carriers[
            offer.itineraries[0]?.segments[0]?.operating?.carrierCode || ""
          ]
        }
      </p>
      <p>
        출발시간: {offer.itineraries[0]?.segments[0]?.departure?.at} (
        {offer.itineraries[0]?.segments[0]?.departure?.iataCode})
      </p>
      <p>
        도착시간:{" "}
        {
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.arrival?.at
        }{" "}
        (
        {
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.arrival?.iataCode
        }
        )
      </p>
      <p>
        항공편 번호:{" "}
        {
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.carrierCode
        }
        {
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.number
        }
      </p>
      <p>
        항공기 정보:{" "}
        {
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.aircraft?.code
        }
      </p>
      <p>경유지 수: {offer.itineraries[0]?.segments.length - 1}</p>

      {/* 왕복일경우 */}
      {inputData.returnDate !== "" && (
        <>
          <hr />
          <p>
            항공사 :{" "}
            {
              dictionaries.carriers[
                offer.itineraries[1]?.segments[0]?.operating?.carrierCode || ""
              ]
            }
          </p>
          <p>
            출발시간: {offer.itineraries[1]?.segments[0]?.departure?.at} (
            {offer.itineraries[1]?.segments[0]?.departure?.iataCode})
          </p>
          <p>
            도착시간:{" "}
            {
              offer.itineraries[1]?.segments[
                offer.itineraries[1]?.segments.length - 1
              ]?.arrival?.at
            }{" "}
            (
            {
              offer.itineraries[1]?.segments[
                offer.itineraries[1]?.segments.length - 1
              ]?.arrival?.iataCode
            }
            )
          </p>
          <p>
            항공편 번호:{" "}
            {
              offer.itineraries[1]?.segments[
                offer.itineraries[1]?.segments.length - 1
              ]?.carrierCode
            }
            {
              offer.itineraries[1]?.segments[
                offer.itineraries[1]?.segments.length - 1
              ]?.number
            }
          </p>
          <p>
            항공기 정보:{" "}
            {
              offer.itineraries[1]?.segments[
                offer.itineraries[1]?.segments.length - 1
              ]?.aircraft?.code
            }
          </p>
          <p>경유지 수: {offer.itineraries[1]?.segments.length - 1}</p>
        </>
      )}

      <hr />
      <p>남은 예약좌석 : {offer.numberOfBookableSeats}</p>
      <p>총 가격: {offer.price.total}</p>
    </Banner>
  );
}

export default FlightResult;
