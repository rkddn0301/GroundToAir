// 찜 내역 데이터
import axios from "axios";
import { FlightWish } from "../../router/FlightSearch";
import { AirlineCodes } from "../../utils/api";
import { formatDuration, formatTime } from "../../utils/formatTime";
import { Alert, Confirm } from "../../utils/sweetAlert";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";

// 요소 값
const ElementValue = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isWidth"].includes(prop),
})<{
  isWidth: string;
}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.isWidth};
  justify-content: center;
  align-items: center;
  border: 1px solid ${(props) => props.theme.white.font};
  gap: 10px;
  font-size: 80%;
  padding: 5px;
  word-break: break-word;
`;

// 요소 버튼
// shouldForwardProp : styled-components에서 특정 props가 DOM에 전달되지 않도록 필터링함(오류방지)
const ElementButton = styled.button.withConfig({
  shouldForwardProp: (prop) =>
    !["fontSize", "backgroundColor", "hoverColor"].includes(prop),
})<{
  fontSize: string;
  backgroundColor: string;
  hoverColor: string;
}>`
  width: 100%;
  height: 100%;
  font-size: ${(props) => props.fontSize};
  background-color: ${(props) => props.backgroundColor};
  border: transparent;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.hoverColor};
    color: ${(props) => props.theme.black.font};
  }
`;

// 조회 결과 컴포넌트에 필요한 props
interface WishResultProps {
  wish: FlightWish;
  airlineCodeOffers: AirlineCodes[];
  setGetWish: React.Dispatch<React.SetStateAction<FlightWish[]>>;
}

function WishResult({ wish, airlineCodeOffers, setGetWish }: WishResultProps) {
  const history = useHistory();

  // 가는편

  const carrierCode =
    airlineCodeOffers.find((airline) => airline.iata === wish.airlinesIata)
      ?.airlinesKor || ""; // 항공사명

  // 오는편

  const returnCarrierCode =
    airlineCodeOffers.find((airline) => airline.iata === wish.reAirlinesIata)
      ?.airlinesKor || ""; // 항공사명

  const wishDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const deleteConfirm = await Confirm("삭제하시겠습니까?", "question");

    if (deleteConfirm.isConfirmed) {
      try {
        const response = await axios.post(
          "http://localhost:8080/user/wishDelete",
          {
            wishNo: wish.wishNo,
          }
        );
        console.log(response.data);

        if (response.data) {
          const successAlert = await Alert("삭제가 완료되었습니다.", "success");

          if (successAlert.isConfirmed || successAlert.isDismissed) {
            setGetWish((prevWish) =>
              prevWish.filter((item) => item.wishNo !== wish.wishNo)
            );
          }
        }
      } catch (error) {
        console.error("위시리스트 삭제 실패 : ", error);
        Alert("삭제 도중 오류가 발생하였습니다.", "error");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* 항공편 */}
      <ElementValue isWidth={"46%"}>
        <span>
          {carrierCode} {wish.departureIata}-{wish.arrivalIata}{" "}
          {formatTime(wish.departureTime)}~{formatTime(wish.arrivalTime)} (
          {formatDuration(wish.turnaroundTime)}){" "}
          <span style={{ color: "blue" }}>{wish.stopLine}</span>
        </span>
        {/* 왕복 여부 */}
        {wish.reStopLine ? (
          <span>
            <br />
            {returnCarrierCode}
            {wish.reDepartureIata}-{wish.reArrivalIata}{" "}
            {formatTime(wish.reDepartureTime)}~{formatTime(wish.reArrivalTime)}{" "}
            ({formatDuration(wish.reTurnaroundTime)}){" "}
            <span style={{ color: "blue" }}>{wish.reStopLine}</span>
          </span>
        ) : (
          ""
        )}
      </ElementValue>

      {/* 출국일/귀국일 */}
      <ElementValue isWidth={"13%"}>
        {wish.departureTime.split("T")[0]}
        {wish.reStopLine ? (
          <>
            <span>~</span>
            {wish.reDepartureTime?.split("T")[0]}
          </>
        ) : (
          ""
        )}
      </ElementValue>

      {/* 인원/좌석등급 */}
      <ElementValue isWidth={"15%"}>
        {(wish.adults ?? 0) + (wish.childrens ?? 0) + (wish.infants ?? 0)}명 /{" "}
        {wish.seatClass === "FIRST"
          ? "일등석"
          : wish.seatClass === "BUSINESS"
          ? "비즈니스석"
          : wish.seatClass === "PREMIUM_ECONOMY"
          ? "프리미엄 일반석"
          : "일반석"}
      </ElementValue>

      {/* 결제금액 */}
      <ElementValue
        isWidth={"11%"}
      >{`₩${wish.totalPrice.toLocaleString()}`}</ElementValue>

      {/* 예약하기 */}
      <ElementValue isWidth={"10%"} style={{ padding: "0px" }}>
        <ElementButton
          fontSize={"9px"}
          backgroundColor={"skyblue"}
          hoverColor={"#595959"}
          onClick={() =>
            history.push({
              pathname: `/flightReservation/${wish.offer?.id}`,
              state: { data: wish.offer },
            })
          }
        >
          예약하기
        </ElementButton>
      </ElementValue>

      {/* 삭제 */}
      <ElementValue isWidth={"5%"} style={{ padding: "0px" }}>
        <ElementButton
          onClick={wishDelete}
          fontSize={"12px"}
          backgroundColor={"#ff4d4f"}
          hoverColor={"#b03044"}
        >
          X
        </ElementButton>
      </ElementValue>
    </div>
  );
}

export default WishResult;
