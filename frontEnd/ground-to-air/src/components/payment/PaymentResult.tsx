// 결제 승인 결과

import axios from "axios";
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

function PaymentResult() {
  const location = useLocation();
  const history = useHistory();

  const query = new URLSearchParams(location.search);
  const pathname = location.pathname;

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
          const res = await axios.post(
            "http://localhost:8080/payment/kakaopayApprove",
            {
              pgToken,
              secretKey: process.env.REACT_APP_KAKAOPAY_SECRET_DEV_KEY,
            },
            { withCredentials: true }
          );
          console.log("결제 승인 성공:", res.data);
          alert("결제가 완료되었습니다!");
          history.push("/"); // 홈으로 이동
        } catch (err) {
          console.error("결제 승인 실패:", err);
          alert("결제 승인 중 오류 발생");
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
          alert("결제가 완료되었습니다!");
          history.push("/"); // 홈으로 이동
        } catch (err) {
          console.error("결제 승인 실패:", err);
          alert("결제 승인 중 오류 발생");
          history.push("/"); // 실패 시 홈으로 이동
        }
      } else if (pathname.includes("/reservationResult/fail")) {
        alert("결제에 실패했습니다.");
        history.push("/"); // 실패 시 홈으로 이동
      } else if (pathname.includes("/reservationResult/cancel")) {
        alert("결제가 취소되었습니다.");
        history.push("/"); // 취소 시 홈으로 이동
      }
    };

    approvePayment();
  }, [pgToken, paymentKey, pathname, history]);

  return <div>결제 처리 중...</div>;
}

export default PaymentResult;
