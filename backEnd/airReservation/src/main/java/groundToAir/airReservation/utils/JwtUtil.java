package groundToAir.airReservation.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

// 로그인 시 부여되는 세션 토큰(JsonWebToken) 유틸
@Slf4j
public class JwtUtil {

    /*
     * JWT의 구성
     * 1. Headers : JWT의 유형과 해싱 알고리즘 정보를 포함
     * 2. Payload : JWT 생성 시 전송하는 모든 구성요소를 의미한다.(클레임보다 더 큰 개념이므로 착각하지 말 것)
     * 3. Signature : JWT 생성 시 Header와 Payload를 기반으로 비밀 키를 사용해 생성
     */


    // 비밀키 생성
    // Keys.secretKeyFor(비밀키 알고리즘 유형) : 유형을 매개변수로 가져와 해당 유형에 맞게 비밀키를 무작위로 생성하는 메서드
    // SignatureAlgorithm.HS256 : JWT에서 비밀키를 생성하는데 필요한 유형으로, HMAC-SHA256 알고리즘에 해당함
    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);


    private final long accessTokenExpirationTime = 1000 * 60 * 60; // 액세스 토큰 만료시간: 1시간
    private final long refreshTokenExpirationTime = 1000 * 60 * 60 * 3; // 리프레시 토큰 만료시간: 3시간

    // 액세스 토큰 생성 메서드
    // 생성을 위해 createToken 메서드에 필요한 데이터를 넘겨서 JWT 토큰을 받아냄
    public Map<String, Object> generateAccessToken(String userId, int userNo) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userNo", userNo);


        String token = createToken(claims, userId, accessTokenExpirationTime); // 토큰 반환
        Date expirationTime = extractAllClaims(token).getExpiration(); // 토큰 만료시간 반환

        // 토큰과 만료 시간을 맵에 담아 반환
        Map<String, Object> accessToken = new HashMap<>();
        accessToken.put("token", token);
        accessToken.put("expiration", expirationTime);

        return accessToken;
    }

    // 리프레시 토큰 생성 메서드
    // 생성을 위해 createToken 메서드에 필요한 데이터를 넘겨서 JWT 토큰을 받아냄
    public Map<String, Object> generateRefreshToken(String userId, int userNo) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userNo", userNo);


        String token = createToken(claims, userId, refreshTokenExpirationTime); // 토큰 반환
        Date expirationTime = extractAllClaims(token).getExpiration(); // 토큰 만료시간 반환

        // 토큰과 만료 시간을 맵에 담아 반환
        Map<String, Object> refreshToken = new HashMap<>();
        refreshToken.put("token", token);
        refreshToken.put("expiration", expirationTime);

        return refreshToken;
    }

    // 직접적으로 토큰을 생성하는 메서드
    private String createToken(Map<String, Object> claims, String userId, long expirationTime) {
        return Jwts.builder() // Header : builder 시 자동으로 포함됨.
                .setClaims(claims) // Payload(Cliams) : Subject, issuedAt, Expiration과 같은 추가 정보를 담음.
                .setSubject(userId) // Payload(Subject) : 로그인 아이디를 특정 소유자로 설정
                .setIssuedAt(new Date(System.currentTimeMillis())) // Payload(issuedAt) : 현재 시간 설정
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // Payload(expiration) : 만료 시간 설정 : 현재 시간 + 만료 시간
                .signWith(secretKey) // Signature : 비밀키를 사용하여 서명을 생성
                .compact();
    }

    // 토큰의 유효성 검증 (소유자 아이디, 토큰 만료 여부 확인)
    /*
     * 이 메서드는 액세스 토큰의 유효성을 검사할 때 유용함
     * 보호된 리소스에 접근하기 전이나, 액세스 토큰 갱신 요청 시 사용할 수 있음
     * 현재는 리프레시 토큰 검증만 하기 때문에 미사용
     */
    public boolean validateToken(String token, String userId) {
        final String extractedUserId = extractUserId(token);
        return (extractedUserId.equals(userId) && !isTokenExpired(token));
    }

    // 소유자인 로그인 아이디를 추출하는 메서드
    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    // 소유자 고유 회원번호를 추출하는 메서드
    public int extractUserNo(String token) {
        return (int) extractAllClaims(token).get("userNo");
    }

    // 클레임 추출하는 메서드
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    // 토큰 만료 여부 확인하는 메서드
    // 확인하기 위해 추가 정보를 담고 있는 클레임을 추출하여 알아냄.
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }
}
