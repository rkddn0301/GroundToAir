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
  airportKor?: string;
  iata?: string;
  cityKor?: string;
  cityCode?: string;
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

  const [autoComplateOriginLocations, setAutoComplateOriginLocations] =
    useState<IataCodes[]>([]); // 출발지 자동완성
  const [
    autoComplateDestinationLocations,
    setAutoComplateDestinationLocations,
  ] = useState<IataCodes[]>([]); // 도착지 자동완성

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

    setAutoComplateOriginLocations((prev) => [
      ...autoComplateDestinationLocations,
    ]); // 도착지의 자동완성을 출발지에 할당
    setAutoComplateDestinationLocations((prev) => [
      ...autoComplateOriginLocations,
    ]); // 출발지의 자동완성을 도착지에 할당
  };

  // 항공 검색 동작
  const flightSearch = async () => {
    let searchOriginLocation; // 실질적으로 검색될 출발지 데이터
    let searchDestinationLocation; // 실질적으로 검색될 도착지 데이터

    // 출발지/도착지 조건
    /*
     1. 자동완성기능을 선택하지 않고 즉시 검색했을 때
     2. 자동완성기능을 선택했을 때의 처리
     3. 나머지는 focus
    */

    //  출발지
    if (
      inputData.originLocationCode.length > 1 &&
      autoComplateOriginLocations.length > 0
    ) {
      // 가장 첫 번째에 있는 공항이 검색
      searchOriginLocation = autoComplateOriginLocations[0]?.iata || "";
      setInputData((prev) => ({
        ...prev,
        originLocationCode: `${autoComplateOriginLocations[0]?.airportKor} (${autoComplateOriginLocations[0]?.iata})`,
      }));
    } else if (/\(.*\)/.test(inputData.originLocationCode)) {
      searchOriginLocation = inputData.originLocationCode
        .split("(")[1]
        .split(")")[0];
    } else {
      document.getElementById("originLocation")?.focus();
      return;
    }

    // 도착지
    if (
      inputData.destinationLocationCode.length > 1 &&
      autoComplateDestinationLocations.length > 0
    ) {
      // 가장 첫 번째에 있는 공항이 검색
      searchDestinationLocation =
        autoComplateDestinationLocations[0]?.iata || "";
      setInputData((prev) => ({
        ...prev,
        destinationLocationCode: `${autoComplateDestinationLocations[0]?.airportKor} (${autoComplateDestinationLocations[0]?.iata})`,
      }));
    } else if (/\(.*\)/.test(inputData.destinationLocationCode)) {
      searchDestinationLocation = inputData.destinationLocationCode
        .split("(")[1]
        .split(")")[0];
    } else {
      document.getElementById("destinationLocation")?.focus();
      return;
    }

    if (!inputData.departureDate) {
      document.getElementById("departureDate")?.focus();
      return;
    }

    console.log(
      searchOriginLocation,
      searchDestinationLocation,
      inputData.departureDate,
      inputData.returnDate
    );

    setFlightOffers(null); // 기존에 검색된 항공 데이터 제거
    setAutoComplateOriginLocations([]); // 출발지 자동완성 제거
    setAutoComplateDestinationLocations([]); // 도착지 자동완성 제거
    setIsLoading(true); // 항공 검색 이전까지 로딩

    try {
      const response = await axios.get(
        `http://localhost:8080/air/flightOffers`,
        {
          params: {
            originLocationCode: searchOriginLocation,
            destinationLocationCode: searchDestinationLocation,
            departureDate: inputData.departureDate,
            returnDate: inputData.returnDate || "",
            adults: inputData.adults,
            currencyCode: "KRW",
          },
        }
      );
      setFlightOffers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("항공 검색 도중 오류 발생 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const originChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData((prev) => ({ ...prev, originLocationCode: value }));

    if (value.length > 1) {
      try {
        const response = await axios.get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        });
        if (response.data) {
          setAutoComplateOriginLocations(response.data);
        } else {
          setAutoComplateOriginLocations([]);
        }
      } catch (error) {
        console.error("출발지 자동완성 오류 발생 : ", error);
      }
    } else {
      setAutoComplateOriginLocations([]);
    }
  };

  const destinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData((prev) => ({ ...prev, destinationLocationCode: value }));

    if (value.length > 1) {
      try {
        const response = await axios.get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        });
        if (response.data) {
          setAutoComplateDestinationLocations(response.data);
        } else {
          setAutoComplateDestinationLocations([]);
        }
      } catch (error) {
        console.error("도착지 자동완성 오류 발생 : ", error);
      }
    } else {
      setAutoComplateDestinationLocations([]);
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
            id="originLocation"
            value={inputData.originLocationCode}
            onChange={originChange}
            placeholder="도시 또는 공항명"
          />
          {autoComplateOriginLocations.length > 0 && (
            <ul>
              {autoComplateOriginLocations.map((originLocation, index) => (
                <>
                  {/* cityKor와 cityCode는 한 번만 표시되도록 체크되며 공항명이 1개만 있으면 나오지 않음 */}
                  {index === 0 &&
                    autoComplateOriginLocations.length > 1 &&
                    originLocation.cityKor !== null &&
                    originLocation.cityCode != null && (
                      <li
                        key={originLocation.codeNo}
                        onClick={() => {
                          setInputData((prev) => ({
                            ...prev,
                            originLocationCode: `${originLocation.cityKor} (${originLocation.cityCode})`,
                          }));
                          setAutoComplateOriginLocations([]); // 제안 리스트 비우기
                        }}
                      >
                        {originLocation.cityKor} ({originLocation.cityCode})
                      </li>
                    )}

                  <li
                    key={originLocation.codeNo + "_airport"}
                    onClick={() => {
                      setInputData((prev) => ({
                        ...prev,
                        originLocationCode: `${originLocation.airportKor} (${originLocation.iata})`,
                      }));
                      setAutoComplateOriginLocations([]); // 제안 리스트 비우기
                    }}
                  >
                    {originLocation.airportKor} ({originLocation.iata})
                  </li>
                </>
              ))}
            </ul>
          )}
        </InputBox>
        <div onClick={locationChange}>↔</div>
        <InputBox>
          <label>도착지</label>
          <input
            type="text"
            id="destinationLocation"
            value={inputData.destinationLocationCode}
            onChange={destinationChange}
            placeholder="도시 또는 공항명"
          />
          {autoComplateDestinationLocations.length > 0 && (
            <ul>
              {autoComplateDestinationLocations.map(
                (destinationLocation, index) => (
                  <>
                    {/* cityKor와 cityCode는 한 번만 표시되도록 체크되며 공항명이 1개만 있으면 나오지 않음 */}
                    {index === 0 &&
                      autoComplateDestinationLocations.length > 1 &&
                      destinationLocation.cityKor !== null &&
                      destinationLocation.cityCode != null && (
                        <li
                          key={destinationLocation.codeNo}
                          onClick={() => {
                            setInputData((prev) => ({
                              ...prev,
                              destinationLocationCode: `${destinationLocation.cityKor} (${destinationLocation.cityCode})`,
                            }));
                            setAutoComplateDestinationLocations([]); // 제안 리스트 비우기
                          }}
                        >
                          {destinationLocation.cityKor} (
                          {destinationLocation.cityCode})
                        </li>
                      )}

                    <li
                      key={destinationLocation.codeNo + "_airport"}
                      onClick={() => {
                        setInputData((prev) => ({
                          ...prev,
                          originLocationCode: `${destinationLocation.airportKor} (${destinationLocation.iata})`,
                        }));
                        setAutoComplateDestinationLocations([]); // 제안 리스트 비우기
                      }}
                    >
                      {destinationLocation.airportKor} (
                      {destinationLocation.iata})
                    </li>
                  </>
                )
              )}
            </ul>
          )}
        </InputBox>
        <InputBox>
          <label>가는날</label>
          <input
            type="date"
            id="departureDate"
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
            id="returnDate"
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
