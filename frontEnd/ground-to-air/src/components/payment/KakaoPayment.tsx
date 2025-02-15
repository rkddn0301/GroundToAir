// 카카오 페이 결제 컴포넌트
import axios from "axios";

function KakaoPayment() {
  const payment = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/payment/kakaopay`,
        {
          amount: 10000, // 결제할 금액
          secretKey: process.env.REACT_APP_KAKAOPAY_SECRET_DEV_KEY,
        }
      );

      console.log(response.data);
      const { redirectUrl } = response.data;
      window.location.href = redirectUrl; // 카카오페이 결제창으로 이동
    } catch (error) {
      console.error("결제 요청 실패 : ", error);
    }
  };
  return <button onClick={payment}>카카오페이</button>;
}

export default KakaoPayment;
