package groundToAir.airReservation.entity;

// 회원 권한 관리 테이블

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "GROUND_TO_AIR_USER_ROLE")
public class UserRoleEntity {

    @Id
    @Column(name = "ROLE_NO")
    private int roleNo;

    @Column(name = "ROLE_NAME")
    private String roleName;

}
