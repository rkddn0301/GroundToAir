package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.WishListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishListRepository extends JpaRepository<WishListEntity, Integer> {
}
