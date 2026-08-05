/**
 * 캡처 업로드 한도는 클라이언트 UX와 서버 검증에서 같은 값을 사용합니다.
 * Vercel 요청 본문 한도보다 여유를 두고 차단하도록 유지합니다.
 */
export const MAX_UPLOAD_IMAGES = 5;
export const CLIENT_IMAGE_MAX_WIDTH = 1100;
export const CLIENT_JPEG_QUALITY = 0.7;
export const MAX_SINGLE_IMAGE_CHARS = 1_250_000;
export const MAX_TOTAL_IMAGE_CHARS = 3_600_000;
export const MAX_REQUEST_BYTES = 4_000_000;
