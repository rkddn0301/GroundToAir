// 메인 & 항공 조회 페이지

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import styled from "styled-components";
import TravelerModal from "../components/flight/TravelerModal";
import FlightResult from "../components/flight/FlightResult";
import AutoComplete from "../components/flight/AutoComplete";
import { AirlineCodes, FlightOffer, IataCodes } from "../utils/api";
import { motion } from "framer-motion";

const Container = styled.div`
  min-width: 100%;
  margin: 0 auto;
`;

const ArrowsIcon = styled.svg`
  width: 25px;
`;

const OnewayCheckMenu = styled.div`
  width: 200px;
  margin-bottom: 15px;
  padding: 15px 10px 15px 20px; // 순서 : 시계방향
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.white.bg} 0%,
    #f7f9fc 100%
  ); // 135도 각도의 그라데이션 배경. 0%(props.theme.white.bg) ~ 100%(#f7f9fc)
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  border-right: 5px solid skyblue;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 그림자 순서 : x축, y축, 흐림효과, 색상
`;

const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.white.bg};
  gap: 5px;
  height: 15vh;
  padding: 15px;
  margin: 0 auto;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 그림자 순서 : x축, y축, 흐림효과, 색상
`;

const Field = styled.div`
  width: 20%;
  height: 85%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  max-width: 200px; // 최대 크기 200px로 고정
`;

const CircleField = styled.div`
  width: 50px;
  padding: 15px;
  display: flex;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 50%;
  font-size: 15px;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

const Label = styled.label`
  font-size: 12px;
  padding: 0 5px 0 0;
  margin-bottom: 8px;
`;

const WriteInput = styled.input`
  border: none;
  background: transparent;
  padding: 10px 5px 10px 5px;
  margin-top: auto;
`;

const CalendarInput = styled.div`
  margin-top: 10px;
`;

const TravelerButton = styled.button`
  position: relative;
  margin-top: 10px;
  padding: 5px;
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 7px;
  border: 1px solid ${(props) => props.theme.white.font};
  cursor: pointer;
  width: 100%;
  max-width: 150px; // 텍스트 초과 시 버튼 고정을 위해 설정
  white-space: nowrap; // 텍스트 줄바꿈 방지
  overflow: hidden; // 숨김
  text-overflow: ellipsis; // 숨겨진 텍스트 ... 표시
`;

const SubmitBtn = styled.button`
  height: 85%;
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

const Loading = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Spinner = styled(motion.div)`
  border: 4px solid ${(props) => props.theme.white.font};
  border-top: 4px solid skyblue; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
  border-radius: 50%;
  width: 16px;
  height: 16px;
`;

const ResultContainer = styled.div`
  //margin: 0 auto;
