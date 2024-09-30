import axios from "axios";
import { useEffect, useRef, useState } from "react";
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

// 호텔 자동완성 기능 데이터 선언부
interface AutoCompleteKeywords {
  data: {
    id: number; // 식별코드
    name: string; // 호텔명
    iataCode: string; // 지역코드
    subType: string; // 호텔 하위유형
    hotelIds: string[]; // 호텔 ID
    address: {
      cityName: string; // 도시명
      countryCode: string; // 국가코드
    };
    geoCode: {
      latitude: number; // 호텔의 위도
      longitude: number; // 호텔의 경도
    };
  }[];
}

// 호텔 검색 데이터 선언부
interface HotelOffer {
  data: {
    type: string; // 데이터 유형
    hotel: {
      hotelId: string; // 호텔 고유식별자
      chainCode: string; // 호텔 체인 코드
      name: string; // 호텔명
      cityCode: string; // 호텔이 위치한 도시의 코드
      latitude: number; // 호텔의 위도
      longitue: number; // 호텔의 경도
    };
    offers: {
      checkInDate: string; // 체크인 날짜
      checkOutDate: string; // 체크아웃 날짜
      room: {
        type: string; // 객실 유형
        typeEstimated?: {
          category?: string; // 객실명
          beds?: number; // 침대 수
          bedType?: string; // 침대 유형
        };
      };
      guests: {
        adults: number; // 객실 인원
      };
      price: {
        base: string; // 기본 요금
        total: string; // 총 요금
      };
    }[];
  }[];
}

