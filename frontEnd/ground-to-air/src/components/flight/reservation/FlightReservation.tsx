// 예약 상세 페이지
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { FlightOffer, FlightPricing } from "../../../utils/api";
import { useEffect, useState } from "react";
import axios from "axios";
import KakaoPayment from "../../payment/KakaoPayment";
import TossPayment from "../../payment/TossPayment";
import { motion } from "framer-motion";

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
  border-radius: 5px;
`;

// 헤더 디자인 구성
const Header = styled.div``;

interface FlightReservationProps {
  data: {
    flightOffers: FlightPricing[]; // Flight Offer Price 데이터
  };
}

function FlightReservation() {
  const location = useLocation<{ offer?: FlightOffer }>();
  const { offer } = location.state;

  const [flightPrice, setFlightPrice] = useState<FlightReservationProps | null>(
    null
  ); // 항공편 상세 추출
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    if (offer) {
      console.log(offer);
      checkflightPrice();
    }
  }, [offer]);

  useEffect(() => {
    if (flightPrice) {
      console.log(flightPrice);
    }
  }, [flightPrice]);

  // 항공편 상세 조회 함수
  const checkflightPrice = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8080/air/flightPrice`,
        {
          flightOffers: offer,
        }
      );
      if (response.data) {
        setFlightPrice(response.data);
      }
    } catch (error) {
      console.error("예약 상세 데이터 가져오기 실패 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      ) : flightPrice ? (
        <DetailList>
          {flightPrice.data.flightOffers.map((pricing: FlightPricing) => (
            <>
              <Header>
                <div>
                  {
                    pricing.itineraries[0]?.segments[
                      pricing.itineraries[0]?.segments.length - 1
                    ]?.arrival?.iataCode
                  }
                </div>
                <div>
                  인원 {pricing.travelerPricings.length}명 |{" "}
                  {pricing.itineraries.length > 1 ? "왕복" : "편도"} |{" "}
                  {pricing.travelerPricings[0]?.fareDetailsBySegment[0]
                    ?.cabin === "FIRST"
                    ? "일등석"
                    : pricing.travelerPricings[0]?.fareDetailsBySegment[0]
                        ?.cabin === "BUSINESS"
                    ? "비즈니스석"
                    : pricing.travelerPricings[0]?.fareDetailsBySegment[0]
                        ?.cabin === "PREMIUM_ECONOMY"
                    ? "프리미엄 일반석"
                    : "일반석"}
                </div>
                <hr />
              </Header>
            </>
          ))}

          <KakaoPayment />
          <TossPayment />
        </DetailList>
      ) : (
        ""
      )}
    </Container>
  );
}

export default FlightReservation;
