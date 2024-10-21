// atom 유틸

import { atom } from "recoil";

// 회원가입이 완료된 계정 정보를 여권정보로 넘기기위한 atom
export const JoinUserNo = atom({
  key: "userNo",
  default: null, // 기본 경로 상태
});
