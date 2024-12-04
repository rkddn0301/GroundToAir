// 항공 조회 필터링 컴포넌트

import styled from "styled-components";
import { FlightOffersResponse } from "../../router/FlightSearch";
import { useEffect, useState } from "react";
import { formatTime } from "../../utils/formatTime";

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

// 출발 시간대 슬라이더 전체 디자인
const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 50px;
`;

// 배경 슬라이더 바
const SliderTrack = styled.div<{ startTime: number; endTime: number }>`
  position: absolute;
  top: 50%;
  width: 100%;
  height: 5px;
  background-color: #ddd;
  border-radius: 5px;
  transform: translateY(-50%);
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: ${(props) =>
      (props.startTime / 1440) *
      100}%; // 하늘색 시작위치 EX) 360(오전 6시) / 1440(전체시간) * 100 = 25% 구간부터 시작
    width: ${(props) =>
      ((props.endTime - props.startTime) / 1440) *
      100}%; // 하늘색이 차지하는 비율 EX) 1439(오후 11시 59분) - 360(오전 6시) / 1440(전체시간) * 100 = 74.93...% 구간을 차지
    height: 100%;
    background-color: #00aaff;
    border-radius: 5px;
  }
`;

// 드래그 원형
const SliderCircle = styled.span<{ position: number }>`
  position: absolute;
  background: #007aff;
  top: 30%;
  left: ${(props) => (props.position / 1440) * 100}%; // 동적 위치
  transform: translateX(-50%); // 가운데 정렬
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 3;
`;

// 출발 시간대 표시
const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

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
  const [originalOffers, setOriginalOffers] =
    useState<FlightOffersResponse | null>(null); // 항공 조회 원본 데이터

  // 원본 데이터 보관
  useEffect(() => {
    setOriginalOffers(flightOffers);
  }, []);

  /* 경유지 데이터 시작 */

  const [nonStop, setNonStop] = useState(true); // 직항 state
  const [oneStop, setOneStop] = useState(true); // 경유 1회 state
  const [multipleStops, setMultipleStops] = useState(true); // 경유 2회 이상 state

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

  // 경유지 변경 시 적용되는 useEffect
  /* useEffect(() => {
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
  }, [nonStop, oneStop, multipleStops, originalOffers]); */

  /* 경유지 데이터 끝 */

  /* 출발 시간대 조정 데이터 시작 */
  const [startTime, setStartTime] = useState(0); // 출발 시간 시작 state
  const [endTime, setEndTime] = useState(1439); // 출발 시간 끝 state

  const maxValue = 1439; // 하루 총 시간

  // 슬라이더 바를 클릭했을 경우
  const sliderTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const trackWidth = e.currentTarget.offsetWidth; // 클릭된 track의 너비(px)
    const clickPosition = e.nativeEvent.offsetX; // 브라우저의 기본 이벤트 객체(nativeEvent)에서 클릭한 위치의 수평좌표를 반환
    const clickValue = Math.round((clickPosition / trackWidth) * maxValue); // 전체 track에서 차지하는 비율을 계산
    const adjustClickValue = Math.min(
      Math.round(clickValue / 30) * 30,
      maxValue
    ); // 30분 단위로 조정, 최대는 maxValue 까지

    if (adjustClickValue < startTime) {
      // 클릭한 구간이 startTime보다 낮을 경우 startTime이 지정
      setStartTime(adjustClickValue);
    } else {
      // 그 외에는 endTime이 지정
      setEndTime(adjustClickValue);
    }
  };

  // 원형을 드래그 했을 경우
  const circleDrag = (
    e: React.MouseEvent<HTMLSpanElement>,
    type: "start" | "end"
  ) => {
    const track = e.currentTarget.parentElement!; // e.currentTarget의 부모 요소를 참조
    const trackWidth = track.offsetWidth; // SliderTrack의 너비를 가져옴
    const trackLeft = track.getBoundingClientRect().left; // track의 왼쪽 경계와(padding-left) track 왼쪽 사이의 거리를 계산

    const onMove = (moveEvent: MouseEvent) => {
      const movePosition = moveEvent.clientX - trackLeft; // 내가 드래그한 위치를 마우스 클릭위치(moveEvent.clientX) - track 시작위치(trackLeft) 기준으로 계산
      const dragValue = Math.round((movePosition / trackWidth) * maxValue); // 내가 드래그한 위치(movePosition)와 전체 track에서 차지하는 비율을 계산

      const adjustedValue = Math.min(Math.round(dragValue / 30) * 30, maxValue); // 30분 단위로 조정, 최대는 maxValue 까지

      if (type === "start" && adjustedValue >= 0 && adjustedValue <= endTime) {
        setStartTime(adjustedValue);
      } else if (
        type === "end" &&
        adjustedValue >= startTime &&
        adjustedValue <= maxValue
      ) {
        setEndTime(adjustedValue);
      }
    };

    const onStop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onStop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onStop);
  };

  /* useEffect(() => {
    if (!originalOffers) return;

    const filteredByTime = originalOffers.data.filter((offer) => {
      const departureSegments = offer.itineraries[0]?.segments || [];

      const departureTime = departureSegments[0]?.departure?.at;
      if (!departureTime) return false;

      const departureDate = new Date(departureTime);
      const departureMinutes =
        departureDate.getHours() * 60 + departureDate.getMinutes(); // 시간과 분을 분으로 합침
      console.log("departureTimeInMs : ", departureMinutes);

      return departureMinutes >= startTime && departureMinutes <= endTime;
    });

    console.log(filteredByTime);

    setFlightOffers({
      data: filteredByTime,
      meta: { count: filteredByTime.length },
      dictionaries: originalOffers.dictionaries, // 원본 데이터의 dictionaries 사용
    });
  }, [startTime, endTime, originalOffers]); */

  /* 출발 시간대 조정 데이터 끝 */

  useEffect(() => {
    if (!originalOffers) return;

    const filteredOffers = originalOffers.data.filter((offer) => {
      const departureSegments = offer.itineraries[0]?.segments || [];
      const returnSegments = offer.itineraries[1]?.segments || [];

      // 출발 시간대 필터링
      const departureTime = departureSegments[0]?.departure?.at;
      if (!departureTime) return false;

      const departureDate = new Date(departureTime);
      const departureMinutes =
        departureDate.getHours() * 60 + departureDate.getMinutes(); // 시간과 분을 분으로 합침

      // 출발 시간이 startTime과 endTime 사이에 있는지 확인
      const isDepartureInTimeRange =
        departureMinutes >= startTime && departureMinutes <= endTime;

      // 경유지 조건 필터링
      const isValidSegment = (segments: any) => {
        if (nonStop) return segments.length === 1;
        if (oneStop) return segments.length === 2;
        if (multipleStops) return segments.length > 2;
        return true; // 기본적으로 모든 조건을 허용
      };

      // 경유지 체크가 해제되었을 때 모든 데이터를 반환하지 않게 처리
      const isAnyStopChecked = nonStop || oneStop || multipleStops;

      // 경유지 체크가 해제되었을 때, 출발 시간과 경유지 조건 모두 만족하지 않으면 필터링됨
      if (!isAnyStopChecked) {
        return false; // 경유지 체크가 없으면 출발시간에 관계없이 필터링됨
      }

      // 경유지와 출발시간 모두 조건에 맞아야 함
      const isValidDeparture =
        isDepartureInTimeRange &&
        (isValidSegment(departureSegments) || isValidSegment(returnSegments));

      // 왕복일 경우, 가는편과 오는편 중 하나라도 조건을 만족해야 함
      if (returnSegments.length > 0) {
        return isValidDeparture; // 경유지와 출발시간 조건이 모두 맞아야 필터링됨
      } else {
        // 편도일 경우, 경유지가 없을 수도 있음
        return isValidDeparture; // 경유지가 없을 경우, 출발시간만 조건에 맞으면 필터링됨
      }
    });

    console.log(filteredOffers);

    // 필터링된 결과로 상태 업데이트
    setFlightOffers({
      data: filteredOffers,
      meta: { count: filteredOffers.length },
      dictionaries: originalOffers.dictionaries,
    });
  }, [startTime, endTime, nonStop, oneStop, multipleStops, originalOffers]);

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
        <SliderContainer>
          {/* 배경 슬라이더 바 */}
          <SliderTrack
            startTime={startTime}
            endTime={endTime}
            onClick={(e) => sliderTrackClick(e)} // 첫 번째 슬라이더 영역 우선
          />

          {/* 첫 번째 슬라이더 */}
          <SliderCircle
            position={startTime}
            onMouseDown={(e) => circleDrag(e, "start")}
          ></SliderCircle>

          {/* 두 번째 슬라이더 */}
          <SliderCircle
            position={endTime}
            onMouseDown={(e) => circleDrag(e, "end")}
          ></SliderCircle>
          <SliderLabels>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {formatTime(startTime)}
            </span>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {formatTime(endTime)}
            </span>
          </SliderLabels>
        </SliderContainer>
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
