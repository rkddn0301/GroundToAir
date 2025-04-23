// 공통적으로 쓰는 api 데이터 모음

import { SeatClass } from "./seatClass";

// 항공

// 공항코드 데이터 수집(WORLD_AIRPORT_CODE)
export interface IataCodes {
  codeNo: number;
  airportKor?: string; // 공항명(한국어)
  iata?: string; // 공항코드
  cityKor?: string; // 도시명(한국어)
  cityCode?: string; // 도시코드
  countryKor?: string; // 국가명(한국어)
}

// 항공사코드 데이터 수집(AIRLINE_CODE)
export interface AirlineCodes {
  codeNo: number;
  airlines: string; // 항공사명
  airlinesKor: string; // 항공사명(한국어)
  iata: string; // 항공사코드(IATA)
  icao: string; // 항공사코드(ICAO)
}

// 국적코드 데이터 수집(COUNTRY_CODE)
export interface CountryCodes {
  codeNo: number;
  isoAlpha2: string;
  country: string;
  countryKor: string;
}

// AmadeusAPI(FlightOfferSearch) 호출된 데이터 지정
export interface FlightOffer {
  type: string; // 응답 데이터의 유형
  id: string; // 항공편 제안 고유 ID
  source: string; // 항공편 정보 제공처
  numberOfBookableSeats?: number; // 예약 가능한 좌석 수
  itineraries: {
    duration: string; // 소요 시간
    segments: Segments[];
  }[];
  price: {
    // 가격 정보
    total: string;
  };

  travelerPricings: TravelerPricings[];
  validatingAirlineCodes: string[]; // 판매 항공사
}

// AmadeusAPI(FlightOfferPrice) 호출된 데이터 지정
export interface FlightPricing {
  type: string;
  id: string;
  source: string; // 항공편 정보 제공처
  itineraries: {
    segments: Segments[];
  }[];

  price: {
    base: string; // 항공요금
    billingCurrency: string; // 결제 시 사용되는 통화
    currency: string; // 표시되는 통화
    grandTotal: string; // 세금포함 요금
    total: string; // 총 요금
  };

  pricingOptions: {
    fareType: string[]; // 요금 종류 EX) PUBLISHED
    includedCheckedBagsOnly: boolean; // 무료 위탁 수하물 포함 여부
  };

  travelerPricings: TravelerPricings[];
}

// AmadeusAPI(FlightCreateOrder) 호출된 데이터 지정
export interface FlightOrder {
  data: {
    type: string;
    id: string;
    flightOffers: FlightPricing[];
    travelers: Travelers[];
  };
}

// 항공편 행선지 정보
export interface Segments {
  departure: {
    // 출발지
    iataCode: string; // 공항코드
    at: string; // 출발시간(현지기준)
    terminal: string; // 승객 처리 구역
  };
  arrival: {
    // 도착지
    iataCode: string; // 공항코드
    at: string; // 도착시간(현지기준)
    terminal: string; // 승객 처리 구역
  };
  carrierCode?: string; // 항공사 코드
  number?: string; // 항공편 번호
  duration?: string; // 소요시간
  aircraft?: {
    code?: string; // 항공기 코드
  };
  operating?: {
    carrierCode?: string;
  }; // 실질적으로 운항하는 항공사
  numberOfStops: number; // 경유 횟수
}

// 탑승자별 금액 정보
export interface TravelerPricings {
  travelerId: string; // 여행자 ID
  fareOption: string; // 요금 옵션 EX) STANDARD
  travelerType: string; // 여행자 유형 EX) ADULT
  price: {
    currency: string; // 표시되는 통화
    total: string; // 총 요금
    base: string; // 항공요금
    taxes: {
      amount: string; // 세금 금액
      code: string; // 세금 코드 EX) SW, TK
    }[]; // 세금 내역
    refundableTaxes: string; // 환불 가능한 세금
  };
  fareDetailsBySegment: {
    segmentId: string; // 구간 ID
    cabin: SeatClass; // 좌석등급
    fareBasis: string; // 요금 기준 코드
    brandedFare: string; // 브랜드 요금명
    class: string; // 예약 등급 EX) Q, V
    includedCheckedBags: {
      quantity: number; // 무료 위탁 수하물 개수
    };
  }[];
  validatingAirlineCodes: string[]; // 판매 항공사
}

// 탑승자 정보
export interface Travelers {
  id: string; // 탑승자 순서
  dateOfBirth: string; // 생년월일
  gender: string; // 성별
  name: {
    firstName: string; // 성
    lastName: string; // 명
  };

  contact: {
    emailAddress: string; // 이메일
    phones: {
      countryCallingCode: string; // 번호 국가코드
      deviceType: string; // 기기유형 EX) MOBILE
      number: string; // 번호
    }[];
    purpose: string; // 여행 목적
  };

  emergencyContact: {
    // 비상연락처
    addresseeName: string; // 명의
    countryCode: string; // 국적
    number: string; // 번호
  };

  documents: {
    documentType: string; // 문서유형 EX) PASSPORT
    expiryDate: string; // 만료일
    holder: boolean; // 보유여부
    issuanceCountry: string; // 발행국가
    nationality: string; // 국적
    number: string; // 문서번호 EX) 여권번호
  }[];
}
