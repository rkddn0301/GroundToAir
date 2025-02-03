import styled from "styled-components";
import { formatDuration, formatTime } from "../../utils/formatTime";
import { AirlineCodes, FlightOffer, IataCodes } from "../../utils/api";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../../utils/atom";
import { Alert } from "../../utils/sweetAlert";
import { FlightWish } from "../../router/FlightSearch";
import { Link } from "react-router-dom";

// FlightResult 전체 컴포넌트 구성
const Banner = styled.div`
  width: 70%;
  max-height: 250px;
  display: flex;
  // flex-direction: column;
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  margin: 0 10% 0 23%;
  box-shadow: 3px 2px 4px rgba(0, 0, 0, 0.2); // 그림자 순서 : x축, y축, 흐림효과, 색상
  //border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 25px;
  padding: 25px;
  margin-bottom: 20px;
  gap: 25px;
`;

// FlightInfo 왕복 컴포넌트 구성
const FlightInfoGroups = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: space-around;
  align-items: center;
`;

/*
* flex : {flex-grow} {flex-shrink} {flex-basis}
* flex-grow : flex-basis 크기를 기준으로 안에 있는 자식끼리 주어진 비율에 따라 나눔.
--> 부모 크기가 자식들의 기본 크기(flex-basis)보다 클 때 작동.
* flex-shrink : 부모 크기가 자식들의 기본 크기(flex-basis)보다 작을 때 축소
--> 단, flex-basis가 %면 어짜피 축소되기 때문에 영향 받지 않음.
EX) ((flex-basis * 자식개수) - 부모 크기) / 자식개수
* flex-basis : 부모 크기를 얼마나 차지할지 정함
*/
// 항공 정보 디자인 구성
const FlightInfo = styled.div`
  width: 100%;
  //flex: 1 0 27.5%;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

// 항공 예약 관련 디자인 구성
const ReservationDetails = styled.div`
  width: 25%;
  //flex: 0 0 5%;
  display: flex;
  justify-content: center;
  //padding: 5px 10px 0 0;
`;

// 항공사 라인
const Airline = styled.div`
  width: 30%;
`;

// 출발지
const OriginLine = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

// 도착지
const DestinationLine = styled.div`
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

// 중간라인(소요시간, 경유지) 구성
const MiddleInfoLine = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

// 항공사 정보 관련 디자인 구성
const AirlineCode = styled.div`
  font-size: 12px;
`;

// 출발지/도착지 공항 코드 디자인 구성
const IataCode = styled.div`
  font-weight: 600;
`;

// 경유지 라인
const StopLine = styled.div`
  position: relative;
  width: 100%;
  border: 1px solid ${(props) => props.theme.white.font};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 50%;
`;

// 경유지 여부에 따라 생성되는 원형 디자인
const StopLineCircle = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: ${(props) => props.theme.white.font};
  border-radius: 50%;
  z-index: 1;
`;

// 경유지 툴팁 구성 디자인
const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%; // left+transform 을 통해 Tooltip을 출력시키는 부모 요소의 수평 중앙에 위치
  transform: translateX(-50%);
  background-color: ${(props) => props.theme.black.bg};
  color: ${(props) => props.theme.black.font};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 10;
  margin-top: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1.2; // 글자 사이의 간격
`;

// 예약 버튼 그룹 디자인
const ReservationBtnGroups = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
`;

// 예약 버튼 디자인
const ReservationBtn = styled.button`
  padding: 10px;
  background-color: skyblue;
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }
`;

// 아이콘 디자인
const Icon = styled.svg`
  width: 24px;
`;

// 조회 결과 컴포넌트에 필요한 props
interface FlightResultProps {
  offer: FlightOffer;
  dictionaries: {
    carriers: { [key: string]: string };
  };
  airlineCodeOffers: AirlineCodes[]; // 항공사 코드 DB
  iataCodeOffers: IataCodes[]; // 공항 코드 DB
  showTooltip: {
    [index: number]: {
      departureDate: boolean;
      returnDate: boolean;
      departureCodeshare: boolean;
      returnCodeshare: boolean;
    };
  }; // offer.id는 이미 부모 컴포넌트에서 선언하여 보냈기 때문에 자식 컴포넌트에서는 index부터 선언
  setShowTooltip: (
    field:
      | "departureDate"
      | "returnDate"
      | "departureCodeshare"
      | "returnCodeshare",
    index: number,
    value: boolean
  ) => void; // field를 value로 업데이트만 해주면 showTooltip으로 확인할 수 있어서 미반환 처리
  isWish: boolean; // 찜 상태 업데이트 후 출력
  setIsWish: () => void; // 찜 상태를 단순히 함수 방식으로만 업데이트하고 나머지는 부모가 처리
  setWishReg: React.Dispatch<React.SetStateAction<FlightWish>>; // 찜 데이터를 형식에 맞게 삽입하여 부모에게 전송
}

