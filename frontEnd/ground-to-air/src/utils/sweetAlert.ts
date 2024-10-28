// sweetAlert2 라이브러리로 구성된 alert 유틸

/*
 ** icon 참고
 * info: 정보를 제공할 때 사용
 * success: 작업이 성공적으로 완료됐음을 알릴 때 사용
 * error: 오류가 발생했음을 알릴 때 사용
 * warning: 주의가 필요할 때 사용
 * question: 사용자에게 선택을 요구할 때 사용
 */

import Swal, { SweetAlertIcon } from "sweetalert2";

// 단순한 확인 팝업창 띄울 시
export const Alert = (textAlert: string, type: SweetAlertIcon) => {
  return Swal.fire({
    text: textAlert,
    icon: type,
    confirmButtonText: "확인",
  });
};

// 확인 여부 과정의 팝업창 띄울 시
export const Confirm = async (textAlert: string, type: SweetAlertIcon) => {
  const result = await Swal.fire({
    text: textAlert,
    icon: type,
    confirmButtonText: "확인",
    showCancelButton: true,
    cancelButtonText: "취소",
  });
  return result;
};
