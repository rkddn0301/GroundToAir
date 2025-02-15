package groundToAir.airReservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class PaymentService {

    private final RestTemplate restTemplate;

    public PaymentService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 카카오페이 결제 준비 페이지 이동
    public String kakaoPaymentReady(Map<String, Object> paymentInfo) {
        String url = "https://open-api.kakaopay.com/online/v1/payment/ready"; // 카카오페이 요청 URL

        String secretKey = (String) paymentInfo.get("secretKey");
        if (secretKey == null) {
            log.error("secretKey가 존재하지 않음");
            throw new IllegalArgumentException("secretKey가 존재하지 않음");
        }

        Integer amount = (Integer) paymentInfo.get("amount");
        if (amount == null) {
            log.error("amount가 존재하지 않음");
            throw new IllegalArgumentException("amount가 존재하지 않음");
        }

        // 카카오페이 API 호출을 위한 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "SECRET_KEY " + secretKey);  // 카카오페이의 API Key 사용
        headers.set("Content-Type", "application/json");

        String requestPayload = String.format(
                "{"
                        + "\"cid\": \"TC0ONETIME\"," // [필수] 가맹점 코드 (테스트 : TC0ONETIME)
                        + "\"partner_order_id\": \"order_123\"," // [필수] 가맹점 관리용 주문번호
                        + "\"partner_user_id\": \"user_123\"," // [필수] 가맹점 관리자 ID
                        + "\"item_name\": \"상품명\"," // [필수] 구매할 상품명
                        + "\"quantity\": 1," // [필수] 구매 수량
                        + "\"total_amount\": \"%d\"," // [필수] 총 결제 금액
                        + "\"vat_amount\": \"%d\"," // [선택] 부가가치세
                        + "\"tax_free_amount\": 0," // [필수] 비과세 금액
                        + "\"approval_url\": \"http://localhost:3000/payment/success\"," // [필수] 결제 성공 시의 url
                        + "\"fail_url\": \"http://localhost:3000/payment/fail\"," // [필수] 결제 실패 시의 url
                        + "\"cancel_url\": \"http://localhost:3000/payment/cancel\"" // [필수] 결제 취소 시의 url
                        + "}", amount, 200 // 예시로 vat_amount = 200 설정
        );

        // 로그: 요청 보내기 전
        log.info("Sending request to Kakao Pay API with payload: {}", requestPayload);
        log.info("Authorization header: KakaoAK {}", secretKey);  // 헤더 정보 로그

        HttpEntity<String> entity = new HttpEntity<>(requestPayload, headers);

        try {
            // 카카오페이 결제 준비 API 호출
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            // 로그: 카카오페이 응답
            String responseBody = response.getBody();
            log.info("Response from Kakao Pay API: {}", responseBody);

            // 응답에서 필요한 데이터만 추출
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            String paymentUrl = jsonResponse.path("next_redirect_pc_url").asText();  // PC에서의 결제 URL

            // 로그: 결제 URL 추출
            log.info("Payment URL extracted: {}", paymentUrl);

            // React로 결제 URL을 반환
            return paymentUrl;

        } catch (Exception e) {
            // 예외 발생 시 로그
            log.error("Error occurred during Kakao Pay payment preparation", e);
            throw new RuntimeException("결제 준비 실패", e);
        }
    }

}
