// 모든 페이지에 전체적으로 보이는 메뉴바

import { Link } from "react-router-dom";
import styled from "styled-components";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 20px;
`;

const LeftMenu = styled.div``;
const RightMenu = styled.div`
  display: flex;
  gap: 15px;
`;

function Layout() {
  return (
    <Nav>
      <LeftMenu>
        <Link to="/">GroundToAir</Link>
      </LeftMenu>
      <RightMenu>
        <Link to="/signUp">회원가입</Link>
        <Link to="/signIn">로그인</Link>
      </RightMenu>
    </Nav>
  );
}

export default Layout;
