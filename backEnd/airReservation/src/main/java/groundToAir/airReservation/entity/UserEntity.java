package groundToAir.airReservation.entity;

import groundToAir.airReservation.enumType.SocialType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

// 회원정보 테이블
@Data
@Entity
@Table(name = "GROUND_TO_AIR_USER")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_NO")
    private int userNo;

    @Column(name = "TOTAL_USER_NO", nullable = false)
    private int totalUserNo;

    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "USER_NAME")
    private String userName;

    @Column(name = "BIRTH")
    private LocalDate birth;

    @Column(name = "GENDER")
    private String gender;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "SOCIAL_ID")
    private String socialId;

    @Enumerated(EnumType.STRING)
    @Column(name = "SOCIAL_TYPE", nullable = false)
    private SocialType socialType;

    @Column(name= "REG_DATE", columnDefinition = "DATE DEFAULT CURRENT_DATE")
    private LocalDate regDate;

    public UserEntity() {
        this.regDate = LocalDate.now(); // 현재 날짜로 초기화
    }

    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_NAME", referencedColumnName = "ROLE_NAME", nullable = false)
    private UserRoleEntity roleName;


}
