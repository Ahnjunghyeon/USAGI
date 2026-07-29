"use client";

import {
  CLIENT_IMAGE_MAX_WIDTH,
  CLIENT_JPEG_QUALITY,
  MAX_TOTAL_IMAGE_CHARS,
  MAX_UPLOAD_IMAGES,
} from "@/lib/upload-config";

export async function compressUploadImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, CLIENT_IMAGE_MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("이미지를 처리할 수 없습니다.");
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", CLIENT_JPEG_QUALITY);
}

export function mergeImageFiles(current: File[], incoming: FileList | File[]) {
  const next = [...current, ...Array.from(incoming).filter((file) => file.type.startsWith("image/"))];
  return next.slice(0, MAX_UPLOAD_IMAGES);
}

export async function prepareUploadImages(files: File[]) {
  const images = await Promise.all(files.slice(0, MAX_UPLOAD_IMAGES).map(compressUploadImage));
  if (JSON.stringify(images).length > MAX_TOTAL_IMAGE_CHARS) {
    throw new Error("캡처 용량이 너무 큽니다. 이미지 수를 줄이거나 더 작은 캡처로 다시 시도해 주세요.");
  }
  return images;
}
