// 항공 조회 필터링 컴포넌트

import styled from "styled-components";
import { FlightOffersResponse } from "../../router/FlightSearch";
import { useEffect, useState } from "react";

// FlightFiltering 전체 컴포넌트 구성
const Banner = styled.div`
  width: 15%;
  position: absolute;
  padding-left: 5px;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.white.bg};
  height: 250px;
  box-shadow: 5px 3px 2px rgba(0, 0, 0, 0.2); // 오른쪽 + 아래쪽 그림자
  z-index: 0; // 검색결과(ResultFont)가 덮어써야해서 적용
`;

// 경유지 필터
const Stopover = styled.div`
  margin: 30px 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// 각 경유지 디자인 구성
const StopoverField = styled.div`
  display: flex;
  gap: 5px;
  padding-left: 5px;
`;

// 출발 시간대 필터
const DepartureTime = styled.div``;

// 가격 조정 필터
const Price = styled.div``;

// 항공사 선택 필터
const Airlines = styled.div``;

// 필터 제목
const Title = styled.h2`
  font-size: 25px;
  font-weight: 600px;
`;

// FlightFiltering 컴포넌트가 요구하는 props
interface FlightFilteringProps {
  flightOffers: FlightOffersResponse | null; // 항공 조회 데이터
  setFlightOffers: React.Dispatch<
    React.SetStateAction<FlightOffersResponse | null>
  >; // 항공 조회 수정 state
}

function FlightFiltering({
  flightOffers,
  setFlightOffers,
}: FlightFilteringProps) {
  const [nonStop, setNonStop] = useState(true); // 직항 state
  const [oneStop, setOneStop] = useState(true); // 경유 1회 state
  const [multipleStops, setMultipleStops] = useState(true); // 경유 2회 이상 state

  const [originalOffers, setOriginalOffers] =
    useState<FlightOffersResponse | null>(null); // 항공 조회 원본 데이터

  // 경유지 체크박스 적용 함수
  const stopoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    if (name === "nonStop") {
      setNonStop((prev) => !prev);
    }

    if (name === "oneStop") {
      setOneStop((prev) => !prev);
    }

    if (name === "multipleStops") {
      setMultipleStops((prev) => !prev);
    }
    console.log(name, checked);
  };

  // 원본 데이터 보관
  useEffect(() => {
    setOriginalOffers(flightOffers);
  }, []);

  // 경유지 변경 시 적용되는 useEffect
  useEffect(() => {
    if (!originalOffers) return;

    // 원본 데이터(originalOffers)에서 필터링
    // 경유지 체크박스 true --> false로 변경 시 해당 데이터는 return 되지 않음
    // 경유지 체크박스 false --> true로 변경 시 해당 데이터는 return 됨
    const filteredOffers = originalOffers.data.filter((offer) => {
      const departureSegments = offer.itineraries[0]?.segments || []; // 가는편 경유지 확인
      const returnSegments = offer.itineraries[1]?.segments || []; // 오는편 경유지 확인

      // 왕복일 경우 가는편/오는편 중 하나라도 아래 조건에 해당하면 데이터 표시
      if (returnSegments.length > 0) {
        return (
          (nonStop &&
            (departureSegments.length === 1 || returnSegments.length === 1)) ||
          (oneStop &&
            (departureSegments.length === 2 || returnSegments.length === 2)) ||
          (multipleStops &&
            (departureSegments.length > 2 || returnSegments.length > 2))
        );
      } else {
        // 편도일 경우 가는편 중 아래 조건에 해당하면 데이터 표시
        return (
          (nonStop && departureSegments.length === 1) ||
          (oneStop && departureSegments.length === 2) ||
          (multipleStops && departureSegments.length > 2)
        );
      }
    });
    console.log(filteredOffers);

    // 필터링된 결과로 상태 업데이트
    setFlightOffers({
      data: filteredOffers,
      meta: { count: filteredOffers.length }, // 필터링 되는 개수 사용
      dictionaries: originalOffers.dictionaries, // 원본 데이터의 dictionaries 사용
    });
  }, [nonStop, oneStop, multipleStops, originalOffers]);

  return (
    <Banner>
      <Stopover>
        <Title>경유</Title>

        <StopoverField>
          <input
            type="checkbox"
            name="nonStop"
            checked={nonStop}
            onChange={stopoverChange}
            style={{ cursor: "pointer" }}
          />
          <label>직항</label>
        </StopoverField>

        <StopoverField>
          <input
            type="checkbox"
            name="oneStop"
            checked={oneStop}
            onChange={stopoverChange}
            style={{ cursor: "pointer" }}
          />
          <label>경유 1회</label>
        </StopoverField>

        <StopoverField>
          <input
            type="checkbox"
            name="multipleStops"
            checked={multipleStops}
            onChange={stopoverChange}
            style={{ cursor: "pointer" }}
          />
          <label>경유 2회 이상</label>
        </StopoverField>
      </Stopover>
      <DepartureTime>
        <Title>출발 시간대</Title>
      </DepartureTime>
      <Price>
        <Title>가격 조정</Title>
      </Price>
      <Airlines>
        <Title>항공사</Title>
      </Airlines>
    </Banner>
  );
}

export default FlightFiltering;
