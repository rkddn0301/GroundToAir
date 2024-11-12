// 메인 & 항공 조회 페이지

import axios from "axios";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import styled from "styled-components";

const Container = styled.div`
  min-width: 100%;
  margin: 0 auto;
`;

const Icon = styled.svg`
  width: 25px;
`;

const OnewayCheckMenu = styled.div`
  width: 200px;
  margin-bottom: 15px;
  padding: 15px 10px 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.white.bg} 0%,
    #f7f9fc 100%
  );
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  border-right: 5px solid skyblue;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Field = styled.div`
  height: 85%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 15px;
`;

const CircleField = styled.div`
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
  padding: 10px 0;
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
`;

const TravelerModal = styled.div`
  position: absolute;
  top: 100%; /* TravelerButton 바로 아래에 위치하게 설정 */
  left: 0;
  z-index: 10;
  background-color: ${(props) => props.theme.white.bg};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  padding: 10px;
`;

const CounterField = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 0;
`;

const CounterLabel = styled.span`
  font-size: 1em;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const CounterButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid #ccc;
  margin: 1em 0;
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

// 좌석 클래스 enum
enum SeatClass {
  ECONOMY = "ECONOMY", // 일반석
  PREMIUM_ECONOMY = "PREMIUM_ECONOMY", // 프리미엄 일반석
  BUSINESS = "BUSINESS", // 비즈니스석
  FIRST = "FIRST", // 일등석
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
  }); // input 입력 state

  const [tempData, setTempData] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: SeatClass.ECONOMY,
  }); // 선택완료 이전 작성 데이터

  const [onewayChecking, setOnewayChecking] = useState(false); // 편도/왕복 여부 스위칭 state
  const [travelerBtnSw, setTravelerBtnSw] = useState(false); // 인원 및 좌석등급 활성화 스위칭 state

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

  // 가는날 & 오는날 새로고침 시 초기값 그대로 수정
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 3);
    const initDepartureDate = currentDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식
    currentDate.setDate(currentDate.getDate() + 1);
    const initReturnDate = currentDate.toISOString().split("T")[0];
    setInputData((prev) => ({ ...prev, departureDate: initDepartureDate })); // 렌더링 후에 3일 뒤 날짜 설정
    setInputData((prev) => ({ ...prev, returnDate: initReturnDate })); // 렌더링 후에 4일 뒤 날짜 설정
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
      destinationLocationCode: prev.originLocationCode,
    }));

    setAutoComplateOriginLocations((prev) => [
      ...autoComplateDestinationLocations,
    ]); // 도착지의 자동완성을 출발지에 할당
    setAutoComplateDestinationLocations((prev) => [
      ...autoComplateOriginLocations,
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

  // 인원 카운팅 동작
  const travelerCounterChange = (
    e: React.MouseEvent<HTMLButtonElement>,
    operation: "increment" | "decrement"
  ) => {
    e.preventDefault();
    const { name } = e.currentTarget;

    setTempData((prev: any) => {
      let newValue = prev[name];

      // 전체 인원 수 계산
      const totalCount = prev.adults + prev.children + prev.infants;

      // 최대 인원 제한(9명)
      const maxCount = 9;

      if (name === "adults" && operation === "increment") {
        newValue = Math.min(newValue + 1, maxCount - totalCount + prev.adults); // 성인 최대
      } else if (name === "adults" && operation === "decrement") {
        newValue = Math.max(newValue - 1, 1); // 성인은 최소 1명
      } else if (name === "children" && operation === "increment") {
        newValue = Math.min(
          newValue + 1,
          maxCount - totalCount + prev.children
        ); // 어린이 최대
      } else if (name === "children" && operation === "decrement") {
        newValue = Math.max(newValue - 1, 0); // 어린이는 최소 0명
      } else if (name === "infants" && operation === "increment") {
        // 유아는 성인 수를 넘지 않도록 제한
        if (prev.infants < prev.adults) {
          newValue = Math.min(
            newValue + 1,
            maxCount - totalCount + prev.infants
          ); // 유아 최대
        } else {
          return prev; // 유아가 성인 수를 넘지 않도록
        }
      } else if (name === "infants" && operation === "decrement") {
        newValue = Math.max(newValue - 1, 0); // 유아는 최소 0명
      }

      // 성인이 줄어들 때 유아 수를 성인 수와 일치시킴
      if (name === "adults" && operation === "decrement") {
        // 성인 수가 줄어들었을 때, 유아 수가 성인을 초과하면 유아 수를 성인 수에 맞게 줄임
        if (prev.infants > newValue) {
          return {
            ...prev,
            adults: newValue,
            infants: newValue, // 유아 수를 성인 수에 맞춤
          };
        }
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  // 좌석등급 선택
  const travelClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SeatClass;
    setTempData((prev) => ({ ...prev, travelClass: value }));
  };

  // 인원 및 좌석등급 선택완료
  const travelerConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    setInputData((prev) => ({
      ...prev,
      adults: tempData.adults,
      children: tempData.children,
      infants: tempData.infants,
      travelClass: tempData.travelClass,
    }));
    setTravelerBtnSw(false);
  };

  // 항공 검색 동작
  const flightSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
      inputData.returnDate,
      inputData.adults,
      inputData.children,
      inputData.infants,
      inputData.travelClass
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
        <Field>
          <Label htmlFor="originLocation">출발지</Label>
          <WriteInput
            type="text"
            id="originLocation"
            value={inputData.originLocationCode}
            onChange={originChange}
            placeholder="도시 또는 공항명"
          />
        </Field>
        <CircleField>
          <Icon
            onClick={locationChange}
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
          </Icon>
        </CircleField>
        <Field>
          <Label htmlFor="destinationLocation">도착지</Label>
          <WriteInput
            type="text"
            id="destinationLocation"
            value={inputData.destinationLocationCode}
            onChange={destinationChange}
            placeholder="도시 또는 공항명"
          />
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
        <Field style={{ position: "relative" }}>
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
            <TravelerModal>
              {/* 성인 Counter */}
              <CounterField>
                <CounterLabel>성인</CounterLabel>
                <ButtonGroup>
                  <CounterButton
                    name="adults"
                    onClick={(e) => travelerCounterChange(e, "decrement")}
                  >
                    -
                  </CounterButton>
                  <span>{tempData.adults}</span>
                  <CounterButton
                    name="adults"
                    onClick={(e) => travelerCounterChange(e, "increment")}
                  >
                    +
                  </CounterButton>
                </ButtonGroup>
              </CounterField>

              {/* 어린이 Counter */}
              <CounterField>
                <CounterLabel>어린이</CounterLabel>
                <ButtonGroup>
                  <CounterButton
                    name="children"
                    onClick={(e) => travelerCounterChange(e, "decrement")}
                  >
                    -
                  </CounterButton>
                  <span>{tempData.children}</span>
                  <CounterButton
                    name="children"
                    onClick={(e) => travelerCounterChange(e, "increment")}
                  >
                    +
                  </CounterButton>
                </ButtonGroup>
              </CounterField>

              {/* 유아 Counter */}
              <CounterField>
                <CounterLabel>유아</CounterLabel>
                <ButtonGroup>
                  <CounterButton
                    name="infants"
                    onClick={(e) => travelerCounterChange(e, "decrement")}
                  >
                    -
                  </CounterButton>
                  <span>{tempData.infants}</span>
                  <CounterButton
                    name="infants"
                    onClick={(e) => travelerCounterChange(e, "increment")}
                  >
                    +
                  </CounterButton>
                </ButtonGroup>
              </CounterField>

              <HorizontalLine />

              {/* 좌석 클래스 선택 */}
              <Field>
                <Label>좌석 클래스 선택:</Label>
                <select
                  value={tempData.travelClass}
                  onChange={travelClassChange}
                >
                  <option value={SeatClass.ECONOMY}>일반석</option>
                  <option value={SeatClass.PREMIUM_ECONOMY}>
                    프리미엄 일반석
                  </option>
                  <option value={SeatClass.BUSINESS}>비즈니스석</option>
                  <option value={SeatClass.FIRST}>일등석</option>
                </select>
              </Field>
              <HorizontalLine />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={travelerConfirm}>선택완료</button>
              </div>
            </TravelerModal>
          )}
        </Field>

        <button onClick={flightSearch}>검색</button>
      </Form>
      <div>
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
                    {destinationLocation.airportKor} ({destinationLocation.iata}
                    )
                  </li>
                </>
              )
            )}
          </ul>
        )}
      </div>

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
        ""
      )}
    </Container>
  );
}

export default FlightSearch;
