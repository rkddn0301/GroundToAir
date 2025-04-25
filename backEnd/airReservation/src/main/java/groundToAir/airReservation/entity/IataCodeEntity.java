package groundToAir.airReservation.entity;

import jakarta.persistence.*;
import lombok.Data;

// 세계 공항코드 테이블
@Data
@Entity
@Table(name = "WORLD_AIRPORT_CODE")
public class IataCodeEntity {

    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="CODE_NO")
    private Integer codeNo;


    // IATA 코드 (EX : GMP)
    @Column(name="IATA", nullable = false)
    private String iata;

    // ICAO 코드 (EX : RKSS)
    @Column(name="ICAO")
    private String icao;

    // 공항명 (EX : Gimpo International Airport)
    @Column(name="AIRPORT", nullable = false)
    private String airport;

    // 공항명 (EX : 김포국제공항)
    @Column(name="AIRPORT_KOR", nullable = false)
    private String airportKor;

    // 공항이 위치한 국가명 (EX : 대한민국)
    @Column(name="COUNTRY_KOR", nullable = false)
    private String countryKor;

    // 공항이 위치한 지역 (EX : 아시아태평양)
    @Column(name="REGION", nullable = false)
    private String region;

    // 공항이 위치한 도시 (EX : Seoul)
    @Column(name="CITY", nullable = false)
    private String city;

    // 공항이 위치한 도시 (EX : 서울)
    @Column(name="CITY_KOR")
    private String cityKor;

    // 공항이 위치한 도시 코드 (EX : SEL)
    @Column(name="CITY_CODE")
    private String cityCode;

    // 공항이 위치한 국가명 (EX : South Korea)
    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUNTRY", referencedColumnName = "COUNTRY", nullable = false)
    private CountryEntity country;

}
