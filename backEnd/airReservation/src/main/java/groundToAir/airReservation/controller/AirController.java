package groundToAir.airReservation.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.service.AirService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/air")
public class AirController {

    private final AirService airService;
    private String accessToken;
    private long tokenExpiryTime; // 토큰 만료 시간을 저장

    public AirController(AirService airService) {
        this.airService = airService;
    }

    // access_token 갱신 여부를 확인하고 필요시 갱신
    private void checkAndRefreshToken() throws Exception {
        long currentTime = System.currentTimeMillis(); // 현재 시간을 가져옴

        // access_token이 없거나, 토큰 만료 시간이 현재 시간보다 이전이면 갱신
        if (accessToken == null || currentTime > tokenExpiryTime) {

            // AirService.getAccessToken() 메서드를 호출해서 token json 데이터를 가져옴
            String tokenResponse = airService.getAccessToken();

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

            System.out.println("currentTime: " + currentTime);
            System.out.println("tokenExpiryTime: " + this.tokenExpiryTime);
            System.out.println("accessToken: " + this.accessToken);
        }
    }

    // React 연동 테스트
    @GetMapping("/hello")
    public String hello() {
        return "hi, reactBoot";
    }

    // DB 테스트 메서드
//    @GetMapping("/users")
//    public List<AirEntity> getUsers() {
//        return airService.getAllUsers();
//    }

    @GetMapping("/token")
    public String getAmadeusToken() {


        return airService.getAccessToken();
    }

    @GetMapping("/metaData")
    public String getMetaData() throws Exception {

        checkAndRefreshToken();
        return airService.getMetaData(accessToken);
    }

    // 항공편 조회
    @GetMapping("/flightOffers")
    public String getFlightOffers(
            @RequestParam("originLocationCode") String originLocationCode,
            @RequestParam("destinationLocationCode") String destinationLocationCode,
            @RequestParam("departureDate") String departureDate,
            @RequestParam("returnDate") String returnDate,
            @RequestParam("adults") int adults,
            @RequestParam("currencyCode") String currencyCode
    ) throws Exception {

        checkAndRefreshToken();
        return airService.getFlightOffers(accessToken, originLocationCode, destinationLocationCode, departureDate, returnDate, adults, currencyCode);
    }

    // 항공편 코드
    @GetMapping("/iataCode")
    public List<IataCodeEntity> getIataCode(
            @RequestParam("keyword") String keyword
    ){


        return airService.getIataCodes(keyword);
    }


}
