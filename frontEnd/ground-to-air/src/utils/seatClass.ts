// 좌석등급 관련 변환 유틸

// 좌석등급 정의
export enum SeatClass {
  ECONOMY = "ECONOMY", // 일반석
  PREMIUM_ECONOMY = "PREMIUM_ECONOMY", // 프리미엄 일반석
  BUSINESS = "BUSINESS", // 비즈니스석
  FIRST = "FIRST", // 일등석
}

// 좌석클래스 --> 한글로 변환
export function seatKor(seat?: SeatClass) {
  if (seat === undefined) return "";
  if (seat === "FIRST") {
    return "일등석";
  } else if (seat === "BUSINESS") {
    return "비즈니스석";
  } else if (seat === "PREMIUM_ECONOMY") {
    return "프리미엄 일반석";
  } else {
    return "일반석";
  }
}
