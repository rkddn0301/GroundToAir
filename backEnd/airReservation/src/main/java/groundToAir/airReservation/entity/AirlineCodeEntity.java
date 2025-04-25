package groundToAir.airReservation.entity;

import jakarta.persistence.*;
import lombok.Data;

// 세계 항공사 코드 테이블
@Entity
@Data
@Table(name = "AIRLINE_CODE")
public class AirlineCodeEntity {

    @Id @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="CODE_NO")
    private Integer codeNo;

    // 항공사명 (EX : Korean Air)
    @Column(name="AIRLINES", nullable = false)
    private String airlines;

    // 항공사명 (EX : 대한 항공)
    @Column(name ="AIRLINES_KOR", nullable = false)
    private String airlinesKor;

    // 항공사 IATA (EX : KE)
    @Column(name="IATA", nullable = false)
    private String iata;

    // 항공사 ICAO (EX : KAL)
    @Column(name="ICAO")
    private String icao;

    // 항공사 지역 (EX : 아시아태평양)
    @Column(name="REGION", nullable = false)
    private String region;

    // 항공사 국가명 (EX : South Korea)
    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUNTRY", referencedColumnName = "COUNTRY", nullable = false)
    private CountryEntity country;




}
