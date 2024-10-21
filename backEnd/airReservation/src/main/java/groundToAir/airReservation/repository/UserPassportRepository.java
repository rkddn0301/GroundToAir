package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.UserPassportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

// 회원 여권 정보 관련 Repository
public interface UserPassportRepository extends JpaRepository<UserPassportEntity, Integer> {
}
