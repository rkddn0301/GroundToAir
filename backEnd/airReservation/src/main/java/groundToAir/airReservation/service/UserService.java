package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.*;
import groundToAir.airReservation.enumType.SocialType;
import groundToAir.airReservation.repository.*;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;


// 회원 정보 관련 Service
// 회원가입, 로그인, 아이디/비밀번호 찾기, 개인정보, 회원탈퇴
@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserPassportRepository userPassportRepository;

    private final PasswordEncoder passwordEncoder;

    private final CountryRepository countryRepository;
    private final RestTemplate restTemplate;
    private final JwtUtil jwtUtil;

    // 이메일 이용
    private final MailService mailService;


    public UserService(UserRepository userRepository, UserPassportRepository userPassportRepository, PasswordEncoder passwordEncoder, CountryRepository countryRepository, RestTemplate restTemplate, JwtUtil jwtUtil, MailService mailService) {
        this.userRepository = userRepository;
        this.userPassportRepository = userPassportRepository;
        this.passwordEncoder = passwordEncoder;
        this.countryRepository = countryRepository;
        this.restTemplate = restTemplate;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
    }

    // 구글 Secret Key
    @Value("${google.client-secret}")
    private String googleClientSecret;

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

                UserEntity userEntity = new UserEntity();
                userEntity.setSocialId(socialId);
                userEntity.setSocialType(SocialType.KAKAO);

                userRepository.save(userEntity);

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
                "&client_secret=" + googleClientSecret +
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

                UserEntity userEntity = new UserEntity();
                userEntity.setSocialId(socialId);
                userEntity.setSocialType(SocialType.GOOGLE);

                userRepository.save(userEntity);

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

        // UserEntity에 설정
        userEntity.setPassword(encodedPassword); // 암호화된 비밀번호 설정
        userEntity.setBirth(birthDay); // 변환된 생일 설정
        userEntity.setSocialType(SocialType.DIRECT); // SocialType에서 DIRECT 설정

        userRepository.save(userEntity);

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

    // 아이디 찾기
    public boolean idFind(String userName,
                          String email) {

        // 사용자 아이디 찾기
        String userId = userRepository.findUserIdByUserNameAndEmail(userName, email);

        if (userId != null) {
            // 아이디가 존재할 경우 이메일로 전송
            mailService.sendIdOrPwEmail(email, userId, "idFind");
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
        mailService.sendIdOrPwEmail(email, temporaryPassword, "pwFind");

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

}

