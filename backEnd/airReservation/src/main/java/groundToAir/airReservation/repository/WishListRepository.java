package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.WishListEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishListRepository extends JpaRepository<WishListEntity, Integer> {
    // 찜 내역에 데이터가 존재하는지 확인
    Optional<WishListEntity> findByUser_UserNoAndFlightNo(int userNo, String flightNo);

}
