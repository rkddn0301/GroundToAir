// 항공 조회 필터링 컴포넌트

import styled from "styled-components";
import { FlightOffersResponse } from "../../router/FlightSearch";
import { useEffect, useState } from "react";
import { formatTime } from "../../utils/formatTime";
import { AirlineCodes } from "../../utils/api";

// FlightFiltering 전체 컴포넌트 구성
const Banner = styled.div`
  width: 15%;
  position: absolute;
  padding-left: 5px;
  margin-bottom: 10px;
  background-color: ${(props) => props.theme.white.bg};
  min-height: 450px;
  //height: 100%;
  box-shadow: 5px 3px 2px rgba(0, 0, 0, 0.2); // 오른쪽 + 아래쪽 그림자
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
const DepartureTime = styled.div`
  margin: 30px 0 20px 0;
`;

// 가격 조정 필터
const Price = styled.div`
  margin: 30px 0 20px 0;
`;

// 출발 시간대, 가격 조정 슬라이더 전체 디자인
const SliderContainer = styled.div`
  position: relative;
  width: 90%;
  margin: 0 auto;
  height: 50px;
`;

// 배경 슬라이더 바
const SliderTrack = styled.div<{
  start: number;
  end: number;
  min: number;
  max: number;
}>`
  position: absolute;
  top: 50%;
  width: 100%;
  height: 5px;
  background-color: ${(props) => props.theme.black.bg}; // #ddd
  border-radius: 5px;
  transform: translateY(-50%);
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: ${(props) =>
      ((props.start - props.min) / (props.max - props.min)) *
      100}%; // 하늘색 시작위치
    // 출발 시간대 EX) (360-0)(오전 6시) / (1439-0)(전체시간) * 100 = 25% 구간부터 시작
    // 가격 조정 EX) (425500-225100) / (573500-225100) * 100 = 57% 구간부터 시작
    width: ${(props) =>
      ((props.end - props.min - (props.start - props.min)) /
        (props.max - props.min)) *
      100}%; // 하늘색이 left부터 차지하는 비율
    // 출발 시간대 EX) (1439-0)(오후 11시 59분) - (360-0)(오전 6시) / (1439-0)(전체시간) * 100 = 74.93...% 구간을 차지
    // 가격 조정 EX) ((573500 - 225100 - (425500-225100)) / 348400) * 100 = 42.47...% 구간을 차지
    height: 100%;
    background-color: skyblue; // #00aaff
    border-radius: 5px;
  }
`;

// 드래그 원형
const SliderCircle = styled.span<{
  position: number;
  min: number;
  max: number;
}>`
  position: absolute;
  background: skyblue; // #00aaff
  top: 30%;
  left: ${(props) =>
    ((props.position - props.min) / (props.max - props.min)) *
    100}%; // 동적 위치
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
  margin-top: 3%;
`;

// 항공사 선택 필터
const Airlines = styled.div`
  margin: 30px 0 20px 0;
`;

// 항공사 전체 디자인
const AirlinesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 5px;
  margin-top: 10px;
`;

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
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
}

