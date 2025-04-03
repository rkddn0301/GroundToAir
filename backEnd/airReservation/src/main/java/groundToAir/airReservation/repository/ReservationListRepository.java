package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.ReservationListEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ReservationListRepository extends JpaRepository<ReservationListEntity, Integer> {

    // 생성된 예약코드가 기존 예약내역의 예약코드와 동일 할 경우 확인
    Optional<ReservationListEntity> findByRevCode(String revCode);

    // 예약내역에 로그인 된 회원과 일치하는 데이터 추출
    @Query("SELECT r.revId AS revId, r.revCode AS revCode, r.reservationListUser.userNo AS userNo, r.revName AS revName, r.airlinesIata AS airlinesIata, r.departureIata AS departureIata, r.departureTime AS departureTime, r.arrivalIata AS arrivalIata, r.arrivalTime AS arrivalTime, r.flightNo AS flightNo, r.turnaroundTime AS turnaroundTime, r.stopLine AS stopLine, r.reAirlinesIata AS reAirlinesIata, r.reDepartureIata AS reDepartureIata, r.reDepartureTime AS reDepartureTime, r.reArrivalIata AS reArrivalIata, r.reArrivalTime AS reArrivalTime, r.reFlightNo AS reFlightNo, r.reTurnaroundTime AS reTurnaroundTime, r.reStopLine AS reStopLine, r.adults AS adults, r.childrens AS childrens, r.infants AS infants, r.seatClass AS seatClass, r.totalPrice AS totalPrice, r.orders AS orders FROM ReservationListEntity r WHERE r.reservationListUser.userNo = :userNo")
    List<Map<String, Object>> findRevList(@Param("userNo") int userNo);

    // 예약자명, 예약코드로 예약 상세 데이터 호출
    @Query("SELECT r.revId AS revId, r.revCode AS revCode, r.reservationListUser.userNo AS userNo, r.revName AS revName, r.airlinesIata AS airlinesIata, r.departureIata AS departureIata, r.departureTime AS departureTime, r.arrivalIata AS arrivalIata, r.arrivalTime AS arrivalTime, r.flightNo AS flightNo, r.turnaroundTime AS turnaroundTime, r.stopLine AS stopLine, r.reAirlinesIata AS reAirlinesIata, r.reDepartureIata AS reDepartureIata, r.reDepartureTime AS reDepartureTime, r.reArrivalIata AS reArrivalIata, r.reArrivalTime AS reArrivalTime, r.reFlightNo AS reFlightNo, r.reTurnaroundTime AS reTurnaroundTime, r.reStopLine AS reStopLine, r.adults AS adults, r.childrens AS childrens, r.infants AS infants, r.seatClass AS seatClass, r.totalPrice AS totalPrice, r.orders AS orders FROM ReservationListEntity r WHERE r.revName = :revName AND r.revCode = :revCode")
    List<Map<String, Object>> findByRevNameAndRevCode(@Param("revName") String revName, @Param("revCode") String revCode);

}
