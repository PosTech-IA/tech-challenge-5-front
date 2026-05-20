/**
 * API Type definitions for architectural diagram analysis
 * These match the backend contract exactly
 */

// Backend status values: received → processing → analyzed (or error)
export type AnalysisStatusType =
  | "received"
  | "processing"
  | "analyzed"
  | "error"

export interface Analysis {
  id: string
  filename: string
  file_ref: string
  status: AnalysisStatusType
  result_data?: Record<string, unknown> // Analysis results
  error_message?: string
  created_at: string // ISO 8601 date string
  updated_at: string // ISO 8601 date string
}

export interface AnalysisStatus {
  analysis_id: string
  filename: string
  status: AnalysisStatusType
  content?: Record<string, unknown> // Analysis results
  error_message?: string
}

export interface UploadFileResponse {
  id: string
  filename: string
  file_ref: string
  status: AnalysisStatusType
  created_at: string
}

export interface AnalysesList {
  analyses: Array<Analysis>
  total: number
}
