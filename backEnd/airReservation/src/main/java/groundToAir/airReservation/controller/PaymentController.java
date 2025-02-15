package groundToAir.airReservation.controller;

import groundToAir.airReservation.service.PaymentService;
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
    @PostMapping("/kakaopay")
    public ResponseEntity<?> kakaoPaymentReady(@RequestBody Map<String, Object> paymentInfo) {
        log.info("Payment info received: {}", paymentInfo);

        try {
            // 결제 준비를 위한 서비스 메서드 호출
            String redirectUrl = paymentService.kakaoPaymentReady(paymentInfo);
            // 리디렉션 URL을 응답으로 반환
            return ResponseEntity.ok(Map.of("redirectUrl", redirectUrl));
        } catch (Exception e) {
            log.error("Payment initiation failed", e);
            return ResponseEntity.status(500).body("Payment initiation failed");
        }
    }


}
