// atom 유틸 (설치는 하였으나 현재 미사용중)

import { atom } from "recoil";

const currentRoute = atom({
  key: "currentRoute",
  default: "", // 기본 경로 상태
});
