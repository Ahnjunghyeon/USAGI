"use client";

import {
  CLIENT_IMAGE_MAX_WIDTH,
  CLIENT_JPEG_QUALITY,
  MAX_TOTAL_IMAGE_CHARS,
  MAX_UPLOAD_IMAGES,
} from "@/lib/upload-config";

export type ImagePreparationErrorCode = "unsupported_type" | "too_many" | "too_large" | "processing_failed";

export class ImagePreparationError extends Error {
  constructor(public readonly code: ImagePreparationErrorCode) {
    super(code);
    this.name = "ImagePreparationError";
  }
}

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function isSupportedImageFile(file: File) {
  return SUPPORTED_TYPES.has(file.type.toLowerCase());
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
};

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() };
    } catch {
      // Safari/browser fallback below.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      cleanup: () => URL.revokeObjectURL(url),
    });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImagePreparationError("processing_failed"));
    };
    image.src = url;
  });
}

export async function compressUploadImage(file: File) {
  if (!isSupportedImageFile(file)) throw new ImagePreparationError("unsupported_type");

  const decoded = await decodeImage(file);
  try {
    const scale = Math.min(1, CLIENT_IMAGE_MAX_WIDTH / decoded.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(decoded.width * scale));
    canvas.height = Math.max(1, Math.round(decoded.height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new ImagePreparationError("processing_failed");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", CLIENT_JPEG_QUALITY);
  } finally {
    decoded.cleanup();
  }
}

export function mergeImageFiles(current: File[], incoming: FileList | File[]) {
  const all = Array.from(incoming);
  const accepted = all.filter(isSupportedImageFile);
  const merged = [...current, ...accepted];
  return {
    files: merged.slice(0, MAX_UPLOAD_IMAGES),
    rejected: all.length - accepted.length,
    truncated: merged.length > MAX_UPLOAD_IMAGES,
  };
}

export async function prepareUploadImages(files: File[]) {
  if (files.length > MAX_UPLOAD_IMAGES) throw new ImagePreparationError("too_many");
  const images: string[] = [];
  let totalChars = 0;

  for (const file of files) {
    const image = await compressUploadImage(file);
    totalChars += image.length;
    if (totalChars > MAX_TOTAL_IMAGE_CHARS) throw new ImagePreparationError("too_large");
    images.push(image);
  }
  return images;
}
