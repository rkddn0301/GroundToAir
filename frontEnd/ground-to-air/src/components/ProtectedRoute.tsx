// 로그인 여부에 따라 접근 경로를 지정해주는 컴포넌트

import React from "react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { isLoggedInState } from "../utils/atom";

// 기본 react-router-dom 에서 RouteProps를 참조하여 component, restricted 속성을 추가정의함.
interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>; // React에서 사용가능한 모든 컴포넌트 타입을 의미
  restricted?: boolean; // 이 props로 로그인 여부에 따른 라우팅 제한
}

function ProtectedRoute({
  component: Component,
  restricted = false,
  ...rest // 추가정의한 속성들을 제외한 RouteProps의 기본 탑재된 속성들을 전부 불러옴.
}: ProtectedRouteProps) {
  const isLoggedIn = useRecoilValue(isLoggedInState); // isLoggedIn 상태 가져오기
  const location = useLocation(); // 현재 위치 정보 가져오기

  // restricted가 true로 제어된 것은 로그인이 안된 사용자만 접근 가능한 페이지
  // from : 로그인 후 리다이렉트될 원래 경로를 나타내며, 자세한 내용은 Login.tsx에서 확인 가능.
  if (
    restricted &&
    isLoggedIn &&
    !(location.state as { from?: string })?.from
  ) {
    // 로그인이 된 상태에서 로그인/회원가입 관련 페이지에 접근하면 메인 페이지로 이동
    return <Redirect to="/" />;
  }

  // restricted가 false로 제어된 것은 로그인이 된 사용자만 접근 가능한 페이지
  if (!restricted && !isLoggedIn) {
    return <Redirect to="/login" />;
  }

  // App측에서 원하는 컴포넌트 명칭을 보내면 ...props에 전달되어 컴포넌트 명칭에 올바르게 전달되는 방식임
  return <Route {...rest} render={(props) => <Component {...props} />} />;
}

export default ProtectedRoute;
