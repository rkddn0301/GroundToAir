import { useEffect, useState } from "react";
import styled from "styled-components";
import { isLoggedInState } from "../utils/atom";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { FlightWish } from "./FlightSearch";
import { formatDuration, formatTime } from "../utils/formatTime";

// WishList 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 항공편 찜 카드 구성
const Card = styled.div`
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 5px;
  width: 80%;
  margin: 0 auto;
`;

function WishList() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom

  const [getWish, setGetWish] = useState<FlightWish[]>([]); // 찜 데이터 조회 state

  const wishListData = async () => {
    const accessToken = localStorage.getItem("accessToken"); // 회원 번호 추출을 위해 accessToken 추출
    if (accessToken) {
      try {
        const wishResponse = await axios.post(
          `http://localhost:8080/user/getWish`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setGetWish(wishResponse.data);
      } catch (error) {
        console.error("위시리스트 데이터 가져오기 실패 : ", error);
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      wishListData();
    }
  }, []);

  useEffect(() => {
    if (getWish.length > 0) {
      console.log(getWish);
    }
  }, [getWish]);
  return (
    <Container>
      <Card>
        <h3>찜 내역</h3>
        <table style={{ border: "1px solid #ccc" }}>
          <thead>
            <tr>
              <th colSpan={6}>항공편</th>
              <th>인원/좌석등급</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            {getWish.map((wish) => (
              <>
                <tr>
                  <td>{wish.airlinesIata}</td>
                  <td>{wish.departureIata}</td>
                  <td>{formatTime(wish.departureTime)}</td>
                  <td>{formatDuration(wish.turnaroundTime)}</td>
                  <td>{formatTime(wish.arrivalTime)}</td>
                  <td>{wish.arrivalIata}</td>
                  <td rowSpan={wish.reStopLine ? 2 : 1}>
                    성인 : {wish.adults}명
                    {(wish.childrens ?? 0) > 0 &&
                      `, 어린이 : ${wish.childrens}명`}
                    {(wish.infants ?? 0) > 0 && `, 유아 : ${wish.infants}명`} /{" "}
                    {wish.seatClass === "FIRST"
                      ? "일등석"
                      : wish.seatClass === "BUSINESS"
                      ? "비즈니스석"
                      : wish.seatClass === "PREMIUM_ECONOMY"
                      ? "프리미엄 일반석"
                      : "일반석"}
                  </td>
                  <td
                    rowSpan={wish.reStopLine ? 2 : 1}
                  >{`\\${wish.totalPrice.toLocaleString()}`}</td>
                </tr>
                {wish.reStopLine && (
                  <tr>
                    <td>{wish.reAirlinesIata}</td>
                    <td>{wish.reDepartureIata}</td>
                    <td>{formatTime(wish.reDepartureTime)}</td>
                    <td>{formatDuration(wish.reTurnaroundTime)}</td>
                    <td>{formatTime(wish.reArrivalTime)}</td>
                    <td>{wish.reArrivalIata}</td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>
    </Container>
  );
}

export default WishList;
