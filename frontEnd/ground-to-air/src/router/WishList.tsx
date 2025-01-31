// 찜 내역
import { useEffect, useState } from "react";
import styled from "styled-components";
import { isLoggedInState } from "../utils/atom";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { FlightWish } from "./FlightSearch";
import { AirlineCodes } from "../utils/api";
import WishResult from "../components/wish/WishResult";

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
  min-height: 550px;
  margin: 0 auto;
`;

// 제목 구간 전체 구성
const Header = styled.div`
  display: flex;
  justify-content: center;
`;

// 테이블 전체 구성
const TableContainer = styled.div`
  min-height: 450px;
  margin: 0 auto;
`;

// 제목 디자인
const MainTitle = styled.h3`
  color: ${(props) => props.theme.white.font};
  font-size: 25px;
  font-weight: 600;
  text-align: center;
  margin: 10px 0;
`;

// 테이블 전체
const MainTable = styled.table`
  border: 2px solid ${(props) => props.theme.white.font};
  border-collapse: collapse;
`;

// 테이블 제목열
const TableHeader = styled.th`
  border-bottom: 2px solid ${(props) => props.theme.white.font};
  border-right: 1px solid ${(props) => props.theme.white.font};
  padding: 5px;
  font-weight: 600;
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
      setCurrentIndex(indexGroup * wishPageCount + 1); // 현재 그룹의 마지막 페이지 번호를 currentIndex로 설정
    }
  };

  const goToPrevGroup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (indexGroup > 1) {
      setIndexGroup(indexGroup - 1);
      setCurrentIndex((indexGroup - 1) * wishPageCount); // 이전 그룹의 첫 번째 페이지 번호를 currentIndex로 설정
    }
  };

  /* 페이지네이션 구간 끝 */

  // 찜 데이터 가져오기
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

  // 항공사 코드 가져오기
  const airlineCodeData = async () => {
    const airlineCodeResponse = await axios.get(
      `http://localhost:8080/air/airlineCode`
    );
    setAirlineCodeOffers(airlineCodeResponse.data); // 항공사 코드
  };

  // 초기 렌더링 시 실행
  useEffect(() => {
    if (isLoggedIn) {
      wishListData(); // 찜 데이터 출력 함수
      airlineCodeData(); // 항공사 로고 데이터 출력 함수
    }
  }, []);

  return (
    <Container>
      <Card>
        <Header>
          <MainTitle>찜 내역</MainTitle>
        </Header>
        <TableContainer>
          <MainTable>
            <thead>
              <tr>
                <TableHeader>항공편</TableHeader>
                <TableHeader>출국일/귀국일</TableHeader>
                <TableHeader>인원/좌석등급</TableHeader>
                <TableHeader>결제금액</TableHeader>
                {getWish.length >= 1 && <TableHeader colSpan={2}></TableHeader>}
              </tr>
            </thead>
            <tbody>
              {getWish.length < 1 ? (
                <tr>
                  <td colSpan={4}>
                    <div
                      style={{
                        height: "370px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "20px",
                        fontWeight: "600",
                      }}
                    >
                      찜 내역이 존재하지 않습니다.
                    </div>
                  </td>
                </tr>
              ) : (
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
              )}
            </tbody>
          </MainTable>
        </TableContainer>

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
