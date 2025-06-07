// 🟡 高優先度: ファイルストレージ統合

import { put, del, list } from "@vercel/blob"
import { CustomError, ErrorCode } from "./error-handler"
import { env } from "./config"

export interface UploadResult {
  url: string
  filename: string
  size: number
  contentType: string
}

// 許可するMIMEタイプ
export const ALLOWED_MIME_TYPES = {
  // 画像
  "image/jpeg": true,
  "image/png": true,
  "image/gif": true,
  "image/webp": true,
  "image/svg+xml": true,
  
  // ドキュメント
  "application/pdf": true,
  "application/msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  "application/vnd.ms-excel": true,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
  "application/vnd.ms-powerpoint": true,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
  
  // テキスト
  "text/plain": true,
  "text/csv": true,
  "text/markdown": true,
  
  // その他
  "application/json": true,
  "application/zip": true,
} as const;

export type AllowedMimeType = keyof typeof ALLOWED_MIME_TYPES;

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return mimeType in ALLOWED_MIME_TYPES;
}

export function validateMimeType(mimeType: string): void {
  if (!isAllowedMimeType(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

// ファイルサイズの制限（バイト単位）
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
}

// ファイル名の検証
export function validateFileName(fileName: string): void {
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  if (sanitizedFileName !== fileName) {
    throw new Error("Invalid file name. Only alphanumeric characters, dots, and hyphens are allowed.");
  }
}

export class FileStorageService {
  private static instance: FileStorageService
  private readonly maxFileSize = MAX_FILE_SIZE
  private readonly allowedTypes = Object.keys(ALLOWED_MIME_TYPES)

  static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService()
    }
    return FileStorageService.instance
  }

  /**
   * ファイルのアップロード
   */
  async uploadFile(
    file: File,
    options: {
      folder?: string
      userId?: string
      projectId?: string
    } = {},
  ): Promise<UploadResult> {
    try {
      // ファイルサイズチェック
      if (file.size > this.maxFileSize) {
        throw new CustomError(
          ErrorCode.FILE_TOO_LARGE,
          `ファイルサイズが制限を超えています（最大: ${Math.round(this.maxFileSize / 1024 / 1024)}MB）`,
          { fileSize: file.size, maxSize: this.maxFileSize },
        )
      }

      // ファイルタイプチェック
      if (!this.allowedTypes.includes(file.type)) {
        throw new CustomError(ErrorCode.INVALID_FILE_TYPE, `サポートされていないファイル形式です`, {
          fileType: file.type,
          allowedTypes: this.allowedTypes,
        })
      }

      // ファイル名の生成
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split(".").pop()
      const filename = `${timestamp}_${randomString}.${extension}`

      // フォルダパスの構築
      const { folder = "uploads", userId, projectId } = options
      let pathname = folder
      if (userId) pathname += `/${userId}`
      if (projectId) pathname += `/${projectId}`
      pathname += `/${filename}`

      // Vercel Blobにアップロード
      const blob = await put(pathname, file, {
        access: "public",
        contentType: file.type,
      })

      return {
        url: blob.url,
        filename: filename,
        size: file.size,
        contentType: file.type,
      }
    } catch (error) {
      console.error("File upload error:", error)

      if (error instanceof CustomError) {
        throw error
      }

      throw new CustomError(ErrorCode.FILE_UPLOAD_ERROR, "ファイルのアップロードに失敗しました", {
        originalError: error.message,
      })
    }
  }

  /**
   * ファイルの削除
   */
  async deleteFile(url: string): Promise<void> {
    try {
      await del(url)
    } catch (error) {
      console.error("File deletion error:", error)
      throw new CustomError(ErrorCode.FILE_UPLOAD_ERROR, "ファイルの削除に失敗しました", {
        url,
        originalError: error.message,
      })
    }
  }

  /**
   * ファイル一覧の取得
   */
  async listFiles(prefix?: string): Promise<any[]> {
    try {
      const { blobs } = await list({ prefix })
      return blobs
    } catch (error) {
      console.error("File listing error:", error)
      throw new CustomError(ErrorCode.FILE_UPLOAD_ERROR, "ファイル一覧の取得に失敗しました", {
        originalError: error.message,
      })
    }
  }

  /**
   * ファイルタイプの検証
   */
  validateFileType(file: File): boolean {
    return this.allowedTypes.includes(file.type)
  }

  /**
   * ファイルサイズの検証
   */
  validateFileSize(file: File): boolean {
    return file.size <= this.maxFileSize
  }

  /**
   * 画像ファイルかどうかの判定
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith("image/")
  }

  /**
   * PDFファイルかどうかの判定
   */
  isPDFFile(file: File): boolean {
    return file.type === "application/pdf"
  }
}

// シングルトンインスタンスのエクスポート
export const fileStorage = FileStorageService.getInstance()
