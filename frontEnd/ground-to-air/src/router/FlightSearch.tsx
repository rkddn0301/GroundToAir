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
import FlightFiltering from "../components/flight/FlightFiltering";
import { Alert } from "../utils/sweetAlert";

import CryptoJS from "crypto-js";
import { fetchAirlineCodes, fetchIataCodes } from "../utils/useAirCodeData";

// FlightSearch 전체 컴포넌트 구성
const Container = styled.div.withConfig({
  shouldForwardProp: (prop) => !["flightOffers"].includes(prop),
})<{
  flightOffers: FlightOffersResponse | null;
}>`
  min-width: 100%;
  margin-top: 50px;
  min-height: ${(props) => (props.flightOffers ? "150vh" : "100vh")};
`;

// 왕복/편도 전체 디자인 구성
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
  border-right: 5px solid ${(props) => props.theme.background};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); // 그림자 순서 : x축, y축, 흐림효과, 색상
`;

// 작성란 폼 전체 디자인 구성
const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${(props) => props.theme.white.bg};
  //height: 15vh;
  box-shadow: 5px 4px 2px rgba(0, 0, 0, 0.2);
  padding: 15px 0 30px 0;
  gap: 10px;
  width: 100%;
`;

// '직항만' 디자인 구성
const NonStopWrapper = styled.div`
  width: 85%;
  display: flex;
  justify-content: flex-end;
  // 입력란 최대 길이 920px ~ 1195px
  max-width: 1080px;
  min-width: 800px;

  @media (max-width: 872px) {
    max-width: 400px;
    min-width: 200px;
  }
`;

// 폼 디자인 구성
const Form = styled.form`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  // width: 85%;

  @media (max-width: 872px) {
    flex-wrap: wrap;
    width: 70%;
  }
`;

// Field 디자인 부분 구성
const FieldWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45%;
  gap: 10px;
  min-width: 400px;
  max-width: 500px;
`;

// 작성란 구분 디자인 구성
const Field = styled.div`
  width: 20%;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  padding: 15px;
  min-width: 200px; // 최소 크기 200px로 고정
  max-width: 250px; // 최대 크기 250px로 고정

  min-height: 90px;
`;

// 출발지/도착지 전환 버튼 구성
const CircleField = styled.div`
  position: absolute;
  width: 50px;
  padding: 15px;
  display: flex;
  background-color: ${(props) => props.theme.white.bg};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 50%;
  font-size: 15px;
  justify-content: center;
  align-items: center;
  z-index: 1;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 출발지/도착지 전환 버튼 아이콘
const ArrowsIcon = styled.svg`
  width: 25px;
`;

// 작성란 제목 디자인 구성
const Label = styled.label`
  font-size: 12px;
  padding: 0 5px 0 0;
  margin-bottom: 8px;
`;

// 작성란 디자인 구성
const WriteInput = styled.input`
  border: none;
  background: transparent;
  padding: 10px 5px 10px 5px;
  margin-top: auto;
`;

// 달력 전체 디자인 구성
const CalendarInput = styled.div`
  margin-top: 10px;

  /* DatePicker 입력창 스타일 수정 */
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    input {
      width: 100%;
      min-width: 170px;
      max-width: 220px;
    }
  }
`;

// 인원 및 좌석등급 버튼 디자인 구성
const TravelerButton = styled.button`
  position: relative;
  margin-top: 5%;
  padding: 5px;
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 7px;
  border: 1px solid ${(props) => props.theme.white.font};
  cursor: pointer;
  width: 100%;
  min-width: 170px;
  max-width: 220px; // 텍스트 초과 시 버튼 고정을 위해 설정
  white-space: nowrap; // 텍스트 줄바꿈 방지
  overflow: hidden; // 숨김
  text-overflow: ellipsis; // 숨겨진 텍스트 ... 표시
`;

// 버튼 디자인 구성
const SubmitBtn = styled.button`
  width: 10%;
  max-width: 200px;
  min-height: 90px;
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }

  @media (max-width: 872px) {
    min-width: 400px;
    min-height: 50px;
    //max-width: 600px;
  }
`;

