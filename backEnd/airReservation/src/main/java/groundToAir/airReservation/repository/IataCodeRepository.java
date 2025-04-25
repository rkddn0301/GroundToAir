package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.IataCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 세계 공항 코드 관련 Repository

// findBy : JPA가 쿼리를 생성할 때, 특정 필드를 기반으로 데이터를 찾겠다는 의미
// StartingWith: 해당 필드가 특정 문자열로 시작하는지 여부를 검사하도록 지시
public interface IataCodeRepository extends JpaRepository<IataCodeEntity, Integer> {

    List<IataCodeEntity> findByIataStartingWithOrCityCodeStartingWithOrAirportKorStartingWithOrCityKorStartingWith(String iataKeyword, String cityCodeKeyword, String airportKeyword, String cityKorKeyword);

}
