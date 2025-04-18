// 예약 상세 페이지
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  AirlineCodes,
  FlightOffer,
  FlightPricing,
  IataCodes,
} from "../../../utils/api";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import FlightReservationResult from "./FlightReservationResult";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../../../utils/atom";
import { Alert, Confirm } from "../../../utils/sweetAlert";
import {
  fetchAirlineCodes,
  fetchIataCodes,
} from "../../../utils/useAirCodeData";

// FlightReservation 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 항공편 로딩 중 전체 디자인 구성
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
  border-top: 4px solid skyblue; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
  border-radius: 50%;
  width: 16px;
  height: 16px;
`;

// 예약 상세 목록
const DetailList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 90%;
  background-color: ${(props) => props.theme.white.bg};
  padding: 30px 10px 30px 10px;
  margin: 0 auto;
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 8px;
`;

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

// 푸터 디자인 구성
const Footer = styled.div`
  width: 80%;
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

// 버튼 전체 구성
const ButtonGroup = styled.div`
  margin-top: 10px;
  width: 50%;
  display: flex;
  justify-content: center;
  gap: 20px;
`;

// 버튼 디자인 구성
const ChoiceButton = styled.button`
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  width: 25%;
  padding: 15px 5px 15px 5px;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

interface FlightReservationProps {
  data: {
    flightOffers: FlightPricing[]; // Flight Offer Price 데이터
  };
}

