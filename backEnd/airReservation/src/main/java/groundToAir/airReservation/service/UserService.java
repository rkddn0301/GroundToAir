package groundToAir.airReservation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import groundToAir.airReservation.entity.*;
import groundToAir.airReservation.enumType.SeatClass;
import groundToAir.airReservation.enumType.SocialType;
import groundToAir.airReservation.repository.*;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;


// 회원 정보 관련 Service
@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserPassportRepository userPassportRepository;

    private final PasswordEncoder passwordEncoder;
    private final UserRoleRepository userRoleRepository;

    private final CountryRepository countryRepository;
    private final WishListRepository wishListRepository;
    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;
    private final ReservationListRepository reservationListRepository;

    // 이메일 이용
    private JavaMailSender mailSender;

    // JSON 파싱 클래스 선언
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UserService(UserRepository userRepository, UserPassportRepository userPassportRepository, PasswordEncoder passwordEncoder, UserRoleRepository userRoleRepository, CountryRepository countryRepository, WishListRepository wishListRepository, RestTemplate restTemplate, JwtUtil jwtUtil, JavaMailSender mailSender, ReservationListRepository reservationListRepository) {
        this.userRepository = userRepository;
        this.userPassportRepository = userPassportRepository;
        this.passwordEncoder = passwordEncoder;
        this.userRoleRepository = userRoleRepository;
        this.countryRepository = countryRepository;
        this.wishListRepository = wishListRepository;
        this.restTemplate = restTemplate;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
        this.reservationListRepository = reservationListRepository;
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

    // 비밀번호 중복 체크
    public int pwCheck(String userNoStr, String password) {

        // String userNo를 int로 변환
        int userNo = Integer.parseInt(userNoStr);


        UserEntity userEntity = userRepository.findById(userNo).orElse(null);
        // 사용자가 존재하고, 비밀번호가 일치할 때
        if (userEntity != null && passwordEncoder.matches(password, userEntity.getPassword())) {
            return 0; // 중복된 비밀번호 있음
        } else {
            return 1; // 중복된 비밀번호 없음
        }
    }

    // JWT를 전체적으로 추출하는 메서드 오버로딩

    // DIRECT 이용자, 리프레시 토큰의 경우
    public Map<String, Object> getJwtToken(String userId, int userNo) {
        return getJwtToken(userId, userNo, "", "");
    }

    // 타사인증 이용자 로그인 시
    public Map<String, Object> getJwtToken(String userId, int userNo, String socialId, String federationAccessToken) {
        // JWT 생성
        Map<String, Object> accessToken = jwtUtil.generateAccessToken(userId, userNo);
        Map<String, Object> refreshToken = jwtUtil.generateRefreshToken(userId, userNo);

        // 두 토큰을 맵으로 묶어 반환
        Map<String, Object> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken.get("token"));
        tokens.put("accessTokenExpiration", accessToken.get("expiration"));
        tokens.put("refreshToken", refreshToken.get("token"));
        tokens.put("refreshTokenExpiration", refreshToken.get("expiration"));
        tokens.put("socialId", socialId); // 타사인증 ID
        tokens.put("federationAccessToken", federationAccessToken); // 타사인증 토큰

        return tokens;

    }


    // 2. 카카오에서 받은 인가 코드로 액세스 토큰 요청 (SpringBoot)
    public String getKakaoAccessToken(Map<String, Object> userInfo) {

        // 요청에 필요한 파라미터 설정
        String requestBody = "grant_type=" + userInfo.get("grant_type") +
                "&client_id=" + userInfo.get("client_id") +
                "&redirect_uri=" + userInfo.get("redirect_uri") +
                "&code=" + userInfo.get("code");

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // HttpEntity : HTTP 요청 또는 응답을 나타내는 클래스로 아래 코드는 요청할 때 사용.
        // POST 방식으로 추출할 때는 requestBody도 넣어줌.
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        log.info("tokenRequest : {}", request);

        // ResponseEntity : 서버로부터 받은 응답을 처리하는 객체.
        // restTemplate.exchange(URL, HttpMethod, request, ResponseType) : 지정된 URL에 대해 특정 HttpMethod로 요청을 보내고 그에 대한 응답을 요청 본문과 헤더를 포함(request)하여 원하는 타입(ResponseType)으로 받아오는 역할
        // 액세스 토큰 응답 처리
        ResponseEntity<Map> response = restTemplate.exchange((String) userInfo.get("access_token_url"), HttpMethod.POST, request, Map.class);

        log.info("tokenResponse : {}", response);

        // 응답에서 액세스 토큰 추출
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null) {
            // 모든 데이터 중 access_token만 추출
            return (String) responseBody.get("access_token");
        }
        throw new RuntimeException("액세스 토큰을 가져오는 데 실패했습니다.");

    }

    // 3. 카카오 로그인
    public Map<String, Object> kakaoUser(Map<String, Object> userInfo) {
        String accessToken = getKakaoAccessToken(userInfo);


        // 사용자 정보를 가져오기 위한 카카오 API URL
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // 사용자 정보 요청
        // restTemplate.exchange(URL, HttpMethod, request, ResponseType) : 지정된 URL에 대해 특정 HttpMethod로 요청을 보내고 그에 대한 응답을 요청 본문과 헤더를 포함(request)하여 원하는 타입(ResponseType)으로 받아오는 역할
        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.POST, request, Map.class);

        // 사용자 정보 처리
        Map<String, Object> kakaoUserInfo = response.getBody();
        log.info("kakaoUserInfo : {}", kakaoUserInfo);
        if (kakaoUserInfo != null) {
            String socialId = kakaoUserInfo.get("id").toString();
            log.info("Kakao User ID : " + socialId);

            Optional<UserEntity> existingUser = userRepository.findBySocialId(socialId);
            int userNo = existingUser.map(UserEntity::getUserNo).orElse(0); // userNo를 가져오거나 0 반환

            if (existingUser.isPresent()) {
                log.info("이미 해당 계정이 존재하므로 로그인만 합니다.");

                return getJwtToken(socialId, userNo, socialId, accessToken);
            } else {
                // 새 사용자로 등록

                // USER 권한 부여를 위해 UserRoleEntity 조회
                UserRoleEntity userRole = userRoleRepository.findByRoleName("USER");

                UserEntity userEntity = new UserEntity();
                userEntity.setRoleName(userRole); // 권한 설정
                userEntity.setSocialId(socialId);
                userEntity.setSocialType(SocialType.KAKAO);

                userRepository.save(userEntity);

                userEntity.setTotalUserNo(userEntity.getUserNo()); // 연동번호는 생성된 회원번호와 동일하게 설정

                // 여권 정보를 위한 빈 UserPassportEntity 생성
                UserPassportEntity userPassportEntity = new UserPassportEntity();
                userPassportEntity.setPassportUser(userEntity); // 외래키를 이용하여 회원번호 추가
                userPassportRepository.save(userPassportEntity);

                return getJwtToken(socialId, userEntity.getUserNo(), socialId, accessToken);

            }
        }

        return null;
    }

    // 2. 구글에서 받은 인가 코드로 액세스 토큰 요청 (SpringBoot)
    public String getGoogleAccessToken(Map<String, Object> userInfo) {

        // 요청에 필요한 파라미터 설정
        String requestBody = "grant_type=" + userInfo.get("grant_type") +
                "&client_id=" + userInfo.get("client_id") +
                "&client_secret=" + userInfo.get("client_secret") +
                "&redirect_uri=" + userInfo.get("redirect_uri") +
                "&code=" + userInfo.get("code");

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // HttpEntity : HTTP 요청 또는 응답을 나타내는 클래스로 아래 코드는 요청할 때 사용.
        // POST 방식으로 추출할 때는 requestBody도 넣어줌.
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        log.info("tokenRequest : {}", request);

        // ResponseEntity : 서버로부터 받은 응답을 처리하는 객체.
        // restTemplate.exchange(URL, HttpMethod, HttpEntity, ResponseType) : 지정된 URL에 대해 특정 HttpMethod로 요청을 보내고 그에 대한 응답을 요청 본문과 헤더를 포함(HttpEntity)하여 원하는 타입(ResponseType)으로 받아오는 역할
        // 액세스 토큰 응답 처리
        ResponseEntity<Map> response = restTemplate.exchange((String) userInfo.get("access_token_url"), HttpMethod.POST, request, Map.class);

        log.info("tokenResponse : {}", response);

        // 응답에서 액세스 토큰 추출
        Map<String, Object> responseBody = response.getBody();
        if (responseBody != null) {
            // 모든 데이터 중 access_token만 추출
            return (String) responseBody.get("access_token");
        }
        throw new RuntimeException("액세스 토큰을 가져오는 데 실패했습니다.");

    }

    // 3. 구글 로그인
    public Map<String, Object> googleUser(Map<String, Object> userInfo) {
        String accessToken = getGoogleAccessToken(userInfo);


        // 사용자 정보를 가져오기 위한 카카오 API URL
        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

        // 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        // 사용자 정보 요청
        HttpEntity<String> request = new HttpEntity<>(headers);
        // restTemplate.exchange(URL, HttpMethod, request, ResponseType) : 지정된 URL에 대해 특정 HttpMethod로 요청을 보내고 그에 대한 응답을 요청 본문과 헤더를 포함(request)하여 원하는 타입(ResponseType)으로 받아오는 역할
        ResponseEntity<Map> response = restTemplate.exchange(userInfoUrl, HttpMethod.POST, request, Map.class);

        // 사용자 정보 처리
        Map<String, Object> googleUserInfo = response.getBody();
        log.info("googleUserInfo : {}", googleUserInfo);
        if (googleUserInfo != null) {
            String socialId = googleUserInfo.get("sub").toString();
            log.info("Google User ID : " + socialId);

            Optional<UserEntity> existingUser = userRepository.findBySocialId(socialId);
            int userNo = existingUser.map(UserEntity::getUserNo).orElse(0); // userNo를 가져오거나 0 반환

            if (existingUser.isPresent()) {
                log.info("이미 해당 계정이 존재하므로 로그인만 합니다.");

                return getJwtToken(socialId, userNo, socialId, accessToken);
            } else {
                // 새 사용자로 등록

                // USER 권한 부여를 위해 UserRoleEntity 조회
                UserRoleEntity userRole = userRoleRepository.findByRoleName("USER");

                UserEntity userEntity = new UserEntity();
                userEntity.setRoleName(userRole); // 권한 설정
                userEntity.setSocialId(socialId);
                userEntity.setSocialType(SocialType.GOOGLE);

                userRepository.save(userEntity);

                userEntity.setTotalUserNo(userEntity.getUserNo()); // 연동번호는 생성된 회원번호와 동일하게 설정

                // 여권 정보를 위한 빈 UserPassportEntity 생성
                UserPassportEntity userPassportEntity = new UserPassportEntity();
                userPassportEntity.setPassportUser(userEntity); // 외래키를 이용하여 회원번호 추가
                userPassportRepository.save(userPassportEntity);

                return getJwtToken(socialId, userEntity.getUserNo(), socialId, accessToken);

            }
        }

        return null;
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

        userRepository.save(userEntity);

        userEntity.setTotalUserNo(userEntity.getUserNo()); // 연동번호는 생성된 회원번호와 동일하게 설정

        // 여권 정보를 위한 빈 UserPassportEntity 생성
        UserPassportEntity userPassportEntity = new UserPassportEntity();
        userPassportEntity.setPassportUser(userEntity); // 외래키를 이용하여 회원번호 추가
        userPassportRepository.save(userPassportEntity);

        // 여권정보 입력 사이트 이동에 필요한 userNo를 가져옴
        return userEntity.getUserNo();

    }

    // 여권 입력 진행
    // @Transactional : 모든 작업이 성공적으로 완료될 시 DB에 Commit 시키고, 오류 발생 시 RollBack 시킴
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
        if (userPassportEntity.getExpirationDate() != null) {
            LocalDate expirationDate = LocalDate.parse(userPassportEntity.getExpirationDate().toString(), DateTimeFormatter.ISO_LOCAL_DATE);
            userPassportEntity.setExpirationDate(expirationDate);
        }


        // UserPassportEntity에 설정
        // ! 위에서 check하고 넣는 이유는 불일치 했던 형식(int, String)을 올바른 형식(UserEntity, CountryEntity)으로 삽입하기 위함이다.
        userPassportEntity.setPassportUser(userCheck);


        userPassportRepository.save(userPassportEntity);
    }


    // GroundToAir 로그인 진행
    public Map<String, Object> loginUser(UserEntity loginEntity) {
        // 입력한 userId가 회원 테이블에 존재하는지 확인
        UserEntity userEntity = userRepository.findByUserId(loginEntity.getUserId()).orElse(null);


        // 비밀번호 비교 (암호화된 비밀번호와 비교)
        // passwordEncoder.matches(매개변수 password, 암호화된 비교대상 password) : 입력한 password와 실제 Entity에 있는 password와 비교하여 일치 여부를 추출하는 메서드
        if (userEntity != null && passwordEncoder.matches(loginEntity.getPassword(), userEntity.getPassword())) {

            return getJwtToken(userEntity.getUserId(), userEntity.getUserNo());  // 로그인 성공, 토큰 반환
        } else {
            return null;  // 로그인 실패 (비밀번호 틀림)
        }
    }

    // 이메일 전송 메서드
    private void sendEmail(String toEmail, String messageContent, String messageType) {
        long startTime = System.currentTimeMillis();
        SimpleMailMessage message = new SimpleMailMessage();
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

    // 아이디 찾기
    public boolean idFind(String userName,
                          String email) {

        // 사용자 아이디 찾기
        String userId = userRepository.findUserIdByUserNameAndEmail(userName, email);

        if (userId != null) {
            // 아이디가 존재할 경우 이메일로 전송
            sendEmail(email, userId, "idFind");
            return true;
        } else {
            // 아이디가 없을 경우
            return false;
        }


    }


    // 비밀번호 찾기
    public boolean pwFind(String userName, String email) {
        // 성명과 이메일로 사용자 조회
        UserEntity user = userRepository.findByUserNameAndEmail(userName, email);

        // 사용자가 존재하지 않으면 false 반환
        if (user == null) {
            return false;
        }

        // 임시 비밀번호 생성
        String temporaryPassword = generateTemporaryPassword();
        log.info("임시비밀번호 : " + temporaryPassword);

        // 임시 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(temporaryPassword);

        // DB에 암호화된 비밀번호 저장
        user.setPassword(encryptedPassword);
        userRepository.save(user);

        // 이메일로 임시 비밀번호 전송
        sendEmail(email, temporaryPassword, "pwFind");

        return true;
    }

    // 임시 비밀번호 생성 (영문자+숫자+특수문자 포함)
    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

        // StringBuilder : 문자열을 효율적으로 생성해주는 클래스이며, 문자열을 변경할 때마다 기존 객체에 값을 추가해줌.
        // 반대로 String은 문자열이 변경될 때마다 새로 객체를 생성해야함.
        StringBuilder password = new StringBuilder();

        // Random : 무작위로 생성해주는 객체
        Random rand = new Random();
        for (int i = 0; i < 6; i++) {
            int index = rand.nextInt(chars.length()); // chars 길이(0 ~ chars.length() -1)를 기준으로 무작위로 돌려 숫자값으로 반환
            password.append(chars.charAt(index)); // chars 문자열에서 index 위치에 있는 문자를 비밀번호에 추가함.
        }

        return password.toString(); // StringBuilder에 있는 내용을 String으로 바꿔서 넘김
    }

    // 개인정보 가져오기
    public Map<String, Object> myInfo(int userNo) {
        Optional<UserEntity> optionalUser = userRepository.findUserWithPassportByUserNo(userNo);

        // 결과를 Map으로 변환
        Map<String, Object> responseMap = new HashMap<>();
        if (optionalUser.isPresent()) {
            UserEntity user = optionalUser.get();
            responseMap.put("userNo", user.getUserNo());
            responseMap.put("userId", user.getUserId());
            responseMap.put("userName", user.getUserName());
            responseMap.put("birth", user.getBirth());
            responseMap.put("gender", user.getGender());
            responseMap.put("email", user.getEmail());
            responseMap.put("socialType", user.getSocialType());

            // 여권 정보가 존재할 경우 추가
            if (user.getPassport() != null) {
                responseMap.put("passportNo", user.getPassport().getPassportNo() != null ? user.getPassport().getPassportNo() : "");
                responseMap.put("passportUserEngName", user.getPassport().getEngName() != null ? user.getPassport().getEngName() : "");
                responseMap.put("nationality", user.getPassport().getNationality() != null ? user.getPassport().getNationality().getCountry() : "");
                responseMap.put("passportExpirationDate", user.getPassport().getExpirationDate() != null ? user.getPassport().getExpirationDate() : "");
                responseMap.put("passportCountryOfIssue", user.getPassport().getCountryOfIssue() != null ? user.getPassport().getCountryOfIssue().getCountry() : "");
            } else {
                responseMap.put("passportNo", "");
                responseMap.put("passportUserEngName", "");
                responseMap.put("nationality", "");
                responseMap.put("passportExpirationDate", "");
                responseMap.put("passportCountryOfIssue", "");
            }
        } else {
            responseMap.put("message", "User not found");
        }
        return responseMap;
    }

    // 개인정보 수정
    // @Transactional : 모든 작업이 성공적으로 완료될 시 DB에 Commit 시키고, 오류 발생 시 RollBack 시킴
    @Transactional
    public boolean myInfoUpdate(UserEntity userEntity) {

        log.info("userService에 들어옴 {}", userEntity);

        // 기존 데이터 조회
        UserEntity existingUser = userRepository.findById(userEntity.getUserNo()).orElse(null);

        if (existingUser == null) {
            log.warn("사용자가 존재하지 않습니다: 회원번호 {}", userEntity.getUserNo());
            return false; // 사용자가 없는 경우 업데이트 실패
        }

        // 업데이트 여부 확인
        boolean isUpdated = false;

        // userId 변경 확인 (보낸 아이디 정보가 존재하거나, 기존 아이디 정보와 동일하지 않을 경우)
        if (userEntity.getUserId() != null && !userEntity.getUserId().equals(existingUser.getUserId())) {
            log.info("아이디 변경됨");
            existingUser.setUserId(userEntity.getUserId());
            isUpdated = true;
        }

        // password 변경 확인 및 암호화 (보낸 비밀번호 정보가 존재하거나, 비어있지 않을 경우)
        if (userEntity.getPassword() != null && !userEntity.getPassword().isEmpty()) {

            String encodedPassword = passwordEncoder.encode(userEntity.getPassword());


            log.info("비밀번호 변경됨");
            existingUser.setPassword(encodedPassword);
            isUpdated = true;


        }

        // email 변경 확인 (보낸 이메일 정보가 존재하거나, 기존 이메일 정보와 동일하지 않을 경우)
        if (userEntity.getEmail() != null && !userEntity.getEmail().equals(existingUser.getEmail())) {
            log.info("이메일 변경됨");
            existingUser.setEmail(userEntity.getEmail());
            isUpdated = true;
        }

        // 업데이트가 필요한 경우에만 저장
        if (isUpdated) {
            userRepository.save(existingUser);
            return true;
        }

        return false;
    }

    // 여권정보 수정
    // @Transactional : 모든 작업이 성공적으로 완료될 시 DB에 Commit 시키고, 오류 발생 시 RollBack 시킴
    @Transactional
    public boolean passportInfoUpdate(UserPassportEntity userPassportEntity) {

        log.info("userService에 들어옴 {}", userPassportEntity);

        // 기존 데이터 조회
        UserPassportEntity existingUser = userPassportRepository.findById(userPassportEntity.getUserNo()).orElse(null);

        if (existingUser == null) {
            log.warn("사용자가 존재하지 않습니다: 회원번호 {}", userPassportEntity.getUserNo());
            return false; // 사용자가 없는 경우 업데이트 실패
        }

        // 업데이트 여부 확인
        boolean isUpdated = false;

        // passportNo 변경 확인 (보낸 여권번호가 존재하거나, 기존 여권번호와 동일하지 않을 경우)
        if (userPassportEntity.getPassportNo() != null && !userPassportEntity.getPassportNo().equals(existingUser.getPassportNo())) {
            log.info("여권번호 변경됨");
            existingUser.setPassportNo(userPassportEntity.getPassportNo());
            isUpdated = true;
        }

        // engName 변경 확인 (보낸 영문명이 존재하거나, 기존 영문명과 동일하지 않을 경우)
        if (userPassportEntity.getEngName() != null && !userPassportEntity.getEngName().equals(existingUser.getEngName())) {
            log.info("영문명 변경됨");
            existingUser.setEngName(userPassportEntity.getEngName());
            isUpdated = true;
        }

        // nationality 변경 확인
        if (userPassportEntity.getNationality() != null) { // 내가 작성한 국적이 존재 할 경우
            // 기존 국적(existingUser)에서 변화가 있을 경우 변경됨
            /*
            existingUser.getNationality() == null을 넣은 이유는 기존 국적이 비어 있을 때 내가 작성한 국적이랑 비교하려는 경우
            --> !userPassportEntity.getNationality().getCountry().equals(existingUser.getNationality().getCountry()) 여기서 기존 국적이 이미 null 이라 getCountry를 가져올 수 없어서 오류가 발생하기 때문.
             */

            if (userPassportEntity.getNationality().getCountry() != null &&
                    (existingUser.getNationality() == null ||
                            !userPassportEntity.getNationality().getCountry().equals(existingUser.getNationality().getCountry()))) {
                log.info("국적 변경됨");
                CountryEntity nationalityCheck = countryRepository.findByCountry(userPassportEntity.getNationality().getCountry())
                        .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 국적입니다."));

                existingUser.setNationality(nationalityCheck); // 외래키로 설정
                isUpdated = true;
            }
        } else { // 내가 작성한 국적이 null일 경우
            //  기존에 국적이 있었다면 변경된 것으로 처리
            if (existingUser.getNationality() != null) {
                log.info("국적이 비어있는데, 기존 값이 존재하여 변경됨");
                existingUser.setNationality(null);
                isUpdated = true;
            }
        }


        // expirationDate 변경 확인 (보낸 여권만료일이 존재하거나, 기존 여권만료일과 동일하지 않을 경우)
        if (userPassportEntity.getExpirationDate() != null) {
            // 보낸 만료일이 존재하고 기존 만료일과 다른 경우
            if (!userPassportEntity.getExpirationDate().equals(existingUser.getExpirationDate())) {
                log.info("여권만료일 변경됨");
                // expirationDate String -> Date 변환
                LocalDate expirationDate = LocalDate.parse(userPassportEntity.getExpirationDate().toString(), DateTimeFormatter.ISO_LOCAL_DATE);
                existingUser.setExpirationDate(expirationDate);
                isUpdated = true;
            }
        } else {
            // 만약 보낸 값이 null이면 기존 값과 동일하면 변화 없음
            if (existingUser.getExpirationDate() != null) {
                log.info("여권만료일이 비어있는데, 기존 값이 존재하여 변경됨");
                existingUser.setExpirationDate(null);
                isUpdated = true;
            }
        }


        // countryOfIssue 변경 확인
        if (userPassportEntity.getCountryOfIssue() != null) { // 내가 작성한 여권발행국이 존재 할 경우
            // 기존 여권발행국(existingUser)에서 변화가 있을 경우 변경됨
            /*
            existingUser.getCountryOfIssue() == null을 넣은 이유는 기존 여권발행국이 비어 있을 때 내가 작성한 여권발행국이랑 비교하려는 경우
            --> !userPassportEntity.getCountryOfIssue().getCountry().equals(existingUser.getCountryOfIssue().getCountry()) 여기서 기존 여권발행국이 이미 null 이라 getCountry를 가져올 수 없어서 오류가 발생하기 때문.
             */
            if (userPassportEntity.getCountryOfIssue().getCountry() != null &&
                    (existingUser.getCountryOfIssue() == null ||
                            !userPassportEntity.getCountryOfIssue().getCountry().equals(existingUser.getCountryOfIssue().getCountry()))) {
                log.info("여권발행국 변경됨");
                CountryEntity countryOfIssueCheck = countryRepository.findByCountry(userPassportEntity.getCountryOfIssue().getCountry())
                        .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 국적입니다."));

                existingUser.setCountryOfIssue(countryOfIssueCheck); // 외래키로 설정
                isUpdated = true;
            }

        } else { // 내가 작성한 여권발행국이 null일 경우
            // 기존에 여권발행국이 있었다면 변경된 것으로 처리
            if (existingUser.getCountryOfIssue() != null) {
                log.info("여권발행국이 비어있는데 기존 값이 존재하여 변경됨");
                existingUser.setCountryOfIssue(null);
                isUpdated = true;
            }

        }


        // 업데이트가 필요한 경우에만 저장
        if (isUpdated) {
            userPassportRepository.save(existingUser);
            return true;
        }

        return false;
    }

    // 회원 탈퇴
    // @Transactional : 모든 작업이 성공적으로 완료될 시 DB에 Commit 시키고, 오류 발생 시 RollBack 시킴
    @Transactional
    public boolean deleteUser(UserEntity userEntity) {
        // 기존 데이터 조회
        UserEntity existingUser = userRepository.findById(userEntity.getUserNo()).orElse(null);

        if (existingUser == null) {
            log.warn("사용자가 존재하지 않습니다: 회원번호 {}", userEntity.getUserNo());
            return false; // 사용자가 없는 경우 업데이트 실패
        }

        try {
            userRepository.deleteById(userEntity.getUserNo());
            log.info("회원 삭제 성공: 회원번호 {}", userEntity.getUserNo());
            return true;
        } catch (Exception e) {
            log.error("회원 삭제 실패: 회원번호 {}, 오류: {}", userEntity.getUserNo(), e.getMessage());
            return false;

        }


    }

    // 카카오 연결 끊기
    public boolean kakaoUnlink(Map<String, Object> userInfo) {

        // 연결 끊기에 필요한 데이터들 String 형식으로 변환
        String accessToken = (String) userInfo.get("accessToken");

        String requestBody = "target_id_type=" + userInfo.get("target_id_type") +
                "&target_id=" + userInfo.get("target_id");

        // 카카오 이용자를 연결 끊기 위한 카카오 API URL
        String unLinkUrl = "https://kapi.kakao.com/v1/user/unlink";

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        // HttpEntity 생성
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        try {
            // restTemplate.exchange(URL, HttpMethod, request, ResponseType) : 지정된 URL에 대해 특정 HttpMethod로 요청을 보내고 그에 대한 응답을 요청 본문과 헤더를 포함(request)하여 원하는 타입(ResponseType)으로 받아오는 역할
            ResponseEntity<String> response = restTemplate.exchange(unLinkUrl, HttpMethod.POST, request, String.class);
            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            log.error("카카오 연결 끊기 요청 중 예외 발생: {}", e.getMessage());
            return false;
        }

    }

    // 구글 연결 끊기
    public boolean googleUnlink(Map<String, Object> userInfo) {
        // 연결 끊기에 필요한 데이터들 String 형식으로 변환
        String accessToken = (String) userInfo.get("accessToken");

        // 구글 연결 끊기 API URL
        String unLinkUrl = "https://accounts.google.com/o/oauth2/revoke?token=" + accessToken;

        try {
            // restTemplate.postForEntity(URL, request, ResponseType.class) : 지정한 URL을 요청(request)에 따라 POST 형식으로 수행하여 응답(ResponseType.class)을 받아오는 역할.
            ResponseEntity<String> response = restTemplate.postForEntity(unLinkUrl, null, String.class);
            return response.getStatusCode().is2xxSuccessful();

        } catch (Exception e) {
            log.error("구글 연결 끊기 요청 중 예외 발생: {}", e.getMessage());
            return false;
        }
    }

    // 찜 조회
    public List<Map<String, Object>> getWish(int userNo) {
        // ! wishListEntity의 offer 속성을 JSON 문자열로 변환하여 DB에 저장했으므로, 예약 상세 페이지에서 이를 확인하기 위해 다시 Java 객체로 변환하는 과정이 필요하다.
        // DB에서 가져온 데이터
        List<Map<String, Object>> wishList = wishListRepository.findWishList(userNo);

        return parsingText(wishList, "offer");
    }


    // 찜 아이콘 클릭 스위칭
    public boolean wish(int userNo, Map<String, Object> wishListData) {

        // 사용자 번호를 WishListEntity에 추가
        UserEntity user = new UserEntity();
        user.setUserNo(userNo);

        // LocalDateTime 형변환
        String departureTimeStr = (String) wishListData.get("departureTime");
        String arrivalTimeStr = (String) wishListData.get("arrivalTime");

        LocalDateTime departureTime = !departureTimeStr.isEmpty() ? LocalDateTime.parse(departureTimeStr) : null;
        LocalDateTime arrivalTime = !arrivalTimeStr.isEmpty() ? LocalDateTime.parse(arrivalTimeStr) : null;

        // WishListEntity 생성 및 가는편에 해당하는 항공권 데이터 삽입
        WishListEntity wishList = new WishListEntity();
        wishList.setWishListUser(user);
        wishList.setAirlinesIata((String) wishListData.get("airlinesIata"));
        wishList.setDepartureIata((String) wishListData.get("departureIata"));
        wishList.setDepartureTime(departureTime);
        wishList.setArrivalIata((String) wishListData.get("arrivalIata"));
        wishList.setArrivalTime(arrivalTime);
        wishList.setFlightNo((String) wishListData.get("flightNo"));
        wishList.setTurnaroundTime((String) wishListData.get("turnaroundTime"));
        wishList.setStopLine((String) wishListData.get("stopLine"));

        // 왕복인지 확인
        if (!wishListData.get("reStopLine").toString().isEmpty()) {

            String reDepartureTimeStr = (String) wishListData.get("reDepartureTime");
            String reArrivalTimeStr = (String) wishListData.get("reArrivalTime");

            LocalDateTime reDepartureTime = reDepartureTimeStr != null && !reDepartureTimeStr.isEmpty()
                    ? LocalDateTime.parse(reDepartureTimeStr)
                    : null;
            LocalDateTime reArrivalTime = reArrivalTimeStr != null && !reArrivalTimeStr.isEmpty()
                    ? LocalDateTime.parse(reArrivalTimeStr)
                    : null;

            wishList.setReAirlinesIata((String) wishListData.get("reAirlinesIata"));
            wishList.setReDepartureIata((String) wishListData.get("reDepartureIata"));
            wishList.setReDepartureTime(reDepartureTime);
            wishList.setReArrivalIata((String) wishListData.get("reArrivalIata"));
            wishList.setReArrivalTime(reArrivalTime);
            wishList.setReFlightNo((String) wishListData.get("reFlightNo"));
            wishList.setReTurnaroundTime((String) wishListData.get("reTurnaroundTime"));
            wishList.setReStopLine((String) wishListData.get("reStopLine"));
        }

        // 인원 수 및 좌석 등급 등 추가 필드 설정
        wishList.setAdults((Integer) wishListData.get("adults"));
        wishList.setChildrens((Integer) wishListData.get("childrens"));
        wishList.setInfants((Integer) wishListData.get("infants"));
        wishList.setSeatClass(SeatClass.valueOf((String) wishListData.get("seatClass")));
        wishList.setTotalPrice((Integer) wishListData.get("totalPrice"));

        // 항공편 데이터를 문자열로 삽입하기 위해 변환
        try {
            Object offerData = wishListData.get("offer");

            if (offerData instanceof LinkedHashMap) { // offer가 LinkedHashMap으로 가져 올 경우
                String offerJson = objectMapper.writeValueAsString(offerData); // Java 객체 --> JSON 문자열 변환
                wishList.setOffer(offerJson);
            } else {
                wishList.setOffer(null);
            }
        } catch (JsonProcessingException e) {
            log.error("OFFER JSON --> TEXT 변환 중 오류 발생 : ", e);
            wishList.setOffer(null);
        }

        // 사용자 번호와 여러 조건에 해당하는 찜 목록이 이미 존재하는지 확인
        Optional<WishListEntity> existingWishList =
                wishListRepository.findByWishListUser_UserNoAndFlightNoAndDepartureTimeAndArrivalTimeAndReFlightNoAndReDepartureTimeAndReArrivalTime(
                        wishList.getWishListUser().getUserNo(),
                        wishList.getFlightNo(),
                        wishList.getDepartureTime(),
                        wishList.getArrivalTime(),
                        wishList.getReFlightNo(),
                        wishList.getReDepartureTime(),
                        wishList.getReArrivalTime()
                );

        if (existingWishList.isPresent()) {
            // 찜 항목이 이미 존재하면 삭제
            wishListRepository.delete(existingWishList.get());
            return false; // 삭제되었으므로 false 리턴
        } else {
            // 찜 항목이 존재하지 않으면 추가
            wishListRepository.save(wishList);
            return true; // 추가되었으므로 true 리턴
        }
    }

    // 찜 제거
    public boolean wishDelete(int wishNo) {
        // 기존 데이터 조회
        WishListEntity existingWish = wishListRepository.findById(wishNo).orElse(null);
        if (existingWish == null) {
            log.warn("찜 데이터가 존재하지 않습니다: 찜번호 {}", wishNo);
            return false; // 데이터가 없는 경우 업데이트 실패
        }
        try {
            wishListRepository.deleteById(wishNo);
            log.info("찜 데이터 삭제 성공: 찜번호 {}", wishNo);
            return true;
        } catch (Exception e) {
            log.error("찜 데이터 삭제 실패: 찜번호 {}, 오류: {}", wishNo, e.getMessage());
            return false;

        }
    }

    // 예약내역 상세 데이터 호출
    public List<Map<String, Object>> reservationDetail(Map<String, Object> reservationDetailInfo) {
        if ("".equals(reservationDetailInfo.get("revName")) && "".equals(reservationDetailInfo.get("revCode"))) {
            return null;
        } else {
            String revName = (String) reservationDetailInfo.get("revName"); // 예약자명
            String revCode = (String) reservationDetailInfo.get("revCode"); // 예약코드

            // 예약자명, 예약코드가 일치하는 상세 데이터 추출
            List<Map<String, Object>> reservationList = reservationListRepository.findByRevNameAndRevCode(revName, revCode);

            return parsingText(reservationList, "orders");
                }
            }

    // 예약내역 조회
    public List<Map<String, Object>> getRevList(int userNo) {
        // ! ReservationListEntity의 order 속성을 JSON 문자열로 변환하여 DB에 저장했으므로, 예약 상세 페이지에서 이를 확인하기 위해 다시 Java 객체로 변환하는 과정이 필요하다.
        // DB에서 가져온 데이터
        List<Map<String, Object>> revList = reservationListRepository.findRevList(userNo);

        return parsingText(revList, "orders");
    }

    // JSON 문자열 변환 메서드 (찜 내역, 예약내역, 예약상세)
    private List<Map<String, Object>> parsingText(List<Map<String, Object>> parsingList, String containsKey) {
        // containsKey 변환
        for (Map<String, Object> item : parsingList) {
            if (item.containsKey(containsKey)) {
                try {
                    // containsKeyString는 String으로 되어 있음
                    String containsKeyString = (String) item.get(containsKey);

                    // JSON 문자열 --> Java 객체 변환
                    // ! TypeReference<>() : Map<String, Object> 타입으로 변환하도록 ObjectMapper 클래스에 요청한다.
                    Map<String, Object> containsKeyData = objectMapper.readValue(containsKeyString, new TypeReference<>() {
                    });

                    // 수정 불가한 Map을 새로운 Map으로 덮어쓰기
                    Map<String, Object> updatedItem = new HashMap<>(item);  // 새로운 Map을 생성
                    updatedItem.put(containsKey, containsKeyData);  // 변환된 데이터를 새로운 Map에 추가

                    // 기존 revItem을 새로운 Map으로 교체
                    // List.indexOf(A) : List 안에서 A가 위치한 순번을 찾아줌.
                    int index = parsingList.indexOf(item);
                    parsingList.set(index, updatedItem); // parsingList에서 index 순번에 업데이트한 Item을 그대로 삽입한다.

                } catch (JsonProcessingException e) {
                    // 변환 실패 시 처리 방법
                    log.error("emptyContainsKeys 변환 중 오류 발생: " + e.getMessage(), e);
                    Map<String, Object> emptyContainsKeys = new HashMap<>();  // 빈 객체를 넣어주기
                    item.put(containsKey, emptyContainsKeys);
                }
            }
        }

        // 변환 후의 parsingList 로그 출력
        log.info("변환 완료된 parsingList 데이터: " + parsingList);

        return parsingList;
    }

}

