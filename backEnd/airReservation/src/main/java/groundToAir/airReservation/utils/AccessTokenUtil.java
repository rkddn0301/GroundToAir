package groundToAir.airReservation.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

// Amadeus API 요청 util
@Slf4j
public class AccessTokenUtil {

    private String accessToken; // 토큰 주입
    private long tokenExpiryTime; // 토큰 유지시간

    private final RestTemplate restTemplate;

    public AccessTokenUtil(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String checkAndRefreshToken() throws Exception {
        long currentTime = System.currentTimeMillis(); // 현재 시간을 가져옴

        // access_token이 없거나, 토큰 만료 시간이 현재 시간보다 이전이면 갱신
        if (accessToken == null || currentTime > tokenExpiryTime) {

            // getAccessToken() 메서드를 호출해서 token json 데이터를 가져옴
            String tokenResponse = getAccessToken();

            // ObjectMapper : JSON <=> Java 간의 변환할 때 사용됨
            ObjectMapper mapper = new ObjectMapper();

            // Json 데이터를 파싱하여 json 데이터 객체로 변환
            // readTree : JSON --> Java 객체로 변환
            JsonNode root = mapper.readTree(tokenResponse);

            // 전역 변수 accessToken(this.accessToken)에 json 데이터 중 access_token을 삽입
            this.accessToken = root.path("access_token").asText();

            // json 데이터 중 토큰 만료시간을 의미하는 expires_in을 추출
            int expiresIn = root.path("expires_in").asInt(); // 만료 시간(초 단위)

            // token 세션시간 조정 (아래 내용의 경우 expiresIn이 1799이기 때문에 환산하면 '30분'으로 처리됨)
            this.tokenExpiryTime = currentTime + (expiresIn * 1000L); // 만료 시간 설정 (밀리초)

            log.info("currentTime: " + currentTime);
            log.info("tokenExpiryTime: " + this.tokenExpiryTime);
            log.info("accessToken: " + this.accessToken);
        }
        return accessToken;
    }

    // Amadeus API로 POST 요청
    public String getAccessToken() {

        String url = "https://test.api.amadeus.com/v1/security/oauth2/token";

        // HTTP 요청의 헤더를 설정하며, 요청의 메타데이터를 포함함.
        HttpHeaders headers = new HttpHeaders();
        // 요청의 본문 데이터를 application/x-www.form-urlencoded 형식으로 설정한다.
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 요청 바디 데이터 설정
        // MultiValueMap : 하나의 키 = 하나의 값만 표시되는 Map과 달리 하나의 키 = [여러 값]을 표시할 수 있는 collection이다.
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", "oT8fZRGasGkulUIrTXVf7BHA6waUqPPO");
        body.add("client_secret", "GVfy5Y6HGnW04qFB");

        // 요청의 headers, body를 함께 묶어 HttpEntity로 만듦
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        // API에 POST 요청을 보내고 응답을 받아옴
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                String.class
        );
        return response.getBody();
    }
}
