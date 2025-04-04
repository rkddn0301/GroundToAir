// 예약내역

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { isLoggedInState } from "../utils/atom";
import { AirlineCodes, FlightOrder } from "../utils/api";
import axios from "axios";
import { SeatClass } from "./FlightSearch";

// ReservationList 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 예약내역 구성 박스
const ListBox = styled.div`
  width: 80%;
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin: 0 auto;
  padding: 10px;
  box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.2);
`;

// 제목
const MainTitle = styled.h3`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 5px;
  border-bottom: 1px solid ${(props) => props.theme.white.font};
  font-size: 24px;
  font-weight: 650;
`;

// 내역 버튼 그룹
const ListButtonGroups = styled.div``;

// 내역 버튼
const ListButton = styled.a.withConfig({
  shouldForwardProp: (prop) => !["isActive"].includes(prop),
})<{
  isActive: boolean;
}>`
  font-size: 14px;
  cursor: pointer;
  font-weight: ${(props) => (props.isActive ? 600 : 500)};
`;

// 예약내역
const RevList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// 요소 제목
const ElementTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isWidth"].includes(prop),
})<{
  isWidth: string;
}>`
  display: flex;
  width: ${(props) => props.isWidth};
  justify-content: center;
  align-items: center;
  padding: 5px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${(props) => props.theme.white.font};
`;

// 요소 값
const ElementValue = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isWidth"].includes(prop),
})<{
  isWidth: string;
}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.isWidth};
  justify-content: center;
  align-items: center;
  border: 1px solid ${(props) => props.theme.white.font};
  gap: 5px;
  font-size: 80%;
  padding: 5px;
  word-break: break-word;
`;

// 요소 버튼
// shouldForwardProp : styled-components에서 특정 props가 DOM에 전달되지 않도록 필터링함(오류방지)
const ElementButton = styled.button.withConfig({
  shouldForwardProp: (prop) =>
    !["fontSize", "backgroundColor", "hoverColor"].includes(prop),
})<{
  fontSize: string;
  backgroundColor: string;
  hoverColor: string;
}>`
  width: 100%;
  height: 100%;
  font-size: ${(props) => props.fontSize};
  background-color: ${(props) => props.backgroundColor};
  border: transparent;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.hoverColor};
    color: ${(props) => props.theme.black.font};
  }
