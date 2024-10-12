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
  numberOfBookableSeats: number;
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      numberOfStops: number;
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
  // input 작성 키워드
  const [originLocationCode, setOriginLocationCode] = useState(""); // 출발지
  const [destinationLocationCode, setDestinationLocationCode] = useState(""); // 도착지
  const [departureDate, setDepartureDate] = useState(""); // 가는날
  const [returnDate, setReturnDate] = useState(""); // 오는날
  const [adults, setAdults] = useState(1); // 인원

  const [flightOffers, setFlightOffers] = useState<FlightOffersResponse | null>(
    null
  ); // 항공편 추출

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const [suggestions, setSuggestions] = useState<IataCodes[]>([]); // 출발지 테스트
  const [suggestionss, setSuggestionss] = useState<IataCodes[]>([]); // 도착지 테스트

  // 가는날 & 오는날 초기값 설정
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    const initDepartureDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식
    currentDate.setDate(currentDate.getDate() + 1);
    const initReturnDate = currentDate.toISOString().split("T")[0];
    setDepartureDate(initDepartureDate); // 렌더링 후에 3일 뒤 날짜 설정
    setReturnDate(initReturnDate); // 렌더링 후에 4일 뒤 날짜 설정
  }, []);

  function handleSearch() {
    if (originLocationCode === "") {
      alert("출발지는 입력해주세요.");
      return;
    } else if (destinationLocationCode === "") {
      alert("도착지는 입력해주세요.");
      return;
    } else if (departureDate === "") {
      alert("출국일을 입력해주세요.");
      return;
    } else if (returnDate === "") {
      alert("입국일을 입력해주세요.");
      return;
    }

    setFlightOffers(null);
    setIsLoading(true);
    const apiUrl = `http://localhost:8080/air/flightOffers`;
    const params = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
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
  }

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginLocationCode(value);

    if (value.length > 1) {
      axios
        .get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        })
        .then((response) => setSuggestions(response.data))
        .catch((error) => console.error(error));
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationLocationCode(value);

    if (value.length > 1) {
      axios
        .get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        })
        .then((response) => setSuggestionss(response.data))
        .catch((error) => console.error(error));
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
            value={originLocationCode}
            onChange={handleOriginChange}
          />
          {suggestions.length > 0 && (
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.codeNo}
                  onClick={() => {
                    setOriginLocationCode(suggestion.iata);
                    setSuggestions([]); // 제안 리스트 비우기
                  }}
                >
                  {suggestion.airport} ({suggestion.iata})
                </li>
              ))}
            </ul>
          )}
        </InputBox>
        <InputBox>
          <label>도착지</label>
          <input
            type="text"
            value={destinationLocationCode}
            onChange={handleDestinationChange}
          />
          {suggestionss.length > 0 && (
            <ul>
              {suggestionss.map((suggestion) => (
                <li
                  key={suggestion.codeNo}
                  onClick={() => {
                    setDestinationLocationCode(suggestion.iata);
                    setSuggestionss([]);
                  }}
                >
                  {suggestion.airport} ({suggestion.iata})
                </li>
              ))}
            </ul>
          )}
        </InputBox>
        <InputBox>
          <label>출국일</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </InputBox>
        <InputBox>
          <label>입국일</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </InputBox>
        <InputBox>
          <label>인원</label>
          <input
            id="human"
            type="number"
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            min={1}
          />
        </InputBox>
      </InputField>
      <button onClick={handleSearch}>검색</button>

      {isLoading ? (
        <div>로딩 중...</div>
      ) : flightOffers ? (
        <div>
          <h2>Flight Offers</h2>
          <p>검색 건 수: {flightOffers.meta.count}</p>
          {flightOffers.data.slice(0, 10).map((offer) => (
            <Banner key={offer.id}>
              <p>가는날</p>
              <hr></hr>
              <p>
                출발시간: {offer.itineraries[0].segments[0].departure.at} (
                {offer.itineraries[0].segments[0].departure.iataCode})
              </p>
              <p>
                도착시간: {offer.itineraries[0].segments[0].arrival.at} (
                {offer.itineraries[0].segments[0].arrival.iataCode})
              </p>
              <p>
                항공편 번호: {offer.itineraries[0].segments[0].carrierCode}
                {offer.itineraries[0].segments[0].number}
              </p>
              <p>
                항공기 정보: {offer.itineraries[0].segments[0].aircraft.code}
              </p>
              <p>경유지 수: {offer.itineraries[0].segments[0].numberOfStops}</p>
              <hr></hr>
              <p>오는날</p>
              <hr></hr>
              <p>
                출발시간: {offer.itineraries[1].segments[0].departure.at} (
                {offer.itineraries[1].segments[0].departure.iataCode})
              </p>
              <p>
                도착시간: {offer.itineraries[1].segments[0].arrival.at} (
                {offer.itineraries[1].segments[0].arrival.iataCode})
              </p>
              <p>
                항공편 번호: {offer.itineraries[1].segments[0].carrierCode}
                {offer.itineraries[1].segments[0].number}
              </p>
              <p>
                항공기 정보: {offer.itineraries[1].segments[0].aircraft.code}
              </p>
              <p>경유지 수: {offer.itineraries[1].segments[0].numberOfStops}</p>
              <hr></hr>
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
