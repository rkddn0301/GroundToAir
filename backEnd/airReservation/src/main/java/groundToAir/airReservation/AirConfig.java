package groundToAir.airReservation;

import groundToAir.airReservation.utils.AccessTokenUtil;
import groundToAir.airReservation.utils.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AirConfig {

    // API 추출에 이용되는 Spring 클래스
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // API Token을 추출하기 위해 선언한 클래스
    @Bean
    public AccessTokenUtil accessTokenUtil(RestTemplate restTemplate) {
        return new AccessTokenUtil(restTemplate);
    }

    // 세션 토큰(JWT)을 추출하기 위해 선언한 클래스
    @Bean
    public JwtUtil jwtUtil() {
        return new JwtUtil();
    }


}
