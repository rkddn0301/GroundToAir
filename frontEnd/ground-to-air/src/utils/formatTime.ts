// 시간 유틸 포맷 함수

export function formatTime(dateTime?: string) {
  if (!dateTime) return "";

  const date = new Date(dateTime);
  const hours = date.getHours();
  const minutes = date.getMinutes();
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

  console.log(matches);
  if (!matches) return "";

  const hours = matches[1] ? parseInt(matches[1].replace("H", "")) : 0;

  if (matches[2] === undefined) {
    // 0분이면 출력할 필요 없음
    return `${hours}시간`;
  }

  const minutes = matches[2] ? parseInt(matches[2].replace("M", "")) : 0;

  return `${hours}시간 ${minutes}분`;
}
