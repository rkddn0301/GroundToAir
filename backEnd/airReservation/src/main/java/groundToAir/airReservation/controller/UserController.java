package groundToAir.airReservation.controller;

import groundToAir.airReservation.entity.UserEntity;
import groundToAir.airReservation.entity.UserPassportEntity;
import groundToAir.airReservation.entity.WishListEntity;
import groundToAir.airReservation.service.UserService;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 회원 정보 관련 Controller
@RestController
@Slf4j
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // 아이디 중복 체크
    @GetMapping("/idCheck")
    public int idCheck(@RequestParam("userId") String userId) {
        return userService.idCheck(userId);
    }

    // 이메일 중복 체크
    @GetMapping("/emailCheck")
    public int emailCheck(@RequestParam("email") String email) {
        return userService.emailCheck(email);
    }

    // 비밀번호 중복 체크
    @GetMapping("/pwCheck")
    public int pwCheck(
            @RequestParam("userNo") String userNo,
            @RequestParam("password") String password) {
        return userService.pwCheck(userNo, password);
    }

    // 카카오 인증
    @PostMapping("/kakao")
    public Map<String, Object> kakaoUser(@RequestBody Map<String, Object> userInfo) {

        log.info(userInfo.toString());
        return userService.kakaoUser(userInfo);
    }

    // 구글 인증
    @PostMapping("/google")
    public Map<String, Object> googleUser(@RequestBody Map<String, Object> userInfo) {

        log.info(userInfo.toString());
        return userService.googleUser(userInfo);
    }

    // 회원가입 진행
    @PostMapping("/register")
    public int registerUser(@RequestBody UserEntity userEntity) {
        log.info(String.format("아이디: %s, 비밀번호: %s, 성명: %s, 생년월일: %s, 성별: %s, 이메일: %s",
                userEntity.getUserId(),
                userEntity.getPassword(),
                userEntity.getUserName(),
                userEntity.getBirth(),
                userEntity.getGender(),
                userEntity.getEmail()));


        return userService.registerUser(userEntity);  // UserEntity를 직접 서비스에 전달
    }


    // 여권정보 입력
    @PostMapping("/passportRegister")
    public void registerPassport(@RequestBody UserPassportEntity userPassportEntity) {
        log.info(String.format("회원번호: %s, 여권번호 : %s, 회원영문명 : %s, 국적 : %s, 여권만료일 : %s, 여권발행국 : %s",
                userPassportEntity.getUserNo(),
                userPassportEntity.getPassportNo(),
                userPassportEntity.getEngName(),
                userPassportEntity.getNationality(), // 문자열로 확인
                userPassportEntity.getExpirationDate(),
                userPassportEntity.getCountryOfIssue()));

        userService.registerPassport(userPassportEntity);
    }


    // 로그인 진행
    @PostMapping("/login")
    public Map<String, Object> loginUser(@RequestBody UserEntity userEntity) {
        log.info(String.format("아이디 : %s, 비밀번호 : %s", userEntity.getUserId(), userEntity.getPassword()));

        Map<String, Object> tokens = userService.loginUser(userEntity);

        if (tokens != null) {
            log.info(tokens.toString());
            return tokens; // 로그인 성공으로 간주하여 토큰을 반환
        } else {

            return null; // 로그인 실패로 간주하여 null을 반환
        }
    }

    // 리프레시 토큰 추출 메서드(보안적으로 인한 교체용)
    @PostMapping("/refresh")
    public Map<String, Object> refreshToken(@RequestHeader("Authorization") String AuthRefreshToken) {

        // 받아온 데이터에서 "Bearer " 부분 제거 후 리프레시 토큰 데이터만 남김
        String refreshToken = AuthRefreshToken.substring(7);

        // 리프레시 토큰이 만료되었는지 확인
        if (jwtUtil.isTokenExpired(refreshToken)) {
            return null; // 만료되었으면 리프레시 토큰이 없다고 반환시킴
        }

        // 리프레시 토큰 유효하면 소유자 ID를 추출
        String userId = jwtUtil.extractUserId(refreshToken);
        int userNo = jwtUtil.extractUserNo(refreshToken);
        log.info("소유자 추출 : " + userId);

        return userService.getJwtToken(userId, userNo); // 새로운 토큰들을 반환
    }

    // 아이디 찾기
    @GetMapping("/idFind")
    public boolean idFind(@RequestParam("userName") String userName,
                          @RequestParam("email") String email) {
        log.info("성명 : " + userName + ", 이메일 : " + email);

        return userService.idFind(userName, email);


    }

    // 비밀번호 찾기
    @GetMapping("/pwFind")
    public boolean pwFind(@RequestParam("userName") String userName,
                          @RequestParam("email") String email) {
        log.info("성명 : " + userName + ", 이메일 : " + email);

        return userService.pwFind(userName, email);
    }


    // 개인정보 확인
    @PostMapping("/myInfo")
    public Map<String, Object> myInfo(@RequestHeader("Authorization") String accessToken) {

        // Bearer 토큰에서 "Bearer " 부분 제거
        if (accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.substring(7);
        }
        int userNo = jwtUtil.extractUserNo(accessToken);


        return userService.myInfo(userNo);
    }

    // 개인정보 수정
    @PostMapping("/myInfoUpdate")
    public boolean myInfoUpdate(@RequestBody UserEntity userEntity) {
        log.info(String.format("회원번호: %s, 아이디: %s, 비밀번호: %s, 이메일: %s",
                userEntity.getUserNo(),
                userEntity.getUserId(),
                userEntity.getPassword(),
                userEntity.getEmail()));

        return userService.myInfoUpdate(userEntity);
    }

    // 여권정보 수정
    @PostMapping("/passportInfoUpdate")
    public boolean passportInfoUpdate(@RequestBody UserPassportEntity userPassportEntity) {
        log.info(String.format("회원번호: %s, 여권번호: %s, 영문명: %s, 국적: %s, 여권만료일: %s, 여권발행국: %s"
                , userPassportEntity.getUserNo()
                , userPassportEntity.getPassportNo()
                , userPassportEntity.getEngName()
                , userPassportEntity.getNationality()
                , userPassportEntity.getExpirationDate()
                , userPassportEntity.getCountryOfIssue()));

        return userService.passportInfoUpdate(userPassportEntity);


    }

    // 회원 탈퇴
    @PostMapping("/delete")
    public boolean deleteUser(@RequestBody UserEntity userEntity) {
        log.info(String.format("탈퇴 할 회원번호: %s", userEntity.getUserNo()));


        return userService.deleteUser(userEntity);

    }

    // 카카오 연결 끊기
    @PostMapping("/kakaoUnlink")
    public boolean kakaoUnlinkUser(@RequestBody Map<String, Object> userInfo) {
        log.info(userInfo.toString());

        return userService.kakaoUnlink(userInfo);
    }

    // 구글 연결 끊기
    @PostMapping("/googleUnlink")
    public boolean gogoleUnlinkUser(@RequestBody Map<String, Object> userInfo) {
        log.info(userInfo.toString());

        return userService.googleUnlink(userInfo);
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
        List<Map<String, Object>> wishListDetails = userService.getWish(userNo);
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

        return userService.wish(userNo, wishListData);
    }

    // 찜 제거
    @PostMapping("wishDelete")
    public boolean wishDelete(@RequestBody WishListEntity wishListEntity) {
        log.info("찜 번호 : " + wishListEntity.getWishNo() );

        return userService.wishDelete(wishListEntity.getWishNo());
    }



}
