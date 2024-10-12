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

function App() {
  return (
    <Container>
      <Router>
        <MainContent>
          <Route path={["/hotels", "/"]} exact>
            <Layout />
          </Route>

          {/* ChoiceButton의 경우 항공, 호텔 조회 페이지에만 보여야함 */}
          <Route path={["/hotels", "/"]} exact>
            <ChoiceButton />
          </Route>
          <Switch>
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
        <Route path={["/hotels", "/"]} exact>
          <Footer />
        </Route>
      </Router>
    </Container>
  );
}

export default App;
