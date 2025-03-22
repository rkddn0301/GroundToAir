// 결제 승인 결과 처리 컴포넌트

import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Alert } from "../../utils/sweetAlert";
import { encryptionKey } from "../../router/FlightSearch";
import CryptoJS from "crypto-js";

// 항공편 로딩 중 전체 디자인 구성
const Loading = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// 로딩 중... 원형 디자인 구성
const Spinner = styled(motion.div)`
  border: 4px solid ${(props) => props.theme.white.font};
  border-top: 4px solid skyblue; // 부분적으로만 색상을 바꿔 원이 돌아가는 것처럼 구현
  border-radius: 50%;
  width: 16px;
  height: 16px;
`;

function PaymentResult() {
  const location = useLocation();
  const history = useHistory();

  const query = new URLSearchParams(location.search);
  const pathname = location.pathname;

  const [isLoading, setIsLoading] = useState(true);

  // 카카오페이
  const pgToken = query.get("pg_token");

  // 토스페이먼츠
  const paymentKey = query.get("paymentKey");
  const orderId = query.get("orderId");
  const amount = query.get("amount");
  const authHeader = `Basic ${btoa(
    `${process.env.REACT_APP_TOSSPAY_SECRET_KEY}:`
  )}`;

  useEffect(() => {
    const approvePayment = async () => {
      // 카카오페이
      if (pathname.includes("/reservationResult/success") && pgToken) {
        try {
          const response = await axios.post(
            "http://localhost:8080/payment/kakaopayApprove",
            {
              pgToken,
              secretKey: process.env.REACT_APP_KAKAOPAY_SECRET_DEV_KEY,
            },
            { withCredentials: true }
          );

          if (response.data) {
            console.log("결제 승인 성공:", response.data);
            reservation();
          }
        } catch (error) {
          console.error("결제 승인 실패:", error);
          setIsLoading(false);
          sessionStorage.removeItem("pricing");
          sessionStorage.removeItem("inputData");
          sessionStorage.removeItem("contactData");
          Alert("결제 승인 중 오류 발생", "error");
          history.push("/"); // 실패 시 홈으로 이동
        }
      } // 토스페이먼츠
      else if (pathname.includes("/reservationResult/success") && paymentKey) {
        try {
          const res = await axios.post(
            "http://localhost:8080/payment/tosspayApprove",
            {
              secretKey: authHeader,
              paymentKey,
              orderId,
              amount,
            }
          );
          console.log("결제 승인 성공:", res.data);
          reservation();
        } catch (error) {
          console.error("결제 승인 실패:", error);
          setIsLoading(false);
          sessionStorage.removeItem("pricing");
          sessionStorage.removeItem("inputData");
          sessionStorage.removeItem("contactData");
          Alert("결제 승인 중 오류 발생", "error");
          history.push("/"); // 실패 시 홈으로 이동
        }
      } else if (pathname.includes("/reservationResult/fail")) {
        Alert("결제에 실패했습니다.", "error");
        sessionStorage.removeItem("pricing");
        sessionStorage.removeItem("inputData");
        sessionStorage.removeItem("contactData");
        history.push("/"); // 실패 시 홈으로 이동
      } else if (pathname.includes("/reservationResult/cancel")) {
        Alert("결제가 취소되었습니다.", "error");
        sessionStorage.removeItem("pricing");
        sessionStorage.removeItem("inputData");
        sessionStorage.removeItem("contactData");
        history.push("/"); // 취소 시 홈으로 이동
      }
    };

    approvePayment();
  }, [pgToken, paymentKey, pathname, history]);

  const reservation = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/air/airReservation",
        {
          flightPricing: sessionStorage.getItem("pricing")
            ? JSON.parse(
                CryptoJS.AES.decrypt(
                  sessionStorage.getItem("pricing") || "",
                  encryptionKey
                ).toString(CryptoJS.enc.Utf8)
              )
            : null,
          travelerData: sessionStorage.getItem("inputData")
            ? JSON.parse(
                CryptoJS.AES.decrypt(
                  sessionStorage.getItem("inputData") || "",
                  encryptionKey
                ).toString(CryptoJS.enc.Utf8)
              )
            : null,
          contactData: sessionStorage.getItem("contactData")
            ? JSON.parse(
                CryptoJS.AES.decrypt(
                  sessionStorage.getItem("contactData") || "",
                  encryptionKey
                ).toString(CryptoJS.enc.Utf8)
              )
            : null,
          userNo: localStorage.getItem("accessToken")
            ? localStorage.getItem("accessToken")
            : "",
        }
      );

      if (response.data) {
        console.log("예약 성공:", response.data);
        const successAlert = await Alert("예약이 완료되었습니다!", "success");

        if (successAlert.isConfirmed || successAlert.isDismissed) {
          setIsLoading(false);
          sessionStorage.removeItem("pricing");
          sessionStorage.removeItem("inputData");
          sessionStorage.removeItem("contactData");
        }
      }
    } catch (error) {
      console.error("예약 도중 오류 발생 : ", error);
    } finally {
      setIsLoading(false);
      sessionStorage.removeItem("pricing");
      sessionStorage.removeItem("inputData");
      sessionStorage.removeItem("contactData");
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loading>
          <Spinner
            animate={{ rotate: [0, 360] }} // 회전 애니메이션
            transition={{
              duration: 1, // 1초 동안
              ease: "linear", // 일정한 속도
              repeat: Infinity, // 무한반복
            }}
          />
          <div style={{ fontWeight: "600" }}>결제 진행 중...</div>
        </Loading>
      ) : (
        ""
      )}
    </div>
  );
}

export default PaymentResult;
