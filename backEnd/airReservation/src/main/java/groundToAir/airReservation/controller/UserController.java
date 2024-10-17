package groundToAir.airReservation.controller;

import groundToAir.airReservation.entity.UserEntity;
import groundToAir.airReservation.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 회원 정보 관련 Controller
@RestController
@Slf4j
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 회원가입 진행
    @PostMapping("/register")
    public void registerUser(@RequestBody UserEntity userEntity) {
        log.info(String.format("아이디: %s, 비밀번호: %s, 성명: %s, 생년월일: %s, 성별: %s, 이메일: %s",
                userEntity.getUserId(),
                userEntity.getPassword(),
                userEntity.getUserName(),
                userEntity.getBirth(),
                userEntity.getGender(),
                userEntity.getEmail()));

        userService.registerUser(userEntity); // UserEntity를 직접 서비스에 전달
    }

    // 로그인 진행
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody UserEntity userEntity) {
        boolean isAuthenticated = userService.loginUser(userEntity);

        if (isAuthenticated) {
            // 로그인 성공 시 JWT 토큰을 반환하거나 세션 생성
            String token = userService.createJwtToken(userEntity.getUserId());
            return ResponseEntity.ok(token);

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패");
        }

    }

}
