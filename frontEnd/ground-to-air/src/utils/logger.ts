// 배포 시 console.log 방지 유틸

// 일반 console.log
export const log = (...args: unknown[]): void => {
  if (process.env.REACT_APP_ENV !== "production") {
    console.log(...args);
  }
};

// 오류 log
export const errors = (...args: unknown[]): void => {
  if (process.env.REACT_APP_ENV !== "production") {
    console.error(...args);
  }
};
