package groundToAir.airReservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
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
    public String kakaoPaymentReady(Map<String, Object> paymentInfo, HttpSession session) {
        String url = "https://open-api.kakaopay.com/online/v1/payment/ready"; // 카카오페이 요청 URL

        // 가져온 데이터 선언 구간
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

        // 요청 할 데이터 입력
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
                        + "\"approval_url\": \"http://localhost:3000/reservationResult/success\"," // [필수] 결제 성공 시의 url
                        + "\"fail_url\": \"http://localhost:3000/reservationResult/fail\"," // [필수] 결제 실패 시의 url
                        + "\"cancel_url\": \"http://localhost:3000/reservationResult/cancel\"" // [필수] 결제 취소 시의 url
                        + "}", amount, 200 // 예시로 vat_amount = 200 설정
        );

        log.info("전송 할 데이터 : {}", requestPayload);
        log.info("헤더 : {}", secretKey);  // 헤더 정보 로그

        HttpEntity<String> requestEntity = new HttpEntity<>(requestPayload, headers);

        try {
            // 카카오페이 결제 준비 API 호출
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            String responseBody = response.getBody();
            log.info("응답받은 데이터 : {}", responseBody);

            // 응답에서 필요한 데이터만 추출
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            String paymentUrl = jsonResponse.path("next_redirect_pc_url").asText();  // 결제창 페이지 URL
            String tid = jsonResponse.path("tid").asText();  // 결제에 필요한 tid

            // 세션에 tid 저장
            session.setAttribute("tid", tid);  // 세션에 tid 저장

            log.info("결제창 페이지 URL : {}", paymentUrl);
            log.info("세션 tid : {}", session.getAttribute("tid"));

            // React로 결제 URL만 반환 (tid는 세션에 저장되었음)
            return paymentUrl;

        } catch (Exception e) {
            // 예외 발생 시 로그
            log.error("결제 준비 실패", e);
            throw new RuntimeException("결제 준비 실패", e);
        }
    }

    // 카카오페이 결제 승인
    public String kakaoPaymentApprove(Map<String, Object> paymentInfo, HttpSession session) {

        String url = "https://open-api.kakaopay.com/online/v1/payment/approve"; // 카카오페이 승인 URL

        // 가져온 데이터 선언 구간
        String secretKey = (String) paymentInfo.get("secretKey");
        if (secretKey == null) {
            log.error("secretKey가 존재하지 않음");
            throw new IllegalArgumentException("secretKey가 존재하지 않음");
        }

        String pgToken = (String) paymentInfo.get("pgToken");
        if (pgToken == null) {
            log.error("pgToken 존재하지 않음");
            throw new IllegalArgumentException("pgToken 존재하지 않음");
        }

        // 세션에서 tid 값을 가져옴
        String tid = (String) session.getAttribute("tid");
        if (tid == null) {
            log.error("세션에서 tid를 찾을 수 없음");
            throw new IllegalArgumentException("세션에서 tid를 찾을 수 없음");
        }

        // 요청 할 데이터 입력
        String requestPayload = String.format(
                "{"
                        + "\"cid\": \"TC0ONETIME\","
                        + "\"tid\": \"%s\"," // tid 값은 결제 준비 단계에서 저장해둬야 함
                        + "\"partner_order_id\": \"order_123\","
                        + "\"partner_user_id\": \"user_123\","
                        + "\"pg_token\": \"%s\""
                        + "}", tid, pgToken
        );

        // 카카오페이 API 호출을 위한 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "SECRET_KEY " + secretKey);

        // 요청 후 응답을 받아옴
        HttpEntity<String> requestEntity = new HttpEntity<>(requestPayload, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        return response.getBody();
    }

    // 토스페이먼츠 결제 승인
    public String tossPaymentApprove(Map<String, Object> paymentInfo) {

        String url = "https://api.tosspayments.com/v1/payments/confirm"; // 토스페이먼츠 승인 URL

        // 가져온 데이터 선언 구간
        String secretKey = (String) paymentInfo.get("secretKey");
        if (secretKey == null) {
            log.error("secretKey가 존재하지 않음");
            throw new IllegalArgumentException("secretKey가 존재하지 않음");
        }

        String paymentKey = (String) paymentInfo.get("paymentKey");
        if (paymentKey == null) {
            log.error("paymentKey가 존재하지 않음");
            throw new IllegalArgumentException("paymentKey가 존재하지 않음");
        }

        String orderId = (String) paymentInfo.get("orderId");
        if (orderId == null) {
            log.error("orderId 존재하지 않음");
            throw new IllegalArgumentException("orderId 존재하지 않음");
        }

        String amount = (String) paymentInfo.get("amount");
        if (amount == null) {
            log.error("amount가 존재하지 않음");
            throw new IllegalArgumentException("amount가 존재하지 않음");
        }

        // 토스페이먼츠 API 호출을 위한 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", secretKey);  // 토스페이먼츠의 API Key 사용
        headers.set("Content-Type", "application/json");

        String body = "{\"paymentKey\":\"" + paymentKey + "\",\"amount\":\"" + amount + "\",\"orderId\":\"" + orderId + "\"}";

        // 요청 후 응답을 받아옴
        HttpEntity<String> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                String.class
        );

        log.info("최종 응답 : {}", response.getBody());

        return response.getBody();

    }

}
