// 시간 유틸 포맷 함수

// 매개변수로 오는 데이터에 따라 시간 변환 해주는 함수
// string 일 경우 'YYYYMMDD TT:MM:SS' 데이터로 date에서 직접 변환을 시도
// number 일 경우 시간 데이터로 1시간(60분) 기준으로 나누기 시도
export function formatTime(input?: string | number) {
  if (input === undefined) return "";

  // !(Non-Null Assertion Operator) : date 뒤에 '!'는 null 또는 undefined가 아님을 보장한다는 의미.
  const date = typeof input === "string" ? new Date(input) : null;
  const hours =
    typeof input === "string" ? date!.getHours() : Math.floor(input / 60);
  const minutes = typeof input === "string" ? date!.getMinutes() : input % 60;

  const period = hours >= 12 ? "오후" : "오전";

  // 12시간제로 변환
  const adjustedHours = hours % 12 || 12; // 0은 12로 표시
  const formattedMinutes = minutes.toString().padStart(2, "0"); // 두 자릿수 맞춤 EX) 2 --> 02

  return `${period} ${adjustedHours}:${formattedMinutes}`;
}

// 소요시간 텍스트 변환
export function formatDuration(duration?: string) {
  if (!duration) return "";

  const regex = /^PT(\d+H)?(\d+M)?$/;
  const matches = duration.match(regex);

  if (!matches) return "";

  const hours = matches[1] ? parseInt(matches[1].replace("H", "")) : 0;

  if (matches[2] === undefined) {
    // 0분이면 출력할 필요 없음
    return `${hours}시간`;
  }

  const minutes = matches[2] ? parseInt(matches[2].replace("M", "")) : 0;

  return `${hours}시간 ${minutes}분`;
}
