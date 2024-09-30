import React, { useEffect } from "react";
import FlightSearch from "./router/FlightSearch";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import HotelSearch from "./router/HotelSearch";
import ChoiceButton from "./components/ChoiceButton";

function App() {
  return (
    <Router>
      <Layout />
      {/* ChoiceButton의 경우 항공, 호텔 조회 페이지에만 보여야함 */}
      <Route path={["/hotels", "/"]} exact>
        <ChoiceButton />
      </Route>
      <Switch>
        <Route path="/hotels">
          <HotelSearch />
        </Route>
        <Route exact path="/">
          <FlightSearch />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
