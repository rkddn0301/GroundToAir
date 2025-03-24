package groundToAir.airReservation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import groundToAir.airReservation.entity.AirlineCodeEntity;
import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.repository.AirlineCodeRepository;
import groundToAir.airReservation.repository.CountryRepository;
import groundToAir.airReservation.repository.IataCodeRepository;
import groundToAir.airReservation.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
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

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public AirService(RestTemplate restTemplate, IataCodeRepository iataCodeRepository, AirlineCodeRepository airlineCodeRepository, JwtUtil jwtUtil) {
        this.restTemplate = restTemplate;
        this.iataCodeRepository = iataCodeRepository;
        this.airlineCodeRepository = airlineCodeRepository;
        this.jwtUtil = jwtUtil;
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

        // 가져온 데이터 중 필요없는 부분 제거
        String replacedFlightOffers = flightOffers.replace("{\"flightOffers\":", "[")
                .replace("}]}]}", "}]}]}]}");


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
        // ! 휴대폰번호, 국적 등 한 번 더 확인 필요함
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
                    .append("\"documents\": [{")
                    .append("\"documentType\": \"PASSPORT\",")
                    .append("\"number\": \"").append(data.get("passportNo")).append("\",")
                    .append("\"expiryDate\": \"").append(data.get("passportExDate")).append("\",")
                    .append("\"issuanceCountry\": \"KR\",")
                    .append("\"nationality\": \"KR\",")
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
    public boolean airReservation(String accessToken, String flightData) throws Exception {
        // JSON 문자열을 Map으로 변환
        Map<String, Object> flightDataMap = objectMapper.readValue(flightData, new TypeReference<>() {
        });

        String flightPricing = objectMapper.writeValueAsString(flightDataMap.get("flightPricing")); // 항공편 상세
        Map<String, Object> travelerData = (Map<String, Object>) flightDataMap.get("travelerData"); // 탑승자 정보 입력 데이터
        Map<String, Object> contactData = (Map<String, Object>) flightDataMap.get("contactData"); // 연락처 상세정보

        // Flight Create Order API 호출하여 데이터를 가져옴
        String flightOrderData = getFlightOrder(accessToken, flightPricing, travelerData, contactData);
        log.info("flightOrderData : {}", flightOrderData);

        // flightOrderData를 다시 Map으로 변환
        Map<String, Object> flightOrderMap = objectMapper.readValue(flightOrderData, new TypeReference<>() {});
        log.info("flightOrderMap : {}", flightOrderMap);

        // 예약 코드 생성 (GTA + 날짜 + 랜덤값)
        String revCode = generateReservationCode();

        log.info("revCode : " + revCode);
        // userNo 추출 (비회원인 경우 X로 설정)
        int userNo = flightDataMap.get("userNo") != null ? jwtUtil.extractUserNo((String) flightDataMap.get("userNo")) : null;
        log.info("userNo : {}", userNo);

        // 예약자명 추출
        String revName = (String) contactData.get("userName");
        log.info("revName : {}", revName);

        // 가는편 정보
        // ! 변수명칭 변경 필요, 가는편만 현재 추출 가능하며 오는편은 itineraries를 이용하여 조건문으로 get(1)이 있을 경우 표시, 그 외 인원수/좌석등급/가격/ORDERS 표시
        Map<String, Object> data = flightOrderMap.get("data") != null ? (Map<String, Object>) flightOrderMap.get("data") : null;

        List<Map<String, Object>> flightOffers = data != null ? (List<Map<String, Object>>) data.get("flightOffers") : null;
        Map<String, Object> firstFlightOffer = (flightOffers != null && !flightOffers.isEmpty()) ? flightOffers.get(0) : null;

        List<Map<String, Object>> itineraries = firstFlightOffer != null ? (List<Map<String, Object>>) firstFlightOffer.get("itineraries") : null;
        Map<String, Object> firstItinerary = (itineraries != null && !itineraries.isEmpty()) ? itineraries.get(0) : null;

        List<Map<String, Object>> segments = firstItinerary != null ? (List<Map<String, Object>>) firstItinerary.get("segments") : null;
        if (segments != null && !segments.isEmpty()) {
            String airlinesIata = (String) segments.get(0).get("carrierCode");
            String departureIata = (String) ((Map<String, Object>) segments.get(0).get("departure")).get("iataCode");
            String departureTime = (String) ((Map<String, Object>) segments.get(0).get("departure")).get("at");
            String arrivalIata = (String) ((Map<String, Object>) segments.get(0).get("arrival")).get("iataCode");
            String arrivalTime =(String) ((Map<String, Object>) segments.get(0).get("arrival")).get("at");
            String flightNo =  airlinesIata + segments.get(0).get("number");
            String turnaroundTime = (String) segments.get(0).get("duration");
            String stopLine = segments.size()-1 == 0 ? "직항" : segments.size()-1 == 1 ? "1회 경유" : "경유 2회 이상" ;
            log.info("airlinesIata : {}", airlinesIata);
            log.info("departureIata : {}", departureIata);
            log.info("departureTime : {}", departureTime);
            log.info("arrivalIata : {}", arrivalIata);
            log.info("arrivalTime : {}", arrivalTime);
            log.info("flightNo : {}", flightNo);
            log.info("turnaroundTime : {}", turnaroundTime);
            log.info("stopLine : {}", stopLine);
        }


       /*

// 오는편 정보가 있을 경우만 처리
        String reAirlinesIata = null, reDepartureIata = null, reDepartureTime = null, reArrivalIata = null,
                reArrivalTime = null, reFlightNo = null, reTurnaroundTime = null, reStopLineText = null;

        if (flightOrderMap.containsKey("flightOffers[0].itineraries[1]")) {
            reAirlinesIata = (String) flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].carrierCode");
            reDepartureIata = (String) flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].departure.iataCode");
            reDepartureTime = (String) flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].departure.at");
            reArrivalIata = (String) flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].arrival.iataCode");
            reArrivalTime = (String) flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].arrival.at");
            reFlightNo = reAirlinesIata + flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].number");
            reTurnaroundTime = (String) flightOrderMap.get("flightOffers[0].itineraries[1].segments[0].duration");

            // reStopLine 텍스트 처리
         //   int reStopLine = ((List) flightOrderMap.get("flightOffers[0].itineraries[1].segments")).size() - 1;
         //   reStopLineText = (reStopLine == 0) ? "직항" : (reStopLine == 1) ? "1회 경유" : "경유 2회 이상";
        }*/


 /*       // userNo 추출
        if (flightDataMap.get("userNo") != "") {
            int userNo = jwtUtil.extractUserNo((String) flightDataMap.get("userNo"));
            log.info("userNo : {}", userNo);
        }*/


        return true;
    }


}
