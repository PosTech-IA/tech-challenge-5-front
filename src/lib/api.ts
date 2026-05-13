/**
 * API client for communicating with the backend analysis service
 */

import type {
  AnalysisStatus,
  UploadFileResponse,
  AnalysesList,
} from '@/types/api'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'

/**
 * Upload a file for architectural diagram analysis
 */
export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/analyses/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return response.json() as Promise<UploadFileResponse>
}

/**
 * Get the current status of an analysis
 */
export async function getAnalysisStatus(
  analysisId: string
): Promise<AnalysisStatus> {
  const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}/status`)

  if (!response.ok) {
    throw new Error(`Failed to get status: ${response.statusText}`)
  }

  return response.json() as Promise<AnalysisStatus>
}

/**
 * Get all analyses for the current user
 */
export async function getAllAnalyses(): Promise<AnalysesList> {
  const response = await fetch(`${API_BASE_URL}/analyses`)

  if (!response.ok) {
    throw new Error(`Failed to fetch analyses: ${response.statusText}`)
  }

  return response.json() as Promise<AnalysesList>
}

/**
 * Download the report for a completed analysis
 */
export async function downloadReport(analysisId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}/report`)

  if (!response.ok) {
    throw new Error(`Failed to download report: ${response.statusText}`)
  }

  return response.blob()
}

/**
 * Trigger download of a blob by creating a temporary link
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