function FlightFiltering({
  flightOffers,
  setFlightOffers,
  airlineCodeOffers,
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

  /* 경유지 데이터 끝 */

  /* 출발 시간대 조정 데이터 시작 */
  const [adjustTime, setAdjustTime] = useState({
    departureStartTime: 0, // 가는편 출발시간 시작
    departureEndTime: 1439, // 가는편 출발시간 끝
    returnStartTime: 0, // 오는편 출발시간 시작
    returnEndTime: 1439, // 오는편 출발시간 끝

    tempDepartureStartTime: 0, // 가는편 출발시간 임시 시작
    tempDepartureEndTime: 1439, // 가는편 출발시간 임시 끝
    tempReturnStartTime: 0, // 오는편 출발시간 임시 시작
    tempReturnEndTime: 1439, // 오는편 출발시간 임시 끝

    minTime: 0, // 하루 시간 시작
    maxTime: 1439, // 하루 총 시간
  });

  // 슬라이더 바를 클릭했을 경우
  const adjustTimeTrackClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "departure" | "return"
  ) => {
    const trackWidth = e.currentTarget.offsetWidth; // 클릭된 track의 너비(px)
    const clickPosition = e.nativeEvent.offsetX; // 브라우저의 기본 이벤트 객체(nativeEvent)에서 클릭한 위치의 수평좌표를 반환
    const clickValue = Math.round(
      (clickPosition / trackWidth) * adjustTime.maxTime
    ); // 전체 track에서 차지하는 비율을 계산
    const adjustClickValue = Math.min(
      Math.round(clickValue / 30) * 30,
      adjustTime.maxTime
    ); // 30분 단위로 조정, 최대는 maxTime 까지

    if (type === "departure") {
      if (adjustClickValue < adjustTime.departureStartTime) {
        // 클릭한 구간이 departureStartTime보다 낮을 경우 tempDepartureStartTime 설정
        setAdjustTime((prev) => ({
          ...prev,
          tempDepartureStartTime: adjustClickValue,
          departureStartTime: adjustClickValue,
        }));
      } else {
        // 그 외에는 tempDepartureEndTime 설정
        setAdjustTime((prev) => ({
          ...prev,
          tempDepartureEndTime: adjustClickValue,
          departureEndTime: adjustClickValue,
        }));
      }
    } else if (type === "return") {
      if (adjustClickValue < adjustTime.returnStartTime) {
        // 클릭한 구간이 returnStartTime 낮을 경우 tempReturnStartTime 설정
        setAdjustTime((prev) => ({
          ...prev,
          tempReturnStartTime: adjustClickValue,
          returnStartTime: adjustClickValue,
        }));
      } else {
        // 그 외에는 tempDepartureEndTime 설정
        setAdjustTime((prev) => ({
          ...prev,
          tempReturnEndTime: adjustClickValue,
          returnEndTime: adjustClickValue,
        }));
      }
    }
  };

  // 원형을 드래그 했을 경우
  const adjustTimeCircleDrag = (
    e: React.MouseEvent<HTMLSpanElement>,
    type: "departureStart" | "departureEnd" | "returnStart" | "returnEnd"
  ) => {
    const track = e.currentTarget.parentElement!; // e.currentTarget의 부모 요소를 참조
    const trackWidth = track.offsetWidth; // SliderTrack의 너비를 가져옴
    const trackLeft = track.getBoundingClientRect().left; // track의 왼쪽 경계와(padding-left) track 왼쪽 사이의 거리를 계산

    const onMove = (moveEvent: MouseEvent) => {
      const movePosition = moveEvent.clientX - trackLeft; // 내가 드래그한 위치를 마우스 클릭위치(moveEvent.clientX) - track 시작위치(trackLeft) 기준으로 계산
      const dragValue = Math.round(
        (movePosition / trackWidth) * adjustTime.maxTime
      ); // 내가 드래그한 위치(movePosition)와 전체 track에서 차지하는 비율을 계산

      const adjustedValue = Math.min(
        Math.round(dragValue / 30) * 30,
        adjustTime.maxTime
      ); // 30분 단위로 조정, 최대는 maxValue 까지

      if (
        type === "departureStart" &&
        adjustedValue >= adjustTime.minTime &&
        adjustedValue < adjustTime.tempDepartureEndTime // start는 end보다 무조건 밑이여야함.
      ) {
        setAdjustTime((prev) => ({
          ...prev,
          tempDepartureStartTime: adjustedValue,
        }));
      } else if (
        type === "departureEnd" &&
        adjustedValue > adjustTime.tempDepartureStartTime && // end는 start보다 무조건 위여야함.
        adjustedValue <= adjustTime.maxTime
      ) {
        setAdjustTime((prev) => ({
          ...prev,
          tempDepartureEndTime: adjustedValue,
        }));
      } else if (
        type === "returnStart" &&
        adjustedValue >= 0 &&
        adjustedValue < adjustTime.tempReturnEndTime // start는 end보다 무조건 밑이여야함.
      ) {
        setAdjustTime((prev) => ({
          ...prev,
          tempReturnStartTime: adjustedValue,
        }));
      } else if (
        type === "returnEnd" &&
        adjustedValue > adjustTime.tempReturnStartTime && // end는 start보다 무조건 위여야함.
        adjustedValue <= adjustTime.maxTime
      ) {
        setAdjustTime((prev) => ({
          ...prev,
          tempReturnEndTime: adjustedValue,
        }));
      }
    };

    const onStop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onStop);
      // mouseup 시에 실제 데이터 업데이트
      setAdjustTime((prev) => ({
        ...prev,
        departureStartTime: prev.tempDepartureStartTime,
        departureEndTime: prev.tempDepartureEndTime,
        returnStartTime: prev.tempReturnStartTime,
        returnEndTime: prev.tempReturnEndTime,
      }));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onStop);
  };

  /* 출발 시간대 조정 데이터 끝 */

  /* 가격 조정 데이터 시작 */

  const [adjustPrice, setAdjustPrice] = useState({
    startPrice: 0,
    endPrice: 0,

    tempStartPrice: 0,
    tempEndPrice: 0,

    minPrice: 0,
    maxPrice: 0,
  });

  // 가격 최소 ~ 최대값 지정
  useEffect(() => {
    if (originalOffers?.data?.length) {
      setAdjustPrice({
        startPrice: parseFloat(originalOffers?.data[0].price.total ?? "0"),
        endPrice: parseFloat(originalOffers?.data.at(-1)?.price.total ?? "0"),

        tempStartPrice: parseFloat(originalOffers?.data[0].price.total ?? "0"),
        tempEndPrice: parseFloat(
          originalOffers?.data.at(-1)?.price.total ?? "0"
        ),

        minPrice: parseFloat(originalOffers?.data[0].price.total ?? "0"),
        maxPrice: parseFloat(originalOffers?.data.at(-1)?.price.total ?? "0"),
      });

      /* 공동운항 구현 시 테스트용
      
      originalOffers.data.map((offer) => {
        console.log(
          `가는편 운항 항공사 [${offer.id}] : `,
          offer.itineraries?.[0]?.segments?.[0]?.operating?.carrierCode
        );

        console.log(
          `오는편 운항 항공사 [${offer.id}] : `,
          offer.itineraries[1]?.segments?.[0]?.operating?.carrierCode
        );

        console.log(
          `판매 항공사 [${offer.id}] : `,
          offer.validatingAirlineCodes
        );
      }); */
    }
  }, [originalOffers]);

  // 슬라이더 바를 클릭했을 경우
  const adjustPriceTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const trackWidth = e.currentTarget.offsetWidth; // 클릭된 track의 너비(px)
    const clickPosition = e.nativeEvent.offsetX; // 브라우저의 기본 이벤트 객체(nativeEvent)에서 클릭한 위치의 수평좌표를 반환
    let clickValue = Math.round(
      (clickPosition / trackWidth) *
        (adjustPrice.maxPrice - adjustPrice.minPrice) +
        adjustPrice.minPrice
    ); // 전체 track에서 차지하는 비율을 계산
    // + price의 경우 time과 달리 최소값이 고정되어있지 않기 때문에 minPrice를 빼서 비율을 고정 시킨다.
    // + 비율을 계산할 때 minPrice를 빼서 0을 시작점으로 하고, 마지막에 다시 minPrice를 더해 실제 가격 범위에 맞는 값을 출력한다.
    // + 결론적으로는 최소값과 최대값 간의 차이를 계산하기 위해 해당 작업을 진행한다.

    // 단위 구분
    if (adjustPrice.minPrice >= 100000 && adjustPrice.minPrice <= 999999) {
      clickValue = Math.round(clickValue / 1000) * 1000;
    } else if (adjustPrice.minPrice >= 1000000) {
      clickValue = Math.round(clickValue / 10000) * 10000;
    }

    if (clickValue < adjustPrice.startPrice) {
      // 클릭한 구간이 startPrice보다 낮을 경우 tempStartPrice 설정
      setAdjustPrice((prev) => ({
        ...prev,
        tempStartPrice: clickValue,
        startPrice: clickValue,
      }));
    } else {
      // 그 외에는 tempEndPrice 설정
      setAdjustPrice((prev) => ({
        ...prev,
        tempEndPrice: clickValue,
        endPrice: clickValue,
      }));
    }
  };

  // 원형을 드래그 했을 경우
  const adjustPriceCircleDrag = (
    e: React.MouseEvent<HTMLSpanElement>,
    type: "start" | "end"
  ) => {
    const track = e.currentTarget.parentElement!; // e.currentTarget의 부모 요소를 참조
    const trackWidth = track.offsetWidth; // SliderTrack의 너비를 가져옴
    const trackLeft = track.getBoundingClientRect().left; // track의 왼쪽 경계와(padding-left) track 왼쪽 사이의 거리를 계산

    const onMove = (moveEvent: MouseEvent) => {
      const movePosition = moveEvent.clientX - trackLeft; // 내가 드래그한 위치를 마우스 클릭위치(moveEvent.clientX) - track 시작위치(trackLeft) 기준으로 계산
      let dragValue = Math.round(
        (movePosition / trackWidth) *
          (adjustPrice.maxPrice - adjustPrice.minPrice) +
          adjustPrice.minPrice
      ); // 내가 드래그한 위치(movePosition)와 전체 track에서 차지하는 비율을 계산

      // 단위 구분
      if (adjustPrice.minPrice >= 100000 && adjustPrice.minPrice <= 999999) {
        dragValue = Math.round(dragValue / 1000) * 1000;
      } else if (adjustPrice.minPrice >= 1000000) {
        dragValue = Math.round(dragValue / 10000) * 10000;
      }

      // 원형 드래그를 왼쪽으로 과하게 했을 경우
      if (dragValue < adjustPrice.minPrice) {
        dragValue = Math.max(dragValue, adjustPrice.minPrice); // dravValue <=> adjustPrice.minPrice 중 가장 큰 값을 출력
      } else if (dragValue > adjustPrice.maxPrice) {
        // 원형 드래그를 오른쪽으로 과하게 했을 경우
        dragValue = Math.min(dragValue, adjustPrice.maxPrice); // dravValue <=> adjustPrice.maxPrice 중 가장 작은 값을 출력
      }

      if (
        type === "start" &&
        dragValue >= adjustPrice.minPrice &&
        dragValue < adjustPrice.tempEndPrice // start는 end보다 무조건 밑이여야함.
      ) {
        setAdjustPrice((prev) => ({
          ...prev,
          tempStartPrice: dragValue,
        }));
      } else if (
        type === "end" &&
        dragValue > adjustPrice.tempStartPrice && // end는 start보다 무조건 위여야함.
        dragValue <= adjustPrice.maxPrice
      ) {
        setAdjustPrice((prev) => ({
          ...prev,
          tempEndPrice: dragValue,
        }));
      }
    };

    const onStop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onStop);
      // mouseup 시에 실제 데이터 업데이트
      setAdjustPrice((prev) => ({
        ...prev,
        startPrice: prev.tempStartPrice,
        endPrice: prev.tempEndPrice,
      }));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onStop);
  };

  /* 가격 조정 데이터 끝 */

  /* 항공사 구분 데이터 시작 */

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]); // 선택된 항공사를 상태로 관리
  const [airlineCount, setAirlineCount] = useState<Record<string, number>>({}); // 항공사별 데이터 개수를 저장
  // + Record<key, value> : Java의 Collection인 Map<key, value>과 유사한 기능

  // 각 항공사의 횟수를 계산
  useEffect(() => {
    if (originalOffers?.data?.length) {
      const count = originalOffers.data.reduce((acc, offer) => {
        const outboundCarrier =
          offer.itineraries?.[0]?.segments?.[0]?.carrierCode; // 가는편 항공사의 코드 추출
        const inboundCarrier =
          offer.itineraries?.[1]?.segments?.[0]?.carrierCode; // 오는편 항공사의 코드 추출

        // 왕복
        if (outboundCarrier && inboundCarrier) {
          if (outboundCarrier === inboundCarrier) {
            acc[outboundCarrier] = (acc[outboundCarrier] || 0) + 1; // acc[outboundCarrier]가 존재할 시 기존 값에서 +1 아니면 0+1. (증가연산자)
          } else {
            acc["기타"] = (acc["기타"] || 0) + 1; // 가는편/오는편이 다르면 기타에 추가
          }
        } else if (outboundCarrier && !inboundCarrier) {
          // 편도
          acc[outboundCarrier] = (acc[outboundCarrier] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>); // {}를 초기값으로 사용하여 reduce를 통해 값을 채워넣는 방식

      // 전체 추가
      const totalCount = Object.values(count).reduce(
        (sum, value) => sum + value,
        0
      ); // sum : 누적해서 추가하는 값이며 초기값은 0, value : 배열 안에 값을 순차적으로 추가
      count["전체"] = totalCount; // '전체'에 합계 값 추가

      console.log(count);
      console.log(Object.keys(count));

      setAirlineCount(count); // EX) KE: 24, LJ: 10, 기타: 15, 전체 : 49
      setSelectedAirlines(Object.keys(count)); // object.keys : count의 key만 배열로 반환하는 방식 EX) ["KE", "LJ", "기타", "전체"]
    }
  }, [originalOffers]);

  // 항공사 체크 클릭 시 동작되는 함수
  const checkboxChange = (airline: string) => {
    /*
    @ '전체' 필터링
    1. '전체' 체크를 클릭해서 해제시키면 모든 필터가 체크 해제되어야함
    2. '전체' 체크가 풀려있는 상태에서 체크하면 모든 필터가 체크되어야함
    3. 모든 특정 필터가 체크 되어있을 경우 '전체'도 체크 되어야함
    4. 모든 특정 필터 중 하나라도 체크 해제 되어있을 경우 '전체'도 체크 해제 되어야함
    */

    // 1번과 2번 내용
    if (airline === "전체") {
      setSelectedAirlines(
        (prevSelected) =>
          prevSelected.includes("전체")
            ? [] // "전체"가 선택된 경우 모든 항목 해제
            : [...Object.keys(airlineCount)] // "전체"를 체크한 경우 모든 항목 추가
      );
    } else {
      setSelectedAirlines((prevSelected) => {
        // 4번 내용.
        // 클릭한 체크박스 airline이 selectedAirlines에 포함되어 있으면 체크 해제
        // 포함되어 있지 않으면 추가
        let newSelected = prevSelected.includes(airline)
          ? prevSelected.filter((item) => item !== airline && item !== "전체")
          : [...prevSelected, airline];

        // 3번 내용.
        // 전체를 제외하기 위해 length - 1로 처리
        if (newSelected.length === Object.keys(airlineCount).length - 1) {
          newSelected = [...newSelected, "전체"];
        }

        return newSelected;
      });
    }
  };
  /* 항공사 구분 데이터 끝 */

  // 필터링 구간
  /* 
    1. 경유지 / 2. 출발 시간대 / 3. 가격 조정 / 4. 항공사 선택
  */
  useEffect(() => {
    if (!originalOffers) return;

    const filteredOffers = originalOffers.data.filter((offer: any) => {
      const departureSegments = offer.itineraries[0]?.segments || []; // 가는편
      const returnSegments = offer.itineraries[1]?.segments || []; // 오는편

      /*  1. 경유지 조건 필터링 시작 */
      const isStopover = (segments: any) => {
        return (
          (nonStop && segments.length === 1) ||
          (oneStop && segments.length === 2) ||
          (multipleStops && segments.length > 2)
        );
      };
      /*  1. 경유지 조건 필터링 끝 */

      /* 2. 출발 시간대 필터링 시작 */

      // 가는편
      const departureTimestamp = departureSegments[0]?.departure?.at;
      if (!departureTimestamp) return false;

      const departureDate = new Date(departureTimestamp);
      const departureTime =
        departureDate.getHours() * 60 + departureDate.getMinutes(); // 시간과 분을 분으로 합침

      // 출발 시간이 startTime과 endTime 사이에 있는지 확인
      const isDepartureInTimeRange =
        departureTime >= adjustTime.departureStartTime &&
        departureTime <= adjustTime.departureEndTime;

      /* 2. 출발 시간대 필터링 끝 */

      /*  3. 가격 조정 필터링 시작 */
      const totalPrice = parseFloat(offer.price.total ?? "0");

      // 가격이 내가 조정한 startPrice와 endPrice 사이에 있는지 확인
      const isTotalPriceRange =
        totalPrice >= adjustPrice.startPrice &&
        totalPrice <= adjustPrice.endPrice;
      /*  3. 가격 조정 필터링 끝 */

      // 왕복일 경우, 가는편과 오는편 중 하나라도 조건을 만족해야 함
      if (returnSegments.length > 0) {
        /* 2. 출발 시간대 필터링 시작 */
        // 오는편
        const returnTimestamp = returnSegments[0]?.departure?.at;
        if (!returnTimestamp) return false;

        const returnDate = new Date(returnTimestamp);
        const returnTime = returnDate.getHours() * 60 + returnDate.getMinutes();

        const isReturnInTimeRange =
          returnTime >= adjustTime.returnStartTime &&
          returnTime <= adjustTime.returnEndTime;
        /* 2. 출발 시간대 필터링 끝 */

        /* 4. 항공사 선택 필터링 시작 */

        // 'selectedAirlines'에 포함된 항공사만 필터링
        const isAirlineSelected =
          (selectedAirlines.includes(departureSegments[0].carrierCode) &&
            departureSegments[0].carrierCode ===
              returnSegments[0].carrierCode) ||
          (selectedAirlines.includes("기타") &&
            departureSegments[0].carrierCode !== returnSegments[0].carrierCode); // 기타는 가는편/오는편 항공사가 다른 데이터만 필터링

        /* 4. 항공사 선택 필터링 끝 */

        return (
          isDepartureInTimeRange &&
          isReturnInTimeRange &&
          isTotalPriceRange &&
          (isStopover(departureSegments) || isStopover(returnSegments)) &&
          isAirlineSelected
        ); // 경유지와 출발시간 조건이 모두 맞아야 필터링됨
      } else {
        // 편도일 경우, 경유지가 없을 수도 있음

        /* 4. 항공사 선택 필터링 시작 */

        // 'selectedAirlines'에 포함된 항공사만 필터링 (편도는 왕복과 다르게 가는편에서 존재여부에 따라 필터링)
        const isAirlineSelected = selectedAirlines.includes(
          departureSegments[0].carrierCode
        );

        /* 4. 항공사 선택 필터링 끝 */
        return (
          isDepartureInTimeRange &&
          isTotalPriceRange &&
          isStopover(departureSegments) &&
          isAirlineSelected
        ); // 경유지가 없을 경우, 출발시간만 조건에 맞으면 필터링됨
      }
    });

    console.log(filteredOffers);

    // 필터링된 결과로 상태 업데이트
    setFlightOffers({
      data: filteredOffers,
      meta: { count: filteredOffers.length },
      dictionaries: originalOffers.dictionaries,
    });
  }, [
    adjustTime,
    adjustPrice,
    nonStop,
    oneStop,
    multipleStops,
    originalOffers,
    selectedAirlines,
  ]);

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
        <div style={{ marginTop: "10px" }}>가는편</div>
        <SliderContainer>
          {/* 배경 슬라이더 바 */}
          <SliderTrack
            start={adjustTime.tempDepartureStartTime}
            end={adjustTime.tempDepartureEndTime}
            min={adjustTime.minTime}
            max={adjustTime.maxTime}
            onClick={(e) => adjustTimeTrackClick(e, "departure")} // 첫 번째 슬라이더 영역 우선
          />

          {/* 첫 번째 슬라이더 */}
          <SliderCircle
            position={adjustTime.tempDepartureStartTime}
            min={adjustTime.minTime}
            max={adjustTime.maxTime}
            onMouseDown={(e) => {
              e.preventDefault();
              adjustTimeCircleDrag(e, "departureStart");
            }}
          ></SliderCircle>

          {/* 두 번째 슬라이더 */}
          <SliderCircle
            position={adjustTime.tempDepartureEndTime}
            min={adjustTime.minTime}
            max={adjustTime.maxTime}
            onMouseDown={(e) => {
              e.preventDefault();
              adjustTimeCircleDrag(e, "departureEnd");
            }}
          ></SliderCircle>
          <SliderLabels>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {formatTime(adjustTime.tempDepartureStartTime)}
            </span>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {formatTime(adjustTime.tempDepartureEndTime)}
            </span>
          </SliderLabels>
        </SliderContainer>
        {originalOffers?.data[0]?.itineraries[1] ? (
          <>
            <div>오는편</div>
            <SliderContainer>
              {/* 배경 슬라이더 바 */}
              <SliderTrack
                start={adjustTime.tempReturnStartTime}
                end={adjustTime.tempReturnEndTime}
                min={adjustTime.minTime}
                max={adjustTime.maxTime}
                onClick={(e) => adjustTimeTrackClick(e, "return")} // 첫 번째 슬라이더 영역 우선
              />

              {/* 첫 번째 슬라이더 */}
              <SliderCircle
                position={adjustTime.tempReturnStartTime}
                min={adjustTime.minTime}
                max={adjustTime.maxTime}
                onMouseDown={(e) => {
                  e.preventDefault();
                  adjustTimeCircleDrag(e, "returnStart");
                }}
              ></SliderCircle>

              {/* 두 번째 슬라이더 */}
              <SliderCircle
                position={adjustTime.tempReturnEndTime}
                min={adjustTime.minTime}
                max={adjustTime.maxTime}
                onMouseDown={(e) => {
                  e.preventDefault();
                  adjustTimeCircleDrag(e, "returnEnd");
                }}
              ></SliderCircle>
              <SliderLabels>
                <span style={{ fontSize: "12px", color: "#555" }}>
                  {formatTime(adjustTime.tempReturnStartTime)}
                </span>
                <span style={{ fontSize: "12px", color: "#555" }}>
                  {formatTime(adjustTime.tempReturnEndTime)}
                </span>
              </SliderLabels>
            </SliderContainer>
          </>
        ) : null}
      </DepartureTime>
      <Price>
        <Title>가격 조정</Title>
        <SliderContainer>
          {/* 배경 슬라이더 바 */}
          <SliderTrack
            start={adjustPrice.tempStartPrice}
            end={adjustPrice.tempEndPrice}
            min={adjustPrice.minPrice}
            max={adjustPrice.maxPrice}
            onClick={(e) => adjustPriceTrackClick(e)} // 첫 번째 슬라이더 영역 우선
          />

          {/* 첫 번째 슬라이더 */}
          <SliderCircle
            position={adjustPrice.tempStartPrice}
            min={adjustPrice.minPrice}
            max={adjustPrice.maxPrice}
            onMouseDown={(e) => {
              e.preventDefault();
              adjustPriceCircleDrag(e, "start");
            }}
          ></SliderCircle>

          {/* 두 번째 슬라이더 */}
          <SliderCircle
            position={adjustPrice.tempEndPrice}
            min={adjustPrice.minPrice}
            max={adjustPrice.maxPrice}
            onMouseDown={(e) => {
              e.preventDefault();
              adjustPriceCircleDrag(e, "end");
            }}
          ></SliderCircle>
          <SliderLabels>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {`${new Intl.NumberFormat().format(adjustPrice.tempStartPrice)}`}
            </span>
            <span style={{ fontSize: "12px", color: "#555" }}>
              {`${new Intl.NumberFormat().format(adjustPrice.tempEndPrice)}`}
            </span>
          </SliderLabels>
        </SliderContainer>
      </Price>
      <Airlines>
        <Title>항공사</Title>
        <AirlinesContainer>
          {Object.entries(airlineCount) // Object.entries: key-value를 쌍으로 반환

            /* 
            sort : 배열을 정렬하는 메서드로, 동작은 아래와 같이 진행된다. (2가지를 비교하기 때문에 버블 정렬 방식으로 됨)
            - airlineA(전방)과 airlineB(후방)를 비교해서 airlineA에 '기타'가 있으면 airlineB랑 바꾼다. (1 : airlineA를 airlineB 뒤로 한 칸 보냄)
            - airlineB에 '기타'가 있으면 무조건 맨 뒤로 위치하게된다. (-1 : airlineB를 맨 뒤로 보냄)
          */
            .sort(([airlineA], [airlineB]) => {
              if (airlineA === "전체") return -1;
              if (airlineB === "전체") return 1;

              if (airlineA === "기타") return 1;
              if (airlineB === "기타") return -1;

              return 0;
            })
            .map(([carrierCode, count]) => {
              // carrierCode : key인 항공사 코드, count : value인 개수

              // 항공사 코드(carrierCode)와 DB(airlineCodeOffers)에 있는 코드랑 비교하여 항공사명으로 변환하는 함수
              const getAirlineName = (carrierCode: string): string => {
                // 항공사 코드와 일치하는 데이터 필터링
                const airline = airlineCodeOffers.filter(
                  (item) => item.iata === carrierCode
                );

                if (carrierCode === "전체") {
                  return "전체";
                }

                // 2개 이상일 경우 : 공항코드가 겹치므로 아래 조건에 따름
                if (airline.length > 1) {
                  const dictionaries =
                    originalOffers?.dictionaries?.carriers[carrierCode] || ""; // API 데이터 항공사명

                  // API 데이터의 항공사명과 비교하여 일치하는 항공사명 추출
                  let matchingAirline = airline.find(
                    (matchingAirline) =>
                      matchingAirline.airlines.trim().toLowerCase() ===
                      dictionaries.trim().toLowerCase()
                  );

                  if (matchingAirline) {
                    return matchingAirline.airlinesKor;
                  }
                }
                // 1개 일 경우 : 추출된 코드 그대로 출력
                else if (airline.length === 1) {
                  return airline[0].airlinesKor;
                }

                // 일치하지 않을 경우 : '기타'로 처리
                return "기타";
              };

              const airlineName = getAirlineName(carrierCode); // 항공사명이 삽입 되어 있는 변수

              return (
                <div key={carrierCode}>
                  <input
                    type="checkbox"
                    id={carrierCode}
                    checked={selectedAirlines.includes(carrierCode)} // selectedAirlines에 carrierCode 포함 여부에 따라 체크
                    onChange={() => checkboxChange(carrierCode)} // 체크박스 상태 변경
                  />
                  <label htmlFor={carrierCode}>
                    {airlineName} ({count})
                  </label>
                </div>
              );
            })}
        </AirlinesContainer>
      </Airlines>
    </Banner>
  );
}

export default FlightFiltering;
