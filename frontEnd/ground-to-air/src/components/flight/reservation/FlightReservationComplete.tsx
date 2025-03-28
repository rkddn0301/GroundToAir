// 예약완료 페이지

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SeatClass } from "../../../router/FlightSearch";

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
  }, []);

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  return (
    <div>
      예약이 완료되었습니다.
      <div>
        예약코드 예약날짜 가는편 오는편 출국일 귀국일 탑승인원 좌석등급 결제금액
      </div>
      <div>
        {data && (
          <>
            <p>{data.revCode}</p>
            <p>{data.regDate.join("-")}</p>
            <p>{`${data.departureIata} => ${data.arrivalIata}`}</p>
            <p>{`${data.reDepartureIata} => ${data.reArrivalIata}`}</p>
            <p>{data.departureTime.join(".")}</p>
            <p>{data.reDepartureTime?.join(".")}</p>
            <p>{`${data.adults + data.childrens + data.infants}명`}</p>
            <p>{`\\${new Intl.NumberFormat("ko-KR").format(
              data.totalPrice
            )}`}</p>
          </>
        )}
      </div>
      <div>
        <button>메인으로</button>
        <button>예약정보 확인</button>
      </div>
    </div>
  );
}

export default FlightReservationComplete;
