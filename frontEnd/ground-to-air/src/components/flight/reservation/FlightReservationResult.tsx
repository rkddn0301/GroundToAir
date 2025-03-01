// 예약 상세 결과 요약
import styled from "styled-components";
import {
  AirlineCodes,
  FlightOffer,
  FlightPricing,
  IataCodes,
} from "../../../utils/api";
import { formatDate, formatDuration } from "../../../utils/formatTime";
import FlightReservationOptions from "./FlightReservationOptions";

// 헤더 디자인 구성
const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${(props) => props.theme.white.font};
`;

// 바디 디자인 구성
const Body = styled.div`
  width: 90%;
  margin-bottom: 10px;
`;

// 푸터 디자인 구성
const Footer = styled.div`
  width: 80%;
`;

// 목적지
const Destination = styled.div`
  font-weight: 600;
  font-size: 24px;
`;

// 탑승자 개요
const TravelerOverview = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  font-size: 19px;
`;

// 출발시간
const DepartureTimes = styled.div`
  margin: 10px 0 10px;
`;

// 항공편 박스
const FlightBox = styled.div`
  border: 2px dashed skyblue;
  padding: 15px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
`;

// 종합결과
const FlightSummary = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px 0px 5px 0px;
  font-size: 14px;

  span:nth-child(2) {
    color: ${(props) => props.theme.white.font};
  }
`;

// 팁 정보
const TipInfo = styled.div`
  margin-bottom: 10px;
  opacity: 70%;
  font-size: 14px;
`;

// 팁 제공 아이콘
const Icon = styled.svg`
  width: 16px;
`;

// 요금 정보
const PriceInfo = styled.div`
  border: 1px solid ${(props) => props.theme.black.font};
  background-color: ${(props) => props.theme.black.bg};
  padding: 5px;
  color: ${(props) => props.theme.black.font};
  opacity: 80%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

// 상세요금
const DetailedPrice = styled.div`
  width: 100%;
  display: flex;
  //justify-content: space-around;

  span:first-child {
    flex: 1;
  }

  span:nth-child(2) {
    flex: 1;
    text-align: left;
    //transform: translateX(15%);
  }

  span:nth-child(3) {
    flex: 1;
    text-align: right;
    //transform: translateX(50%);
  }

  span:last-child {
    flex: 1;
  }
`;

interface FlightReservationResultProps {
  pricing: FlightPricing; // 항공편 상세 코드
  offer?: FlightOffer; // 항공편 조회 코드
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 공항 코드 DB
}

