// 예약 상세 페이지
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { FlightOffer } from "../utils/api";
import { FlightWish } from "./FlightSearch";
import { useEffect, useState } from "react";
import axios from "axios";

const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

interface ReservationDetailProps {}

function ReservationDetail() {
  const location = useLocation<{ offer?: FlightOffer; wish?: FlightWish }>();
  const { offer, wish } = location.state;

  const [flightPrice, setFlightPrice] = useState();

  useEffect(() => {
    if (offer) {
      console.log(offer);
      fetchDetail();
    }

    if (wish) {
      console.log(wish);
    }
  }, [offer, wish]);

  const fetchDetail = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/air/flightPrice`,
        {
          flightOffers: offer,
        }
      );
      console.log(response.data);
      if (response.data) {
        setFlightPrice(response.data);
      }
    } catch (error) {
      console.error("예약 상세 데이터 가져오기 실패 : ", error);
    }
  };

  return (
    <Container>
      <p>
        예약 {offer && offer.id} {wish && wish.wishNo} 페이지입니다.
      </p>
    </Container>
  );
}

export default ReservationDetail;
