import axios from "axios";
import { FlightWish } from "../../router/FlightSearch";
import { AirlineCodes } from "../../utils/api";
import { formatDuration, formatTime } from "../../utils/formatTime";
import { Alert, Confirm } from "../../utils/sweetAlert";

// 조회 결과 컴포넌트에 필요한 props
interface WishResultProps {
  wish: FlightWish;
  airlineCodeOffers: AirlineCodes[];
  setGetWish: React.Dispatch<React.SetStateAction<FlightWish[]>>;
}

function WishResult({ wish, airlineCodeOffers, setGetWish }: WishResultProps) {
  // 가는편

  const carrierCodeLogo =
    airlineCodeOffers.find((airline) => {
      const matchesIata = airline.iata === wish.airlinesIata;

      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || ""; // 기본값을 객체로 설정

  // 오는편

  const returnCarrierCodeLogo =
    airlineCodeOffers.find((airline) => {
      const matchesIata = airline.iata === wish.reAirlinesIata;

      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || ""; // 기본값을 객체로 설정

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

          if (successAlert.isConfirmed) {
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
    <>
      <tr>
        <td
          style={{
            borderBottom: wish.reStopLine ? "0px" : "1px solid #595959",
            padding: "5px",
            textAlign: "center",
            verticalAlign: wish.reStopLine ? "" : "middle",
          }}
        >
          {carrierCodeLogo !== "" ? (
            <img src={carrierCodeLogo.airlinesLogo} />
          ) : (
            wish.airlinesIata
          )}{" "}
          {wish.departureIata} {formatTime(wish.departureTime)}{" "}
          {formatDuration(wish.turnaroundTime)} {formatTime(wish.arrivalTime)}{" "}
          {wish.arrivalIata}
        </td>

        <td
          rowSpan={wish.reStopLine ? 2 : 1}
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
            fontSize: "12px",
          }}
        >
          성인 : {wish.adults}명
          {(wish.childrens ?? 0) > 0 && `, 어린이 : ${wish.childrens}명`}
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
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >{`\\${wish.totalPrice.toLocaleString()}`}</td>
        <td
          rowSpan={wish.reStopLine ? 2 : 1}
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >
          <button>예약하기</button>
        </td>
        <td
          rowSpan={wish.reStopLine ? 2 : 1}
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >
          <button onClick={wishDelete}>X</button>
        </td>
      </tr>
      {wish.reStopLine && (
        <tr>
          <td
            style={{
              borderBottom: "1px solid #595959",
              textAlign: "center",
              padding: "5px",
            }}
          >
            {returnCarrierCodeLogo !== "" ? (
              <img src={returnCarrierCodeLogo.airlinesLogo} />
            ) : (
              wish.reAirlinesIata
            )}{" "}
            {wish.reDepartureIata} {formatTime(wish.reDepartureTime)}{" "}
            {formatDuration(wish.reTurnaroundTime)}{" "}
            {formatTime(wish.reArrivalTime)} {wish.reArrivalIata}
          </td>
        </tr>
      )}
    </>
  );
}

export default WishResult;
