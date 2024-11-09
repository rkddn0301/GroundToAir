package groundToAir.airReservation.entity;

import jakarta.persistence.*;
import lombok.Data;

// 세계 공항코드 DB
@Data
@Entity
@Table(name = "WORLD_AIRPORT_CODE")
public class IataCodeEntity {

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="CODE_NO")
    private Integer codeNo;

    @Column(name="IATA", nullable = false)
    private String iata;

    @Column(name="ICAO")
    private String icao;

    @Column(name="AIRPORT", nullable = false)
    private String airport;

    @Column(name="AIRPORT_KOR", nullable = false)
    private String airportKor;

    @Column(name="COUNTRY_KOR", nullable = false)
    private String countryKor;

    @Column(name="REGION", nullable = false)
    private String region;

    @Column(name="CITY", nullable = false)
    private String city;

    @Column(name="CITY_KOR")
    private String cityKor;

    @Column(name="CITY_CODE")
    private String cityCode;

    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUNTRY", referencedColumnName = "COUNTRY", nullable = false)
    private CountryEntity country;

}
