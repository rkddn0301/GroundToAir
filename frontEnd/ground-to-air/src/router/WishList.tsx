// 찜 내역
import { useEffect, useState } from "react";
import styled from "styled-components";
import { isLoggedInState } from "../utils/atom";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { FlightWish } from "./FlightSearch";
import { AirlineCodes } from "../utils/api";
import WishResult from "../components/wish/WishResult";
import { fetchAirlineCodes } from "../utils/useAirCodeData";
import { errors } from "../utils/logger";

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
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.white.bg};
  border-radius: 5px;
  min-width: 80%;
  margin: 0 auto;
  gap: 10px;
  padding: 10px;
`;

// 제목 구간 전체 구성
const Header = styled.div`
  display: flex;
  justify-content: center;
`;

// 찜 내역 구성
const WishLists = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// 제목 디자인
const MainTitle = styled.h3`
  color: ${(props) => props.theme.white.font};
  font-size: 25px;
  font-weight: 600;
  text-align: center;
  margin: 10px 0;
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

function WishList() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom

  const [getWish, setGetWish] = useState<FlightWish[]>([]); // 찜 데이터 조회 state

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출

  /* 페이지네이션 구간 시작 */

  // 페이지네이션은 이전, 다음버튼을 제외한 최대 5개 버튼을 보여준다.
  // 버튼마다 찜 데이터를 5개씩 보여준다.

  const [currentIndex, setCurrentIndex] = useState(1); // 선택한 페이지네이션 state
  const [indexGroup, setIndexGroup] = useState(1); // 페이지네이션 그룹 state

  const wishPageCount = 5; // 조회되는 찜 데이터 & 페이지네이션 버튼 개수

  const totalWishes = Math.ceil(getWish.length / wishPageCount); // 생성되는 페이지네이션 버튼 총 개수

  const currentWishData = getWish.slice(
    (currentIndex - 1) * wishPageCount,
    currentIndex * wishPageCount
  ); // 선택한 페이지네이션 번호에 따라 보여주는 찜 데이터 순서

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
    if (indexGroup * wishPageCount < totalWishes) {
      setIndexGroup(indexGroup + 1);
      setCurrentIndex(indexGroup * wishPageCount + 1); // 다음 그룹의 첫 페이지 번호를 currentIndex로 설정
    }
  };

  const goToPrevGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (indexGroup > 1) {
      setIndexGroup(indexGroup - 1);
      setCurrentIndex((indexGroup - 1) * wishPageCount); // 이전 그룹의 마지막 페이지 번호를 currentIndex로 설정
    }
  };

  /* 페이지네이션 구간 끝 */

  // 찜 데이터 가져오기
  const wishListData = async () => {
    const accessToken = localStorage.getItem("accessToken"); // 회원 번호 추출을 위해 accessToken 추출
    if (accessToken) {
      try {
        const wishResponse = await axios.post(
          `http://localhost:8080/reservation/getWish`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setGetWish(wishResponse.data);
      } catch (error) {
        errors("위시리스트 데이터 가져오기 실패 : ", error);
      }
    }
  };

  // 초기 렌더링 시 실행
  useEffect(() => {
    if (isLoggedIn) {
      wishListData(); // 찜 데이터 출력 함수
      // 항공편 데이터 추출
      const airCodeFetch = async () => {
        const airlineCodes = await fetchAirlineCodes();
        setAirlineCodeOffers(airlineCodes); // 항공사 코드
      };
      airCodeFetch();
    }
  }, []);

  return (
    <Container>
      <Card>
        <Header>
          <MainTitle>찜 내역</MainTitle>
        </Header>
        <WishLists>
          <div style={{ display: "flex" }}>
            <ElementTitle isWidth={"46%"}>항공편</ElementTitle>
            <ElementTitle isWidth={"13%"}>출국일/귀국일</ElementTitle>
            <ElementTitle isWidth={"15%"}>인원/좌석등급</ElementTitle>
            <ElementTitle isWidth={"11%"}>결제금액</ElementTitle>
            <ElementTitle isWidth={"10%"} />
            <ElementTitle isWidth={"5%"} />
          </div>
          {getWish.length > 0 ? (
            <>
              {currentWishData.map((wish) => (
                <WishResult
                  key={wish.wishNo}
                  wish={wish}
                  setGetWish={setGetWish}
                  airlineCodeOffers={airlineCodeOffers}
                />
              ))}
            </>
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
              찜 내역이 존재하지 않습니다.
            </div>
          )}
        </WishLists>

        {/* 페이지네이션 구간 */}
        <PagenationContainer>
          {/* 이전 버튼 */}
          {indexGroup > 1 && (
            <PagenationBtn onClick={(e) => goToPrevGroup(e)}>
              &lt;&lt;
            </PagenationBtn>
          )}

          {/* 페이지네이션 번호 구성 */}
          {[...Array(wishPageCount)].map((_, index) => {
            const page = (indexGroup - 1) * wishPageCount + (index + 1);
            if (page <= totalWishes) {
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
          {indexGroup * wishPageCount < totalWishes && (
            <PagenationBtn onClick={(e) => goToNextGroup(e)}>
              &gt;&gt;
            </PagenationBtn>
          )}
        </PagenationContainer>
      </Card>
    </Container>
  );
}

export default WishList;
