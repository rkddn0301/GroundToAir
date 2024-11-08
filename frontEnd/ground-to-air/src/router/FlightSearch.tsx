// 메인 & 항공 조회 페이지

import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 90%;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const InputField = styled.div`
  display: flex;
  gap: 15px;
`;

const InputBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const Banner = styled.div`
  border: 1px solid;
  border-radius: 25px;
  padding: 25px;
  margin-bottom: 20px;
`;

interface IataCodes {
  codeNo: number;
  airport: string;
  iata: string;
}

// AmadeusAPI(FlightOfferSearch) 호출된 데이터 지정
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

// AmadeusAPI(FlightOfferSearch) 호출 데이터 배열로 변환
interface FlightOffersResponse {
  meta: {
    count: number;
  };
  data: FlightOffer[];
}

function FlightSearch() {
  const [inputData, setInputData] = useState({
    originLocationCode: "", // 출발지
    destinationLocationCode: "", // 도착지
    departureDate: "", // 가는날
    returnDate: "", // 오는날
    adults: 1, // 인원
  }); // input 입력 state

  const [flightOffers, setFlightOffers] = useState<FlightOffersResponse | null>(
    null
  ); // 항공편 추출

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const [searchOriginLocations, setSearchOriginLocations] = useState<
    IataCodes[]
  >([]); // 출발지 테스트
  const [searchDestinationLocations, setSearchDestinationLocations] = useState<
    IataCodes[]
  >([]); // 도착지 테스트

  // 가는날 & 오는날 초기값 설정
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    const initDepartureDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식
    currentDate.setDate(currentDate.getDate() + 1);
    const initReturnDate = currentDate.toISOString().split("T")[0];
    setInputData((prev) => ({ ...prev, departureDate: initDepartureDate })); // 렌더링 후에 3일 뒤 날짜 설정
    setInputData((prev) => ({ ...prev, returnDate: initReturnDate })); // 렌더링 후에 4일 뒤 날짜 설정
  }, []);

  // 클릭 시 출발지 <-> 도착지 변경
  const locationChange = () => {
    setInputData((prev) => ({
      ...prev,
      originLocationCode: prev.destinationLocationCode,
      destinationLocationCode: prev.originLocationCode,
    }));

    // 검색 기록 초기화
    setSearchOriginLocations([]);
    setSearchDestinationLocations([]);
  };

  // 항공 검색 동작
  const flightSearch = () => {
    console.log(
      inputData.originLocationCode,
      inputData.destinationLocationCode,
      inputData.departureDate,
      inputData.returnDate
    );
    if (inputData.originLocationCode === "") {
      alert("출발지를 입력해주세요.");
      return;
    } else if (inputData.destinationLocationCode === "") {
      alert("도착지를 입력해주세요.");
      return;
    } else if (inputData.departureDate === "") {
      alert("가는날을 입력해주세요.");
      return;
    }

    setFlightOffers(null);
    setIsLoading(true);
    const apiUrl = `http://localhost:8080/air/flightOffers`;
    const params = {
      originLocationCode: inputData.originLocationCode,
      destinationLocationCode: inputData.destinationLocationCode,
      departureDate: inputData.departureDate,
      returnDate: inputData.returnDate || "",
      adults: inputData.adults,
      currencyCode: "KRW",
    };

    axios
      .get(apiUrl, { params })
      .then((response) => {
        setFlightOffers(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error fetching flight offers:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const originChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData((prev) => ({ ...prev, originLocationCode: value }));

    if (value.length > 1) {
      axios
        .get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        })
        .then((response) => setSearchOriginLocations(response.data))
        .catch((error) => console.error(error));
    } else {
      setSearchOriginLocations([]);
    }
  };

  const destinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData((prev) => ({ ...prev, destinationLocationCode: value }));

    if (value.length > 1) {
      axios
        .get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        })
        .then((response) => setSearchDestinationLocations(response.data))
        .catch((error) => console.error(error));
    } else {
      setSearchDestinationLocations([]);
    }
  };

  return (
    <Container>
      <Title>항공편 조회</Title>
      <InputField>
        <InputBox>
          <label>출발지</label>
          <input
            type="text"
            value={inputData.originLocationCode}
            onChange={originChange}
            placeholder="국가 또는 도시"
          />
          {searchOriginLocations.length > 0 && (
            <ul>
              {searchOriginLocations.map((originLocation) => (
                <li
                  key={originLocation.codeNo}
                  onClick={() => {
                    setInputData((prev) => ({
                      ...prev,
                      originLocationCode: originLocation.iata,
                    }));
                    setSearchOriginLocations([]); // 제안 리스트 비우기
                  }}
                >
                  {originLocation.airport} ({originLocation.iata})
                </li>
              ))}
            </ul>
          )}
        </InputBox>
        <div onClick={locationChange}>↔</div>
        <InputBox>
          <label>도착지</label>
          <input
            type="text"
            value={inputData.destinationLocationCode}
            onChange={destinationChange}
            placeholder="국가 또는 도시"
          />
          {searchDestinationLocations.length > 0 && (
            <ul>
              {searchDestinationLocations.map((destinationLocation) => (
                <li
                  key={destinationLocation.codeNo}
                  onClick={() => {
                    setInputData((prev) => ({
                      ...prev,
                      destinationLocationCode: destinationLocation.iata,
                    }));
                    setSearchDestinationLocations([]);
                  }}
                >
                  {destinationLocation.airport} ({destinationLocation.iata})
                </li>
              ))}
            </ul>
          )}
        </InputBox>
        <InputBox>
          <label>가는날</label>
          <input
            type="date"
            value={inputData.departureDate}
            onChange={(e) =>
              setInputData((prev) => ({
                ...prev,
                departureDate: e.target.value,
              }))
            }
          />
        </InputBox>
        <InputBox>
          <label>오는날</label>
          <input
            type="date"
            value={inputData.returnDate}
            onChange={(e) =>
              setInputData((prev) => ({ ...prev, returnDate: e.target.value }))
            }
          />
        </InputBox>
        <InputBox>
          <label>인원</label>
          <input
            id="human"
            type="number"
            value={inputData.adults}
            onChange={(e) =>
              setInputData((prev) => ({
                ...prev,
                adults: Number(e.target.value),
              }))
            }
            min={1}
          />
        </InputBox>
      </InputField>
      <button onClick={flightSearch}>검색</button>

      {isLoading ? (
        <div>로딩 중...</div>
      ) : flightOffers ? (
        <div>
          <h2>Flight Offers</h2>
          <p>검색 건 수: {flightOffers.meta.count}</p>
          {flightOffers.data.slice(0, 30).map((offer: any) => (
            <Banner key={offer.id}>
              <p>가는날</p>
              <hr />
              {/* 경유 여부 확인 */}
              {offer.itineraries[0]?.segments.length - 1 > 0 ? (
                <>
                  <p>
                    출발시간: {offer.itineraries[0]?.segments[0]?.departure?.at}{" "}
                    ({offer.itineraries[0]?.segments[0]?.departure?.iataCode})
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
                    출발시간: {offer.itineraries[0]?.segments[0]?.departure?.at}{" "}
                    ({offer.itineraries[0]?.segments[0]?.departure?.iataCode})
                  </p>
                  <p>
                    도착시간: {offer.itineraries[0]?.segments[0]?.arrival?.at} (
                    {offer.itineraries[0]?.segments[0]?.arrival?.iataCode})
                  </p>
                  <p>
                    항공편 번호:{" "}
                    {offer.itineraries[0]?.segments[0]?.carrierCode}
                    {offer.itineraries[0]?.segments[0]?.number}
                  </p>
                  <p>
                    항공기 정보:{" "}
                    {offer.itineraries[0]?.segments[0]?.aircraft?.code}
                  </p>
                  <p>경유지 수: {offer.itineraries[0]?.segments.length - 1}</p>
                </>
              )}

              {/* 왕복일경우 */}
              {inputData.returnDate && (
                <>
                  <hr />
                  <p>오는날</p>
                  <hr />
                  {/* 경유 여부 확인 */}
                  {offer.itineraries[1]?.segments.length - 1 > 0 ? (
                    <>
                      <p>
                        출발시간:{" "}
                        {offer.itineraries[1]?.segments[0]?.departure?.at} (
                        {offer.itineraries[1]?.segments[0]?.departure?.iataCode}
                        )
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
                      <p>
                        경유지 수: {offer.itineraries[1]?.segments.length - 1}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        출발시간:{" "}
                        {offer.itineraries[1]?.segments[0]?.departure?.at} (
                        {offer.itineraries[1]?.segments[0]?.departure?.iataCode}
                        )
                      </p>
                      <p>
                        도착시간:{" "}
                        {offer.itineraries[1]?.segments[0]?.arrival?.at} (
                        {offer.itineraries[1]?.segments[0]?.arrival?.iataCode})
                      </p>
                      <p>
                        항공편 번호:{" "}
                        {offer.itineraries[1]?.segments[0]?.carrierCode}
                        {offer.itineraries[1]?.segments[0]?.number}
                      </p>
                      <p>
                        항공기 정보:{" "}
                        {offer.itineraries[1]?.segments[0]?.aircraft?.code}
                      </p>
                      <p>
                        경유지 수: {offer.itineraries[1]?.segments.length - 1}
                      </p>
                    </>
                  )}
                </>
              )}

              <hr />
              <p>남은 예약좌석 : {offer.numberOfBookableSeats}</p>
              <p>총 가격: {offer.price.total}</p>
            </Banner>
          ))}
        </div>
      ) : (
        <div>비행편이 없습니다.</div>
      )}
    </Container>
  );
}

export default FlightSearch;
