/**
 * API Type definitions for architectural diagram analysis
 */

export interface Analysis {
  id: string
  fileName: string
  uploadDate: string // ISO 8601 date string
  status: 'pending' | 'processing' | 'complete' | 'failed'
  progress?: number // 0-100 percentage
  error?: string
  reportUrl?: string // URL to download the generated report
}

export interface AnalysisStatus {
  status: Analysis['status']
  progress?: number // 0-100 percentage
  error?: string
  reportUrl?: string
}

export interface UploadFileResponse {
  analysisId: string
}

export interface AnalysesList {
  analyses: Analysis[]
  total: number
}
