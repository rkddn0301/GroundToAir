// 찜 내역 데이터
import axios from "axios";
import { FlightWish } from "../../router/FlightSearch";
import { AirlineCodes } from "../../utils/api";
import { formatDuration, formatTime } from "../../utils/formatTime";
import { Alert, Confirm } from "../../utils/sweetAlert";
import { Link } from "react-router-dom";

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
    <>
      <tr>
        {/* 항공편 */}
        <td
          style={{
            borderBottom: "1px solid #595959",
            padding: "5px",
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          {carrierCodeLogo !== "" ? (
            <img src={carrierCodeLogo.airlinesLogo} />
          ) : (
            wish.airlinesIata
          )}{" "}
          {wish.departureIata}-{wish.arrivalIata}{" "}
          {formatTime(wish.departureTime)}~{formatTime(wish.arrivalTime)} (
          {formatDuration(wish.turnaroundTime)}){" "}
          <span style={{ color: "blue" }}>{wish.stopLine}</span>
          {/* 왕복 여부 */}
          {wish.reStopLine ? (
            <>
              <br />
              <br />
              {returnCarrierCodeLogo !== "" ? (
                <img src={returnCarrierCodeLogo.airlinesLogo} />
              ) : (
                wish.reAirlinesIata
              )}{" "}
              {wish.reDepartureIata}-{wish.reArrivalIata}{" "}
              {formatTime(wish.reDepartureTime)}~
              {formatTime(wish.reArrivalTime)} (
              {formatDuration(wish.reTurnaroundTime)}){" "}
              <span style={{ color: "blue" }}>{wish.reStopLine}</span>
            </>
          ) : (
            ""
          )}
        </td>

        {/* 출국일/귀국일 */}
        <td
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >
          {wish.departureTime.split("T")[0]}
          {wish.reStopLine ? (
            <>
              <br />~<br />
              {wish.reArrivalTime?.split("T")[0]}
            </>
          ) : (
            ""
          )}
        </td>

        {/* 인원/좌석등급 */}
        <td
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >
          {(wish.adults ?? 0) + (wish.childrens ?? 0) + (wish.infants ?? 0)}명 /{" "}
          {wish.seatClass === "FIRST"
            ? "일등석"
            : wish.seatClass === "BUSINESS"
            ? "비즈니스석"
            : wish.seatClass === "PREMIUM_ECONOMY"
            ? "프리미엄 일반석"
            : "일반석"}
        </td>

        {/* 결제금액 */}
        <td
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >{`\\${wish.totalPrice.toLocaleString()}`}</td>

        {/* 버튼란 */}
        <td
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >
          <Link
            to={{
              pathname: `/wishList/flightReservation/${wish.wishNo}`,
              state: { offer: wish.offer },
            }}
          >
            <button
              style={{
                backgroundColor: "skyblue",
                border: "1px solid #595959",
                color: "#595959",
                borderRadius: "2px",
                padding: "7px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#595959";
                e.currentTarget.style.color = "#f7fcfc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "skyblue";
                e.currentTarget.style.color = "#595959";
              }}
            >
              예약하기
            </button>
          </Link>
        </td>
        <td
          style={{
            textAlign: "center",
            verticalAlign: "middle",
            border: "1px solid #595959",
            padding: "5px",
          }}
        >
          <button
            onClick={wishDelete}
            style={{
              backgroundColor: "#ff4d4f",
              border: "1px solid #595959",
              color: "#f7fcfc",
              borderRadius: "2px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#b03044")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ff4d4f")
            }
          >
            X
          </button>
        </td>
      </tr>
    </>
  );
}

export default WishResult;
