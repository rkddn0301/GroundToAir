package groundToAir.airReservation.controller;

import groundToAir.airReservation.service.PaymentService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@Slf4j
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // 카카오페이 결제 준비 페이지 이동
    @PostMapping("/kakaopayReady")
    public ResponseEntity<?> kakaoPaymentReady(@RequestBody Map<String, Object> paymentInfo,  HttpSession session) {
        log.info("paymentInfo : {}", paymentInfo);

        try {
            // 결제 준비를 위한 서비스 메서드 호출
            String redirectUrl = paymentService.kakaoPaymentReady(paymentInfo, session);
            // `redirectUrl' 반환
            return ResponseEntity.ok(Map.of(
                    "redirectUrl", redirectUrl
            ));
        } catch (Exception e) {
            log.error("요청 실패 : ", e);
            return ResponseEntity.status(500).body("요청 실패");
        }
    }

    // 카카오페이 결제 승인
    @PostMapping("/kakaopayApprove")
    public ResponseEntity<?> kakaoPaymentApprove(@RequestBody Map<String, Object> paymentInfo, HttpSession session) {
        log.info("paymentInfo : {}", paymentInfo);
        log.info("tid : {}", session.getAttribute("tid")); // tid 값 로그로 출력


        try {
            // 결제 승인을 위한 서비스 메서드 호출
            String response = paymentService.kakaoPaymentApprove(paymentInfo, session);
            // 리디렉션 URL을 응답으로 반환
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("요청 실패 : ", e);
            return ResponseEntity.status(500).body("요청 실패");
        }
    }

    // 토스페이먼츠 결제 승인
    @PostMapping("/tosspayApprove")
    public ResponseEntity<?> tossPaymentApprove(@RequestBody Map<String, Object> paymentInfo) {
        log.info("paymentInfo : {}", paymentInfo);

        try {
            // 결제 승인을 위한 서비스 메서드 호출
            String response = paymentService.tossPaymentApprove(paymentInfo);
            // 리디렉션 URL을 응답으로 반환
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("요청 실패 : ", e);
            return ResponseEntity.status(500).body("요청 실패");
        }

    }


}
