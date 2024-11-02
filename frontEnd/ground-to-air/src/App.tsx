import React, { useEffect } from "react";
import FlightSearch from "./router/FlightSearch";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import HotelSearch from "./router/HotelSearch";
import ChoiceButton from "./components/ChoiceButton";
import Join from "./router/Join";
import styled from "styled-components";
import Footer from "./components/Footer";
import JoinInfo from "./router/JoinInfo";
import Login from "./router/Login";
import PassportInfo from "./router/PassportInfo";
import { resetInactivityTimer } from "./utils/jwtActivityTimer";
import { useRecoilValue } from "recoil";
import { isLoggedInState, tokenExpirationTime } from "./utils/atom";
import PwFind from "./router/PwFind";
import IdFind from "./router/IdFind";
import MyInfo from "./router/MyInfo";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: skyblue;
  //width: 100%;
  height: 100vh;
`;

const MainContent = styled.main`
  flex: 1; /* 남은 공간을 모두 차지하도록 설정 */
`;

let debounceTimer: NodeJS.Timeout; // 타이머 연속 호출 방지 타이머

function App() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 atom
  const tokenExpiration = useRecoilValue(tokenExpirationTime); // 토큰 만료시간 atom

  // 전체 사이트에서 활동/비활동에 따라 세션 유지 여부를 결정
  useEffect(() => {
    if (!isLoggedIn) return; // 로그인 된 상태에서만 동작

    // 활동 시 동작
    const events = ["click", "keydown", "scroll"]; // 클릭, 키보드, 스크롤
    const resetTimer = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        resetInactivityTimer(tokenExpiration);
      }, 10000); // 10초 후 리셋

      console.log("동작");
    };

    // 이벤트 리스너 추가
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      // 브라우저에서 사이트를 닫거나 새로고침 시 이벤트 리스너 제거
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn]);

  return (
    <Container>
      <Router>
        <MainContent>
          <Route path={["/hotels", "/", "/myInfo"]} exact>
            <Layout />
          </Route>

          {/* ChoiceButton의 경우 항공, 호텔 조회 페이지에만 보여야함 */}
          <Route path={["/hotels", "/"]} exact>
            <ChoiceButton />
          </Route>
          <Switch>
            <Route path="/myInfo">
              <MyInfo />
            </Route>
            <Route path="/pwFind">
              <PwFind />
            </Route>
            <Route path="/idFind">
              <IdFind />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/join/info/passportInfo">
              <PassportInfo />
            </Route>
            <Route path="/join/info">
              <JoinInfo />
            </Route>
            <Route path="/join">
              <Join />
            </Route>
            <Route path="/hotels">
              <HotelSearch />
            </Route>
            <Route exact path="/">
              <FlightSearch />
            </Route>
          </Switch>
        </MainContent>
        <Route path={["/hotels", "/", "/myInfo"]} exact>
          <Footer />
        </Route>
      </Router>
    </Container>
  );
}

export default App;
