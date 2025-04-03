// 모든 페이지에 전체적으로 보이는 상단 메뉴바

import { Link } from "react-router-dom";
import styled from "styled-components";
import Title from "./Title";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../utils/atom";
import { logout } from "../utils/jwtActivityTimer";

// Layout의 전체 컴포넌트 구성
const Nav = styled.nav`
  position: fixed; // 틀고정
  top: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: ${(props) => props.theme.black.bg};
  color: ${(props) => props.theme.black.font};
`;

// 좌측 메뉴 구성란(메인 로고)
const LeftMenu = styled.div``;

// 우측 메뉴 구성란(회원가입, 로그인 등)
const RightMenu = styled.div`
  display: flex;
  gap: 15px;
`;

// 선택 메뉴 구성
const Menus = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

// 아이콘 조정
const Icon = styled.svg`
  width: 48px;
`;

function Layout() {
  const isLoggedIn = useRecoilValue(isLoggedInState); // 로그인 여부 확인 atom

  return (
    <Nav>
      <LeftMenu>
        <Title parentBgColor="black" />
      </LeftMenu>

      <RightMenu>
        {!isLoggedIn ? (
          <>
            <Link to="/join">
              <Menus>
                <Icon
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </Icon>
                회원가입
              </Menus>
            </Link>

            <Link to="/login">
              <Menus>
                <Icon
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                  />
                </Icon>
                로그인
              </Menus>
            </Link>
          </>
        ) : (
          <>
            <Link to="/myInfo">
              <Menus>
                <Icon
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </Icon>
                개인정보
              </Menus>
            </Link>
            <Link to="/wishList">
              <Menus>
                <Icon
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </Icon>
                찜
              </Menus>
            </Link>
            <Menus onClick={logout}>
              <Icon
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                />
              </Icon>
              로그아웃
            </Menus>
          </>
        )}

        <Link to={isLoggedIn ? "/reservationList" : "/guestReservation"}>
          <Menus>
            <Icon
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </Icon>
            예약내역
          </Menus>
        </Link>
      </RightMenu>
    </Nav>
  );
}

export default Layout;