// 항공 조회 로딩 중 전체 디자인 구성
const Loading = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// 로딩 중... 원형 디자인 구성
const Spinner = styled(motion.div)`
  border: 4px solid ${(props) => props.theme.white.font};
  border-top: 4px solid ${(props) => props.theme.background}; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
  border-radius: 50%;
  width: 16px;
  height: 16px;
`;

// 항공 조회 결과 전체 디자인 구성
const ResultContainer = styled.div`
  display: flex;
`;

// 항공 조회 결과 폰트 디자인 구성
const ResultFont = styled.div`
  width: 50%;
  font-weight: 600;
  display: flex;
  justify-content: flex-start;
`;

// 더 보기 버튼 디자인 구성
const MoreBtnField = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 10% 10px 8%;
`;

// 더 보기 버튼 구성
const MoreBtn = styled.button`
  width: 200px;
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  cursor: pointer;

  padding: 5px;
  font-weight: 600;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
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

// 다른 컴포넌트에서 wishList를 props로 이용 시 필요
export interface FlightWish {
  wishNo?: number;
  userNo?: number;

  airlinesIata: string;
  departureIata: string;
  departureTime: string;
  arrivalIata: string;
  arrivalTime: string;
  flightNo: string;
  turnaroundTime: string;
  stopLine: string;

  reAirlinesIata?: string;
  reDepartureIata?: string;
  reDepartureTime?: string;
  reArrivalIata?: string;
  reArrivalTime?: string;
  reFlightNo?: string;
  reTurnaroundTime?: string;
  reStopLine?: string;
  totalPrice: number;
  offer?: FlightOffer | null;

  adults?: number;
  childrens?: number;
  infants?: number;
  seatClass?: SeatClass;
}

// 좌석 클래스 enum
export enum SeatClass {
  ECONOMY = "ECONOMY", // 일반석
  PREMIUM_ECONOMY = "PREMIUM_ECONOMY", // 프리미엄 일반석
  BUSINESS = "BUSINESS", // 비즈니스석
  FIRST = "FIRST", // 일등석
}

// AmadeusAPI(FlightOfferSearch) 호출 데이터 배열로 변환
export interface FlightOffersResponse {
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

export const encryptionKey = process.env.REACT_APP_FLIGHT_DATA_SECRET_KEY || ""; // 이전 항공 데이터 암호화 키

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

  const [onewayChecking, setOnewayChecking] = useState(false); // 편도/왕복 여부 스위칭 state

  const [travelerBtnSw, setTravelerBtnSw] = useState(false); // 인원 및 좌석등급 활성화 스위칭 state
  const travelerModalRef = useRef<HTMLDivElement>(null); // 인원 및 좌석등급 선택란 제어

  /* 자동완성 관련 state 시작 */

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

  /* 자동완성 관련 state 끝 */

