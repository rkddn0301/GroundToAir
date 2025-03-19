// atom 유틸

import { atom } from "recoil";

// 회원가입이 완료된 계정 정보를 여권정보로 넘기기위한 atom
export const JoinUserNo = atom({
  key: "userNo",
  default: null, // 기본 경로 상태
});

// 로그인 세션을 위한 스위칭 atom
// !! 연산자 : 부정+부정=긍정으로 결국 localStorage로 출력될 값을 boolean 타입으로 변환한 것
export const isLoggedInState = atom<boolean>({
  key: "isLoggedInState",
  default: !!localStorage.getItem("accessToken"),
});

// 타사인증 토큰
export const federationAccessToken = atom<String>({
  key: "federationAccessToken",
  default: "",
});

// 타사인증 socialId
export const socialId = atom<String>({
  key: "socialId",
  default: "",
});
