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
    private String airport_kor;

    @Column(name="COUNTRY", nullable = false)
    private String country;

    @Column(name="COUNTRY_KOR", nullable = false)
    private String country_kor;

    @Column(name="REGION", nullable = false)
    private String region;

    @Column(name="CITY", nullable = false)
    private String city;

}
