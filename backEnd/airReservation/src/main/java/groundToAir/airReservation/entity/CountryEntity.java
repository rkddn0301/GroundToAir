package groundToAir.airReservation.entity;

import jakarta.persistence.*;
import lombok.Data;

// 국가코드 테이블
@Data
@Entity
@Table(name = "COUNTRY_CODE")
public class CountryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CODE_NO")
    private Integer codeNo;

    // 국가코드2자리 (EX : KR)
    @Column(name = "ISO_ALPHA2", nullable = false)
    private String isoAlpha2;

    // 국가코드3자리 (EX : KOR)
    @Column(name = "ISO_ALPHA3", nullable = false)
    private String isoAlpha3;

    // 국가번호 (EX : 410)
    @Column(name = "ISO_NUMERIC", nullable = false)
    private String isoNumeric;

    // 대륙공통코드 (EX : Asia)
    @Column(name = "CONTINENT_COMMON_CODE", nullable = false)
    private String continentCommonCode;

    // 대륙행정표준코드 (EX : 아시아)
    @Column(name = "CONTINENT_ADMIN_CODE", nullable = false)
    private String continentAdminCode;

    // 대륙외교부직제코드 (EX : 아시아)
    @Column(name = "CONTINENT_FOREIGN_AFFAIRS_CODE", nullable = false)
    private String continentForeignAffairsCode;

    // 국가명 (EX : South Korea)
    @Column(name = "COUNTRY", nullable = false)
    private String country;

    // 국가명(한글) (EX : 대한민국)
    @Column(name = "COUNTRY_KOR", nullable = false)
    private String countryKor;


    public CountryEntity() {

    }
    // 여권 정보 입력 시 자식 엔티티인 UserPassportEntity에서 String 형태로 보내기 때문에 부모 엔티티인 CountryEntity에서 변환해주는 작업이 필요하다.
    public CountryEntity(String country) {
        this.country = country;
    }


}