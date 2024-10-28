// JWT 활동 타이머 유틸
import axios from "axios";
import { Alert } from "./sweetAlert";

let inactivityTimer: NodeJS.Timeout; // 비활동 타이머
let refreshInterval: NodeJS.Timeout; // 리프레시 토큰 타이머

// 로그인 시 비활동 타이머, 리프레시 토큰 타이머가 동시에 동작되는 함수
export const startSessionTimeout = () => {
  resetInactivityTimer(); // 세션 타이머 초기화
  refreshInterval = setInterval(refreshAccessToken, 25000); // 25초마다 토큰 갱신
};

// 비활동 타이머 리셋 함수
// 활동 시 이 함수가 계속 호출되어 갱신되는 로직
export const resetInactivityTimer = () => {
  console.log("비활동 타이머 작동");
  clearTimeout(inactivityTimer); // 기존 비활동 타이머 삭제
  inactivityTimer = setTimeout(logout, 30000); // 30초 후 로그아웃
};

// 토큰 갱신 요청
// ! 토큰을 갱신하는건 보안적으로 안전하기 때문에 주기적으로 교체하도록 한다.
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  console.log(refreshToken);
  if (!refreshToken) return logout(); // 기존 리프레시 토큰이 없으면 로그아웃

  try {
    const response = await axios.post<{
      accessToken: string;
      refreshToken: string;
    }>(
      "http://localhost:8080/user/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    console.log(response.data);
    // 새로운 토큰으로 업데이트
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    logout();
  }
};

// 로그아웃 처리 함수
const logout = () => {
  clearTimeout(inactivityTimer); // 비활동 타이머 삭제
  clearInterval(refreshInterval); // 리프레시 토큰 타이머 삭제
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  Alert("세션이 만료되었습니다. 다시 로그인 해주세요.", "info").then(() => {
    window.location.href = "/login"; // 로그인 페이지로 이동
  });
};
