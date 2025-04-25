package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.AirlineCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 세계 항공사 코드 관련 Repository
public interface AirlineCodeRepository extends JpaRepository<AirlineCodeEntity, Integer> {


}
