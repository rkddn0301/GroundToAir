import styled from "styled-components";
import { SeatClass } from "../../router/FlightSearch";
import { useEffect } from "react";

const Banner = styled.div`
  width: 80%;
  margin: 0 auto;
  border: 1px solid;
  border-radius: 25px;
  padding: 25px;
  margin-bottom: 20px;
`;

// inputData의 타입 정의
interface InputData {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  travelClass: SeatClass;
}

interface FlightOffer {
  type: string;
  id: string;
  source: string;
  numberOfBookableSeats?: number;
  itineraries: {
    duration: string;
    segments: {
      departure?: {
        // 출발지
        iataCode?: string;
        at?: string;
      };
      arrival?: {
        // 도착지
        iataCode?: string;
        at?: string;
      };
      carrierCode?: string;
      number?: string;
      aircraft?: {
        code?: string;
      };
      numberOfStops: number; // 경유 횟수
    }[];
  }[];
  price: {
    total: string;
  };
}

interface FlightResultProps {
  offer: FlightOffer;
  inputData: InputData; // inputData의 타입을 참조
}

function FlightResult({ offer, inputData }: FlightResultProps) {
  useEffect(() => {
    console.log(offer);
    console.log(inputData);
  }, [offer, inputData]);

  return (
    <Banner key={offer.id}>
      <p>가는날</p>
      <hr />
      {/* 경유 여부 확인 */}
      {offer.itineraries[0]?.segments.length - 1 > 0 ? (
        <>
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
        </>
      ) : (
        <>
          <p>
            출발시간: {offer.itineraries[0]?.segments[0]?.departure?.at} (
            {offer.itineraries[0]?.segments[0]?.departure?.iataCode})
          </p>
          <p>
            도착시간: {offer.itineraries[0]?.segments[0]?.arrival?.at} (
            {offer.itineraries[0]?.segments[0]?.arrival?.iataCode})
          </p>
          <p>
            항공편 번호: {offer.itineraries[0]?.segments[0]?.carrierCode}
            {offer.itineraries[0]?.segments[0]?.number}
          </p>
          <p>
            항공기 정보: {offer.itineraries[0]?.segments[0]?.aircraft?.code}
          </p>
          <p>경유지 수: {offer.itineraries[0]?.segments.length - 1}</p>
        </>
      )}

      {/* 왕복일경우 */}
      {inputData.returnDate != "" && (
        <>
          <hr />
          <p>오는날</p>
          <hr />
          {/* 경유 여부 확인 */}
          {offer.itineraries[1]?.segments.length - 1 > 0 ? (
            <>
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
          ) : (
            <>
              <p>
                출발시간: {offer.itineraries[1]?.segments[0]?.departure?.at} (
                {offer.itineraries[1]?.segments[0]?.departure?.iataCode})
              </p>
              <p>
                도착시간: {offer.itineraries[1]?.segments[0]?.arrival?.at} (
                {offer.itineraries[1]?.segments[0]?.arrival?.iataCode})
              </p>
              <p>
                항공편 번호: {offer.itineraries[1]?.segments[0]?.carrierCode}
                {offer.itineraries[1]?.segments[0]?.number}
              </p>
              <p>
                항공기 정보: {offer.itineraries[1]?.segments[0]?.aircraft?.code}
              </p>
              <p>경유지 수: {offer.itineraries[1]?.segments.length - 1}</p>
            </>
          )}
        </>
      )}

      <hr />
      <p>남은 예약좌석 : {offer.numberOfBookableSeats}</p>
      <p>총 가격: {offer.price.total}</p>
    </Banner>
  );
}

export default FlightResult;
