package groundToAir.airReservation.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import groundToAir.airReservation.entity.*;
import groundToAir.airReservation.enumType.SeatClass;
import groundToAir.airReservation.repository.AirlineCodeRepository;
import groundToAir.airReservation.repository.CountryRepository;
import groundToAir.airReservation.repository.IataCodeRepository;
import groundToAir.airReservation.repository.ReservationListRepository;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;


@Slf4j
@Service
public class AirService {


    private final RestTemplate restTemplate;
    private final IataCodeRepository iataCodeRepository;
    private final AirlineCodeRepository airlineCodeRepository;
    private final JwtUtil jwtUtil;

    private final MailService mailService;

    private static final ObjectMapper objectMapper = new ObjectMapper();
    static {
        // Java 8 날짜/시간 타입을 처리하기 위한 모듈 등록
        objectMapper.registerModule(new JavaTimeModule());
    }


    private final CountryRepository countryRepository;
    private final ReservationListRepository reservationListRepository;

    public AirService(RestTemplate restTemplate, IataCodeRepository iataCodeRepository, AirlineCodeRepository airlineCodeRepository, JwtUtil jwtUtil, MailService mailService, CountryRepository countryRepository, ReservationListRepository reservationListRepository) {
        this.restTemplate = restTemplate;
        this.iataCodeRepository = iataCodeRepository;
        this.airlineCodeRepository = airlineCodeRepository;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
        this.countryRepository = countryRepository;
        this.reservationListRepository = reservationListRepository;
    }


    public String getFlightOffers(String accessToken, String originLocationCode, String destinationLocationCode, String departureDate, String returnDate, int adults, int children, int infants, String travelClass, String currencyCode, String excludedAirlineCodes) {
        String url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

        // URL에 쿼리 파라미터 추가
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("originLocationCode", originLocationCode)
                .queryParam("destinationLocationCode", destinationLocationCode)
                .queryParam("departureDate", departureDate)
                .queryParam("adults", adults)
                .queryParam("children", children)
                .queryParam("infants", infants)
                .queryParam("travelClass", travelClass)
                .queryParam("currencyCode", currencyCode)
                .queryParam("excludedAirlineCodes", excludedAirlineCodes);

        // 비어있을 경우 편도, 존재할 경우 왕복
        if (returnDate != null && !returnDate.isEmpty()) {
            uriBuilder.queryParam("returnDate", returnDate);
        }

        String fullUrl = uriBuilder.toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, request, String.class);
        return response.getBody();
    }

    // 자동완성 항공편 코드 가져오기
    public List<IataCodeEntity> getAutoCompleteIataCodes(String keyword) {
        if (keyword == null || keyword.length() < 2) {
            return Collections.emptyList(); // 빈 리스트 반환
        }

        // 해당 조건을 만족하는 데이터들만 반환
        return iataCodeRepository.findByIataStartingWithOrCityCodeStartingWithOrAirportKorStartingWithOrCityKorStartingWith(
                keyword, keyword, keyword, keyword
        );
    }

    // 항공사 코드 가져오기
    public List<AirlineCodeEntity> getAirlineCodes() {
        return airlineCodeRepository.findAll();
    }

    // 항공편 코드 가져오기
    public List<IataCodeEntity> getIataCodes() {
        return iataCodeRepository.findAll();
    }

    // 예약 상세 데이터 조회
    public String getFlightPrice(String accessToken, String flightOffers) {
        String url = "https://test.api.amadeus.com/v1/shopping/flight-offers/pricing";

        log.info("flightOffers : " + flightOffers);


        // 가져온 데이터 중 필요없는 부분 제거
        String replacedFlightOffers = flightOffers.replace("{\"flightOffers\":", "[")
                .replace("}]}]}]}", "}]}]}]}]}");

        log.info("replacedFlightOffers: " + replacedFlightOffers);


        // flight offer price Body 양식에 맞게 JSON 형식으로 변환
        String requestBody = "{ \"data\": { \"type\": \"flight-offers-pricing\", " +
                "\"flightOffers\": " + replacedFlightOffers;

        log.info("requestBody: " + requestBody);

        // HttpHeaders 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + accessToken);

        // HttpEntity에 헤더와 본문 설정
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        return restTemplate.postForObject(url, entity, String.class);


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
            Map<String, Object> flightOrderMap = objectMapper.readValue(flightOrderData, new TypeReference<>() {});
            log.info("flightOrderMap : {}", flightOrderMap);


            // 예약 코드 생성 및 입력 (GTA + 날짜 + 랜덤값)
            String revCode = generateReservationCode();
            // 생성된 예약코드가 이미 예약내역에 존재하는 경우 다시 변경
            while ( reservationListRepository.findByRevCode(revCode).isPresent()) {
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
                    flightNo =  airlinesIata + segments.get(0).get("number");

                    // 총 소요시간 계산 (경유일 시 Duration 클래스를 사용하여 hours, minutes로 나누고 소요시간 양식에 맞게 삽입)
                    if (segments.size()-1 == 0) {
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

                    stopLine = segments.size()-1 == 0 ? "직항" : segments.size()-1 == 1 ? "1회 경유" : "경유 2회 이상" ;
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
                    reFlightNo =  reAirlinesIata + reSegments.get(0).get("number");

                    // 총 소요시간 계산 (경유일 시 Duration 클래스를 사용하여 hours, minutes로 나누고 소요시간 양식에 맞게 삽입)
                    if (reSegments.size()-1 == 0) {
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

                    reStopLine = reSegments.size()-1 == 0 ? "직항" : reSegments.size()-1 == 1 ? "1회 경유" : "경유 2회 이상" ;
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


                if (travelerMap != null ) {
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

                    seatClass = SeatClass.valueOf((String) ((List<Map<String,Object>>) travelerMap.get(0).get("fareDetailsBySegment")).get(0).get("cabin"));

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



                return objectMapper.convertValue(reservationList, new TypeReference<>() {});
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


}
