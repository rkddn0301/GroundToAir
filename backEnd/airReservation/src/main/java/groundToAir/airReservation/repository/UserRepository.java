package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

// 회원 정보 관련 Repository
// exists : 동일한 데이터가 있는지 확인
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    // userId 중복 확인
    boolean existsByUserId(String userId);

    // email 중복 확인
    boolean existsByEmail(String email);
}
