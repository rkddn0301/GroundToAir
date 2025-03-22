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
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
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
    public String getFlightOrder(String accessToken, Map<String, Object> flightDataMap) throws Exception {

        String url = "https://test.api.amadeus.com/v1/booking/flight-orders";


        String flightPricing = objectMapper.writeValueAsString(flightDataMap.get("flightPricing")); // 항공편 상세
        Map<String, Object> travelerData = (Map<String, Object>) flightDataMap.get("travelerData"); // 탑승자 정보 입력 데이터
        Map<String, Object> contactData = (Map<String, Object>) flightDataMap.get("contactData"); // 연락처 상세정보

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


        /*log.info("flightPricing : {}", flightDataMap.get("flightPricing"));
        log.info("travelerData : {}", flightDataMap.get("travelerData"));
        log.info("contactData : {}", flightDataMap.get("contactData"));*/

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

    // 예약 내역 등록
    public boolean airReservation(String accessToken, String flightData) throws Exception {
        // JSON 문자열을 Map으로 변환
        Map<String, Object> flightDataMap = objectMapper.readValue(flightData, new TypeReference<>() {
        });

        String test = getFlightOrder(accessToken, flightDataMap);
        //getFlightOrder(accessToken, flightDataMap);


        log.info("flightDataMap : {}", flightDataMap);
        log.info("test : {}", test);


        // 예약코드 랜덤으로 생성 (이따가 진행)

        // userNo 추출
        if (flightDataMap.get("userNo") != "") {
            int userNo = jwtUtil.extractUserNo((String) flightDataMap.get("userNo"));
            log.info("userNo : {}", userNo);
        }


        return true;
    }


}
