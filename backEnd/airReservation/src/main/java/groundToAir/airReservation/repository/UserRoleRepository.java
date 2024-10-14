package groundToAir.airReservation.repository;

import groundToAir.airReservation.entity.UserRoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRoleEntity, Integer> {
    UserRoleEntity findByRoleName(String roleName);
}
