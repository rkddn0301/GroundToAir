import React, { useEffect } from "react";
import FlightSearch, { encryptionKey } from "./router/FlightSearch";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import Join from "./router/Join";
import styled from "styled-components";
import Footer from "./components/Footer";
import JoinInfo from "./router/JoinInfo";
import Login from "./router/Login";
import PassportInfo from "./router/PassportInfo";
import { resetInactivityTimer } from "./utils/jwtActivityTimer";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "./utils/atom";
import PwFind from "./router/PwFind";
import IdFind from "./router/IdFind";
import MyInfo from "./router/MyInfo";
import ProtectedRoute from "./components/ProtectedRoute";
import WishList from "./router/WishList";
import PaymentResult from "./components/payment/PaymentResult";
import FlightReservation from "./components/flight/reservation/FlightReservation";
import TravelerInfo from "./components/flight/reservation/TravelerInfo";
import CryptoJS from "crypto-js";
import FlightReservationComplete from "./components/flight/reservation/FlightReservationComplete";
import ReservationDetail from "./router/ReservationDetail";
import GuestReservationList from "./router/GuestReservationList";
import ReservationList from "./router/ReservationList";

// 전체 컴포넌트를 구성
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; // 페이지 최소 높이를 150vh로 변경
  padding-top: 114px;
  background: transparent;
  background-image: none;
`;

// 비디오 컴포넌트
const VideoContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${(props) => props.theme.background};
  z-index: -2;
`;

// Layout, Footer 사이에 있는 Main div 태그
const MainContent = styled.main`
  flex: 1; /* 남은 공간을 모두 차지하도록 설정 */
`;

let debounceTimer: NodeJS.Timeout; // 타이머 연속 호출 방지 타이머

function App() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom
  const expirationTime = CryptoJS.AES.decrypt(
    localStorage.getItem("expirationTime") || "",
    encryptionKey
  ).toString(CryptoJS.enc.Utf8); // 토큰 만료시간 localStorage

  // 전체 사이트에서 활동/비활동에 따라 세션 유지 여부를 결정
  useEffect(() => {
    if (!isLoggedIn) return; // 로그인 된 상태에서만 동작

    // 활동 시 동작
    const events = ["click", "keydown", "scroll"]; // 클릭, 키보드, 스크롤
    const resetTimer = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        resetInactivityTimer(
          expirationTime ? parseInt(JSON.parse(expirationTime)) : 0
        );
      }, 2000); // 2초 후 리셋

      console.log("동작");
    };

    // 이벤트 리스너 추가
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      // 브라우저에서 사이트를 닫거나 새로고침 시 이벤트 리스너 제거
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(debounceTimer); // 짧은 타이머이지만 메모리 누수에 문제가 발생할 수 있어 작성됨.
    };
  }, [isLoggedIn, expirationTime]);

  return (
    <Container>
      {/* 배경화면 지정 */}
      <VideoContainer />
      <video
        src="/cloud.MOV"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <Router>
        <Route
          path={[
            "/",
            "/myInfo",
            "/wishList",
            "/flightReservation/:id",
            "/flightReservation/:id/traveler",
            "/flightReservation/:id/traveler/result",
            "/reservationDetail/:revCode",
            "/reservationList",
          ]}
          exact
        >
          <Layout />
        </Route>
        <MainContent>
          <Switch>
            {/* 로그인된 사용자만 접근 가능 */}
            <ProtectedRoute
              path="/myInfo"
              component={MyInfo}
              restricted={false}
            />

            <ProtectedRoute
              path="/wishList"
              component={WishList}
              restricted={false}
            />

            <ProtectedRoute
              path="/reservationList"
              component={ReservationList}
              restricted={false}
            />

            {/* 로그인된 사용자는 접근 불가 */}
            <ProtectedRoute
              path="/guestReservation"
              component={GuestReservationList}
              restricted={true}
            />
            <ProtectedRoute
              path="/pwFind"
              component={PwFind}
              restricted={true}
            />
            <ProtectedRoute
              path="/idFind"
              component={IdFind}
              restricted={true}
            />
            <ProtectedRoute path="/login" component={Login} restricted={true} />
            <ProtectedRoute
              path="/join/info/passportInfo"
              component={PassportInfo}
              restricted={true}
            />
            <ProtectedRoute
              path="/join/info"
              component={JoinInfo}
              restricted={true}
            />
            <ProtectedRoute path="/join" component={Join} restricted={true} />

            <Route
              path="/reservationDetail/:revCode"
              component={ReservationDetail}
            />
            <Route path="/reservationResult" component={PaymentResult} />

            <Route
              path="/flightReservation/:id/traveler/result"
              component={FlightReservationComplete}
            />

            <Route
              path="/flightReservation/:id/traveler"
              component={TravelerInfo}
            />
            <Route
              path="/flightReservation/:id"
              component={FlightReservation}
            />

            <Route exact path="/" component={FlightSearch} />
          </Switch>
        </MainContent>
        <Route
          path={[
            "/",
            "/myInfo",
            "/wishList",
            "/flightReservation/:id",
            "/wishList/flightReservation/:id",
            "/flightReservation/:id/traveler",
            "/flightReservation/:id/traveler/result",
            "/reservationDetail/:revCode",
            "/reservationList",
          ]}
          exact
        >
          <Footer />
        </Route>
      </Router>
    </Container>
  );
}

export default App;
