// 예약완료 페이지

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SeatClass } from "../../../router/FlightSearch";
import styled from "styled-components";

// 예약완료 페이지 전체 구성
const Container = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 제목 디자인
const MainTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
`;

// 결과리스트 구성
const ResultList = styled.div`
  width: 40%;
  background-color: ${(props) => props.theme.white.bg};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  padding: 15px;
  box-shadow: 2px 3px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
`;

// 요소리스트 디자인
const ElementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-weight: 600;
  align-items: flex-start;
`;

// 값리스트 디자인
const ValueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
`;

// 버튼 전체 구성
const ButtonGroup = styled.div``;

interface FlightReservationCompleteProps {
  revCode: string; // 예약코드
  regDate: number[]; // 예약날짜

  // 가는편
  airlinesIata: string; // 항공사
  departureIata: string; // 출발지
  departureTime: number[]; // 출발시간
  arrivalIata: string; // 도착지
  arrivalTime: number[]; // 도착시간
  flightNo: string; // 항공편번호

  // 오는편
  reAirlinesIata?: string; // 항공사
  reDepartureIata?: string; // 출발지
  reDepartureTime?: number[]; // 출발시간
  reArrivalIata?: string; // 도착지
  reArrivalTime?: number[]; // 도착시간
  reFlightNo?: string; // 항공편번호

  adults: number; // 성인 수
  childrens: number; // 어린이 수
  infants: number; // 유아 수
  seatClass: SeatClass; // 좌석등급
  totalPrice: number; // 결제금액
}

function FlightReservationComplete() {
  const location = useLocation<{ data?: FlightReservationCompleteProps }>();
  const { data } = location.state || {};

  // 초기 렌더링
  useEffect(() => {
    if (sessionStorage.getItem("redirection")) {
      sessionStorage.removeItem("redirection");
    }
    if (data) {
      console.log(data);
    }
  }, [data]);

  const revCode = data?.revCode; // 예약코드
  const regDate = data?.regDate.join("-")?.replace(/-(\d)\b/g, "-0$1"); // 예약일 ( '-(\d)' : '-' 뒤 숫자, '\b' : '\d'뒤에 문자가 없으면 동작하게 하는 것  )
  const OutboundFlight = `${data?.departureIata} --> ${data?.arrivalIata}`; // 가는편
  const InboundFlight = `${data?.reDepartureIata} --> ${data?.reArrivalIata}`; // 오는편

  const [year, month, day, hour, minute] = data?.departureTime || [];
  const [reYear, reMonth, reDay, reHour, reMinute] =
    data?.reDepartureTime || [];

  const DepartureDate = `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`; // 출국일
  const ReturnDate = `${reYear}-${String(reMonth).padStart(2, "0")}-${String(
    reDay
  ).padStart(2, "0")} ${String(reHour).padStart(2, "0")}:${String(
    reMinute
  ).padStart(2, "0")}`; // 귀국일

  const adults = data?.adults || 0; // 성인 수
  const childrens = data?.childrens || 0; // 어린이 수
  const infants = data?.infants || 0; // 유아 수

  const seatClass =
    data?.seatClass === "FIRST"
      ? "일등석"
      : data?.seatClass === "BUSINESS"
      ? "비즈니스석"
      : data?.seatClass === "PREMIUM_ECONOMY"
      ? "프리미엄 일반석"
      : "일반석"; // 좌석등급

  const totalPrice = data?.totalPrice || 0; // 결제금액

  return (
    <Container>
      <MainTitle>예약이 완료되었습니다.</MainTitle>
      <ResultList>
        {data && (
          <>
            <ElementList>
              <p>예약코드</p>
              <p>예약날짜</p>
              <p>가는편</p>
              {data.reFlightNo && <p>오는편</p>}
              <p>출국일</p>
              <p>귀국일</p>
              <p>탑승인원</p>
              <p>좌석등급</p>
              <p>결제금액</p>
            </ElementList>
            <ValueList>
              <p>{revCode}</p>
              <p>{regDate}</p>
              <p>{OutboundFlight}</p>
              {data.reFlightNo && <p>{InboundFlight}</p>}
              <p>{DepartureDate}</p>
              {data.reFlightNo && <p>{ReturnDate}</p>}
              <p>{`${adults + childrens + infants}명`}</p>
              <p>{seatClass}</p>
              <p>{`\\${new Intl.NumberFormat("ko-KR").format(totalPrice)}`}</p>
            </ValueList>
          </>
        )}
      </ResultList>
      <ButtonGroup>
        <button>메인으로</button>
        <button>예약정보 확인</button>
      </ButtonGroup>
    </Container>
  );
}

export default FlightReservationComplete;