function FlightReservation() {
  const isLoggedIn = useRecoilValue(isLoggedInState);

  const location = useLocation<{ data?: FlightOffer }>();
  const { data } = location.state;

  const history = useHistory();

  /* 항공편 관련 state 시작 */
  const [flightPrice, setFlightPrice] = useState<FlightReservationProps | null>(
    null
  ); // 항공편 상세 추출

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출
  const [iataCodeOffers, setIataCodeOffers] = useState<IataCodes[]>([]); // 공항 코드 추출

  /* 항공편 관련 state 끝 */

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    if (data) {
      console.log(data);
      // 항공편 데이터 추출
      const airCodeFetch = async () => {
        const airlineCodes = await fetchAirlineCodes();
        const iataCodes = await fetchIataCodes();
        setAirlineCodeOffers(airlineCodes); // 항공사 코드
        setIataCodeOffers(iataCodes); // 공항 코드
      };
      airCodeFetch();
      checkflightPrice();
    }
  }, [data]);

  // 항공편 상세 조회 함수
  const checkflightPrice = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8080/air/flightPrice`,
        {
          flightOffers: data,
        }
      );
      if (response.data === "No fare applicable") {
        const errorAlert = await Alert(
          "선택하신 조건에 맞는 항공편이 없습니다.<br>다른 항공편을 이용해주시길 바랍니다.",
          "error"
        );
        if (errorAlert.isConfirmed || errorAlert.isDismissed) {
          history.push("/");
        }
      } else {
        setFlightPrice(response.data);
      }
    } catch (error) {
      console.error("예약 상세 데이터 가져오기 실패 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // '다음으로' 클릭 시 동작하는 함수
  const nextClick = async () => {
    if (!isLoggedIn) {
      const nextConfirm = await Confirm(
        "비회원으로 예약하시겠습니까?",
        "question"
      );

      if (nextConfirm.isConfirmed) {
        history.push({
          pathname: `/flightReservation/${data?.id}/traveler`,
          state: { data: flightPrice },
        });
      } else {
        history.push({
          pathname: "/login",
          state: {
            data: flightPrice,
            redirection: `${location.pathname}/traveler`,
          },
        });
      }
    } else {
      history.push({
        pathname: `/flightReservation/${data?.id}/traveler`,
        state: { data: flightPrice },
      });
    }
  };

  const pricing = flightPrice?.data.flightOffers.at(-1);
  // Header
  const destination = iataCodeOffers.find(
    (iata) =>
      pricing?.itineraries[0]?.segments.at(-1)?.arrival?.iataCode === iata.iata
  ); // 목적지 레코드
  const peoples = pricing?.travelerPricings.length ?? 0; // 인원 수
  const isRoundTrip = pricing?.itineraries?.length ?? 0 > 1 ? "왕복" : "편도"; // 왕복여부
  const seatClass =
    pricing?.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin === "FIRST"
      ? "일등석"
      : pricing?.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ===
        "BUSINESS"
      ? "비즈니스석"
      : pricing?.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ===
        "PREMIUM_ECONOMY"
      ? "프리미엄 일반석"
      : "일반석"; // 좌석등급

  // 요금 관련
  // reduce는 첫 번째 매개변수로 누적값을 받고, 두 번째 매개변수로 배열의 각 요소를 처리해 누적값을 계산하며, 초기값은 숫자, 문자 등 어떤 값도 될 수 있음.
  // forEach는 배열 내부 각 요소에 대해 반복적으로 순환시킬 수 있으나 반환은 하지 않는다. 따라서 reduce에서 누적해야 할 값을 forEach에 넣으면 계산만 해주고 reduce가 별도로 누적된 값을 return 할 수 있다.

  const base =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      pricing?.travelerPricings?.reduce(
        (sum, traveler) => sum + parseFloat(traveler.price.base),
        0
      ) ?? 0
    ); // 항공 요금

  const fuelSurcharge =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      pricing?.travelerPricings?.reduce((sum, traveler) => {
        traveler.price.taxes?.forEach((tax) => {
          // code가 "YQ" 혹은 "YR" 일 경우 sum에 amount 값을 누적 계산함.
          if (tax.code === "YQ" || tax.code === "YR") {
            sum += parseFloat(tax.amount);
          }
        });
        return sum;
      }, 0) ?? 0
    ); // 유류할증료(YQ/YR)

  const taxFees =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      pricing?.travelerPricings?.reduce((sum, traveler) => {
        traveler.price.taxes?.forEach((tax) => {
          // code 중 "YQ","YR"를 제외한 모든 amount 값을 sum에 누적 계산함.
          if (tax.code !== "YQ" && tax.code !== "YR") {
            sum += parseFloat(tax.amount);
          }
        });
        return sum;
      }, 0) ?? 0
    ); // 제세공과금

  const total =
    "₩" +
    new Intl.NumberFormat("ko-KR").format(
      pricing?.travelerPricings?.reduce(
        (sum, traveler) => sum + parseFloat(traveler.price.total),
        0
      ) ?? 0
    ); // 총 요금

  return (
    <Container>
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
        </Loading>
      ) : flightPrice &&
        iataCodeOffers.length > 0 &&
        airlineCodeOffers.length > 0 ? (
        <DetailList>
          {flightPrice.data.flightOffers.map(
            (pricing: FlightPricing, index) => (
              <>
                <Header>
                  <Destination>
                    {/* 목적지 추출 : 도시명이 없다면 공항명으로 대체. */}
                    {destination
                      ? destination.cityKor ?? destination?.airportKor
                      : ""}
                  </Destination>
                  <TravelerOverview>
                    <div>인원 {peoples}명</div>
                    <div>|</div>
                    <div>{isRoundTrip}</div>
                    <div>|</div>
                    <div>{seatClass}</div>
                  </TravelerOverview>
                </Header>
                <FlightReservationResult
                  key={index}
                  pricing={pricing}
                  turnaroundTime={data?.itineraries[0]?.duration}
                  reTurnaroundTime={data?.itineraries[1]?.duration}
                  airlineCodeOffers={airlineCodeOffers}
                  iataCodeOffers={iataCodeOffers}
                />
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
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </Icon>
                      유류할증료와 제세공과금은 환율 변동 및 항공사 사정에 따라
                      변경될 수 있습니다.
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
            )
          )}

          <ButtonGroup>
            <ChoiceButton onClick={() => history.goBack()}>
              이전으로
            </ChoiceButton>
            <ChoiceButton onClick={nextClick}>다음으로</ChoiceButton>
          </ButtonGroup>
        </DetailList>
      ) : (
        ""
      )}
    </Container>
  );
}

export default FlightReservation;
