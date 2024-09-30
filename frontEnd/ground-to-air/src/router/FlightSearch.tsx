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
  const [originLocationCode, setOriginLocationCode] = useState("");
  const [destinationLocationCode, setDestinationLocationCode] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [flightOffers, setFlightOffers] = useState<FlightOffersResponse | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const [suggestions, setSuggestions] = useState<IataCodes[]>([]); // 출발지 테스트
  const [suggestionss, setSuggestionss] = useState<IataCodes[]>([]); // 도착지 테스트

  function handleSearch() {
    const currencyCode = "KRW"; // 통화 단위 (한국 원)
    setIsLoading(true);
    const apiUrl = `http://localhost:8080/air/flightOffers`;
    const params = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      currencyCode,
    };

    console.log(
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      currencyCode
    );

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
