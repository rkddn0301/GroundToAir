package groundToAir.airReservation.service;

import groundToAir.airReservation.entity.CountryEntity;
import groundToAir.airReservation.repository.CountryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// 국적 코드 관련 Service
@Service
public class CountryService {

    private final CountryRepository countryRepository;

    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    // 국적 코드 전체 가져오기
    public List<CountryEntity> getCountries() {
        return countryRepository.findAll();
    }



}