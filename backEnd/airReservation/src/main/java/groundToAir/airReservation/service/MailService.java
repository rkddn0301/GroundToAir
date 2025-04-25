package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.ReservationListEntity;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;

// 메일 관련 Service
@Service
@Slf4j
public class MailService {
    // 이메일 이용
    private JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 아이디 혹은 비밀번호 찾기 이메일 전송
    public void sendIdOrPwEmail(String toEmail, String messageContent, String messageType) {
        long startTime = System.currentTimeMillis();
        SimpleMailMessage message = new SimpleMailMessage(); // SimpleMailMessage : 텍스트 전용 이메일 전송 방식
        message.setTo(toEmail);

        // 메시지 유형에 따라 제목과 내용을 다르게 설정
        if ("idFind".equals(messageType)) {
            message.setSubject("아이디 찾기");
            message.setText("귀하의 아이디는 " + messageContent + " 입니다.");
        } else if ("pwFind".equals(messageType)) {
            message.setSubject("비밀번호 찾기");
            message.setText("귀하의 임시 비밀번호는: " + messageContent + " 입니다.\n로그인 후 반드시 비밀번호를 변경해 주시기 바랍니다.");
        }

        mailSender.send(message);
        long endTime = System.currentTimeMillis();
        log.info("메일 전송 완료, 소요시간: " + (endTime - startTime) + "ms");
    }

    // 예약 완료 이메일 전송
    public void sendRevListCompleteEmail(String toEmail, ReservationListEntity reservationList) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage(); // HTML, 첨부파일 등을 포함하여 이메일 전송하는 방식
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        log.info("reservationList : {}", reservationList);

        helper.setTo(toEmail);
        helper.setSubject("GroundToAir 항공편 예약이 완료되었습니다."); // 제목

        // 좌석등급
        String seatClassLabel = reservationList.getSeatClass().equals("FIRST") ? "일등석" :
                reservationList.getSeatClass().equals("BUSINESS") ? "비즈니스석" :
                        reservationList.getSeatClass().equals("PREMIUM_ECONOMY") ? "프리미엄 일반석" :
                                "일반석";

        String tripType = (reservationList.getReStopLine() != null && !reservationList.getReStopLine().isEmpty()) ? "왕복" : "편도"; // 왕복여부

        int totalPeople = reservationList.getAdults() + reservationList.getChildrens() + reservationList.getInfants(); // 예약인원

        String htmlContent = "<div style='font-family:sans-serif; line-height:1.6;  margin: 0 auto; width: 50%;'>"
                + "<h2 style='text-align: center;'>" + reservationList.getRevName() + "님의 항공편 예약이 완료되었습니다 ✈️</h2><hr />"
                + "<p><strong>예약자명:</strong> " + reservationList.getRevName() + "</p>"
                + "<p><strong>항공편:</strong> (" + tripType + ") " + reservationList.getDepartureIata() + " - " + reservationList.getArrivalIata() + "</p>"
                + "<p><strong>예약코드:</strong> " + reservationList.getRevCode() + "</p>"
                + "<p><strong>예약인원:</strong> " + totalPeople + "명</p>"
                + "<p><strong>좌석등급:</strong> " + seatClassLabel + "</p>"
                + "<p><strong>결제금액:</strong> " + NumberFormat.getInstance().format(reservationList.getTotalPrice()) + "원</p>"
                + "<br/>"
                + "<p style='text-align: center;'>자세한 내용은 GroundToAir 페이지 예약내역에서 확인하여 주시길 바랍니다.</p>"
                + "</div>"; // 메시지 내용


        helper.setText(htmlContent, true); // true = HTML

        mailSender.send(message);


    }

}