  /* 항공 조회 결과 적용 시작 */

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const [flightOffers, setFlightOffers] = useState<FlightOffersResponse | null>(
    () => {
      const storedData = localStorage.getItem("flightOffers");
      if (storedData) {
        const bytes = CryptoJS.AES.decrypt(storedData, encryptionKey);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) || null;
      }
      return null;
    }
  ); // 전체 항공편 추출

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출

  const [iataCodeOffers, setIataCodeOffers] = useState<IataCodes[]>([]); // 공항 코드 추출

  const [showTooltip, setShowTooltip] = useState<{
    [key: string]: {
      [index: number]: {
        departureDate: boolean;
        returnDate: boolean;
        departureCodeshare: boolean;
        returnCodeshare: boolean;
      };
    };
  }>({}); // 경유지 툴팁으로 고유 key, 경유지 구분 index, 왕복 내용 중 hover 여부를 관리하는 state
  // EX) 경유지 : 3번째 데이터에서 2회 경유 일 경우 고유 key는 '3', index는 0,1이 발생함. 따라서 key[0]에는 첫 번째 경유지, key[1]에는 두 번째 경유지가 있는 것.

  const [isNonstop, setIsNonstop] = useState({
    checking: false, // 체크박스 선택
    search: false, // 검색 후 필터링
  }); // '직항만' 스위칭

  /* 항공 조회 결과 적용 끝 */

  /* 찜(wishList) state 구성 시작 */

  const [getWish, setGetWish] = useState<FlightWish[]>([]); // 찜 데이터 조회 state

  const [isWish, setIsWish] = useState<{
    [key: string]: boolean;
  }>({}); // 찜 스위칭

  const [wishReg, setWishReg] = useState<FlightWish>({
    airlinesIata: "", // 가는편_항공사코드
    departureIata: "", // 가는편_출발지공항
    departureTime: "", //  가는편_출발시간
    arrivalIata: "", // 가는편_도착지공항
    arrivalTime: "", // 가는편_도착시간
    flightNo: "", // 가는편_항공편번호
    turnaroundTime: "", // 가는편_소요시간
    stopLine: "", // 가는편_경유지 여부

    reAirlinesIata: "", // 오는편_항공사코드
    reDepartureIata: "", // 오는편_출발지공항
    reDepartureTime: "", // 오는편_출발시간
    reArrivalIata: "", // 오는편_도착지공항
    reArrivalTime: "", // 오는편_도착시간
    reFlightNo: "", // 오는편_항공편번호
    reTurnaroundTime: "", // 오는편_소요시간
    reStopLine: "", // 오는편_경유지 여부
    totalPrice: 0, // 가격
    offer: null, // 항공편
  }); // 찜 데이터 등록 state

  /* 찜(wishList) state 구성 끝 */

  /* 항공 조회 결과 적용 끝 */

  /* 더 보기 기능 적용 시작 */
  const [moreCount, setMoreCount] = useState(10); // 더 보기 state

  const loadMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMoreCount((prev) => prev + 30);
  };

  /* 더 보기 기능 적용 끝 */

  /* 모달 제어 구간 시작 */

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

  /* 모달 제어 구간 끝 */

  /* 항공 입력 구간 시작 */

  // 초기 렌더링 시 조건에 따라 기능 적용
  useEffect(() => {
    // 항공편 데이터 추출
    const airCodeFetch = async () => {
      const airlineCodes = await fetchAirlineCodes();
      const iataCodes = await fetchIataCodes();
      setAirlineCodeOffers(airlineCodes); // 항공사 코드
      setIataCodeOffers(iataCodes); // 공항 코드
    };
    airCodeFetch();

    // 유지 할 검색 데이터가 존재 할 경우
    if (flightOffers) {
      wishListData();
    }

    // 가는날 & 오는날 새로고침 시 초기값 그대로 수정
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

  // 편도/왕복 선택 함수
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
        const response = await axios.get(
          `http://localhost:8080/air/autoCompleteIataCodes`,
          {
            params: { keyword: value },
          }
        );
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
        const response = await axios.get(
          `http://localhost:8080/air/autoCompleteIataCodes`,
          {
            params: { keyword: value },
          }
        );
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
  const roundTripDateChange = (dates: [Date | null, Date | null]) => {
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
  /* 항공 입력 구간 끝 */

  /* 찜 관련 시작 */

  // 기존 찜 데이터 조회
  const wishListData = async () => {
    const accessToken = localStorage.getItem("accessToken"); // 회원 번호 추출을 위해 accessToken 추출
    if (accessToken) {
      try {
        const wishResponse = await axios.post(
          `http://localhost:8080/user/getWish`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setGetWish(wishResponse.data);
      } catch (error) {
        console.error("위시리스트 데이터 가져오기 실패 : ", error);
      }
    }
  };

  // 검색(flightSearch) 후 추가적으로 동작하는 hook
  useEffect(() => {
    // 기존 찜 데이터(getWish)와 검색 데이터(flightOffers) 간 서로 비교하여 일치 시 찜 표시 유지
    // ! map이 아닌 reduce를 사용한 이유는 각각 값을 넣어서 출력하는게 아닌 누적하여 총합 결과를 isWish에 삽입해야 하기 때문이다.
    if (getWish.length > 0 && flightOffers) {
      const updatedIsWish = flightOffers.data.reduce((acc: any, offer) => {
        const flightNo = `${offer.itineraries?.[0]?.segments?.[0]?.carrierCode}${offer.itineraries?.[0]?.segments?.[0]?.number}`;
        const departureTime =
          offer.itineraries?.[0]?.segments?.[0]?.departure?.at || "";
        const arrivalTime =
          offer.itineraries?.[0]?.segments?.[
            offer.itineraries?.[0]?.segments?.length - 1
          ]?.arrival?.at || "";
        const reFlightNo = `${
          offer.itineraries?.[1]?.segments?.[0]?.carrierCode || ""
        }${offer.itineraries?.[1]?.segments?.[0]?.number || ""}`;
        const reDepartureTime =
          offer.itineraries?.[1]?.segments?.[0]?.departure?.at || "";
        const reArrivalTime =
          offer.itineraries?.[1]?.segments?.[
            offer.itineraries?.[1]?.segments?.length - 1
          ]?.arrival?.at || "";

        // 기존 데이터에서 조건에 모두 일치하는지 체크
        // ! some, every 사용 주의 사항
        // > some : 하나라도 일치하면 true, every : 전부 일치해야 true
        // > 배열로 넘어가게되면 some은 [n] 중 하나의 배열이라도 내부 값이 일치하면 true 지만
        // > every는 [n] 중 하나라도 불일치하면 false를 반환하기 때문에 신중히 이용해야한다.
        // EX) A = 1 일 때 array[0].A = 1, array[1].A = 2 면 some은 일치, every는 불일치
        const matchedWish = getWish.some(
          (wish) =>
            wish.flightNo === flightNo &&
            wish.departureTime === departureTime &&
            wish.arrivalTime === arrivalTime &&
            (wish.reFlightNo || "") === (reFlightNo || "") &&
            (wish.reDepartureTime || "") === (reDepartureTime || "") &&
            (wish.reArrivalTime || "") === (reArrivalTime || "")
        );
        acc[offer.id] = matchedWish;
        return acc;
      }, {});

      // console.log(getWish);
      setIsWish(updatedIsWish);
    }
  }, [getWish, flightOffers]);

  // FlightResult에서 찜 아이콘 클릭 이력이 있을 시 sendWishList 함수 호출
  useEffect(() => {
    if (wishReg.flightNo !== "") {
      // console.log(wishReg);
      sendWishList(wishReg);
    }
  }, [wishReg]);

  // 클릭한 찜 데이터를 WISH_LIST 테이블에 반영하기 위해 데이터 전송
  const sendWishList = async (data: FlightWish) => {
    try {
      const accessToken = localStorage.getItem("accessToken"); // 로컬 스토리지에서 토큰 가져오기

      const response = await axios.post(
        `http://localhost:8080/user/wish`,
        {
          ...data, // wishList 데이터
          adults: inputData.adults,
          childrens: inputData.children,
          infants: inputData.infants,
          seatClass: inputData.travelClass,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // 인증 토큰
          },
        }
      );

      if (response.data) {
        Alert("찜 내역에 저장 완료하였습니다.", "success");
      }

      // console.log(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  /* 찜 관련 끝 */

  // 항공 검색 동작
  const flightSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let searchOriginLocation: string; // 실질적으로 검색될 출발지 데이터
    let searchDestinationLocation: string; // 실질적으로 검색될 도착지 데이터

    // 공항코드 검색 여부 확인하는 변수
    let originLocationCheck = false;
    let destinationLocationCheck = false;

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
      //console.log("출발지에 공항명칭으로 검색함");

      originLocationCheck = true; // 공항코드 검색 확인
    } else if (/\(.*\)/.test(inputData.originLocationCode)) {
      searchOriginLocation = inputData.originLocationCode
        .split("(")[1]
        .split(")")[0];

      // 검색한게 도시코드/공항코드 인지 확인
      if (inputData.originLocationCodeNo.endsWith("_airport")) {
        //console.log("출발지에 공항명칭으로 검색함");

        originLocationCheck = true; // 공항코드 검색 확인
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

      //console.log("도착지에 공항명칭으로 검색함");

      destinationLocationCheck = true; // 공항코드 검색 확인
    } else if (/\(.*\)/.test(inputData.destinationLocationCode)) {
      searchDestinationLocation = inputData.destinationLocationCode
        .split("(")[1]
        .split(")")[0];

      // 검색한게 도시코드/공항코드 인지 확인
      if (inputData.destinationLocationCodeNo.endsWith("_airport")) {
        //console.log("도착지에 공항명칭으로 검색함");

        destinationLocationCheck = true; // 공항코드 검색 확인
      }
    } else {
      document.getElementById("destinationLocation")?.focus();
      return;
    }

    // 달력
    if (!inputData.departureDate) {
      document.getElementById("departureDate")?.focus();
      return;
    }

    /*  console.log(
      searchOriginLocation,
      searchDestinationLocation,
      inputData.departureDate,
      inputData.returnDate,
      inputData.adults,
      inputData.children,
      inputData.infants,
      inputData.travelClass
    ); */

    setFlightOffers(null); // 기존에 검색된 항공 데이터 제거

    // 자동완성 제거
    setAutoCompleteOriginLocationSw(false);
    setAutoCompleteDestinationLocationSw(false);
    setAutoCompleteOriginLocations([]);
    setAutoCompleteDestinationLocations([]);

    setIsLoading(true); // 항공 검색 이전까지 로딩

    setMoreCount(10); // 항공 더 보기 초기화

    // '직항만' 체크 여부에 따라 검색 boolean 변경
    if (isNonstop.checking) {
      setIsNonstop({ ...isNonstop, search: true });
    } else {
      setIsNonstop({ ...isNonstop, search: false });
    }

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
            excludedAirlineCodes: "H1", // 한에어는 판매대행사이기 때문에 해당 관련된 데이터를 모두 제거한다.
          },
        }
      );
      console.log(response.data);

      /* 
      - 검색결과는 아래 조건대로 출력됨.
      1. 출발지 공항 코드가 검색된 값과 같아야함 .
      2. 도착지 공항 코드가 검색된 값과 같아야함.
      3. 왕복 날짜가 있고, 오는날 출발지 공항 코드가 가는날 도착지 검색된 값과 같아야 함.
      4. 왕복 날짜가 있고, 오는날 도착지 공항 코드가 가는날 출발지 검색된 값과 같아야 함.

      --> 위 결과는 공항코드로 검색했을 경우이며, 도시코드로 검색 할 경우 해당되지 않음. 
      EX) 출발지를 도시로 검색 할 경우 1, 3번은 해당되지 않음
      EX) 도착지를 도시로 검색 할 경우 2, 4번은 해당되지 않음
      EX) 전부 도시로 검색 할 경우 아예 해당되지 않음  
  
      */

      if (response.data && (originLocationCheck || destinationLocationCheck)) {
        const filteredOffers = response.data.data.filter((offer: any) => {
          const originLocationCode =
            offer.itineraries[0]?.segments[0]?.departure?.iataCode;
          const destinationLocationCode =
            offer.itineraries[0]?.segments[
              offer.itineraries[0]?.segments.length - 1
            ]?.arrival?.iataCode;

          const returnDestinationLocationCode =
            offer.itineraries[1]?.segments[
              offer.itineraries[1]?.segments.length - 1
            ]?.arrival?.iataCode;
          const returnOriginLocationCode =
            offer.itineraries[1]?.segments[0]?.departure?.iataCode;

          const nullChecking =
            (originLocationCheck &&
              searchOriginLocation !== originLocationCode) ||
            (destinationLocationCheck &&
              searchDestinationLocation !== destinationLocationCode) ||
            (inputData.returnDate !== "" &&
              originLocationCheck &&
              searchOriginLocation !== returnDestinationLocationCode) ||
            (inputData.returnDate !== "" &&
              destinationLocationCheck &&
              searchDestinationLocation !== returnOriginLocationCode);

          return !nullChecking;
        });
        // console.log(filteredOffers);
        setFlightOffers({
          ...response.data, // 원래 데이터의 meta, dictionaries 등을 유지
          data: filteredOffers, // 필터링된 데이터로 교체
        });

        // 데이터 검색 후 localStorage에 저장하여 유지 및 보안을 위해 encrypt로 암호화
        const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify({ ...response.data, data: filteredOffers }),
          encryptionKey
        ).toString();
        localStorage.setItem("flightOffers", encryptedData);
      } else {
        setFlightOffers(response.data);

        // 데이터 검색 후 localStorage에 저장하여 유지 및 보안을 위해 encrypt로 암호화
        const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify(response.data),
          encryptionKey
        ).toString();
        localStorage.setItem("flightOffers", encryptedData);
      }

      wishListData(); // 찜 데이터 가져오기
    } catch (error) {
      console.error("항공 검색 도중 오류 발생 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container flightOffers={flightOffers}>
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
      <FormWrapper>
        <NonStopWrapper>
          <div>
            <input
              type="checkbox"
              onClick={() =>
                setIsNonstop((prev) => ({ ...prev, checking: !prev.checking }))
              }
            />
            <label>직항만</label>
          </div>
        </NonStopWrapper>
        <Form>
          <FieldWrapper>
            <Field
              style={{ position: "relative", width: "50%" }}
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
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </ArrowsIcon>
            </CircleField>
            <Field
              style={{ position: "relative", width: "50%" }}
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
                    setAutoCompleteLocationSw={
                      setAutoCompleteDestinationLocationSw
                    }
                    autoCompleteLocations={autoCompleteDestinationLocations}
                    setAutoCompleteLocations={
                      setAutoCompleteDestinationLocations
                    }
                    type="destination"
                  />
                )}
            </Field>
          </FieldWrapper>
          {!onewayChecking && (
            <Field>
              <Label>가는날/오는날</Label>
              <CalendarInput>
                <DatePicker
                  showIcon
                  onChange={roundTripDateChange} // 범위 선택을 위한 onChange
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
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
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
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
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
        {flightOffers && (
          <ResultFont>
            {onewayChecking ? "편도 " : "왕복 "}검색결과:{" "}
            {flightOffers?.meta.count}개
          </ResultFont>
        )}
      </FormWrapper>

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
          <FlightFiltering
            flightOffers={flightOffers}
            setFlightOffers={setFlightOffers}
            airlineCodeOffers={airlineCodeOffers}
            isNonstop={isNonstop.search}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "85%",
              margin: "0 auto",
            }}
          >
            {flightOffers.data.slice(0, moreCount).map((offer: any) => (
              <>
                <FlightResult
                  key={offer.id}
                  offer={offer}
                  dictionaries={flightOffers.dictionaries}
                  airlineCodeOffers={airlineCodeOffers}
                  iataCodeOffers={iataCodeOffers}
                  showTooltip={showTooltip[offer.id] || {}} // 고유아이디인 offer.id로 key를 지정, offer.id가 없을 경우 {}로 대체
                  setShowTooltip={(field, index, value) =>
                    setShowTooltip((prev) => ({
                      ...prev,
                      [offer.id]: {
                        ...(prev[offer.id] || {}),
                        [index]: {
                          ...(prev[offer.id]?.[index] || {}),
                          [field]: value,
                        },
                      },
                    }))
                  }
                  // ...prev :  offer.id로 구성된 모든 showTooltip을 가져오는 것. EX) 내가 offer.id : 3을 수정했어도 1,2,4~moreCount에 있는 offer.id 내부 정보를 모두 가져오는 것
                  // ...(prev[offer.id] || {}) : 특정 offer.id 안에 있는 기존 [index] : value(departureDate : false, returnDate : false)의 각각 상태를 가져오는 것
                  // ...(prev[offer.id]?.[index] || {}) : index 내부에 value(departureDate: false, returnDate: false)를 가져오는 것
                  // field는 내가 변경한 key, value는 내가 변경한 boolean

                  isWish={isWish[offer.id] || false} // 고유아이디인 offer.id로 key를 지정, offer.id가 없을 경우 {}로 대체
                  setIsWish={() =>
                    setIsWish((prev) => ({
                      ...prev,
                      [offer.id]: !prev[offer.id], // 특정 offer.id에 대한 값만 업데이트
                    }))
                  } // showTooltip과 다르게 단순히 특정 데이터(offer.id)에 대한 boolean 값만 스위칭 하기 때문에 매크로 function처럼 자식에게 보내고 나머지 처리는 여기서 진행한다.
                  setWishReg={setWishReg} // 찜 데이터 추가 props
                />
              </>
            ))}
            {moreCount < flightOffers.meta.count && (
              <MoreBtnField>
                <MoreBtn onClick={loadMore}>더 보기</MoreBtn>
              </MoreBtnField>
            )}
          </div>
        </ResultContainer>
      ) : (
        ""
      )}
    </Container>
  );
}

export default FlightSearch;
