package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.IataCodeEntity;
import groundToAir.airReservation.repository.IataCodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
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

    public AirService(RestTemplate restTemplate, IataCodeRepository iataCodeRepository) {
        this.restTemplate = restTemplate;
        this.iataCodeRepository = iataCodeRepository;
    }


    public String getFlightOffers(String accessToken, String originLocationCode, String destinationLocationCode, String departureDate, String returnDate, int adults, int children, int infants, String travelClass, String currencyCode) {
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
                .queryParam("currencyCode", currencyCode);

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

    public List<IataCodeEntity> getIataCodes(String keyword) {
        if (keyword == null || keyword.length() < 2) {
            return Collections.emptyList(); // 빈 리스트 반환
        }

        // 해당 조건을 만족하는 데이터들만 반환
        return iataCodeRepository.findByIataStartingWithOrCityCodeStartingWithOrAirportKorStartingWithOrCityKorStartingWith(
                keyword, keyword, keyword, keyword
        );
    }

    public String getImageUrlFromHtml() throws IOException {
        String url = "https://www.airportal.go.kr/knowledge/airlines/KgMain01P1.jsp?df_id=60";
        Document doc = Jsoup.connect(url).get();
        log.info("doc : {}", doc);

        return url;
    }






}