function FlightReservationResult({
  pricing,
  offer,
  airlineCodeOffers,
  iataCodeOffers,
}: FlightReservationResultProps) {
  // Header
  const destination = iataCodeOffers.find(
    (iata) =>
      pricing.itineraries[0]?.segments.at(-1)?.arrival?.iataCode === iata.iata
  ); // 목적지 레코드
  const peoples = pricing.travelerPricings.length; // 인원 수
  const isRoundTrip = pricing.itineraries.length > 1 ? "왕복" : "편도"; // 왕복여부
  const seatClass =
    pricing.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin === "FIRST"
      ? "일등석"
      : pricing.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ===
        "BUSINESS"
      ? "비즈니스석"
      : pricing.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ===
        "PREMIUM_ECONOMY"
      ? "프리미엄 일반석"
      : "일반석"; // 좌석등급

  // Body

  // 가는편
  const departureDate = formatDate(
    pricing.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발일

  const arrivalDate = formatDate(
    pricing.itineraries[0]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const totalDuration = formatDuration(offer?.itineraries[0]?.duration); // 총 소요시간

  // 오는편

  const returnDepartureDate = formatDate(
    pricing.itineraries[1]?.segments[0]?.departure?.at
  ); // 출발일

  const returnArrivalDate = formatDate(
    pricing.itineraries[1]?.segments.at(-1)?.arrival?.at
  ); // 도착일

  const returnTotalDuration = formatDuration(offer?.itineraries[1]?.duration); // 총 소요시간

  // 요금 관련
  // reduce는 첫 번째 매개변수로 누적값을 받고, 두 번째 매개변수로 배열의 각 요소를 처리해 누적값을 계산하며, 초기값은 숫자, 문자 등 어떤 값도 될 수 있음.
  // forEach는 배열 내부 각 요소에 대해 반복적으로 순환시킬 수 있으나 반환은 하지 않는다. 따라서 reduce에서 누적해야 할 값을 forEach에 넣으면 계산만 해주고 reduce가 별도로 누적된 값을 return 할 수 있다.

  const base =
    "\\" +
    new Intl.NumberFormat("ko-KR").format(
      pricing.travelerPricings.reduce(
        (sum, traveler) => sum + parseFloat(traveler.price.base),
        0
      )
    ); // 항공 요금

  const fuelSurcharge =
    "\\" +
    new Intl.NumberFormat("ko-KR").format(
      pricing.travelerPricings.reduce((sum, traveler) => {
        traveler.price.taxes.forEach((tax) => {
          // code가 "YQ" 혹은 "YR" 일 경우 sum에 amount 값을 누적 계산함.
          if (tax.code === "YQ" || tax.code === "YR") {
            sum += parseFloat(tax.amount);
          }
        });
        return sum;
      }, 0)
    ); // 유류할증료(YQ/YR)

  const taxFees =
    "\\" +
    new Intl.NumberFormat("ko-KR").format(
      pricing.travelerPricings.reduce((sum, traveler) => {
        traveler.price.taxes.forEach((tax) => {
          // code 중 "YQ","YR"를 제외한 모든 amount 값을 sum에 누적 계산함.
          if (tax.code !== "YQ" && tax.code !== "YR") {
            sum += parseFloat(tax.amount);
          }
        });
        return sum;
      }, 0)
    ); // 제세공과금

  const total =
    "\\" +
    new Intl.NumberFormat("ko-KR").format(
      pricing.travelerPricings.reduce(
        (sum, traveler) => sum + parseFloat(traveler.price.total),
        0
      )
    ); // 총 요금

  return (
    <>
      <Header>
        <Destination>
          {/* 목적지 추출 : 도시명이 없다면 공항명으로 대체. */}
          {destination ? destination.cityKor ?? destination?.airportKor : ""}
        </Destination>
        <TravelerOverview>
          <div>인원 {peoples}명</div>
          <div>|</div>
          <div>{isRoundTrip}</div>
          <div>|</div>
          <div>{seatClass}</div>
        </TravelerOverview>
      </Header>
      <Body>
        {/* 가는편 */}
        <DepartureTimes>
          <span style={{ fontWeight: "600" }}>가는편 출발시간</span>{" "}
          {departureDate}
        </DepartureTimes>
        <FlightBox>
          {pricing.itineraries[0]?.segments.map((segment, index) => (
            <FlightReservationOptions
              segment={segment}
              key={index}
              airlineCodeOffers={airlineCodeOffers}
              iataCodeOffers={iataCodeOffers}
              nextSegment={pricing.itineraries[0]?.segments[index + 1]}
            />
          ))}
          <FlightSummary>
            <span>도착시간 : {arrivalDate}</span>
            <span> | </span>
            <span>총 소요시간 : {totalDuration}</span>
          </FlightSummary>
        </FlightBox>
        {/* 오는편 */}
        {isRoundTrip === "왕복" && (
          <>
            <DepartureTimes>
              <span style={{ fontWeight: "600" }}>오는편 출발시간</span>{" "}
              {returnDepartureDate}
            </DepartureTimes>
            <FlightBox>
              {pricing.itineraries[1]?.segments.map((segment, index) => (
                <FlightReservationOptions
                  segment={segment}
                  key={index}
                  airlineCodeOffers={airlineCodeOffers}
                  iataCodeOffers={iataCodeOffers}
                  nextSegment={pricing.itineraries[1]?.segments[index + 1]}
                />
              ))}
              <FlightSummary>
                <span>도착시간 : {returnArrivalDate}</span>
                <span> | </span>
                <span>총 소요시간 : {returnTotalDuration}</span>
              </FlightSummary>{" "}
            </FlightBox>
          </>
        )}
      </Body>
      <Footer>
        {/* 팁 정보 제공 */}
        <TipInfo>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-start",
            }}
          >
            <Icon
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
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </Icon>
            유류할증료와 제세공과금은 환율 변동 및 항공사 사정에 따라 변경될 수
            있습니다.
          </div>
        </TipInfo>

        {/* 항공 요금 */}
        <PriceInfo>
          <DetailedPrice>
            <span />
            <span>항공요금 {peoples > 1 && `X ${peoples}`}</span>
            <span>{base}</span>
            <span />
          </DetailedPrice>
          <DetailedPrice>
            <span />
            <span>유류할증료 {peoples > 1 && `X ${peoples}`}</span>
            <span>{fuelSurcharge}</span>
            <span />
          </DetailedPrice>
          <DetailedPrice>
            <span />
            <span>제세공과금 {peoples > 1 && `X ${peoples}`}</span>
            <span>{taxFees}</span>
            <span />
          </DetailedPrice>
          <DetailedPrice>
            <span />
            <span>총 금액 {peoples > 1 && `X ${peoples}`}</span>
            <span>{total}</span>
            <span />
          </DetailedPrice>
        </PriceInfo>
      </Footer>
    </>
  );
}

export default FlightReservationResult;
