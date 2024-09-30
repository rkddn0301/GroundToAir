package groundToAir.airReservation.service;


import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.repository.IataCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;


@Service
public class AirService {

    private final RestTemplate restTemplate;
    public AirService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
//    @Autowired
//    private AirRepository airRepository;

    @Autowired
    private IataCodeRepository iataCodeRepository;



    // Amadeus API로 POST 요청
    public String getAccessToken() {

        String url = "https://test.api.amadeus.com/v1/security/oauth2/token";

        // HTTP 요청의 헤더를 설정하며, 요청의 메타데이터를 포함함.
        HttpHeaders headers = new HttpHeaders();
        // 요청의 본문 데이터를 application/x-www.form-urlencoded 형식으로 설정한다.
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // 요청 바디 데이터 설정
        // MultiValueMap : 하나의 키 = 하나의 값만 표시되는 Map과 달리 하나의 키 = [여러 값]을 표시할 수 있는 collection이다.
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("client_id", "oT8fZRGasGkulUIrTXVf7BHA6waUqPPO");
        body.add("client_secret", "GVfy5Y6HGnW04qFB");

        // 요청의 headers, body를 함께 묶어 HttpEntity로 만듦
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        // API에 POST 요청을 보내고 응답을 받아옴
        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                String.class
        );
        return response.getBody();
    }

    // ! 혹시 오류나면 token 코드 붙여넣기
    public String getMetaData(String accessToken) {

        String url = "https://test.api.amadeus.com/v1/shopping/flight-destinations";
        String origin = "PAR";
        int maxPrice = 200;


        // URL에 쿼리 파라미터 추가
        String fullUrl = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("origin", origin)
                .queryParam("maxPrice", maxPrice)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, request, String.class);
        return response.getBody();

    }

    public String getFlightOffers(String accessToken, String originLocationCode, String destinationLocationCode, String departureDate, String returnDate, int adults, String currencyCode) {
        String url = "https://test.api.amadeus.com/v2/shopping/flight-offers";

        // URL에 쿼리 파라미터 추가
        String fullUrl = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("originLocationCode", originLocationCode)
                .queryParam("destinationLocationCode", destinationLocationCode)
                .queryParam("departureDate", departureDate)
                .queryParam("returnDate", returnDate)
                .queryParam("adults", adults)
                .queryParam("currencyCode", currencyCode)
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, request, String.class);
        return response.getBody();
    }

    public List<IataCodeEntity> getIataCodes(String keyword) {


        // keyword 값이 없거나 2글자 미만이면 해당 조건 적용
        if (keyword == null || keyword.isEmpty() || keyword.length() < 2) {
            return Collections.emptyList(); // 빈 리스트 반환
        }

      return iataCodeRepository.findByIataStartingWith(keyword);
    }







}
