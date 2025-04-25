package groundToAir.airReservation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import groundToAir.airReservation.entity.CountryEntity;
import groundToAir.airReservation.entity.ReservationListEntity;
import groundToAir.airReservation.entity.UserEntity;
import groundToAir.airReservation.entity.WishListEntity;
import groundToAir.airReservation.enumType.SeatClass;
import groundToAir.airReservation.repository.CountryRepository;
import groundToAir.airReservation.repository.ReservationListRepository;
import groundToAir.airReservation.repository.WishListRepository;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

// 찜, 예약 관련 Service
// 찜 등록/조회/삭제, 예약 등록/조회/삭제
@Service
@Slf4j
public class ReservationService {

    private final WishListRepository wishListRepository;
    private final ReservationListRepository reservationListRepository;
    private final CountryRepository countryRepository;
    private final JwtUtil jwtUtil;

    private final MailService mailService;

    private final RestTemplate restTemplate;

    // JSON 파싱 클래스 선언
    private static final ObjectMapper objectMapper = new ObjectMapper();

    static {
        // Java 8 날짜/시간 타입을 처리하기 위한 모듈 등록
        objectMapper.registerModule(new JavaTimeModule());
    }


    public ReservationService(WishListRepository wishListRepository, ReservationListRepository reservationListRepository, CountryRepository countryRepository, JwtUtil jwtUtil, MailService mailService, RestTemplate restTemplate) {
        this.wishListRepository = wishListRepository;
        this.reservationListRepository = reservationListRepository;
        this.countryRepository = countryRepository;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
        this.restTemplate = restTemplate;
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

    // 예약 내역 API 호출
    public String getFlightOrder(String accessToken, String flightPricing, Map<String, Object> travelerData, Map<String, Object> contactData) throws Exception {

        String url = "https://test.api.amadeus.com/v1/booking/flight-orders";

        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("\"travelers\": [");

        // 탑승자 정보 데이터를 순차적(key)으로 삽입
        // ! 휴대폰번호 등 한 번 더 확인 필요함
        travelerData.forEach((key, value) -> {
            Map<String, Object> data = (Map<String, Object>) value; // key 내부 값(value)을 data에 삽입 EX) data.get("birth")

            jsonBuilder.append("{")
                    .append("\"id\": \"").append(Integer.parseInt(key) + 1).append("\",")
                    .append("\"dateOfBirth\": \"").append(data.get("birth")).append("\",")
                    .append("\"name\": {")
                    .append("\"firstName\": \"").append(data.get("userEngFN")).append("\",")
                    .append("\"lastName\": \"").append(data.get("userEngLN")).append("\"")
                    .append("},")
                    .append("\"gender\": \"").append(data.get("gender").equals("M") ? "MALE" : "FEMALE").append("\",")
                    .append("\"contact\": {")
                    .append("\"emailAddress\": \"").append(data.get("email")).append("\",")
                    .append("\"phones\": [{")
                    .append("\"deviceType\": \"MOBILE\",")
                    .append("\"countryCallingCode\": \"82\",")
                    .append("\"number\": \"").append(contactData.get("phoneNumber")).append("\"")
                    .append("}]")
                    .append("},")
                    .append("\"emergencyContact\": {")
                    .append("\"addresseeName\": \"").append(data.get("userEngFN")).append(data.get("userEngLN")).append("\",")
                    .append("\"countryCode\": \"").append(countryRepository.findByCountry((String) data.get("nationality")).map(CountryEntity::getIsoAlpha2).orElse(null)).append("\",") // 국적 2글자 코드로 변환
                    .append("\"number\": \"").append(contactData.get("emergencyNumber")).append("\"")
                    .append("},")
                    .append("\"documents\": [{")
                    .append("\"documentType\": \"PASSPORT\",")
                    .append("\"number\": \"").append(data.get("passportNo")).append("\",")
                    .append("\"expiryDate\": \"").append(data.get("passportExDate")).append("\",")
                    .append("\"issuanceCountry\": \"").append(countryRepository.findByCountry((String) data.get("passportCOI")).map(CountryEntity::getIsoAlpha2).orElse(null)).append("\",") // 여권발행국 2글자 코드로 변환
                    .append("\"nationality\": \"").append(countryRepository.findByCountry((String) data.get("nationality")).map(CountryEntity::getIsoAlpha2).orElse(null)).append("\",") // 국적 2글자 코드로 변환
                    .append("\"holder\": true")
                    .append("}]")
                    .append("},");
        });

        // 마지막 탑승자 삽입 후에는 쉼표가 필요 없으니 제거
        if (jsonBuilder.charAt(jsonBuilder.length() - 1) == ',') {
            jsonBuilder.deleteCharAt(jsonBuilder.length() - 1);
        }

        jsonBuilder.append("]");

        // 최종 데이터를 jsonResult에 삽입
        String jsonResult = jsonBuilder.toString();

        // 탑승자 정보를 넣기 위해 텍스트 분리
        String[] spliting = flightPricing.split("}}]}]}],");

        // API 호출 양식
        String template = spliting[0] + "}}]}]}]," + jsonResult + "," + spliting[1];

        log.info("flightPricing : {}", flightPricing);
        log.info("travelerData : {}", travelerData);
        log.info("contactData : {}", contactData);

        log.info("spliting : {}", spliting);
        log.info("jsonResult : {}", jsonResult);
        log.info("template : {}", template);

        // HttpHeaders 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + accessToken);

        // HttpEntity에 헤더와 본문 설정
        HttpEntity<String> entity = new HttpEntity<>(template, headers);


        return restTemplate.postForObject(url, entity, String.class);
    }

    // 예약 코드 생성
    private String generateReservationCode() {
        // 현재 시간 추출
        LocalDateTime now = LocalDateTime.now();

        // DateTimeFormatter를 통해 'yyyyMMdd' 형식에 맞게 변환 후 date에 삽입
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String date = now.format(formatter);

        // randomAlphanumeric를 통해 영어 대소문자와 숫자를 포함한 6글자를 생성 및 toUpperCase로 전부 대문자로 표현
        String randomCode = RandomStringUtils.randomAlphanumeric(6).toUpperCase();

        return "GTA" + date + randomCode;
    }


    // 예약 내역 등록
    public Map<String, Object> airReservation(String accessToken, String flightData) throws Exception {
        // 예약내역 Entity 생성
        ReservationListEntity reservationList = new ReservationListEntity();

        // JSON 문자열을 Map으로 변환
        Map<String, Object> flightDataMap = objectMapper.readValue(flightData, new TypeReference<>() {
        });

        String flightPricing = objectMapper.writeValueAsString(flightDataMap.get("flightPricing")); // 항공편 상세
        Map<String, Object> travelerData = (Map<String, Object>) flightDataMap.get("travelerData"); // 탑승자 정보 입력 데이터
        Map<String, Object> contactData = (Map<String, Object>) flightDataMap.get("contactData"); // 연락처 상세정보

        try {
            // Flight Create Order API 호출하여 데이터를 가져옴. orders에 삽입
            String flightOrderData = getFlightOrder(accessToken, flightPricing, travelerData, contactData);
            log.info("flightOrderData : {}", flightOrderData);
            reservationList.setOrders(flightOrderData);


            // flightOrderData를 다시 Map으로 변환
            Map<String, Object> flightOrderMap = objectMapper.readValue(flightOrderData, new TypeReference<>() {
            });
            log.info("flightOrderMap : {}", flightOrderMap);


            // 예약 코드 생성 및 입력 (GTA + 날짜 + 랜덤값)
            String revCode = generateReservationCode();
            // 생성된 예약코드가 이미 예약내역에 존재하는 경우 다시 변경
            while (reservationListRepository.findByRevCode(revCode).isPresent()) {
                revCode = generateReservationCode();
            }
            log.info("revCode : " + revCode);

            reservationList.setRevCode(revCode);

            // userNo 추출 및 입력 (비회원인 경우 null로 설정)
            int userNo = flightDataMap.get("userNo") != "" ? jwtUtil.extractUserNo((String) flightDataMap.get("userNo")) : 0;
            log.info("userNo : {}", userNo);
            if (userNo != 0) {
                UserEntity user = new UserEntity();
                user.setUserNo(userNo);
                reservationList.setReservationListUser(user);
            }

            // 예약자명 추출 및 입력
            String revName = (String) contactData.get("userName");
            log.info("revName : {}", revName);
            reservationList.setRevName(revName); // 예약자명

            // flightOrderMap 모든 데이터 추출
            Map<String, Object> data = flightOrderMap.get("data") != null ? (Map<String, Object>) flightOrderMap.get("data") : null;
            Map<String, Object> flightOffers = data != null ? ((List<Map<String, Object>>) data.get("flightOffers")).stream().findFirst().orElse(null) : null;

            if (flightOffers != null) {
                // 가는편 정보

                Map<String, Object> itineraries = ((List<Map<String, Object>>) flightOffers.get("itineraries")).stream().findFirst().orElse(null);

                String airlinesIata = null, departureIata = null, arrivalIata = null,
                        flightNo = null, turnaroundTime = null, stopLine = null;
                LocalDateTime departureTime = null, arrivalTime = null;

                List<Map<String, Object>> segments = itineraries != null ? (List<Map<String, Object>>) itineraries.get("segments") : null;
                if (segments != null && !segments.isEmpty()) {
                    airlinesIata = (String) segments.get(0).get("carrierCode");
                    departureIata = (String) ((Map<String, Object>) segments.get(0).get("departure")).get("iataCode");
                    departureTime = Optional.ofNullable((String) ((Map<String, Object>) segments.get(0).get("departure")).get("at"))
                            .filter(str -> !str.isEmpty())
                            .map(LocalDateTime::parse)
                            .orElse(null);

                    arrivalIata = (String) ((Map<String, Object>) segments.get(segments.size() - 1).get("arrival")).get("iataCode");
                    arrivalTime = Optional.ofNullable((String) ((Map<String, Object>) segments.get(segments.size() - 1).get("arrival")).get("at"))
                            .filter(str -> !str.isEmpty())
                            .map(LocalDateTime::parse)
                            .orElse(null);
                    flightNo = airlinesIata + segments.get(0).get("number");

                    // 총 소요시간 계산 (경유일 시 Duration 클래스를 사용하여 hours, minutes로 나누고 소요시간 양식에 맞게 삽입)
                    if (segments.size() - 1 == 0) {
                        turnaroundTime = (String) segments.get(0).get("duration");
                    } else if (departureTime != null && arrivalTime != null) {
                        Duration duration = Duration.between(departureTime, arrivalTime);
                        long hours = duration.toHours();
                        long minutes = duration.toMinutesPart();
                        if (minutes == 0) {
                            turnaroundTime = String.format("PT%dH", hours);
                        } else if (hours == 0) {
                            turnaroundTime = String.format("PT%dM", minutes);
                        } else {
                            turnaroundTime = String.format("PT%dH%dM", hours, minutes);
                        }
                    }

                    stopLine = segments.size() - 1 == 0 ? "직항" : segments.size() - 1 == 1 ? "1회 경유" : "경유 2회 이상";
                    log.info("airlinesIata : {}", airlinesIata);
                    log.info("departureIata : {}", departureIata);
                    log.info("departureTime : {}", departureTime);
                    log.info("arrivalIata : {}", arrivalIata);
                    log.info("arrivalTime : {}", arrivalTime);
                    log.info("flightNo : {}", flightNo);
                    log.info("turnaroundTime : {}", turnaroundTime);
                    log.info("stopLine : {}", stopLine);

                    // 가는편 정보 입력
                    reservationList.setAirlinesIata(airlinesIata);
                    reservationList.setDepartureIata(departureIata);
                    reservationList.setDepartureTime(departureTime);
                    reservationList.setArrivalIata(arrivalIata);
                    reservationList.setArrivalTime(arrivalTime);
                    reservationList.setFlightNo(flightNo);
                    reservationList.setTurnaroundTime(turnaroundTime);
                    reservationList.setStopLine(stopLine);
                }

                // 오는편 정보
                Map<String, Object> reItineraries = ((List<Map<String, Object>>) flightOffers.get("itineraries")).stream().skip(1).findFirst().orElse(null);

                List<Map<String, Object>> reSegments = reItineraries != null ? (List<Map<String, Object>>) reItineraries.get("segments") : null;

                String reAirlinesIata = null, reDepartureIata = null, reArrivalIata = null,
                        reFlightNo = null, reTurnaroundTime = null, reStopLine = null;

                LocalDateTime reDepartureTime = null, reArrivalTime = null;

                if (reSegments != null && !reSegments.isEmpty()) {
                    reAirlinesIata = (String) reSegments.get(0).get("carrierCode");
                    reDepartureIata = (String) ((Map<String, Object>) reSegments.get(0).get("departure")).get("iataCode");
                    reDepartureTime = Optional.ofNullable((String) ((Map<String, Object>) reSegments.get(0).get("departure")).get("at"))
                            .filter(str -> !str.isEmpty())
                            .map(LocalDateTime::parse)
                            .orElse(null);
                    reArrivalIata = (String) ((Map<String, Object>) reSegments.get(reSegments.size() - 1).get("arrival")).get("iataCode");
                    reArrivalTime = Optional.ofNullable((String) ((Map<String, Object>) reSegments.get(reSegments.size() - 1).get("arrival")).get("at"))
                            .filter(str -> !str.isEmpty())
                            .map(LocalDateTime::parse)
                            .orElse(null);
                    reFlightNo = reAirlinesIata + reSegments.get(0).get("number");

                    // 총 소요시간 계산 (경유일 시 Duration 클래스를 사용하여 hours, minutes로 나누고 소요시간 양식에 맞게 삽입)
                    if (reSegments.size() - 1 == 0) {
                        reTurnaroundTime = (String) reSegments.get(0).get("duration");
                    } else if (reDepartureTime != null && reArrivalTime != null) {
                        Duration duration = Duration.between(reDepartureTime, reArrivalTime);
                        long hours = duration.toHours();
                        long minutes = duration.toMinutesPart();
                        if (minutes == 0) {
                            reTurnaroundTime = String.format("PT%dH", hours);
                        } else if (hours == 0) {
                            reTurnaroundTime = String.format("PT%dM", minutes);
                        } else {
                            reTurnaroundTime = String.format("PT%dH%dM", hours, minutes);
                        }
                    }

                    reStopLine = reSegments.size() - 1 == 0 ? "직항" : reSegments.size() - 1 == 1 ? "1회 경유" : "경유 2회 이상";
                    log.info("reAirlinesIata : {}", reAirlinesIata);
                    log.info("reDepartureIata : {}", reDepartureIata);
                    log.info("reDepartureTime : {}", reDepartureTime);
                    log.info("reArrivalIata : {}", reArrivalIata);
                    log.info("reArrivalTime : {}", reArrivalTime);
                    log.info("reFlightNo : {}", reFlightNo);
                    log.info("reTurnaroundTime : {}", reTurnaroundTime);
                    log.info("reStopLine : {}", reStopLine);

                    // 오는편 정보 입력
                    reservationList.setReAirlinesIata(reAirlinesIata);
                    reservationList.setReDepartureIata(reDepartureIata);
                    reservationList.setReDepartureTime(reDepartureTime);
                    reservationList.setReArrivalIata(reArrivalIata);
                    reservationList.setReArrivalTime(reArrivalTime);
                    reservationList.setReFlightNo(reFlightNo);
                    reservationList.setReTurnaroundTime(reTurnaroundTime);
                    reservationList.setReStopLine(reStopLine);
                }

                // 가격
                int totalPrice = (int) Double.parseDouble((String) ((Map<String, Object>) flightOffers.get("price")).get("total"));


                List<Map<String, Object>> travelerMap = ((List<Map<String, Object>>) flightOffers.get("travelerPricings"));

                // 인원 수, 좌석등급
                int adults = 0, childrens = 0, infants = 0;
                SeatClass seatClass = null;


                if (travelerMap != null) {
                    for (Map<String, Object> traveler : travelerMap) {
                        String travelerType = (String) traveler.get("travelerType");
                        if ("ADULT".equals(travelerType)) {
                            adults++;
                        }
                        if ("CHILD".equals(travelerType)) {
                            childrens++;
                        }
                        if ("HELD_INFANT".equals(travelerType)) {
                            infants++;
                        }
                    }

                    seatClass = SeatClass.valueOf((String) ((List<Map<String, Object>>) travelerMap.get(0).get("fareDetailsBySegment")).get(0).get("cabin"));

                }
                log.info("peoples : adults={} childrens={} infants={} seatClass={} totalPrice={}", adults, childrens, infants, seatClass, totalPrice);

                // 나머지 정보 입력 (유형별 인원 수, 좌석등급, 가격)
                reservationList.setAdults(adults);
                reservationList.setChildrens(childrens);
                reservationList.setInfants(infants);
                reservationList.setSeatClass(seatClass);
                reservationList.setTotalPrice(totalPrice);

                // 최종 저장
                reservationListRepository.save(reservationList);

                // 예약 완료 이메일 전송
                String toEmail = ((Map<String, Object>) ((Map<String, Object>) ((List<?>) ((Map<String, Object>) flightOrderMap.get("data")).get("travelers")).get(0)).get("contact")).get("emailAddress").toString();
                mailService.sendRevListCompleteEmail(toEmail, reservationList);


                return objectMapper.convertValue(reservationList, new TypeReference<>() {
                });
            } else { // 항공편 데이터가 없을 시
                return null;
            }
        } catch (HttpClientErrorException e) {
            String detail = new ObjectMapper()
                    .readTree(e.getResponseBodyAsString())
                    .get("errors").get(0).get("detail").asText();
            Map<String, Object> errorMap = Map.of("error", detail);
            return errorMap;

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

    // 예약내역 제거
    public boolean revDelete(int revId) {
        // 기존 데이터 조회
        ReservationListEntity existingRev = reservationListRepository.findById(revId).orElse(null);
        if (existingRev == null) {
            log.warn("예약내역 데이터가 존재하지 않습니다: 예약번호 {}", revId);
            return false; // 데이터가 없는 경우 업데이트 실패
        }
        try {
            reservationListRepository.deleteById(revId);
            log.info("예약내역 데이터 삭제 성공: 예약번호 {}", revId);
            return true;
        } catch (Exception e) {
            log.error("예약내역 데이터 삭제 실패: 예약번호 {}, 오류: {}", revId, e.getMessage());
            return false;

        }
    }


}
