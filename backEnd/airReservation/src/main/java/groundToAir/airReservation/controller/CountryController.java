package groundToAir.airReservation.controller;

import groundToAir.airReservation.entity.CountryEntity;
import groundToAir.airReservation.service.CountryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// 국가 코드 관련 Controller
@Slf4j
@RestController
@RequestMapping("/country")
public class CountryController {

    private final CountryService countryService;

    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }

    // 국적 코드 가져오기
    @GetMapping("/code")
    public List<CountryEntity> getCountries() {
        return countryService.getCountries();
    }

}
