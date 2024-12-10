// 공통적으로 쓰는 api 데이터 모음

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
  airlinesLogo: string; // 항공사 로고 URL
  iata: string; // 항공사코드(IATA)
  icao: string; // 항공사코드(ICAO)
}

// AmadeusAPI(FlightOfferSearch) 호출된 데이터 지정
export interface FlightOffer {
  type: string; // 응답 데이터의 유형
  id: string; // 항공편 제안 고유 ID
  source: string;
  numberOfBookableSeats?: number; // 예약 가능한 좌석 수
  itineraries: {
    duration: string; // 소요 시간
    segments: {
      departure?: {
        // 출발지
        iataCode?: string; // 공항코드
        at?: string; // 출발시간(현지기준)
      };
      arrival?: {
        // 도착지
        iataCode?: string; // 공항코드
        at?: string; // 도착시간(현지기준)
      };
      carrierCode?: string; // 항공사 코드
      number?: string; // 항공편 번호
      aircraft?: {
        code?: string; // 항공기 코드
      };
      operating?: {
        carrierCode?: string;
      }; // 실질적으로 운항하는 항공사
      numberOfStops: number; // 경유 횟수
    }[];
  }[];
  price: {
    // 가격 정보
    total: string;
  };
  validatingAirlineCodes: string[]; // 판매 항공사
}

// 호텔

// 호텔 자동완성 기능 데이터 선언부
export interface AutoCompleteKeywords {
  data: {
    id: number; // 식별코드
    name: string; // 호텔명
    iataCode: string; // 지역코드
    subType: string; // 호텔 하위유형
    hotelIds: string[]; // 호텔 ID
    address: {
      cityName: string; // 도시명
      countryCode: string; // 국가코드
    };
    geoCode: {
      latitude: number; // 호텔의 위도
      longitude: number; // 호텔의 경도
    };
  }[];
}

// 호텔 검색 데이터 선언부
export interface HotelOffer {
  data: {
    type: string; // 데이터 유형
    hotel: {
      hotelId: string; // 호텔 고유식별자
      chainCode: string; // 호텔 체인 코드
      name: string; // 호텔명
      cityCode: string; // 호텔이 위치한 도시의 코드
      latitude: number; // 호텔의 위도
      longitue: number; // 호텔의 경도
    };
    offers: {
      checkInDate: string; // 체크인 날짜
      checkOutDate: string; // 체크아웃 날짜
      room: {
        type: string; // 객실 유형
        typeEstimated?: {
          category?: string; // 객실명
          beds?: number; // 침대 수
          bedType?: string; // 침대 유형
        };
      };
      guests: {
        adults: number; // 객실 인원
      };
      price: {
        base: string; // 기본 요금
        total: string; // 총 요금
      };
    }[];
  }[];
}
