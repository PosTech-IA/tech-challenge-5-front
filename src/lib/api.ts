/**
 * API client for communicating with the backend analysis service
 */

import type {
  AnalysesList,
  AnalysisStatus,
  UploadFileResponse,
} from "@/types/api"

const GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080"

/**
 * Upload a file for architectural diagram analysis
 */
export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${GATEWAY_URL}/api/v1/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return response.json() as Promise<UploadFileResponse>
}

/**
 * Get the analysis report once processing is complete
 */
export async function getAnalysisReport(
  analysisId: string
): Promise<AnalysisStatus> {
  const response = await fetch(`${GATEWAY_URL}/api/v1/report/${analysisId}`)

  if (!response.ok) {
    throw new Error(`Failed to get report: ${response.statusText}`)
  }

  return response.json() as Promise<AnalysisStatus>
}

/**
 * List all analyses with optional status filter and pagination
 */
export async function listReports(
  status?: string,
  limit: number = 10,
  offset: number = 0
): Promise<AnalysesList> {
  const searchParams = new URLSearchParams()
  searchParams.append("limit", String(limit))
  searchParams.append("offset", String(offset))
  if (status) {
    searchParams.append("status", status)
  }

  const response = await fetch(`${GATEWAY_URL}/api/v1/reports?${searchParams}`)

  if (!response.ok) {
    throw new Error(`Failed to list reports: ${response.statusText}`)
  }

  return response.json() as Promise<AnalysesList>
}

/**
 * Download a report as PDF
 */
export async function downloadReportPdf(analysisId: string): Promise<void> {
  const response = await fetch(`${GATEWAY_URL}/api/v1/report/${analysisId}/pdf`)

  if (!response.ok) {
    throw new Error(`Failed to download report: ${response.statusText}`)
  }

  const blob = await response.blob()
  triggerBlobDownload(blob, "report.pdf")
}

/**
 * Trigger download of a blob by creating a temporary link
 */
export function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
