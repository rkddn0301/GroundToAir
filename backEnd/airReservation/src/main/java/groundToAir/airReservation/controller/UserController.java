package groundToAir.airReservation.controller;

import groundToAir.airReservation.entity.UserEntity;
import groundToAir.airReservation.entity.UserPassportEntity;
import groundToAir.airReservation.service.UserService;
import groundToAir.airReservation.utils.JwtUtil;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    // 카카오 인증
    @PostMapping("/kakao")
    public Map<String, Object> kakaoUser(@RequestBody Map<String, Object> userInfo) {

        log.info(userInfo.toString());
        return userService.kakaoUser(userInfo);
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
        log.info("소유자 추출 : " + userId);

        return userService.getJwtToken(userId); // 새로운 토큰들을 반환
    }



}
