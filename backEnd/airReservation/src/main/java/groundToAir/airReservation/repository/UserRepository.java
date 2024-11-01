package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// 회원 정보 관련 Repository
// exists : 동일한 데이터가 있는지 확인
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    // userId 중복 확인
    boolean existsByUserId(String userId);

    // email 중복 확인
    boolean existsByEmail(String email);

    // 로그인 하는 아이디가 일치하는지 확인
    Optional<UserEntity> findByUserId(String userId);

    // 타사 인증 과정 (Kakao, Google)
    Optional<UserEntity> findBySocialId(String socialId);

    // 아이디 찾기 과정에서 성명, 이메일이 일치하는 아이디 확인
    @Query("SELECT u.userId FROM UserEntity u WHERE u.userName =?1 AND u.email = ?2")
    String findUserIdByUserNameAndEmail(String userName, String email);

    // 개인정보 추출
    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.passport p WHERE u.userNo = :userNo")
    Optional<UserEntity> findUserWithPassportByUserNo(@Param("userNo") int userNo);


}
