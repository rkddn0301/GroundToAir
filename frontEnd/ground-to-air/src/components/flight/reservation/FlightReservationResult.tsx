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

const Footer = styled.div``;

// 항공편 박스
const FlightBox = styled.div`
  border: 2px dashed skyblue;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
`;

const Icon = styled.svg`
  width: 18px;
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
        <div style={{ fontWeight: "600", fontSize: "24px" }}>
          {/* 목적지 추출 : 도시명이 없다면 공항명으로 대체. */}
          {destination ? destination.cityKor ?? destination?.airportKor : ""}
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-evenly",
            fontSize: "19px",
          }}
        >
          <div>인원 {peoples}명</div>
          <div>|</div>
          <div>{isRoundTrip}</div>
          <div>|</div>
          <div>{seatClass}</div>
        </div>
      </Header>
      <Body>
        {/* 가는편 */}
        <p style={{ margin: "10px 0 10px" }}>
          <span style={{ fontWeight: "600" }}>가는편 출발시간</span>{" "}
          {departureDate}
        </p>
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
          <p>
            <span>도착 : {arrivalDate}</span>{" "}
            <span>총 소요시간 : {totalDuration}</span>
          </p>
        </FlightBox>
        {/* 오는편 */}
        {isRoundTrip === "왕복" && (
          <>
            <p style={{ margin: "10px 0 10px" }}>
              <span style={{ fontWeight: "600" }}>오는편 출발시간</span>{" "}
              {returnDepartureDate}
            </p>
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
              <p>
                <span>도착 : {returnArrivalDate}</span>{" "}
                <span>총 소요시간 : {returnTotalDuration}</span>
              </p>{" "}
            </FlightBox>
          </>
        )}
      </Body>
      <Footer>
        {/* 팁 정보 제공 */}
        <div>
          <p>
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
          </p>
        </div>

        {/* 항공 요금 */}
        <div>
          <div>
            <span>항공요금 X{peoples}</span>
            <span>{base}</span>
          </div>
          <div>
            <span>유류할증료 X{peoples}</span>
            <span>{fuelSurcharge}</span>
          </div>
          <div>
            <span>제세공과금 X{peoples}</span>
            <span>{taxFees}</span>
          </div>
          <div>
            <span>총 금액 X{peoples}</span>
            <span>{total}</span>
          </div>
        </div>
      </Footer>
    </>
  );
}

export default FlightReservationResult;
