// 예약정보입력

import { useHistory, useLocation } from "react-router-dom";
import { FlightPricing } from "../../../utils/api";
import { useEffect } from "react";
import styled from "styled-components";
import TravelerInfoWrite from "./TravelerInfoWrite";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../../../utils/atom";

// TravelerInfo 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
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

interface TravelerInfoProps {
  data: {
    flightOffers: FlightPricing[]; // Flight Offer Price 데이터
  };
}

function TravelerInfo() {
  const isLoggedIn = useRecoilValue(isLoggedInState);

  const location = useLocation<{ data?: TravelerInfoProps }>();
  const { data } = location.state || {};

  const history = useHistory();

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  return (
    <Container>
      <DetailList>
        {data?.data.flightOffers.map(
          (priceOffers: FlightPricing, index: number) => (
            <div key={index} style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {priceOffers.travelerPricings.map((travelerPricings, index) => (
                  <TravelerInfoWrite
                    key={index}
                    travelerPricings={travelerPricings}
                  />
                ))}
              </div>

              {isLoggedIn && (
                <div>
                  <input type="checkBox" />
                  예약자와 동일
                </div>
              )}
            </div>
          )
        )}
        <ButtonGroup>
          <ChoiceButton onClick={() => history.goBack()}>이전으로</ChoiceButton>

          <ChoiceButton>다음으로</ChoiceButton>
        </ButtonGroup>
      </DetailList>
    </Container>
  );
}

export default TravelerInfo;
