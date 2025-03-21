package groundToAir.airReservation.entity;

import groundToAir.airReservation.enumType.SeatClass;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

// 예약내역 테이블
@Data
@Entity
@Table(name = "RESERVATION_LIST")
public class ReservationListEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REV_ID")
    private int revId;

    // 예약코드
    @Column(name = "REV_CODE", unique = true)
    private String revCode;

    // 예약자명
    @Column(name = "REV_NAME")
    private String revName;

    // 가는편 항공사 코드
    @Column(name="AIRLINES_IATA")
    private String airlinesIata;

    // 가는편 출발지 공항
    @Column(name="DEPARTURE_IATA")
    private String departureIata;

    // 가는편 출발시간
    @Column(name="DEPARTURE_TIME")
    private LocalDateTime departureTime;

    // 가는편 도착지 공항
    @Column(name="ARRIVAL_IATA")
    private String arrivalIata;

    // 가는편 도착시간
    @Column(name="ARRIVAL_TIME")
    private LocalDateTime arrivalTime;

    // 가는편 항공편번호
    @Column(name="FLIGHT_NO")
    private String flightNo;

    // 가는편 소요시간
    @Column(name="TURNAROUND_TIME")
    private String turnaroundTime;

    // 가는편 경유지 여부
    @Column(name="STOP_LINE")
    private String stopLine;

    // 오는편 항공사 코드
    @Column(name="RE_AIRLINES_IATA")
    private String reAirlinesIata;

    // 오는편 출발지 공항
    @Column(name="RE_DEPARTURE_IATA")
    private String reDepartureIata;

    // 오는편 출발시간
    @Column(name="RE_DEPARTURE_TIME")
    private LocalDateTime reDepartureTime;

    // 오는편 도착지 공항
    @Column(name="RE_ARRIVAL_IATA")
    private String reArrivalIata;

    // 오는편 도착시간
    @Column(name="RE_ARRIVAL_TIME")
    private LocalDateTime reArrivalTime;

    // 오는편 항공편번호
    @Column(name="RE_FLIGHT_NO")
    private String reFlightNo;

    // 오는편 소요시간
    @Column(name="RE_TURNAROUND_TIME")
    private String reTurnaroundTime;

    // 오는편 경유지 여부
    @Column(name="RE_STOP_LINE")
    private String reStopLine;

    // 인원 수(성인)
    @Column(name="ADULTS")
    private Integer adults;

    // 인원 수(어린이)
    @Column(name="CHILDRENS")
    private Integer childrens;

    // 인원 수(유아)
    @Column(name="INFANTS")
    private Integer infants;

    // 좌석등급
    @Enumerated(EnumType.STRING)
    @Column(name="SEAT_CLASS")
    private SeatClass seatClass;

    // 가격
    @Column(name="TOTAL_PRICE")
    private Integer totalPrice;

    // 예약내역
    @Column(name="ORDERS")
    private String orders;

    // 예약날짜
    @Column(name= "REG_DATE")
    private LocalDate regDate;

    public ReservationListEntity() {
        this.regDate = LocalDate.now(); // 현재 날짜로 초기화
    }

    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_NO")
    private UserEntity reservationListUser;
}
