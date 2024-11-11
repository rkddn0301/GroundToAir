package groundToAir.airReservation.controller;

import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.service.AirService;
import groundToAir.airReservation.utils.AccessTokenUtil;
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
            @RequestParam("currencyCode") String currencyCode
    ) throws Exception {

        log.info("출발지 : {}, 도착지 : {}, 가는날 : {}, 오는날 : {}, 성인 : {}, 어린이 : {}, 유아 : {}, 좌석등급 : {}, 화폐 : {}",
                originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, travelClass, currencyCode);



        String accessToken = accessTokenUtil.checkAndRefreshToken();
        return airService.getFlightOffers(accessToken, originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, travelClass, currencyCode);
    }

    // 항공편 코드
    @GetMapping("/iataCode")
    public List<IataCodeEntity> getIataCode(
            @RequestParam("keyword") String keyword
    ){


        return airService.getIataCodes(keyword);
    }



}
