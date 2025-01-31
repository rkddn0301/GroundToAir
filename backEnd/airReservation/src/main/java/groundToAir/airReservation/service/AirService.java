package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.AirlineCodeEntity;
import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.repository.AirlineCodeRepository;
import groundToAir.airReservation.repository.CountryRepository;
import groundToAir.airReservation.repository.IataCodeRepository;
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

    public AirService(RestTemplate restTemplate, IataCodeRepository iataCodeRepository, AirlineCodeRepository airlineCodeRepository) {
        this.restTemplate = restTemplate;
        this.iataCodeRepository = iataCodeRepository;
        this.airlineCodeRepository = airlineCodeRepository;
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
                .replace("}}]}]}}", "}}]}]}]}}");


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














}
