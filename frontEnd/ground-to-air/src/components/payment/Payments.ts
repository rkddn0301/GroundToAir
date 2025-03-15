// 결제 수단 함수 호출 구간

import { loadTossPayments } from "@tosspayments/payment-sdk";
import axios from "axios";

// 카카오페이
export const KakaoPayments = async (total: number) => {
  try {
    const response = await axios.post(
      `http://localhost:8080/payment/kakaopayReady`,
      {
        itemName: "항공편 예약", // 상품명
        amount: total, // 결제할 금액
        secretKey: process.env.REACT_APP_KAKAOPAY_SECRET_DEV_KEY,
      },
      { withCredentials: true }
    );

    console.log(response.data);
    const { redirectUrl } = response.data;
    window.location.href = redirectUrl; // 카카오페이 결제창으로 이동
  } catch (error) {
    console.error("결제 요청 실패 : ", error);
  }
};

// 토스페이먼츠
export const TossPayments = async (
  total: number,
  sendEmail: string,
  sendUserName: string,
  sendPhoneNumber: string
) => {
  try {
    const clientKey = process.env.REACT_APP_TOSSPAY_CLIENT_KEY as string;
    const customerKey = process.env.REACT_APP_TOSSPAY_CUSTOMER_KEY as string; // 본인이 직접 지정해야 함
    const orderId = crypto.randomUUID(); // 주문번호는 매번 바뀌어야함

    const tossPayments = await tossSDKLoading(clientKey); // 토스 SDK 로딩

    // 결제 진행 (버튼 클릭 시 호출)
    await requestPayment(
      tossPayments,
      customerKey,
      orderId,
      total,
      sendEmail,
      sendUserName,
      sendPhoneNumber
    );
  } catch (error) {
    console.error("TossPayments 로딩 또는 결제 처리 실패:", error);
  }
};

// 토스 SDK 로딩
const tossSDKLoading = async (clientKey: string) => {
  try {
    if (!clientKey) {
      throw new Error("클라이언트 키가 설정되지 않았습니다.");
    }

    const payments = await loadTossPayments(clientKey);
    return payments; // payments 값을 return
  } catch (error) {
    console.error("토스 결제 SDK 로딩 오류 : ", error);
  }
};

// 토스 결제 요청
const requestPayment = async (
  tossPayments: any,
  customerKey: string,
  orderId: string,
  total: number,
  sendEmail: string,
  sendUserName: string,
  sendPhoneNumber: string
) => {
  if (!tossPayments) {
    throw new Error("TossPayments SDK 로드 실패");
  }
  try {
    // 삽입할 값 설정
    const value = {
      currency: "KRW",
      amount: total, // 결제 금액
      orderName: "항공편 예약", // 상품명
      email: sendEmail, // 이메일
      customerName: sendUserName, // 구매자명
      customerMobilePhone: sendPhoneNumber, // 구매자번호
    };

    await tossPayments.requestPayment({
      method: "CARD", // [필수] 결제수단
      card: {
        // [선택] 카드 결제 정보
        useEscrow: false, // 에스크로 사용 여부. 에스크로(Escrow) : 결제 금액을 판매자가 아닌 제3자가 받아 구매자가 상품이나 서비스를 받은 후에만 판매자에게 금액이 지급되는 서비스.
        flowMode: "DEFAULT", // 결제창 여는 방식 (DEFAULT : 카드/간편결제 통합결제창 열람, DIRECT : 카드 또는 간편결제의 자체창 열람)
        useCardPoint: false, // 카드사 포인트 사용 여부
        useAppCardOnly: false, // 카드사의 앱카드 단독 사용 여부
      },
      amount: value.amount, // [필수] 결제 금액 정보 (value : 결제 금액, currency : 결제 통화)
      orderId: orderId, // [필수] 고유 주문번호
      orderName: value.orderName, // [필수] 구매 상품명
      successUrl: `${window.location.origin}/reservationResult/success`, // [선택] 결제 성공 시 리다이렉트 되는 URL
      failUrl: `${window.location.origin}/reservationResult/fail`, // [선택] 결제 실패 시 리다이렉트 되는 URL
      customerKey, // 구매자 고유 키
      customerEmail: value.email, // [선택] 구매자 이메일
      customerName: value.customerName, // [선택] 구매자 명
      customerMobilePhone: value.customerMobilePhone, //  [선택] 구매자 휴대폰 번호
    });
  } catch (error) {
    console.error("결제 요청 실패:", error);
  }
};