`;

// FlightReservation 타입 지정
interface FlightReservation {
  revId: number;
  revCode: string;
  userNo?: number;
  revName: string;

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
  orders?: FlightOrder | null;

  adults?: number;
  childrens?: number;
  infants?: number;
  seatClass?: SeatClass;
  regDate: string;
}

function ReservationList() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom

  const [getRevList, setGetRevList] = useState<FlightReservation[]>([]); // 예약내역 데이터 조회 state

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출

  const [listChoice, setListChoice] = useState({
    revList: true, // 예약내역
    pastList: false, // 지난내역
  }); // 내역 선택 state

  // 예약내역 데이터 가져오기
  const reservationListData = async () => {
    const accessToken = localStorage.getItem("accessToken"); // 회원 번호 추출을 위해 accessToken 추출
    if (accessToken) {
      try {
        const revResponse = await axios.post(
          `http://localhost:8080/user/getRevList`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(revResponse.data);
        setGetRevList(revResponse.data);
      } catch (error) {
        console.error("예약내역 데이터 가져오기 실패 : ", error);
      }
    }
  };

  // 항공사 코드 가져오기
  const airlineCodeData = async () => {
    const airlineCodeResponse = await axios.get(
      `http://localhost:8080/air/airlineCode`
    );
    setAirlineCodeOffers(airlineCodeResponse.data); // 항공사 코드
  };

  // 초기 렌더링 시 실행
  useEffect(() => {
    if (isLoggedIn) {
      reservationListData(); // 예약내역 데이터 출력 함수
      airlineCodeData(); // 항공사 로고 데이터 출력 함수
    }
  }, []);

  useEffect(() => {
    if (getRevList.length > 0) {
      console.log(getRevList);
    }
  }, [getRevList]);

  const ListChoice = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { id } = e.currentTarget;

    setListChoice({
      revList: id === "revList" ? true : false,
      pastList: id === "pastList" ? true : false,
    });
  };

  return (
    <Container>
      <ListBox>
        <MainTitle>예약내역</MainTitle>

        {/* 내역 버튼 */}
        <ListButtonGroups>
          <ListButton
            isActive={listChoice.revList}
            id="revList"
            onClick={ListChoice}
          >
            예약내역
          </ListButton>{" "}
          |{" "}
          <ListButton
            isActive={listChoice.pastList}
            id="pastList"
            onClick={ListChoice}
          >
            지난내역
          </ListButton>
        </ListButtonGroups>

        {/* 예약내역 */}
        <RevList>
          <div style={{ display: "flex" }}>
            <ElementTitle isWidth={"16%"}>예약날짜/예약코드</ElementTitle>
            <ElementTitle isWidth={"30%"}>항공편</ElementTitle>
            <ElementTitle isWidth={"13%"}>출국일/귀국일</ElementTitle>
            <ElementTitle isWidth={"15%"}>인원/좌석등급</ElementTitle>
            <ElementTitle isWidth={"11%"}>결제금액</ElementTitle>
            <ElementTitle isWidth={"10%"} />
            <ElementTitle isWidth={"5%"} />
          </div>

          {getRevList.length > 0 ? (
            <div style={{ display: "flex" }}>
              <ElementValue isWidth={"16%"}>
                <span>{getRevList[0].regDate}</span>
                <span>{getRevList[0].revCode}</span>
              </ElementValue>
              <ElementValue isWidth={"30%"}>
                <span>
                  {getRevList[0].airlinesIata} {getRevList[0].departureIata}-
                  {getRevList[0].arrivalIata} {getRevList[0].departureTime}~
                  {getRevList[0].arrivalTime}
                </span>
                {getRevList[0].reStopLine ? (
                  <span>
                    {getRevList[0].reAirlinesIata}{" "}
                    {getRevList[0].reDepartureIata}-
                    {getRevList[0].reArrivalIata}{" "}
                    {getRevList[0].reDepartureTime}~
                    {getRevList[0].reArrivalTime}
                  </span>
                ) : (
                  ""
                )}
              </ElementValue>
              <ElementValue isWidth={"13%"}>
                <span>{getRevList[0].departureTime}</span>
                {getRevList[0].reStopLine ? (
                  <>
                    <span>~</span>
                    <span>{getRevList[0].reDepartureTime}</span>
                  </>
                ) : (
                  ""
                )}
              </ElementValue>
              <ElementValue isWidth={"15%"}>
                <span>
                  {(getRevList[0].adults ?? 0) +
                    (getRevList[0].childrens ?? 0) +
                    (getRevList[0].infants ?? 0)}
                  명 /{" "}
                  {getRevList[0].seatClass === "FIRST"
                    ? "일등석"
                    : getRevList[0].seatClass === "BUSINESS"
                    ? "비즈니스석"
                    : getRevList[0].seatClass === "PREMIUM_ECONOMY"
                    ? "프리미엄 일반석"
                    : "일반석"}
                </span>
              </ElementValue>
              <ElementValue isWidth={"11%"}>
                {getRevList[0].totalPrice}
              </ElementValue>
              <ElementValue isWidth={"10%"} style={{ padding: "0px" }}>
                <ElementButton
                  fontSize={"9px"}
                  backgroundColor={"skyblue"}
                  hoverColor={"#595959"}
                >
                  예약상세확인
                </ElementButton>
              </ElementValue>
              <ElementValue isWidth={"5%"} style={{ padding: "0px" }}>
                <ElementButton
                  fontSize={"12px"}
                  backgroundColor={"#ff4d4f"}
                  hoverColor={"#b03044"}
                >
                  X
                </ElementButton>
              </ElementValue>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "370px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              예약내역이 존재하지 않습니다.
            </div>
          )}
        </RevList>

        {/* 페이지네이션 */}
        <div>
          <button>1</button>
        </div>
      </ListBox>
    </Container>
  );
}

export default ReservationList;
