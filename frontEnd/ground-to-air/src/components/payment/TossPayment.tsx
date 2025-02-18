// 토스페이먼츠 결제 컴포넌트

import { loadTossPayments } from "@tosspayments/payment-sdk";
import { useEffect, useState } from "react";

const clientKey = process.env.REACT_APP_TOSSPAY_CLIENT_KEY as string;
const customerKey = process.env.REACT_APP_TOSSPAY_CUSTOMER_KEY as string; // 본인이 직접 지정해야 함
const orderId = crypto.randomUUID(); // 주문번호는 매번 바뀌어야함

function TossPayment() {
  const [tossPayments, setTossPayments] = useState<any>(null); // TossPayments 인스턴스 저장
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 추적
  const amount = {
    currency: "KRW",
    value: 50000,
  }; // 가격

  // 토스 SDK 로딩
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        if (!clientKey) {
          throw new Error("클라이언트 키가 설정되지 않았습니다.");
        }

        const payments = await loadTossPayments(clientKey);
        setTossPayments(payments);
      } catch (error) {
        console.error("토스 결제 SDK 로딩 오류:", error);
      } finally {
        setLoading(false); // 로딩 상태 업데이트
      }
    };

    fetchPayment();
  }, []);

  // 결제 요청 함수
  const requestPayment = async () => {
    if (!tossPayments) {
      console.error("토스 결제 SDK가 아직 로드되지 않았습니다.");
      return;
    }

    try {
      await tossPayments.requestPayment({
        method: "CARD", // [필수] 결제수단
        card: {
          // [선택] 카드 결제 정보
          useEscrow: false, // 에스크로 사용 여부. 에스크로(Escrow) : 결제 금액을 판매자가 아닌 제3자가 받아 구매자가 상품이나 서비스를 받은 후에만 판매자에게 금액이 지급되는 서비스.
          flowMode: "DEFAULT", // 결제창 여는 방식 (DEFAULT : 카드/간편결제 통합결제창 열람, DIRECT : 카드 또는 간편결제의 자체창 열람)
          useCardPoint: false, // 카드사 포인트 사용 여부
          useAppCardOnly: false, // 카드사의 앱카드 단독 사용 여부
        },
        amount: amount.value, // [필수] 결제 금액 정보 (value : 결제 금액, currency : 결제 통화)
        orderId: orderId, // [필수] 고유 주문번호
        orderName: "토스 티셔츠 외 2건", // [필수] 구매 상품명
        successUrl: `${window.location.origin}/reservationResult/success`, // [선택] 결제 성공 시 리다이렉트 되는 URL
        failUrl: `${window.location.origin}/reservationResult/fail`, // [선택] 결제 실패 시 리다이렉트 되는 URL
        customerKey, // 구매자 고유 키
        customerEmail: "a22495407@gmail.com", // [선택] 구매자 이메일
        customerName: "김토스", // [선택] 구매자 명
        customerMobilePhone: "01012341234", //  [선택] 구매자 휴대폰 번호
      });
    } catch (error: any) {
      console.error("결제 요청 실패:", error);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>; // SDK 로딩 중일 때 표시할 내용
  }

  return (
    <button className="button" onClick={requestPayment}>
      결제하기
    </button>
  );
}

export default TossPayment;
