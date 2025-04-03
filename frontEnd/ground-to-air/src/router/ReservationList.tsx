// 예약내역

import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { isLoggedInState } from "../utils/atom";
import { AirlineCodes } from "../utils/api";
import axios from "axios";

// ReservationList 전체 컴포넌트 구성
const Container = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;
`;

function ReservationList() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom

  const [getRevList, setGetRevList] = useState([]); // 예약내역 데이터 조회 state

  const [airlineCodeOffers, setAirlineCodeOffers] = useState<AirlineCodes[]>(
    []
  ); // 항공사 코드 추출

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
      reservationListData(); // 예약내역 데이터 출력 함수
      airlineCodeData(); // 항공사 로고 데이터 출력 함수
    }
  }, []);

  useEffect(() => {
    if (getRevList.length >= 1) {
      console.log(getRevList);
    }
  }, [getRevList]);

  return (
    <Container>
      {/* 박스 */}
      <div
        style={{
          width: "80%",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          margin: "0 auto",
          padding: "10px",
        }}
      >
        {/* 제목 */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: "5px",
            borderBottom: "1px solid #595959",
          }}
        >
          <h3 style={{ fontSize: "24px", fontWeight: "650" }}>예약내역</h3>
        </div>

        {/* 내역 버튼 */}
        <div>
          <a>예약내역</a> | <a>지난내역</a>
        </div>

        {/* 예약내역 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                width: "16%",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid #595959",
              }}
            >
              예약날짜/예약코드
            </div>
            <div
              style={{
                display: "flex",
                width: "30%",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid #595959",
              }}
            >
              항공편
            </div>
            <div
              style={{
                display: "flex",
                width: "15%",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid #595959",
              }}
            >
              출국일/귀국일
            </div>
            <div
              style={{
                display: "flex",
                width: "15%",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid #595959",
              }}
            >
              인원/좌석등급
            </div>
            <div
              style={{
                display: "flex",
                width: "10%",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid #595959",
              }}
            >
              결제금액
            </div>
            <div
              style={{
                width: "10%",
                border: "1px solid #595959",
              }}
            ></div>
            <div
              style={{
                width: "5%",
                border: "1px solid #595959",
              }}
            ></div>
          </div>
          <div style={{ display: "flex", width: "100%" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "16%",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #595959",
                gap: "2px",
                fontSize: "80%",
                padding: "5px",
                wordBreak: "break-word",
              }}
            >
              <span>2025-02-20</span>
              <span>GTA20250301GSAD13</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "30%",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #595959",
                fontSize: "80%",
                padding: "5px",
              }}
            >
              <span>아시아나항공 GMP-KIX 오후 10:10~오후 11:55</span>
              <span>아시아나항공 KIX-GMP 오후 10:10~오후 11:55</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "15%",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #595959",
                fontSize: "80%",
                padding: "5px",
              }}
            >
              <span>2025-04-05</span>
              <span>~</span>
              <span>2025-04-06</span>
            </div>
            <div
              style={{
                display: "flex",
                width: "15%",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #595959",
                fontSize: "80%",
                padding: "5px",
              }}
            >
              <span>1명 / 비즈니스석</span>
            </div>
            <div
              style={{
                display: "flex",
                width: "10%",
                justifyContent: "center",
                alignItems: "center",
                border: "1px solid #595959",
                fontSize: "80%",
                padding: "5px",
              }}
            >
              \1,029,300
            </div>
            <div
              style={{
                width: "10%",
                border: "1px solid #595959",
              }}
            >
              <button
                style={{ width: "100%", height: "100%", fontSize: "9px" }}
              >
                예약상세확인
              </button>
            </div>
            <div
              style={{
                width: "5%",
                border: "1px solid #595959",
              }}
            >
              <button
                style={{ width: "100%", height: "100%", fontSize: "12px" }}
              >
                X
              </button>
            </div>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div>
          <button>1</button>
        </div>
      </div>
    </Container>
  );
}

export default ReservationList;
