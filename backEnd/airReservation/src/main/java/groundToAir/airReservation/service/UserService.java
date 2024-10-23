package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.CountryEntity;
import groundToAir.airReservation.entity.UserEntity;
import groundToAir.airReservation.entity.UserPassportEntity;
import groundToAir.airReservation.entity.UserRoleEntity;
import groundToAir.airReservation.enumType.SocialType;
import groundToAir.airReservation.repository.CountryRepository;
import groundToAir.airReservation.repository.UserPassportRepository;
import groundToAir.airReservation.repository.UserRepository;
import groundToAir.airReservation.repository.UserRoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;

// 회원 정보 관련 Service
@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserPassportRepository userPassportRepository;

    private final PasswordEncoder passwordEncoder;
    private final UserRoleRepository userRoleRepository;

    private final CountryRepository countryRepository;
    private final RestTemplate restTemplate;

    public UserService(UserRepository userRepository, UserPassportRepository userPassportRepository, PasswordEncoder passwordEncoder, UserRoleRepository userRoleRepository, CountryRepository countryRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.userPassportRepository = userPassportRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRoleRepository = userRoleRepository;
        this.countryRepository = countryRepository;
        this.restTemplate = restTemplate;
    }

    // 아이디 중복 체크
    public int idCheck(String userId) {
        boolean checkResult = userRepository.existsByUserId(userId);

        // checkResult가 true면 아이디가 중복이므로 0, 아니면 1로 전달
        if (checkResult) {
            return 0;
        } else {
            return 1;
        }
    }

    // 이메일 중복 체크
    public int emailCheck(String email) {
        boolean checkResult = userRepository.existsByEmail(email);

        // checkResult가 true면 이메일이 중복이므로 0, 아니면 1로 전달
        if (checkResult) {
            return 0;
        } else {
            return 1;
        }

    }

    // 2. 카카오에서 받은 인가 코드로 액세스 토큰 요청 (SpringBoot)
    public String getKakaoAccessToken(Map<String, Object> userInfo) {



        // 요청에 필요한 파라미터 설정
      String requestBody = "grant_type="+ userInfo.get("grant_type") +
              "&client_id=" + userInfo.get("client_id") +
              "&redirect_uri=" + userInfo.get("redirect_uri") +
              "&code=" + userInfo.get("code");

      // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // POST 방식으로 추출할 때는 requestBody도 넣어줌.
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        // 액세스 토큰 요청
        ResponseEntity<Map> response = restTemplate.exchange((String) userInfo.get("access_token_url"), HttpMethod.POST, request, Map.class);

        log.info("{}", response);

        // 응답에서 액세스 토큰 추출
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null) {
            // 모든 데이터 중 access_token만 추출
            return (String) responseBody.get("access_token");
        }
        throw new RuntimeException("액세스 토큰을 가져오는 데 실패했습니다.");

    }

    // 3. 카카오 로그인
    public void kakaoUser(Map<String, Object> userInfo) {
        String accessToken = getKakaoAccessToken(userInfo);

        log.info(accessToken);

        // 사용자 정보를 가져오기 위한 카카오 API URL
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // 사용자 정보 요청
        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.POST, request, Map.class);

        // 사용자 정보 처리
        Map<String, Object> kakaoUserInfo = response.getBody();
        if (kakaoUserInfo != null) {
            String socialId = kakaoUserInfo.get("id").toString();
            log.info("Kakao User ID : " + socialId);

            Optional<UserEntity> existingUser = userRepository.findBySocialId(socialId);

            if (existingUser.isPresent()) {
                log.info("이미 해당 계정이 존재하므로 로그인만 합니다.");

            } else {
                // 새 사용자로 등록

                // USER 권한 부여를 위해 UserRoleEntity 조회
                UserRoleEntity userRole = userRoleRepository.findByRoleName("USER");

                UserEntity userEntity = new UserEntity();
                userEntity.setRoleName(userRole); // 권한 설정
                userEntity.setSocialId(socialId);
                userEntity.setSocialType(SocialType.KAKAO);
                userEntity.setTotalUserNo((int) (userRepository.count() + 1)); // 사용자 수 설정

                userRepository.save(userEntity);
            }
        }
    }


    // GroundToAir 회원가입 진행(DIRECT)
    // @Transactional : 모든 작업이 성공적으로 완료될 시 DB에 Commit 시키고, 오류 발생 시 RollBack 시킴
    @Transactional
    public int registerUser(UserEntity userEntity) {

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

        // 여권정보 입력 사이트 이동에 필요한 userNo를 가져옴
        return userEntity.getUserNo();

    }

    // 여권 입력 진행
    @Transactional
    public void registerPassport(UserPassportEntity userPassportEntity) {

        // UserPassportEntity의 경우 UserEntity에 있는 기본키(userNo), CountryEntity에 있는 컬럼(country)을 가져와 기본키 및 외래키로 사용하기 때문에 추가하는 작업 시 userCheck, nationalityCheck와 같은 작업이 필요하다.

        // userNo를 이용해 UserEntity를 조회
        UserEntity userCheck = userRepository.findById(userPassportEntity.getUserNo())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 회원번호입니다."));

        // nationality를 CountryEntity로 설정
        if (userPassportEntity.getNationality() != null) {
        CountryEntity nationalityCheck = countryRepository.findByCountry(userPassportEntity.getNationality().getCountry())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 국적입니다."));

            userPassportEntity.setNationality(nationalityCheck); // 외래키로 설정
        }

        // countryOfIssue를 CountryEntity로 설정
        if (userPassportEntity.getCountryOfIssue() != null) {
            CountryEntity countryOfIssueCheck = countryRepository.findByCountry(userPassportEntity.getCountryOfIssue().getCountry())
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 국적입니다."));

            userPassportEntity.setCountryOfIssue(countryOfIssueCheck); // 외래키로 설정
        }

        // expirationDate String -> Date 변환
        LocalDate expirationDate = LocalDate.parse(userPassportEntity.getExpirationDate().toString(), DateTimeFormatter.ISO_LOCAL_DATE);

        // UserPassportEntity에 설정
        // ! 위에서 check하고 넣는 이유는 불일치 했던 형식(int, String)을 올바른 형식(UserEntity, CountryEntity)으로 삽입하기 위함이다.
        userPassportEntity.setUser(userCheck);

        userPassportEntity.setExpirationDate(expirationDate);

        userPassportRepository.save(userPassportEntity);
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
