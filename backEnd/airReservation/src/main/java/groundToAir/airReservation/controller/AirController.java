package groundToAir.airReservation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import groundToAir.airReservation.entity.AirlineCodeEntity;
import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.service.AirService;
import groundToAir.airReservation.utils.AccessTokenUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;


// 항공편 관련 Controller
// 항공편 조회, 항공편 예약 데이터 조회
@Slf4j
@RestController
@RequestMapping("/air")
public class AirController {

    private final AirService airService;
    private final AccessTokenUtil accessTokenUtil;

    public AirController(AirService airService, AccessTokenUtil accessTokenUtil) {
        this.airService = airService;
        this.accessTokenUtil = accessTokenUtil;
    }

    // React 연동 테스트
    @GetMapping("/hello")
    public String hello() {
        return "hi, reactBoot";
    }

    @GetMapping("/token")
    public String getAmadeusToken() throws Exception {


        return accessTokenUtil.checkAndRefreshToken();
    }


    // 항공편 조회
    @GetMapping("/flightOffers")
    public String getFlightOffers(
            @RequestParam("originLocationCode") String originLocationCode,
            @RequestParam("destinationLocationCode") String destinationLocationCode,
            @RequestParam("departureDate") String departureDate,
            @RequestParam("returnDate") String returnDate,
            @RequestParam("adults") int adults,
            @RequestParam("children") int children,
            @RequestParam("infants") int infants,
            @RequestParam("travelClass") String travelClass,
            @RequestParam("currencyCode") String currencyCode,
            @RequestParam("excludedAirlineCodes") String excludedAirlineCodes
    ) throws Exception {

        log.info("출발지 : {}, 도착지 : {}, 가는날 : {}, 오는날 : {}, 성인 : {}, 어린이 : {}, 유아 : {}, 좌석등급 : {}, 화폐 : {}",
                originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, travelClass, currencyCode);


        String accessToken = accessTokenUtil.checkAndRefreshToken();
        return airService.getFlightOffers(accessToken, originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, travelClass, currencyCode, excludedAirlineCodes);
    }

    // 자동완성 항공편 코드
    @GetMapping("/autoCompleteIataCodes")
    public List<IataCodeEntity> getAutoCompleteIataCode(
            @RequestParam("keyword") String keyword
    ) {
        return airService.getAutoCompleteIataCodes(keyword);
    }

    // 항공사 코드
    @GetMapping("/airlineCode")
    public List<AirlineCodeEntity> getAirlineCode() {
        return airService.getAirlineCodes();
    }

    // 항공편 코드
    @GetMapping("/iataCode")
    public List<IataCodeEntity> getIataCode() {
        return airService.getIataCodes();
    }

    // 항공편 예약 데이터 조회
    @PostMapping("/flightPrice")
    public String getFlightPrice(@RequestBody String flightOffers) throws Exception {
        log.info("flight Offers : {}", flightOffers);

        String accessToken = accessTokenUtil.checkAndRefreshToken();
        try {
            String response = airService.getFlightPrice(accessToken, flightOffers);
            return response;
        } catch (HttpClientErrorException e) {
            String detail = new ObjectMapper()
                    .readTree(e.getResponseBodyAsString())
                    .get("errors").get(0).get("detail").asText();
            return detail;
        }

    }
}
