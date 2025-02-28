// 예약 상세 페이지
import { Link, useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  AirlineCodes,
  FlightOffer,
  FlightPricing,
  IataCodes,
} from "../../../utils/api";
import { useEffect, useState } from "react";
import axios from "axios";
import KakaoPayment from "../../payment/KakaoPayment";
import TossPayment from "../../payment/TossPayment";
import { motion } from "framer-motion";
import FlightReservationResult from "./FlightReservationResult";

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

interface FlightReservationProps {
  data: {
    flightOffers: FlightPricing[]; // Flight Offer Price 데이터
  };
}

function FlightReservation() {
  const location = useLocation<{ offer?: FlightOffer }>();
  const { offer } = location.state;

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
    if (offer) {
      console.log(offer);
      airCodeFetch();
      checkflightPrice();
    }
  }, [offer]);

  useEffect(() => {
    if (flightPrice) {
      console.log(flightPrice);
    }
  }, [flightPrice]);

  // 항공사 코드 추출 함수
  const airCodeFetch = async () => {
    const airlineCodeResponse = await axios.get(
      `http://localhost:8080/air/airlineCode`
    );
    const iataCodeResponse = await axios.get(
      `http://localhost:8080/air/iataCode`
    );
    setAirlineCodeOffers(airlineCodeResponse.data); // 항공사 코드
    setIataCodeOffers(iataCodeResponse.data); // 항공편 코드
  };

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
      ) : flightPrice && iataCodeOffers && airlineCodeOffers ? (
        <DetailList>
          {flightPrice.data.flightOffers.map(
            (pricing: FlightPricing, index) => (
              <>
                <FlightReservationResult
                  key={index}
                  pricing={pricing}
                  offer={offer}
                  airlineCodeOffers={airlineCodeOffers}
                  iataCodeOffers={iataCodeOffers}
                />
              </>
            )
          )}

          {/*       <KakaoPayment />
          <TossPayment /> */}
          <div>
            <button onClick={() => history.goBack()}>이전으로</button>
            <Link
              to={{
                pathname: `/flightReservation/${offer?.id}/traveler`,
                state: { offer },
              }}
            >
              <button>다음으로</button>
            </Link>
          </div>
        </DetailList>
      ) : (
        ""
      )}
    </Container>
  );
}

export default FlightReservation;
