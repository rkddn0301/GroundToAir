package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.ReservationListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationListRepository extends JpaRepository<ReservationListEntity, Integer> {

}
