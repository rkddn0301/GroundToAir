// 예약정보입력

import { useLocation } from "react-router-dom";
import { FlightOffer } from "../../../utils/api";

function TravelerInfo() {
  const location = useLocation<{ offer?: FlightOffer }>();
  const { offer } = location.state || {};
  return <p>탑승자 정보 사이트 {offer?.id}</p>;
}

export default TravelerInfo;
