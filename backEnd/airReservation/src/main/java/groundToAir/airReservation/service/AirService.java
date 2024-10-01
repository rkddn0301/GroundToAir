package groundToAir.airReservation.service;


import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.repository.IataCodeRepository;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;


@Service
public class AirService {


    private final RestTemplate restTemplate;
    private final IataCodeRepository iataCodeRepository;

    public AirService(RestTemplate restTemplate, IataCodeRepository iataCodeRepository) {
        this.restTemplate = restTemplate;
        this.iataCodeRepository = iataCodeRepository;
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
        if (keyword == null  || keyword.length() < 2) {
            return Collections.emptyList(); // 빈 리스트 반환
        }

      return iataCodeRepository.findByIataStartingWith(keyword);
    }







}
