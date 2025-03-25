package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.ReservationListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReservationListRepository extends JpaRepository<ReservationListEntity, Integer> {

    // 생성된 예약코드가 기존 예약내역의 예약코드와 동일 할 경우 확인
    Optional<ReservationListEntity> findByRevCode(String revCode);
}
