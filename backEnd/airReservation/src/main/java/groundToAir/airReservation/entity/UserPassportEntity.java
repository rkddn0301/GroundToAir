package groundToAir.airReservation.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

// 회원 여권정보 테이블
@Data
@Entity
@Table(name = "GROUND_TO_AIR_USER_PASSPORT")
public class UserPassportEntity {


    @Id
    @Column(name = "USER_NO")
    private int userNo;

    // 여권번호
    @Column(name ="PASSPORT_NO")
    private String passportNo;

    // 여권영문명
    @Column(name = "PASSPORT_USER_ENG_NAME")
    private String engName;

    // 국적
    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "NATIONALITY", referencedColumnName = "COUNTRY")
    private CountryEntity nationality;

    // 여권만료일
    @Column(name = "PASSPORT_EXPIRATION_DATE")
    private LocalDate expirationDate;

    // 여권발행국
    @Column(name = "PASSPORT_COUNTRY_OF_ISSUE")
    private String countryOfIssue;

    // 외래키 설정 (OneToOne: 1:1 관계)
    // MapsId : 외래키로 가져온걸 기본키로 설정
    // ! Hibernate는 @MapsId로 설정된 필드를 저장할 때 외래키 관계를 명시적으로 연결해야 동작한다. 그래서 UserEntity를 채워줘야 외래키와 기본키가 제대로 매핑된다.
    // CascadeType.ALL : UserEntity에 있는 데이터가 지워질 경우 UserPassportEntity에서 JoinColumn 과 일치하는 값을 찾아 같이 전부 지워버린다는 의미. (실제 DB에도 설정해놓았을 경우 여기다가 같이 써놓아야함)
    @OneToOne(cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "USER_NO")
    private UserEntity user;


}