// 예약내역

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { isLoggedInState } from "../utils/atom";
import { AirlineCodes, FlightOrder } from "../utils/api";
import axios from "axios";
import ReservationResult from "../components/revList/ReservationResult";
import { fetchAirlineCodes } from "../utils/useAirCodeData";
import { SeatClass } from "../utils/seatClass";

// ReservationList 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

// 예약내역 구성 박스
const ListBox = styled.div`
  width: 80%;
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin: 0 auto;
  padding: 10px;
  box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.2);
`;

// 제목
const MainTitle = styled.h3`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 5px;
  border-bottom: 1px solid ${(props) => props.theme.white.font};
  font-size: 24px;
  font-weight: 650;
`;

// 내역 버튼 그룹
const ListButtonGroups = styled.div``;

// 내역 버튼
const ListButton = styled.a.withConfig({
  shouldForwardProp: (prop) => !["isActive"].includes(prop),
})<{
  isActive: boolean;
}>`
  font-size: 14px;
  cursor: pointer;
  font-weight: ${(props) => (props.isActive ? 600 : 500)};
`;

// 예약내역
const RevList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// 요소 제목
const ElementTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => !["isWidth"].includes(prop),
})<{
  isWidth: string;
}>`
  display: flex;
  width: ${(props) => props.isWidth};
  justify-content: center;
  align-items: center;
  padding: 5px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid ${(props) => props.theme.white.font};
`;

// 페이지네이션 전체 구성
const PagenationContainer = styled.div`
  display: flex;
  gap: 5px;
  margin: 0 auto;
`;

// 페이지네이션 버튼 디자인 구성
const PagenationBtn = styled.button`
  background-color: ${(props) => props.theme.white.bg};
  color: ${(props) => props.theme.white.font};
  border: 1px solid ${(props) => props.theme.white.font};
  border-radius: 3px;
  padding: 10px;
  font-size: 16px;
  font-weight: 550;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
  }

  &:disabled {
    background-color: ${(props) => props.theme.black.bg};
    color: ${(props) => props.theme.black.font};
    cursor: default;
  }
`;

// FlightReservation 타입 지정
export interface FlightReservation {
  revId: number;
  revCode: string;
  userNo?: number;
  revName: string;

  airlinesIata: string;
  departureIata: string;
  departureTime: string;
  arrivalIata: string;
  arrivalTime: string;
  flightNo: string;
  turnaroundTime: string;
  stopLine: string;

  reAirlinesIata?: string;
  reDepartureIata?: string;
  reDepartureTime?: string;
  reArrivalIata?: string;
  reArrivalTime?: string;
  reFlightNo?: string;
  reTurnaroundTime?: string;
  reStopLine?: string;
  totalPrice: number;
  orders?: FlightOrder | null;

  adults?: number;
  childrens?: number;
  infants?: number;
  seatClass?: SeatClass;
  regDate: string;
}

