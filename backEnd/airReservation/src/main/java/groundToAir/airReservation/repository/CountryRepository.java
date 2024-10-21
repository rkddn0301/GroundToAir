package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.CountryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// 국적 코드 관련 Repository
public interface CountryRepository extends JpaRepository<CountryEntity, Integer> {

    // JPQL : 테이블 쿼리가 아닌 Entity에 있는 객체를 명시하여 출력하는 쿼리
    @Query("SELECT c FROM CountryEntity c WHERE c.country = :country")
    Optional<CountryEntity> findByCountry(@Param("country") String country);

}