function FlightResult({
  offer,
  dictionaries,
  airlineCodeOffers,
  iataCodeOffers,
  showTooltip,
  setShowTooltip,
  isWish,
  setIsWish,
  setWishReg,
}: FlightResultProps) {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 확인

  // 가는날

  const operatingCode =
    offer.itineraries?.[0]?.segments?.[0]?.operating?.carrierCode; // 운항 항공사

  const validatingCode = offer.itineraries[0]?.segments[0]?.carrierCode; // 판매 항공사

  /*
   * 항공사 로고 로직
   * 1. matchesIata, isLogoValid가 일치하는 값이 나올 때까지 진행
   * 2. matchesIata : 항공사 테이블(airlineCodeOffers)에서 일치하는 항공사 코드랑 일치하는지 확인
   * 3. isLogoValid : 항공사 테이블에서 일치하는 로고가 있는지 확인
   */
  const carrierCodeLogo =
    airlineCodeOffers.find((airline) => {
      // 판매항공사를 carrierCode로 대체 (12/10)
      const matchesIata = airline.iata === validatingCode || "";

      /* 운항항공사
     const matchesIata =
        airline.iata ===
          offer.itineraries[0]?.segments[0]?.operating?.carrierCode ||
        airline.iata ===
          offer.itineraries[0]?.segments[
            offer.itineraries[0]?.segments.length - 1
          ]?.operating?.carrierCode ||
        ""; */

      /* 판매항공사
       const matchesValidatingAirline =
        offer.validatingAirlineCodes?.includes(airline.iata) || ""; */

      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || ""; // 기본값을 객체로 설정

  const airlineCode = `${
    offer.itineraries?.[0]?.segments?.[0]?.carrierCode || ""
  }${offer.itineraries?.[0]?.segments?.[0]?.number || ""}`; // 항공편 번호
  /*  const returnAirlineCode = `${
    offer.itineraries?.[1]?.segments?.[0]?.carrierCode || ""
  }${offer.itineraries?.[1]?.segments?.[0]?.number || ""}`; */
  /* 최종 출발 항공편(경유지까지 고려한 코드로 나중에 필요 시 이용)
  
  `${
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.carrierCode
  }${
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.number
  }`;  */

  const departureTime = formatTime(
    offer.itineraries[0]?.segments[0]?.departure?.at
  ); // 출발시간
  const arrieveTime = formatTime(
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.arrival?.at
  ); // 도착시간

  const originLocationCode =
    offer.itineraries[0]?.segments[0]?.departure?.iataCode; // 출발지 공항코드
  const destinationLocationCode =
    offer.itineraries[0]?.segments[offer.itineraries[0]?.segments.length - 1]
      ?.arrival?.iataCode; // 도착지 공항코드

  const duration = formatDuration(offer.itineraries[0]?.duration); // 소요시간
  const numberOfStops = offer.itineraries[0]?.segments.length - 1; // 경유지 수
  const airportStopover = offer.itineraries[0]; // 경유지 공항코드

  // 오는날

  const returnOperatingCode =
    offer.itineraries?.[1]?.segments?.[0]?.operating?.carrierCode; // 운항 항공사

  const returnValidatingCode = offer.itineraries[1]?.segments[0]?.carrierCode; // 판매 항공사

  const returnCarrierCodeLogo =
    airlineCodeOffers.find((airline) => {
      // 판매항공사를 carrierCode로 대체 (12/10)
      const matchesIata = airline.iata === returnValidatingCode || "";

      /* 운항항공사
      const matchesIata =
        airline.iata ===
          offer.itineraries[1]?.segments[0]?.operating?.carrierCode ||
        airline.iata ===
          offer.itineraries[1]?.segments[
            offer.itineraries[1]?.segments.length - 1
          ]?.operating?.carrierCode ||
        ""; */

      /* 판매항공사
       const matchesValidatingAirline =
        offer.validatingAirlineCodes?.includes(airline.iata) || ""; */

      const isLogoValid =
        airline.airlinesLogo &&
        airline.airlinesLogo.split("images/")[1] !== "pop_sample_img03.gif";

      return matchesIata && isLogoValid;
    }) || "";

  const returnAirlineCode = `${
    offer.itineraries?.[1]?.segments?.[0]?.carrierCode || ""
  }${offer.itineraries?.[1]?.segments?.[0]?.number || ""}`; // 항공편 번호
  /* 최종 출발 항공편(경유지까지 고려한 코드로 나중에 필요 시 이용)
  
  `${
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.carrierCode
  }${
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.number
  }`; */

  const returnDepartureTime = formatTime(
    offer.itineraries[1]?.segments[0]?.departure?.at
  ); // 출발시간

  const returnArrieveTime = formatTime(
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.arrival?.at
  ); // 도착시간

  const returnOriginLocationCode =
    offer.itineraries[1]?.segments[0]?.departure?.iataCode; // 출발지 공항코드
  const returnDestinationLocationCode =
    offer.itineraries[1]?.segments[offer.itineraries[1]?.segments.length - 1]
      ?.arrival?.iataCode; // 도착지 공항코드

  const returnDuration = formatDuration(offer.itineraries[1]?.duration); // 소요시간
  const returnNumberOfStops = offer.itineraries[1]?.segments.length - 1; // 경유지 수
  const returnAirportStopover = offer.itineraries[1]; // 경유지 공항코드

  // 공통
  // const numberOfBookableSeats = offer.numberOfBookableSeats; // 예약 가능한 좌석
  const totalPrice = offer.price.total; // 총 가격

  // 공동운항 툴팁
  const getAirlineTooltip = (carrierCode: string | undefined): string => {
    // carrierCode가 undefined일 경우 처리
    if (!carrierCode) {
      return "알 수 없음"; // carrierCode가 없으면 기본값으로 "알 수 없음" 반환
    }

    // 항공사 코드와 일치하는 데이터 필터링
    const airline = airlineCodeOffers.filter(
      (item) => item.iata === carrierCode
    );

    // 2개 이상일 경우 : 공항코드가 겹치므로 아래 조건에 따름
    if (airline.length > 1) {
      const dictionariesCarrier = dictionaries?.carriers?.[carrierCode] ?? ""; // undefined일 경우 빈 문자열로 처리

      // API 데이터의 항공사명과 비교하여 일치하는 항공사명 추출
      let matchingAirline = airline.find(
        (matchingAirline) =>
          matchingAirline.airlines.trim().toLowerCase() ===
          dictionariesCarrier.trim().toLowerCase()
      );

      if (matchingAirline) {
        return matchingAirline.airlinesKor;
      }
    }
    // 1개 일 경우 : 추출된 코드 그대로 출력
    else if (airline.length === 1) {
      return airline[0].airlinesKor;
    }

    // 항공사가 없을 경우 : '알 수 없음'으로 처리
    return "알 수 없음";
  };

  // 찜 버튼 클릭 시 항공 데이터를 부모 컴포넌트 state(setWish)에게 보냄
  const wishListUpdate = async () => {
    // 로그인 여부 확인
    if (isLoggedIn) {
      // 로그인 o
      setIsWish(); // 아이콘 상태 스위칭
      setWishReg((prev: FlightWish) => ({
        ...prev,
        // 가는편
        airlinesIata: validatingCode || "",
        departureIata: originLocationCode || "",
        departureTime:
          offer.itineraries?.[0]?.segments?.[0]?.departure?.at || "",
        arrivalIata: destinationLocationCode || "",
        arrivalTime:
          offer.itineraries?.[0]?.segments?.[
            offer.itineraries?.[0]?.segments?.length - 1
          ]?.arrival?.at || "",
        flightNo: airlineCode || "",
        turnaroundTime: offer.itineraries?.[0]?.duration || "",
        stopLine:
          numberOfStops === 0
            ? "직항"
            : numberOfStops
            ? `${numberOfStops}회 경유`
            : "",

        // 오는편
        reAirlinesIata: returnValidatingCode || "",
        reDepartureIata: returnOriginLocationCode || "",
        reDepartureTime:
          offer.itineraries?.[1]?.segments?.[0]?.departure?.at || "",
        reArrivalIata: returnDestinationLocationCode || "",
        reArrivalTime:
          offer.itineraries?.[1]?.segments?.[
            offer.itineraries?.[1]?.segments?.length - 1
          ]?.arrival?.at || "",
        reFlightNo: returnAirlineCode || "",
        reTurnaroundTime: offer.itineraries?.[1]?.duration || "",
        reStopLine:
          returnNumberOfStops === 0
            ? "직항"
            : returnNumberOfStops
            ? `${returnNumberOfStops}회 경유`
            : "",

        totalPrice: parseInt(totalPrice) || 0,
      }));
    } else {
      // 로그인 x
      const sessionOutAlert = await Alert(
        "로그인이 필요한 기능입니다.",
        "info"
      );
      if (sessionOutAlert.isConfirmed) {
        window.location.href = "/login"; // 로그인 페이지로 이동
      }
    }
  };

  return (
    <Banner key={offer.id}>
      <FlightInfoGroups>
        <FlightInfo>
          <Airline>
            {carrierCodeLogo !== "" ? (
              <img src={carrierCodeLogo.airlinesLogo} />
            ) : (
              <>
                {
                  dictionaries.carriers[
                    offer.itineraries[0]?.segments[0]?.carrierCode || ""
                  ]
                }
                {/* 운항항공사
                {
                  dictionaries.carriers[
                    offer.itineraries[0]?.segments[
                      offer.itineraries[0]?.segments.length - 1
                    ]?.operating?.carrierCode || ""
                  ]
                } */}

                {/* 판매항공사
                   {dictionaries.carriers[
                    offer.validatingAirlineCodes?.[0] || ""
                  ] || ""} */}
              </>
            )}

            <AirlineCode>
              <span>{airlineCode}</span>
              {operatingCode !== validatingCode && (
                <span
                  style={{ position: "relative" }}
                  onMouseEnter={() =>
                    setShowTooltip("departureCodeshare", 0, true)
                  }
                  onMouseLeave={() =>
                    setShowTooltip("departureCodeshare", 0, false)
                  }
                >
                  {" "}
                  공동운항{" "}
                  {showTooltip[0]?.departureCodeshare && (
                    <Tooltip>
                      실제운항 : {getAirlineTooltip(operatingCode)}
                    </Tooltip>
                  )}
                </span>
              )}
            </AirlineCode>
          </Airline>
          <OriginLine>
            {departureTime}
            <div style={{ fontWeight: "600" }}>{originLocationCode}</div>
          </OriginLine>
          <MiddleInfoLine>
            {duration}

            <StopLine>{numberOfStops > 0 && <StopLineCircle />}</StopLine>
            {/* EX) 5번째 offer.id에 첫 번째 경유지를 가는편인 곳에 마우스를 갖다댔을 경우
                {
                    "5": {
                        "0": {
                            "departureDate": true
                        }
                    }
                }
            */}
            <div style={{ position: "relative" }}>
              {numberOfStops === 0 ? (
                "직항"
              ) : (
                <>
                  {`${numberOfStops}회 경유`}{" "}
                  {airportStopover.segments.map(
                    (segments: any, index: number) =>
                      index < numberOfStops ? (
                        <span
                          key={index}
                          onMouseEnter={() =>
                            setShowTooltip("departureDate", index, true)
                          }
                          onMouseLeave={() =>
                            setShowTooltip("departureDate", index, false)
                          }
                        >
                          {segments.arrival.iataCode}{" "}
                          {showTooltip[index]?.departureDate &&
                            iataCodeOffers
                              .filter(
                                (iata) =>
                                  iata.iata === segments.arrival.iataCode
                              )
                              .map((filteredIata, i) => (
                                <Tooltip key={i}>
                                  {filteredIata.airportKor}
                                </Tooltip>
                              ))}
                        </span>
                      ) : null
                  )}
                </>
              )}
            </div>
          </MiddleInfoLine>
          <DestinationLine>
            {arrieveTime}
            <IataCode>{destinationLocationCode}</IataCode>
          </DestinationLine>
        </FlightInfo>

        {/* 왕복일경우 */}
        {offer.itineraries[1] && (
          <FlightInfo>
            <Airline>
              {returnCarrierCodeLogo !== "" ? (
                <img src={returnCarrierCodeLogo.airlinesLogo} />
              ) : (
                <>
                  {
                    dictionaries.carriers[
                      offer.itineraries[1]?.segments[0]?.carrierCode || ""
                    ]
                  }
                  {/* 운항항공사 
                   {
                    dictionaries.carriers[
                      offer.itineraries[1]?.segments[
                        offer.itineraries[1]?.segments.length - 1
                      ]?.operating?.carrierCode || ""
                    ]
                  } */}
                  {/* 판매항공사
                   {dictionaries.carriers[
                    offer.validatingAirlineCodes?.[0] || ""
                  ] || ""} */}
                </>
              )}
              <AirlineCode>
                <span>{returnAirlineCode}</span>

                {returnOperatingCode !== returnValidatingCode && (
                  <span
                    style={{ position: "relative" }}
                    onMouseEnter={() =>
                      setShowTooltip("returnCodeshare", 0, true)
                    }
                    onMouseLeave={() =>
                      setShowTooltip("returnCodeshare", 0, false)
                    }
                  >
                    {" "}
                    공동운항{" "}
                    {showTooltip[0]?.returnCodeshare && (
                      <Tooltip>
                        실제운항 : {getAirlineTooltip(returnOperatingCode)}
                      </Tooltip>
                    )}
                  </span>
                )}
              </AirlineCode>
            </Airline>
            <OriginLine>
              {returnDepartureTime}
              <div style={{ fontWeight: "600" }}>
                {returnOriginLocationCode}
              </div>
            </OriginLine>
            <MiddleInfoLine>
              {returnDuration}

              <StopLine>
                {returnNumberOfStops > 0 && <StopLineCircle />}
              </StopLine>

              <div>
                {returnNumberOfStops === 0 ? (
                  "직항"
                ) : (
                  <div style={{ position: "relative" }}>
                    {`${returnNumberOfStops}회 경유`}{" "}
                    {returnAirportStopover.segments.map(
                      (segments: any, index: any) =>
                        index < returnNumberOfStops ? (
                          <span
                            key={index}
                            onMouseEnter={() =>
                              setShowTooltip("returnDate", index, true)
                            }
                            onMouseLeave={() =>
                              setShowTooltip("returnDate", index, false)
                            }
                          >
                            {segments.arrival.iataCode}{" "}
                            {showTooltip[index]?.returnDate &&
                              iataCodeOffers
                                .filter(
                                  (iata) =>
                                    iata.iata === segments.arrival.iataCode
                                )
                                .map((filteredIata, i) => (
                                  <Tooltip key={i}>
                                    {filteredIata.airportKor}
                                  </Tooltip>
                                ))}
                          </span>
                        ) : null
                    )}
                  </div>
                )}
              </div>
            </MiddleInfoLine>
            <DestinationLine>
              {returnArrieveTime}
              <IataCode>{returnDestinationLocationCode}</IataCode>
            </DestinationLine>
          </FlightInfo>
        )}
      </FlightInfoGroups>

      <ReservationDetails>
        {/* <div style={{ fontSize: "12px" }}>{numberOfBookableSeats}석 남음</div> */}

        <ReservationBtnGroups>
          <Link
            to={{
              pathname: `/reservationDetail/${offer.id}`,
              state: { offer },
            }}
          >
            <ReservationBtn>예약하기</ReservationBtn>
          </Link>
          <div style={{ fontWeight: 600 }}>{`\\${new Intl.NumberFormat().format(
            parseFloat(totalPrice)
          )}`}</div>
        </ReservationBtnGroups>
        <div>
          {isWish ? (
            <Icon
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
              style={{ cursor: "pointer" }}
              onClick={wishListUpdate}
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </Icon>
          ) : (
            <Icon
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
              style={{ cursor: "pointer" }}
              onClick={wishListUpdate}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </Icon>
          )}
        </div>
      </ReservationDetails>
    </Banner>
  );
}

export default FlightResult;