function ReservationList() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom

  const [getRevList, setGetRevList] = useState<FlightReservation[]>([]); // 예약내역 데이터 조회 state

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출

  const [listChoice, setListChoice] = useState({
    revList: true, // 예약내역
    pastList: false, // 지난내역
  }); // 내역 선택 state

  // 예약내역/지난내역 선택에 따라 필터링
  const filteredRev = getRevList.filter((rev: FlightReservation) => {
    return listChoice.pastList
      ? new Date(rev.departureTime) <= new Date()
      : new Date(rev.departureTime) > new Date();
  });

  /* 페이지네이션 구간 시작 */

  // 페이지네이션은 이전, 다음버튼을 제외한 최대 5개 버튼을 보여준다.
  // 버튼마다 찜 데이터를 5개씩 보여준다.

  const [currentIndex, setCurrentIndex] = useState(1); // 선택한 페이지네이션 state
  const [indexGroup, setIndexGroup] = useState(1); // 페이지네이션 그룹 state

  const revPageCount = 5; // 조회되는 예약내역 데이터 & 페이지네이션 버튼 개수

  const totalRevs = Math.ceil(filteredRev.length / revPageCount); // 생성되는 페이지네이션 버튼 총 개수

  // sort(a,b) : return 값이 -1이면 a가 앞으로, 0이면 유지, 1이면 b가 앞으로 감
  // a.localeCompare(b) : 문자열 날짜를 비교해서 a가 b보다 이전이면 -1, 같으면 0, 이후면 1을 출력.
  /* ['2025-05-03', '2025-05-05', '2025-05-01'] 이 있을 때의 가정 (내림차순)
  1. 비교: '2025-05-05' vs '2025-05-03'
  '2025-05-05'.localeCompare('2025-05-03') → 양수

  즉, '2025-05-05'가 뒤 → 앞으로 정렬됨

  2. 비교: '2025-05-01' vs '2025-05-05'
  '2025-05-01'.localeCompare('2025-05-05') → 음수

  즉, '2025-05-01'이 앞 → 위치 그대로

  3. 비교: '2025-05-01' vs '2025-05-03'
  '2025-05-01'.localeCompare('2025-05-03') → 음수

  즉, '2025-05-01'이 앞 → 위치 그대로
  */
  const sortedRev = listChoice.pastList
    ? [...filteredRev].sort(
        (a, b) => b.departureTime.localeCompare(a.departureTime) // 내림차순 (a.departureTime.localeCompare(b.departureTime)으로하면 오름차순)
      )
    : filteredRev;
  // 지난내역 탭일 시 최근 예약한 내역이 앞에 표시되도록 정렬
  const currentRevData = sortedRev.slice(
    (currentIndex - 1) * revPageCount,
    currentIndex * revPageCount
  ); // 선택한 페이지네이션 번호에 따라 보여주는 예약내역 데이터 순서
  console.log(currentRevData);

  // 페이지네이션 클릭 시 동작
  const pagenationClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    e.preventDefault();
    setCurrentIndex(index);
  };

  // 그룹 이동을 위한 함수
  const goToNextGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (indexGroup * revPageCount < totalRevs) {
      setIndexGroup(indexGroup + 1);
      setCurrentIndex(indexGroup * revPageCount + 1); // 다음 그룹의 첫 페이지 번호를 currentIndex로 설정
    }
  };

  const goToPrevGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (indexGroup > 1) {
      setIndexGroup(indexGroup - 1);
      setCurrentIndex((indexGroup - 1) * revPageCount); // 이전 그룹의 마지막 페이지 번호를 currentIndex로 설정
    }
  };

  /* 페이지네이션 구간 끝 */

  // 예약내역 데이터 가져오기
  const reservationListData = async () => {
    const accessToken = localStorage.getItem("accessToken"); // 회원 번호 추출을 위해 accessToken 추출
    if (accessToken) {
      try {
        const revResponse = await axios.post(
          `http://localhost:8080/user/getRevList`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(revResponse.data);
        setGetRevList(revResponse.data);
      } catch (error) {
        console.error("예약내역 데이터 가져오기 실패 : ", error);
      }
    }
  };

  // 초기 렌더링 시 실행
  useEffect(() => {
    if (isLoggedIn) {
      reservationListData(); // 예약내역 데이터 출력 함수
      // 항공편 데이터 추출
      const airCodeFetch = async () => {
        const airlineCodes = await fetchAirlineCodes();

        setAirlineCodeOffers(airlineCodes); // 항공사 코드
      };
      airCodeFetch();
    }
  }, []);

  useEffect(() => {
    if (getRevList.length > 0) {
      console.log(getRevList);
    }
  }, [getRevList]);

  const ListChoice = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { id } = e.currentTarget;

    setListChoice({
      revList: id === "revList" ? true : false,
      pastList: id === "pastList" ? true : false,
    });

    // 내역 변경 시 페이지네이션 처음으로 돌아감
    setCurrentIndex(1);
    setIndexGroup(1);
  };

  return (
    <Container>
      <ListBox>
        <MainTitle>예약내역</MainTitle>

        {/* 내역 버튼 */}
        <ListButtonGroups>
          <ListButton
            isActive={listChoice.revList}
            id="revList"
            onClick={ListChoice}
          >
            예약내역
          </ListButton>{" "}
          |{" "}
          <ListButton
            isActive={listChoice.pastList}
            id="pastList"
            onClick={ListChoice}
          >
            지난내역
          </ListButton>
        </ListButtonGroups>

        {/* 예약내역 */}
        <RevList>
          <div style={{ display: "flex" }}>
            <ElementTitle isWidth={"16%"}>예약날짜/예약코드</ElementTitle>
            <ElementTitle isWidth={"30%"}>항공편</ElementTitle>
            <ElementTitle isWidth={"13%"}>출국일/귀국일</ElementTitle>
            <ElementTitle isWidth={"15%"}>인원/좌석등급</ElementTitle>
            <ElementTitle isWidth={"11%"}>결제금액</ElementTitle>
            <ElementTitle isWidth={listChoice.revList ? "10%" : "15%"} />
            {listChoice.revList && <ElementTitle isWidth={"5%"} />}
          </div>

          {/* 예약내역/지난내역 선택 여부에 따라 filteredRev로 필터링 */}
          {filteredRev.length > 0 ? (
            currentRevData.map((rev: FlightReservation) => (
              <ReservationResult
                key={rev.revId}
                rev={rev}
                airlineCodeOffers={airlineCodeOffers}
                setGetRevList={setGetRevList}
                listChoice={{
                  revList: listChoice.revList,
                  pastList: listChoice.pastList,
                }}
              />
            ))
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "370px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              예약내역이 존재하지 않습니다.
            </div>
          )}
        </RevList>

        {/* 페이지네이션 구간 */}
        <PagenationContainer>
          {/* 이전 버튼 */}
          {indexGroup > 1 && (
            <PagenationBtn onClick={(e) => goToPrevGroup(e)}>
              &lt;&lt;
            </PagenationBtn>
          )}

          {/* 페이지네이션 번호 구성 */}
          {[...Array(revPageCount)].map((_, index) => {
            const page = (indexGroup - 1) * revPageCount + (index + 1);
            if (page <= totalRevs) {
              return (
                <PagenationBtn
                  key={page}
                  onClick={(e) => pagenationClick(e, page)}
                  disabled={currentIndex === page}
                >
                  {page}
                </PagenationBtn>
              );
            }
            return null;
          })}

          {/* 다음 버튼 */}
          {indexGroup * revPageCount < totalRevs && (
            <PagenationBtn onClick={(e) => goToNextGroup(e)}>
              &gt;&gt;
            </PagenationBtn>
          )}
        </PagenationContainer>
      </ListBox>
    </Container>
  );
}

export default ReservationList;
