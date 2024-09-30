package groundToAir.airReservation.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import groundToAir.airReservation.service.AirService;
import groundToAir.airReservation.service.HotelService;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@Slf4j
@RestController
@RequestMapping("/hotel")
public class HotelController {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    private final AirService airService;
    private final HotelService hotelService;
    private String accessToken;
    private long tokenExpiryTime; // 토큰 만료 시간을 저장

    public HotelController(AirService airService, HotelService hotelService) {
        this.airService = airService;
        this.hotelService = hotelService;
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

    // 호텔 키워드 조회
    @GetMapping("/hotelAutoComplete")
    public String getHotelAutoComplete (
            @RequestParam("keyword") String keyword,
            @RequestParam("subType") String subType,
            @RequestParam("max") int max
    ) throws Exception {
        checkAndRefreshToken();
        // 쉼표로 구분된 subType 문자열을 배열로 변환
        String[] subTypes = subType.split(",");

        System.out.println("keyword: " + keyword);
        System.out.println("subTypes: " + Arrays.toString(subTypes));

        return hotelService.getHotelAutoComplete(accessToken, keyword, subTypes, max);
    }

    // 호텔 목록 조회
    @GetMapping("/hotelList")
    public String getHotelList (
            @RequestParam("keyword") String keyword
    ) throws Exception {
        checkAndRefreshToken();

        logger.info("keyowrd : " + keyword);


        return hotelService.getHotelList(accessToken, keyword);
    }

    // 호텔 총 검색 조회
    @GetMapping("/hotelOffers")
    public String getHotelOffers(
            @RequestParam("hotelIds")  String hotelIds,
            @RequestParam("checkInDate") String checkInDate,
            @RequestParam("checkOutDate") String checkOutDate,
            @RequestParam("adults") int adults,
            @RequestParam("roomQuantity") int roomQuantity,
            @RequestParam("currency") String currency
    ) throws Exception {
        checkAndRefreshToken();
        return hotelService.getHotelOffers(accessToken, hotelIds, checkInDate, checkOutDate, adults, roomQuantity, currency);
    }



}
