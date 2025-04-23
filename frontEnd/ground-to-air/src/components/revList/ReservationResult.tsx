// 예약 내역 데이터

import styled from "styled-components";
import { FlightReservation } from "../../router/ReservationList";
import { AirlineCodes } from "../../utils/api";
import { formatTime } from "../../utils/formatTime";
import { useHistory } from "react-router-dom";
import { Alert, Confirm } from "../../utils/sweetAlert";
import axios from "axios";
import { SeatClass, seatKor } from "../../utils/seatClass";

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
interface ReservationResultProps {
  rev: FlightReservation;
  airlineCodeOffers: AirlineCodes[];
  setGetRevList: React.Dispatch<React.SetStateAction<FlightReservation[]>>;
  listChoice: {
    revList: boolean;
    pastList: boolean;
  };
}

function ReservationResult({
  rev,
  airlineCodeOffers,
  setGetRevList,
  listChoice,
}: ReservationResultProps) {
  const history = useHistory();

  // 가는편
  const carrierCode =
    airlineCodeOffers.find((airline) => airline.iata === rev.airlinesIata)
      ?.airlinesKor || ""; // 항공사명

  // 오는편
  const returnCarrierCode =
    airlineCodeOffers.find((airline) => airline.iata === rev.reAirlinesIata)
      ?.airlinesKor || ""; // 항공사명

  const revListDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const deleteConfirm = await Confirm("삭제하시겠습니까?", "question");

    if (deleteConfirm.isConfirmed) {
      try {
        const response = await axios.post(
          "http://localhost:8080/user/revDelete",
          {
            revId: rev.revId,
          }
        );
        console.log(response.data);
        if (response.data) {
          const successAlert = await Alert("삭제가 완료되었습니다.", "success");

          if (successAlert.isConfirmed || successAlert.isDismissed) {
            setGetRevList((prevRev) =>
              prevRev.filter((item) => item.revId !== rev.revId)
            );
          }
        }
      } catch (error) {
        console.error("예약내역 삭제 실패 : ", error);
        Alert("삭제 도중 오류가 발생하였습니다.", "error");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <ElementValue isWidth={"16%"}>
        <span>{rev.regDate}</span>
        <span>{rev.revCode}</span>
      </ElementValue>
      <ElementValue isWidth={"30%"}>
        <span>
          {carrierCode} {rev.departureIata}-{rev.arrivalIata}{" "}
          {formatTime(rev.departureTime)}~{formatTime(rev.arrivalTime)}
        </span>
        {rev.reStopLine ? (
          <span>
            {returnCarrierCode} {rev.reDepartureIata}-{rev.reArrivalIata}{" "}
            {formatTime(rev.reDepartureTime)}~{formatTime(rev.reArrivalTime)}
          </span>
        ) : (
          ""
        )}
      </ElementValue>
      <ElementValue isWidth={"13%"}>
        <span>{rev.departureTime.split("T")[0]}</span>
        {rev.reStopLine ? (
          <>
            <span>~</span>
            <span>{rev.reDepartureTime?.split("T")[0]}</span>
          </>
        ) : (
          ""
        )}
      </ElementValue>
      <ElementValue isWidth={"15%"}>
        <span>
          {(rev.adults ?? 0) + (rev.childrens ?? 0) + (rev.infants ?? 0)}명 /{" "}
          {seatKor(rev.seatClass)}
        </span>
      </ElementValue>
      <ElementValue
        isWidth={"11%"}
      >{`₩${rev.totalPrice.toLocaleString()}`}</ElementValue>
      <ElementValue
        isWidth={listChoice.revList ? "10%" : "15%"}
        style={{ padding: "0px" }}
      >
        <ElementButton
          fontSize={"9px"}
          backgroundColor={"skyblue"}
          hoverColor={"#595959"}
          onClick={() =>
            history.push({
              pathname: `/reservationDetail/${rev.revCode}`,
              state: {
                revName: rev.revName,
                revCode: rev.revCode,
              },
            })
          }
        >
          예약상세확인
        </ElementButton>
      </ElementValue>
      {listChoice.revList && (
        <ElementValue isWidth={"5%"} style={{ padding: "0px" }}>
          <ElementButton
            onClick={revListDelete}
            fontSize={"12px"}
            backgroundColor={"#ff4d4f"}
            hoverColor={"#b03044"}
          >
            X
          </ElementButton>
        </ElementValue>
      )}
    </div>
  );
}

export default ReservationResult;
