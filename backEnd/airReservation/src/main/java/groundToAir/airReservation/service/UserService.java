package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.UserEntity;
import groundToAir.airReservation.entity.UserRoleEntity;
import groundToAir.airReservation.enumType.SocialType;
import groundToAir.airReservation.repository.UserRepository;
import groundToAir.airReservation.repository.UserRoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

// 회원 정보 관련 Service
@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    private final UserRoleRepository userRoleRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRoleRepository = userRoleRepository;
    }

    // GroundToAir 회원가입 진행(DIRECT)
    // @Transactional : 모든 작업이 성공적으로 완료될 시 DB에 Commit 시키고, 오류 발생 시 RollBack 시킴
    @Transactional
    public void registerUser(UserEntity userEntity) {
        // 중복 검사
        if (userRepository.existsByUserId(userEntity.getUserId())) {
            throw new IllegalArgumentException("중복된 사용자 ID입니다.");
        }
        if (userRepository.existsByEmail(userEntity.getEmail())) {
            throw new IllegalArgumentException("중복된 이메일입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(userEntity.getPassword());

        // birth String -> Date 변환
        LocalDate birthDay = LocalDate.parse(userEntity.getBirth().toString(), DateTimeFormatter.ISO_LOCAL_DATE);

        // USER 권한 부여를 위해 UserRoleEntity 조회
        UserRoleEntity userRole = userRoleRepository.findByRoleName("USER");


        // UserEntity에 설정
        userEntity.setPassword(encodedPassword); // 암호화된 비밀번호 설정
        userEntity.setBirth(birthDay); // 변환된 생일 설정
        userEntity.setSocialType(SocialType.DIRECT); // SocialType에서 DIRECT 설정
        userEntity.setRoleName(userRole); // 권한 설정
        userEntity.setTotalUserNo((int) (userRepository.count() + 1)); // 사용자 수 설정

        userRepository.save(userEntity);

    }

    // GroundToAir 로그인 진행
    public boolean loginUser(UserEntity loginEntity) {
        // userId로 사용자를 조회하고 비밀번호 확인
        UserEntity userEntity = userRepository.findByUserId(loginEntity.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 이미 암호화된 비밀번호와 사용자가 입력한 비밀번호 비교
        return passwordEncoder.matches(loginEntity.getPassword(), userEntity.getPassword());
    }

    // JWT 토큰 생성 (Optional)
    public String createJwtToken(String userId) {
        // JWT 생성 로직
        return "generated-jwt-token"; // 예시로 반환
    }

}
