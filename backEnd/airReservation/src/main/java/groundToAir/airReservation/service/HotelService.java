package groundToAir.airReservation.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class HotelService {

    private final RestTemplate restTemplate;
    public HotelService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // 호텔 키워드 조회
    public String getHotelAutoComplete(String accessToken, String keyword, String[] subTypes, int max) {
        String url = "https://test.api.amadeus.com/v1/reference-data/locations/hotel";


        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("keyword", keyword)
                .queryParam("max", max);

        // subTypes 배열을 다시 쿼리 파라미터로 연결
        for (String subType : subTypes) {
            builder.queryParam("subType", subType);
        }


        // keyword에서 공백이 있는 상태로 검색 시 오류 발생하여 replace로 수정
        String fullUrl = builder.toUriString().replace("%20", " ");
        System.out.println(fullUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, request, String.class);

        System.out.println("Response status: " + response.getStatusCode());
        System.out.println("Response body: " + response.getBody());

        return response.getBody();
    }

    // 호텔 목록 조회
    public String getHotelList(String accessToken, String keyword) {
        String url;
        String fullUrl;


        // keyword 글자 수가 세 글자 이하일 경우 cityCode이므로 아래와 같이 진행
        if (keyword.length() <= 3) {
            url = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city";
            fullUrl = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("cityCode", keyword)
                    .toUriString();

        } else { // 반대로 이상일 경우 hotelIds이므로 아래와 같이 진행
            url = "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-hotels";
            fullUrl = UriComponentsBuilder.fromHttpUrl(url)
                    .queryParam("hotelIds", keyword)
                    .toUriString();
        }

        System.out.println(fullUrl);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);


        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, request, String.class);
        return response.getBody();
    }

    // 호텔 총 검색 조회
    public String getHotelOffers(String accessToken,String hotelIds, String checkInDate, String checkOutDate,int adults,int roomQuantity, String currency){
        String url = "https://test.api.amadeus.com/v3/shopping/hotel-offers";

        // 배열을 콤마로 구분된 문자열로 변환
        // String hotelIdsParam = String.join(",", hotelIds);


        // URL에 쿼리 파라미터 추가
        String fullUrl = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("hotelIds", hotelIds)
                .queryParam("checkInDate", checkInDate)
                .queryParam("checkOutDate", checkOutDate)
                .queryParam("adults", adults)
                .queryParam("roomQuantity", roomQuantity)
                .queryParam("currency", currency)
                .toUriString();

        System.out.println(fullUrl);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);


        HttpEntity<String> request = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(fullUrl, HttpMethod.GET, request, String.class);
        return response.getBody();
    }

    

}