`;

// 다른 컴포넌트에서 inputData를 props로 이용 시 필요
export interface InputData {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  travelClass: SeatClass;
  originLocationCodeNo: string;
  destinationLocationCodeNo: string;
}

// 좌석 클래스 enum
export enum SeatClass {
  ECONOMY = "ECONOMY", // 일반석
  PREMIUM_ECONOMY = "PREMIUM_ECONOMY", // 프리미엄 일반석
  BUSINESS = "BUSINESS", // 비즈니스석
  FIRST = "FIRST", // 일등석
}

// 다른 컴포넌트에서 locationData를 props로 이용 시 필요
export interface LocationData {
  originLocationIataCodeChecking: boolean;
  destinationLocationIataCodeChecking: boolean;

  originIataCode: string;
  destinationIataCode: string;
}

// AmadeusAPI(FlightOfferSearch) 호출 데이터 배열로 변환
interface FlightOffersResponse {
  meta: {
    count: number;
  };
  data: FlightOffer[];
  dictionaries: {
    carriers: {
      [key: string]: string;
    };
  };
}

function FlightSearch() {
  const [inputData, setInputData] = useState({
    originLocationCode: "", // 출발지
    destinationLocationCode: "", // 도착지
    departureDate: "", // 가는날
    returnDate: "", // 오는날
    adults: 1, // 성인
    children: 0, // 어린이
    infants: 0, // 유아
    travelClass: SeatClass.ECONOMY, // 여행 좌석 클래스
    originLocationCodeNo: "", // 출발지가 선택된 코드(도시/공항 구분용)
    destinationLocationCodeNo: "", // 도착지가 선택된 코드(도시/공항 구분용)
  }); // input 입력 state

  /*
  * 생성한 이유 
  - Amadeus API에서 도시코드와 공항코드 검색이라는 구분이 따로 존재하지 않음
  - 상하이(SHA) === 상하이 훙차오 공항(SHA)과 같이 도시코드와 공항코드가 동일 할 경우 도시코드로 검색이 되버려서 구분이 필요
  */
  const [filterMismatchCount, setFilterMismatchCount] = useState(0); // 총 개수 - 필터링 된 개수
  const [locationData, setLocationData] = useState({
    originLocationIataCodeChecking: false,
    destinationLocationIataCodeChecking: false,

    originIataCode: "",
    destinationIataCode: "",
  });

  const [onewayChecking, setOnewayChecking] = useState(false); // 편도/왕복 여부 스위칭 state

  const [travelerBtnSw, setTravelerBtnSw] = useState(false); // 인원 및 좌석등급 활성화 스위칭 state
  const travelerModalRef = useRef<HTMLDivElement>(null); // 인원 및 좌석등급 선택란 제어

  const [autoCompleteOriginLocations, setAutoCompleteOriginLocations] =
    useState<IataCodes[]>([]); // 출발지 자동완성
  const [
    autoCompleteDestinationLocations,
    setAutoCompleteDestinationLocations,
  ] = useState<IataCodes[]>([]); // 도착지 자동완성

  const [autoCompleteOriginLocationSw, setAutoCompleteOriginLocationSw] =
    useState(false); // 출발지 자동완성 활성화 스위칭 state
  const [
    autoCompleteDestinationLocationSw,
    setAutoCompleteDestinationLocationSw,
  ] = useState(false); // 도착지 자동완성 활성화 스위칭 state

  const autoCompleteOriginLocationRef = useRef<HTMLDivElement>(null); // 출발지 자동완성 선택란 제어
  const autoCompleteDestinationLocationRef = useRef<HTMLDivElement>(null); // 도착지 자동완성 선택란 제어

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const [flightOffers, setFlightOffers] = useState<FlightOffersResponse | null>(
    null
  ); // 항공편 추출

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출

  // modal 구간에서 벗어날 경우 비활성화
  const modalClickOutside = (e: MouseEvent) => {
    // 출발지 자동완성 모달 구간
    if (
      autoCompleteOriginLocationRef.current &&
      !autoCompleteOriginLocationRef.current.contains(e.target as Node)
    ) {
      setAutoCompleteOriginLocationSw(false);
    } else {
      // 모달 구간을 다시 클릭하면 기존 자동완성 내용 보이도록 설정
      setAutoCompleteOriginLocationSw(true);
    }

    // 도착지 자동완성 모달 구간
    if (
      autoCompleteDestinationLocationRef.current &&
      !autoCompleteDestinationLocationRef.current.contains(e.target as Node)
    ) {
      setAutoCompleteDestinationLocationSw(false);
    } else {
      // 모달 구간을 다시 클릭하면 기존 자동완성 내용 보이도록 설정
      setAutoCompleteDestinationLocationSw(true);
    }

    // 인원 및 좌석등급 모달 구간
    if (
      travelerModalRef.current &&
      !travelerModalRef.current.contains(e.target as Node)
    ) {
      setTravelerBtnSw(false);
    }
  };

  // 항공사 코드 추출 함수
  const airlineCodeFetch = async () => {
    const response = await axios.get(`http://localhost:8080/air/airlineCode`);
    setAirlineCodeOffers(response.data);
  };

  useEffect(() => {
    if (airlineCodeOffers.length > 0) {
      console.log(airlineCodeOffers);
    }
  }, [airlineCodeOffers]);

  // 가는날 & 오는날 새로고침 시 초기값 그대로 수정
  useEffect(() => {
    airlineCodeFetch(); // 항공사 코드 데이터 저장

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    const initDepartureDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식
    currentDate.setDate(currentDate.getDate() + 1);
    const initReturnDate = currentDate.toISOString().split("T")[0];
    setInputData((prev) => ({ ...prev, departureDate: initDepartureDate })); // 렌더링 후에 3일 뒤 날짜 설정
    setInputData((prev) => ({ ...prev, returnDate: initReturnDate })); // 렌더링 후에 4일 뒤 날짜 설정

    // travelerModalRef 이벤트 리스너 추가
    document.addEventListener("mousedown", modalClickOutside);

    return () => {
      document.removeEventListener("mousedown", modalClickOutside);
    };
  }, []);

  // 편도/왕복 선택 radio
  const onewayCheckingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "oneway") {
      setOnewayChecking(true);
      setInputData((prev) => ({ ...prev, returnDate: "" })); // 오는날은 데이터가 필요없음
    } else if (value === "rountTrip") {
      setOnewayChecking(false);

      // 왕복 전환 중 가는날에 날짜가 선택되어 있을 경우 오는날에 하루 뒤로 출력
      const choiceDepartureDate = new Date(inputData.departureDate);
      choiceDepartureDate.setDate(choiceDepartureDate.getDate() + 1);

      setInputData((prev) => ({
        ...prev,
        returnDate: choiceDepartureDate.toISOString().split("T")[0],
      }));
    }
    setFlightOffers(null); // 이전 검색 기록 초기화
  };

  // 클릭 시 출발지 <-> 도착지 변경
  const locationChange = () => {
    setInputData((prev) => ({
      ...prev,
      originLocationCode: prev.destinationLocationCode,
      originLocationCodeNo: prev.destinationLocationCodeNo,
      destinationLocationCode: prev.originLocationCode,
      destinationLocationCodeNo: prev.originLocationCodeNo,
    }));

    setAutoCompleteOriginLocations((prev) => [
      ...autoCompleteDestinationLocations,
    ]); // 도착지의 자동완성을 출발지에 할당
    setAutoCompleteDestinationLocations((prev) => [
      ...autoCompleteOriginLocations,
    ]); // 출발지의 자동완성을 도착지에 할당
  };

  // 출발지 입력 시 동작
  const originChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData((prev) => ({ ...prev, originLocationCode: value }));

    if (value.length > 1) {
      try {
        const response = await axios.get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        });
        if (response.data) {
          setAutoCompleteOriginLocationSw(true);
          setAutoCompleteOriginLocations(response.data);
        } else {
          setAutoCompleteOriginLocationSw(false);
          setAutoCompleteOriginLocations([]);
        }
      } catch (error) {
        console.error("출발지 자동완성 오류 발생 : ", error);
      }
    } else {
      setAutoCompleteOriginLocations([]);
    }
  };

  // 도착지 입력 시 동작
  const destinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputData((prev) => ({ ...prev, destinationLocationCode: value }));

    if (value.length > 1) {
      try {
        const response = await axios.get(`http://localhost:8080/air/iataCode`, {
          params: { keyword: value },
        });
        if (response.data) {
          setAutoCompleteDestinationLocationSw(true);
          setAutoCompleteDestinationLocations(response.data);
        } else {
          setAutoCompleteDestinationLocationSw(false);
          setAutoCompleteDestinationLocations([]);
        }
      } catch (error) {
        console.error("도착지 자동완성 오류 발생 : ", error);
      }
    } else {
      setAutoCompleteDestinationLocations([]);
    }
  };

  // 왕복 달력 선택
  const rountTripDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;

    setInputData({
      ...inputData,
      departureDate: start ? format(start, "yyyy-MM-dd") : "",
      returnDate: end ? format(end, "yyyy-MM-dd") : "",
    });
  };

  // 편도 달력 선택
  const onewayDateChange = (date: Date | null) => {
    if (date) {
      setInputData({
        ...inputData,
        departureDate: format(date, "yyyy-MM-dd"),
      }); // Date --> String 변환하여 departureDate에 삽입
    } else {
      setInputData({ ...inputData, departureDate: "" });
    }
  };

  // 인원 및 좌석등급 활성화
  const travelerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setTravelerBtnSw((prev) => !prev);
  };

  // 항공 검색 동작
  const flightSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let searchOriginLocation: string; // 실질적으로 검색될 출발지 데이터
    let searchDestinationLocation: string; // 실질적으로 검색될 도착지 데이터

    // 구분 초기화
    setLocationData({
      originLocationIataCodeChecking: false,
      destinationLocationIataCodeChecking: false,

      originIataCode: "",
      destinationIataCode: "",
    });

    setFilterMismatchCount(0);

    // 출발지/도착지 조건
    /*
     1. 자동완성기능을 선택하지 않고 즉시 검색했을 때
     2. 자동완성기능을 선택했을 때의 처리
     3. 나머지는 focus
    */

    //  출발지
    if (
      inputData.originLocationCode.length > 1 &&
      autoCompleteOriginLocations.length > 0
    ) {
      // 가장 첫 번째에 있는 공항이 검색
      searchOriginLocation = autoCompleteOriginLocations[0]?.iata || "";
      setInputData((prev) => ({
        ...prev,
        originLocationCode: `${autoCompleteOriginLocations[0]?.airportKor} (${autoCompleteOriginLocations[0]?.iata})`,
        originLocationCodeNo: `${autoCompleteOriginLocations[0]?.codeNo}_airport`,
      }));
      console.log("출발지에 공항명칭으로 검색함");

      setLocationData((prev) => ({
        ...prev,
        originLocationIataCodeChecking: true,
        originIataCode: searchOriginLocation,
      }));
    } else if (/\(.*\)/.test(inputData.originLocationCode)) {
      searchOriginLocation = inputData.originLocationCode
        .split("(")[1]
        .split(")")[0];

      // 검색한게 도시코드/공항코드 인지 확인
      if (inputData.originLocationCodeNo.endsWith("_airport")) {
        console.log("출발지에 공항명칭으로 검색함");
        setLocationData((prev) => ({
          ...prev,
          originLocationIataCodeChecking: true,
          originIataCode: searchOriginLocation,
        }));
      }
    } else {
      document.getElementById("originLocation")?.focus();
      return;
    }

    // 도착지
    if (
      inputData.destinationLocationCode.length > 1 &&
      autoCompleteDestinationLocations.length > 0
    ) {
      // 가장 첫 번째에 있는 공항이 검색
      searchDestinationLocation =
        autoCompleteDestinationLocations[0]?.iata || "";
      setInputData((prev) => ({
        ...prev,
        destinationLocationCode: `${autoCompleteDestinationLocations[0]?.airportKor} (${autoCompleteDestinationLocations[0]?.iata})`,
        destinationLocationCodeNo: `${autoCompleteDestinationLocations[0]?.codeNo}_airport`,
      }));

      console.log("도착지에 공항명칭으로 검색함");

      setLocationData((prev) => ({
        ...prev,
        destinationLocationIataCodeChecking: true,
        destinationIataCode: searchDestinationLocation,
      }));
    } else if (/\(.*\)/.test(inputData.destinationLocationCode)) {
      searchDestinationLocation = inputData.destinationLocationCode
        .split("(")[1]
        .split(")")[0];

      // 검색한게 도시코드/공항코드 인지 확인
      if (inputData.destinationLocationCodeNo.endsWith("_airport")) {
        console.log("도착지에 공항명칭으로 검색함");
        setLocationData((prev) => ({
          ...prev,
          destinationLocationIataCodeChecking: true,
          destinationIataCode: searchDestinationLocation,
        }));
      }
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
      inputData.returnDate,
      inputData.adults,
      inputData.children,
      inputData.infants,
      inputData.travelClass
    );

    setFlightOffers(null); // 기존에 검색된 항공 데이터 제거

    // 자동완성 제거
    setAutoCompleteOriginLocationSw(false);
    setAutoCompleteDestinationLocationSw(false);
    setAutoCompleteOriginLocations([]);
    setAutoCompleteDestinationLocations([]);

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
            children: inputData.children,
            infants: inputData.infants,
            travelClass: inputData.travelClass,
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

  return (
    <Container>
      <OnewayCheckMenu>
        <label>
          <input
            type="radio"
            value="rountTrip"
            name="tripType"
            onChange={onewayCheckingChange}
            defaultChecked
          />{" "}
          왕복
        </label>
        <label>
          <input
            type="radio"
            value="oneway"
            name="tripType"
            onChange={onewayCheckingChange}
          />{" "}
          편도
        </label>
      </OnewayCheckMenu>
      <Form>
        <Field
          style={{ position: "relative" }}
          ref={autoCompleteOriginLocationRef}
        >
          <Label htmlFor="originLocation">출발지</Label>
          <WriteInput
            type="search"
            id="originLocation"
            value={inputData.originLocationCode}
            onChange={originChange}
            placeholder="도시 또는 공항명"
            autoComplete="off"
          />
          {autoCompleteOriginLocationSw &&
            autoCompleteOriginLocations.length > 0 && (
              <AutoComplete
                setInputData={setInputData}
                setAutoCompleteLocationSw={setAutoCompleteOriginLocationSw}
                autoCompleteLocations={autoCompleteOriginLocations}
                setAutoCompleteLocations={setAutoCompleteOriginLocations}
                type="origin"
              />
            )}
        </Field>
        <CircleField onClick={locationChange}>
          <ArrowsIcon
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </ArrowsIcon>
        </CircleField>
        <Field
          style={{ position: "relative" }}
          ref={autoCompleteDestinationLocationRef}
        >
          <Label htmlFor="destinationLocation">도착지</Label>
          <WriteInput
            type="search"
            id="destinationLocation"
            value={inputData.destinationLocationCode}
            onChange={destinationChange}
            placeholder="도시 또는 공항명"
            autoComplete="off"
          />
          {autoCompleteDestinationLocationSw &&
            autoCompleteDestinationLocations.length > 0 && (
              <AutoComplete
                setInputData={setInputData}
                setAutoCompleteLocationSw={setAutoCompleteDestinationLocationSw}
                autoCompleteLocations={autoCompleteDestinationLocations}
                setAutoCompleteLocations={setAutoCompleteDestinationLocations}
                type="destination"
              />
            )}
        </Field>
        {!onewayChecking && (
          <Field>
            <Label>가는날/오는날</Label>
            <CalendarInput>
              <DatePicker
                showIcon
                onChange={rountTripDateChange} // 범위 선택을 위한 onChange
                startDate={
                  inputData.departureDate
                    ? new Date(inputData.departureDate)
                    : undefined
                }
                endDate={
                  inputData.returnDate
                    ? new Date(inputData.returnDate)
                    : undefined
                }
                minDate={new Date()} // 금일 이전 날짜 비활성화
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                } // 금일로부터 1년 뒤까지 선택 가능
                swapRange
                selectsRange
                monthsShown={2} // 달력을 2개월치로 표시
                locale={ko} // 한국어 설정
                dateFormat="yyyy-MM-dd" // 날짜 형식
                placeholderText="가는날/오는날(왕복)"
              />
            </CalendarInput>
          </Field>
        )}

        {onewayChecking && (
          <Field>
            <Label>가는날</Label>
            <CalendarInput>
              <DatePicker
                showIcon
                onChange={onewayDateChange}
                selected={
                  inputData.departureDate
                    ? new Date(inputData.departureDate)
                    : null
                }
                minDate={new Date()} // 금일 이전 날짜 비활성화
                maxDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                } // 금일로부터 1년 뒤까지 선택 가능
                monthsShown={2} // 달력을 2개월치로 표시
                locale={ko} // 한국어 설정
                dateFormat="yyyy-MM-dd" // 날짜 형식
                placeholderText="가는날(편도)"
              />
            </CalendarInput>
          </Field>
        )}
        <Field style={{ position: "relative" }} ref={travelerModalRef}>
          <Label>인원 및 좌석 등급</Label>
          <TravelerButton onClick={travelerClick}>
            인원&nbsp;
            {Number(inputData.adults) +
              Number(inputData.children) +
              Number(inputData.infants)}
            명 &nbsp;ㆍ{" "}
            {inputData.travelClass === SeatClass.ECONOMY && "일반석"}
            {inputData.travelClass === SeatClass.PREMIUM_ECONOMY &&
              "프리미엄 일반석"}
            {inputData.travelClass === SeatClass.BUSINESS && "비즈니스석"}
            {inputData.travelClass === SeatClass.FIRST && "일등석"}
          </TravelerButton>
          {travelerBtnSw && (
            <TravelerModal
              setInputData={setInputData}
              setTravelerBtnSw={setTravelerBtnSw}
            />
          )}
        </Field>

        <SubmitBtn onClick={flightSearch}>검색</SubmitBtn>
      </Form>
      {/* 11/23기준 항공 조회가 되지 않아 임시로 항공사 로고 삽입 테스트 */}
      {airlineCodeOffers.map((airline, index) => {
        return (
          <div>
            {airline.iata === "KE" && (
              <img
                src={
                  airline.airlinesLogo.split("images/")[1] ===
                  "pop_sample_img03.gif"
                    ? ""
                    : airline.airlinesLogo
                }
              />
            )}
          </div>
        );
      })}

      {isLoading ? (
        <Loading>
          <Spinner
            animate={{ rotate: [0, 360] }} // 회전 애니메이션
            transition={{
              duration: 1, // 1초 동안
              ease: "linear", // 일정한 속도
              repeat: Infinity, // 무한반복
            }}
          />
          <div style={{ fontWeight: "600" }}>검색 중...</div>
        </Loading>
      ) : flightOffers ? (
        <ResultContainer>
          <div style={{ margin: "10px", fontWeight: "600" }}>
            {onewayChecking ? "편도 " : "왕복 "}검색결과:{" "}
            {flightOffers.meta.count - filterMismatchCount}개
          </div>
          {flightOffers.data.slice(0, 90).map((offer: any) => (
            <>
              <FlightResult
                key={offer.id}
                offer={offer}
                inputData={inputData}
                locationData={locationData}
                dictionaries={flightOffers.dictionaries}
                airlineCodeOffers={airlineCodeOffers}
                setFilterMismatchCount={setFilterMismatchCount}
              />
            </>
          ))}
        </ResultContainer>
      ) : (
        ""
      )}
    </Container>
  );
}

export default FlightSearch;
