package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.WishListEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface WishListRepository extends JpaRepository<WishListEntity, Integer> {

    // 찜 내역에 로그인 된 회원과 일치하는 데이터 추출
    @Query("SELECT w.wishNo AS wishNo, w.airlinesIata AS airlinesIata, w.departureIata AS departureIata, w.departureTime AS departureTime, w.arrivalIata AS arrivalIata, w.arrivalTime AS arrivalTime, w.flightNo AS flightNo, w.turnaroundTime AS turnaroundTime, w.stopLine AS stopLine, w.reAirlinesIata AS reAirlinesIata, w.reDepartureIata AS reDepartureIata, w.reDepartureTime AS reDepartureTime, w.reArrivalIata AS reArrivalIata, w.reArrivalTime AS reArrivalTime, w.reFlightNo AS reFlightNo, w.reTurnaroundTime AS reTurnaroundTime, w.reStopLine AS reStopLine, w.adults AS adults, w.childrens AS childrens, w.infants AS infants, w.seatClass AS seatClass, w.totalPrice AS totalPrice, w.wishListUser.userNo AS userNo FROM WishListEntity w WHERE w.wishListUser.userNo = :userNo")
    List<Map<String, Object>> findWishList(@Param("userNo") int userNo);

    // 찜 아이콘 클릭 시 찜 내역에 데이터가 존재하는지 확인
    Optional<WishListEntity> findByWishListUser_UserNoAndFlightNoAndDepartureTimeAndArrivalTimeAndReFlightNoAndReDepartureTimeAndReArrivalTime(
            int userNo, String flightNo, LocalDateTime departureTime, LocalDateTime arrivalTime,
            String reFlightNo, LocalDateTime reDepartureTime, LocalDateTime reArrivalTime);



}
