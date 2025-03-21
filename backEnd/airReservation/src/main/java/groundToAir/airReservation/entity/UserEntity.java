package groundToAir.airReservation.entity;

import groundToAir.airReservation.enumType.SocialType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

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

    @Column(name= "REG_DATE")
    private LocalDate regDate;

    public UserEntity() {
        this.regDate = LocalDate.now(); // 현재 날짜로 초기화
    }

    // 외래키 설정 (ManyToOne: N:1 관계)
    // fetch = FetchType.LAZY : 연관된 Entity를 실제로 사용할 때만 불러오도록 지연 로딩 설정.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROLE_NAME", referencedColumnName = "ROLE_NAME", nullable = false)
    private UserRoleEntity roleName;

    // 양방향 설정: UserEntity와 UserPassportEntity 간의 관계
    // CascadeType.ALL : UserEntity에 있는 데이터가 지워질 경우 UserPassportEntity에서 JoinColumn 과 일치하는 값을 찾아 같이 전부 지워버린다는 의미. (실제 DB에도 설정해놓았을 경우 여기다가 같이 써놓아야함)
    @OneToOne(mappedBy = "passportUser", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private UserPassportEntity passport;

    // 양방향 설정: UserEntity와 WishListEntity 간의 관계
    // CascadeType.ALL : UserEntity에 있는 데이터가 지워질 경우 WishListEntity에서 JoinColumn과 일치하는 값을 찾아 같이 전부 지워버린다는 의미. (실제 DB에도 설정해놓았을 경우 여기다가 같이 써놓아야함)
    @OneToMany(mappedBy = "wishListUser", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<WishListEntity> wishList;

    // 양방향 설정: UserEntity와 ReservationListEntity 간의 관계
    // CascadeType.ALL : UserEntity에 있는 데이터가 지워질 경우 ReservationListEntity에서 JoinColumn과 일치하는 값을 찾아 같이 전부 지워버린다는 의미. (실제 DB에도 설정해놓았을 경우 여기다가 같이 써놓아야함)
    @OneToMany(mappedBy = "reservationListUser", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ReservationListEntity> reservationList;
}
