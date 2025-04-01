// 예약 상세

import axios from "axios";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

function ReservationDetail() {
  const location = useLocation<{ revName?: string; revCode?: string }>();
  const { revName, revCode } = location.state || {};

  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  useEffect(() => {
    if (revName && revCode) {
      reservationDataExtraction(revName, revCode);
    }
  }, [revName, revCode]);

  // 예약 상세 데이터 추출
  const reservationDataExtraction = async (
    revName: string,
    revCode: string
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:8080/user/reservationDetail`,
        {
          revName: revName,
          revCode: revCode,
        }
      );
      if (response.data) {
        console.log(response.data);
      }
    } catch (error) {
      console.error("예약 상세 데이터 가져오기 실패 : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? (
        <div>로딩중 ...</div>
      ) : (
        <div>
          <p>예약자명 : {revName}</p>
          <p>예약코드 : {revCode}</p>
        </div>
      )}
    </div>
  );
}

export default ReservationDetail;
