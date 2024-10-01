package groundToAir.airReservation.controller;


import groundToAir.airReservation.service.HotelService;
import groundToAir.airReservation.utils.AccessTokenUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@Slf4j
@RestController
@RequestMapping("/hotel")
public class HotelController {

    private final HotelService hotelService;
    private final AccessTokenUtil accessTokenUtil;


    public HotelController(HotelService hotelService, AccessTokenUtil accessTokenUtil) {
        this.hotelService = hotelService;
        this.accessTokenUtil = accessTokenUtil;
    }

    // 호텔 키워드 조회
    @GetMapping("/hotelAutoComplete")
    public String getHotelAutoComplete (
            @RequestParam("keyword") String keyword,
            @RequestParam("subType") String subType,
            @RequestParam("max") int max
    ) throws Exception {
       String accessToken = accessTokenUtil.checkAndRefreshToken();
        // 쉼표로 구분된 subType 문자열을 배열로 변환
        String[] subTypes = subType.split(",");
        log.info("accessToken: " + accessToken);
        log.info("keyword: " + keyword);
        log.info("subTypes: " + Arrays.toString(subTypes));

        return hotelService.getHotelAutoComplete(accessToken, keyword, subTypes, max);
    }

    // 호텔 목록 조회
    @GetMapping("/hotelList")
    public String getHotelList (
            @RequestParam("keyword") String keyword
    ) throws Exception {
        String accessToken = accessTokenUtil.checkAndRefreshToken();

        log.info("keyowrd : " + keyword);


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
        String accessToken = accessTokenUtil.checkAndRefreshToken();
        return hotelService.getHotelOffers(accessToken, hotelIds, checkInDate, checkOutDate, adults, roomQuantity, currency);
    }



}
