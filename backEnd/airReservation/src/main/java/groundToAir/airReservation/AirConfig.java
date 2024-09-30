package groundToAir.airReservation;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AirConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
