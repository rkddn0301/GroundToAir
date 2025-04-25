package groundToAir.airReservation.controller;

import groundToAir.airReservation.entity.ReservationListEntity;
import groundToAir.airReservation.entity.WishListEntity;
import groundToAir.airReservation.service.ReservationService;
import groundToAir.airReservation.utils.AccessTokenUtil;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// 찜, 예약 관련 Controller
// 찜 등록/조회/삭제, 예약 등록/조회/삭제
@RestController
@Slf4j
@RequestMapping("/reservation")
public class ReservationController {

    private final ReservationService reservationService;
    private final AccessTokenUtil accessTokenUtil;
    private final JwtUtil jwtUtil;

    public ReservationController(ReservationService reservationService, AccessTokenUtil accessTokenUtil, JwtUtil jwtUtil) {
        this.reservationService = reservationService;
        this.accessTokenUtil = accessTokenUtil;
        this.jwtUtil = jwtUtil;
    }

    // 찜 조회
    @PostMapping("/getWish")
    public ResponseEntity<List<Map<String, Object>>> getWish(@RequestHeader("Authorization") String accessToken) {
        // Bearer 토큰에서 "Bearer " 부분 제거
        if (accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        // 토큰에서 사용자 번호 추출
        int userNo = jwtUtil.extractUserNo(accessToken);

        // 사용자 번호로 찜 데이터 가져오기
        List<Map<String, Object>> wishListDetails = reservationService.getWish(userNo);
        return ResponseEntity.ok(wishListDetails);
    }

    // 찜 아이콘 클릭 스위칭
    @PostMapping("/wish")
    public boolean wish(@RequestHeader("Authorization") String accessToken, @RequestBody Map<String, Object> wishListData) {
        // Bearer 토큰에서 "Bearer " 부분 제거
        if (accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        // 토큰에서 사용자 번호 추출
        int userNo = jwtUtil.extractUserNo(accessToken);


        // 위시리스트 데이터 로깅
        log.info("회원번호 : " + userNo + ", 찜 : " + wishListData);

        return reservationService.wish(userNo, wishListData);
    }

    // 찜 제거
    @PostMapping("/wishDelete")
    public boolean wishDelete(@RequestBody WishListEntity wishListEntity) {
        log.info("찜 번호 : " + wishListEntity.getWishNo());

        return reservationService.wishDelete(wishListEntity.getWishNo());
    }

    // 예약내역 등록
    @PostMapping("/airReservation")
    public Map<String, Object> airReservation(@RequestBody String flightData) throws Exception {

        log.info("flightData : {}", flightData);

        String accessToken = accessTokenUtil.checkAndRefreshToken();


        return reservationService.airReservation(accessToken, flightData);


    }

    // 예약내역 상세 데이터 호출
    @PostMapping("/reservationDetail")
    public ResponseEntity<List<Map<String, Object>>> reservationDetail(@RequestBody Map<String, Object> reservationDetailInfo) {
        log.info("예약 상세 호출에 필요한 데이터 : {}", reservationDetailInfo);
        // 예약내역 상세 데이터 확인
        List<Map<String, Object>> response = reservationService.reservationDetail(reservationDetailInfo);
        return ResponseEntity.ok(response);

    }


    // 예약내역 조회
    @PostMapping("/getRevList")
    public ResponseEntity<List<Map<String, Object>>> getRevList(@RequestHeader("Authorization") String accessToken) {
        // Bearer 토큰에서 "Bearer " 부분 제거
        if (accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }

        // 토큰에서 사용자 번호 추출
        int userNo = jwtUtil.extractUserNo(accessToken);

        // 사용자 번호로 찜 데이터 가져오기
        List<Map<String, Object>> revListDetails = reservationService.getRevList(userNo);
        return ResponseEntity.ok(revListDetails);
    }

    // 예약내역 제거
    @PostMapping("/revDelete")
    public boolean revDelete(@RequestBody ReservationListEntity reservationListEntity) {
        log.info("예약 번호 : " + reservationListEntity.getRevId());

        return reservationService.revDelete(reservationListEntity.getRevId());
    }
}