function HotelSearch() {
  // input 작성 키워드
  const [writeKeyword, setWriteKeyword] = useState(""); // 작성 키워드 (보여지는 데이터)
  const [checkInDate, setCheckInDate] = useState(""); // 체크인
  const [checkOutDate, setCheckOutDate] = useState(""); // 체크아웃
  const [adults, setAdults] = useState(1); // 인원
  const [roomQuantity, setRoomQuantity] = useState(1); // 객실 수

  const [detailKeyword, setDetailKeyword] = useState<String>(""); // 검색 키워드 (실질적으로 보낼 데이터)

  const [searchCityName, setSearchCityName] = useState(""); // 자동완성되어 보여지는 도시명
  const [searchIataCode, setSearchIataCode] = useState(""); // 자동완성되어 보여지는 지역코드

  const [autoCompleteKeywords, setAutoCompleteKeywords] =
    useState<AutoCompleteKeywords | null>(null); // 키워드 추출

  const [hotelOffers, setHotelOffers] = useState<HotelOffer | null>(null); // 호텔 조회 데이터

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const timeoutRef = useRef<number | undefined>(undefined); // API 요청에 딜레이를 주는 훅
  const prevKeywordRef = useRef(""); // 이전 작성기록 저장하는 훅

  // 체크인 & 체크아웃 초기값 설정
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    const initCheckInDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식
    currentDate.setDate(currentDate.getDate() + 1);
    const initCheckOutDate = currentDate.toISOString().split("T")[0];
    setCheckInDate(initCheckInDate); // 렌더링 후에 1일 뒤 날짜 설정
    setCheckOutDate(initCheckOutDate); // 렌더링 후에 2일 뒤 날짜 설정
  }, []);

  // 조회 버튼 클릭 시 동작
  function handleSearch() {
    if (writeKeyword === "") {
      alert("호텔명을 입력해주세요.");
      return;
    } else if (checkInDate === "") {
      alert("체크인 날짜를 입력해주세요.");
      return;
    } else if (checkOutDate === "") {
      alert("체크아웃 날짜를 입력해주세요.");
      return;
    } else if (roomQuantity < 1) {
      alert("객실 수는 하나 이상이어야 합니다.");
      return;
    }

    setHotelOffers(null);
    setIsLoading(true);

    // 작성한 호텔명 혹은 도시명(searchKeyword)과 subType 데이터로 Hotel List API에 요청
    axios
      .get(`http://localhost:8080/hotel/hotelList`, {
        params: {
          keyword: detailKeyword,
        },
      })
      .then((response) => {
        // api 데이터 중 hotelIds만 추출하여 hotelIdsData에 저장
        console.log(response.data);
        const hotelIdsData = response.data.data
          .flatMap((hotel: any) => hotel.hotelId)
          .join(",");
        console.log(hotelIdsData);

        // hotelIdsData와 체크인, 체크아웃, 인원, 객실, 통화기준 데이터로 Hotel Search API에 요청
        return axios.get(`http://localhost:8080/hotel/hotelOffers`, {
          params: {
            hotelIds: hotelIdsData,
            checkInDate,
            checkOutDate,
            adults,
            roomQuantity,
            currency: "KRW",
          },
        });
      })
      .then((response: any) => {
        console.log(response.data);
        setHotelOffers(response.data); // 가져온 데이터를 hotelOffers에 삽입
      })
      .catch((error) => {
        console.error("Error fetching hotel offers:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // 호텔명 작성 도중 동작하는 함수
  const keywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWriteKeyword(value);

    // 작성한 글자 수가 세 글자 이상일 때 동작
    // ! (요청 수를 줄이기 위해 작성) 작성한 글을 지울 때는 이전글을 저장한 prevKeywordRef를 통해 api가 동작하지 않도록 설정
    if (value.length > 2 && value.length >= prevKeywordRef.current.length) {
      timeoutRef.current = window.setTimeout(() => {
        axios
          .get(`http://localhost:8080/hotel/hotelAutoComplete`, {
            params: {
              keyword: value,
              subType: "HOTEL_LEISURE,HOTEL_GDS",
              max: 20,
            },
          })

          .then((response: any) => {
            setAutoCompleteKeywords(response.data);
            console.log(response.data);

            // 자동완성된 데이터 중 도시명으로도 검색 가능하도록 집계하는 구간

            const iataCodeCount: { [key: string]: number } = {}; // 각 동일한 iataCode 방 생성
            let maxIataCodeCount = 0; // iataCode중 가장 많이 집계된 code를 카운트하는 변수
            let maxIataCode = ""; // iataCode중 가장 많이 집계된 code를 추출하는 변수

            const cityNameCount: { [key: string]: number } = {}; // 각 동일한 cityName 방 생성
            let maxCityNameCount = 0; // cityName중 가장 많이 집계된 name을 카운트하는 변수
            let maxCityName = ""; // cityName중 가장 많이 집계된 name을 추출하는 변수

            response.data.data.forEach((keywords: any) => {
              // 추출되는 cityName를 동일한 방에다가 카운트
              if (cityNameCount[keywords.address.cityName]) {
                cityNameCount[keywords.address.cityName] += 1;
              } else {
                cityNameCount[keywords.address.cityName] = 1;
              }

              // 추출되는 iataCode를 동일한 방에다가 카운트
              if (iataCodeCount[keywords.iataCode]) {
                iataCodeCount[keywords.iataCode] += 1;
              } else {
                iataCodeCount[keywords.iataCode] = 1;
              }

              // 가장 많이 집계된 cityName를 갱신
              if (
                cityNameCount[keywords.address.cityName] >= maxCityNameCount
              ) {
                maxCityNameCount = cityNameCount[keywords.address.cityName];
                maxCityName = keywords.address.cityName;

                /* console.log(
                      "keywords.address.cityName" +
                        cityNameCount[keywords.address.cityName]
                    );
                    console.log("maxCityNameCount : " + maxCityNameCount);
                    console.log("maxCityName : " + maxCityName); */
              }

              // 가장 많이 집계된 iataCode를 갱신
              if (iataCodeCount[keywords.iataCode] >= maxIataCodeCount) {
                maxIataCodeCount = iataCodeCount[keywords.iataCode];
                maxIataCode = keywords.iataCode;

                /* console.log(
                      "keywords.iataCode" + iataCodeCount[keywords.iataCode]
                    );
                    console.log("maxIataCodeCount : " + maxIataCodeCount);
                    console.log("maxIataCode : " + maxIataCode); */
              }
            });
            if (maxIataCodeCount >= 2) {
              // 도시명 기준으로 작성했거나 호텔명이 명확하지 않을 경우
              setDetailKeyword(maxIataCode); // iataCode가 2 이상일 때 설정
              setSearchCityName(maxCityName);
              setSearchIataCode(maxIataCode);
            } else {
              // 호텔명을 명확하게 작성했을 경우
              setDetailKeyword(response.data.data[0].hotelIds.join(",")); // 그 외에는 첫 번째 hotelIds 설정
              setSearchCityName(""); // 자동완성된 도시명이 있으면 삭제
              setSearchIataCode(""); // 자동완성된 지역코드가 있으면 삭제
            }
          })
          .catch((error) => console.error(error));
      }, 500); // 입력할 때 500ms이 지날 때 동작되도록 설정
    }
    prevKeywordRef.current = value; // 이전 작성 값을 저장

    // 두 글자 미만으로 지웠을 경우 자동완성 기록 삭제
    if (value.length <= 2) {
      prevKeywordRef.current = "";
      setDetailKeyword("");
      setAutoCompleteKeywords(null);
    }
  };
  // 배포 테스트
  /* useEffect(() => {
    console.log(prevKeywordRef.current);
  }, [prevKeywordRef.current]); */

  useEffect(() => {
    console.log(detailKeyword);
  }, [detailKeyword]);

  return (
    <Container>
      <Title>호텔 조회</Title>
      <InputField>
        <InputBox>
          <label>호텔명</label>
          <input type="text" value={writeKeyword} onChange={keywordChange} />
          {autoCompleteKeywords !== null && (
            <ul>
              {/* 도시 키워드 추가 */}
              {searchCityName && searchIataCode ? (
                <>
                  <li
                    key={`iataCode-${searchIataCode}`}
                    onClick={() => {
                      setWriteKeyword(searchCityName);
                      prevKeywordRef.current = searchCityName;
                      setDetailKeyword(searchIataCode);
                      setAutoCompleteKeywords(null);
                    }}
                  >
                    {searchCityName} ({searchIataCode})
                  </li>
                  <hr />
                </>
              ) : (
                ""
              )}

              {/* 호텔키워드 추가 */}
              {autoCompleteKeywords.data.slice(0, 5).map((keywords) => (
                <li
                  key={keywords.id}
                  onClick={() => {
                    setWriteKeyword(keywords.name);
                    prevKeywordRef.current = keywords.name;

                    // hotelIds를 문자열로 변환하여 detailKeyword에 설정 후 저장
                    const hotelIdsChange = keywords.hotelIds.join(",");
                    setDetailKeyword(hotelIdsChange);
                    setAutoCompleteKeywords(null);
                  }}
                >
                  {keywords.name}
                </li>
              ))}
            </ul>
          )}

          {detailKeyword ? <div>{detailKeyword}</div> : null}
        </InputBox>

        <InputBox>
          <label>체크인</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
        </InputBox>
        <InputBox>
          <label>체크아웃</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
          />
        </InputBox>
        <InputBox>
          <label>인원</label>
          <input
            type="number"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            min={1}
          />
        </InputBox>
        <InputBox>
          <label>객실</label>
          <input
            type="number"
            value={roomQuantity}
            onChange={(e) => setRoomQuantity(Number(e.target.value))}
            min={1}
          />
        </InputBox>
      </InputField>
      <button onClick={handleSearch}>검색</button>

      {isLoading ? (
        <div>로딩 중...</div>
      ) : hotelOffers ? (
        <div>
          <h2>Hotel Offers</h2>
          {hotelOffers.data.map((hotelOffers: any) => (
            <Banner key={hotelOffers.hotel.hotelId}>
              <p>호텔명 : {hotelOffers.hotel.name}</p>
              <hr />
              <p>
                <span>체크인: {hotelOffers.offers[0].checkInDate}</span> /
                &nbsp;
                <span>체크아웃: {hotelOffers.offers[0].checkOutDate}</span>
              </p>
              <hr />
              <p>
                객실명 : {hotelOffers.offers[0].room.typeEstimated?.category}
              </p>
              <p>침대 수 : {hotelOffers.offers[0].room.typeEstimated?.beds}</p>

              <p>객실 지정인원 : {hotelOffers.offers[0].guests.adults} </p>
              <hr />
              <p>요금 : {hotelOffers.offers[0].price.total}</p>
            </Banner>
          ))}
        </div>
      ) : (
        <div>호텔이 없습니다.</div>
      )}
    </Container>
  );
}

export default HotelSearch;
