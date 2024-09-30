package groundToAir.airReservation;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// React & Spring 연동 CORS 설정
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") // 허용할 출처 설정
                .allowedMethods("GET", "POST", "PUT", "DELETE"); // 허용할 HTTP 메서드 설정
    }
}
