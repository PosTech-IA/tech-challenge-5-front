/**
 * Custom hook for polling analysis status with configurable intervals and timeouts
 */

import { useEffect, useRef, useState } from "react"
import type { AnalysisStatus } from "@/types/api"
import { getAnalysisReport } from "@/lib/api"
import { POLLING_CONFIG } from "@/config/polling"

export interface UsePollingResult {
  isPolling: boolean
  currentStatus: AnalysisStatus | null
  error: string | null
  cancel: () => void
}

export interface UsePollingOptions {
  pollIntervalMs?: number
  maxDurationMs?: number
  onStatusUpdate?: (status: AnalysisStatus) => void
  onComplete?: (status: AnalysisStatus) => void
  onError?: (error: string) => void
}

/**
 * Hook to poll analysis status until completion or timeout
 * @param analysisId - The ID of the analysis to poll
 * @param options - Configuration options for polling behavior
 */
export function usePolling(
  analysisId: string | null,
  options: UsePollingOptions = {}
): UsePollingResult {
  const {
    pollIntervalMs = POLLING_CONFIG.POLL_INTERVAL_MS,
    maxDurationMs = POLLING_CONFIG.MAX_POLL_DURATION_MS,
    onStatusUpdate,
    onComplete,
    onError,
  } = options

  const [isPolling, setIsPolling] = useState(!!analysisId)
  const [currentStatus, setCurrentStatus] = useState<AnalysisStatus | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const retriesRef = useRef(0)

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }

  const poll = async () => {
    if (!analysisId) return

    try {
      const status = await getAnalysisReport(analysisId)
      retriesRef.current += 1

      setCurrentStatus(status)
      setError(null)

      onStatusUpdate?.(status)

      // Stop polling if analysis is complete or failed
      if (status.status === "analyzed" || status.status === "error") {
        stopPolling()
        onComplete?.(status)
      }

      // Check if we've exceeded max duration
      if (startTimeRef.current) {
        const elapsedTime = Date.now() - startTimeRef.current
        if (elapsedTime > maxDurationMs) {
          const timeoutError = `Analysis polling timed out after ${(maxDurationMs / 1000 / 60).toFixed(0)} minutes`
          setError(timeoutError)
          onError?.(timeoutError)
          stopPolling()
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch status"
      setError(errorMessage)
      onError?.(errorMessage)
      // Continue polling on error - the network might be temporarily unavailable
    }
  }

  useEffect(() => {
    if (!analysisId) {
      setIsPolling(false)
      return
    }

    // Initial poll immediately
    startTimeRef.current = Date.now()
    retriesRef.current = 0
    setIsPolling(true)
    setError(null)

    void poll()

    // Set up interval for subsequent polls
    intervalRef.current = setInterval(() => {
      void poll()
    }, pollIntervalMs)

    return () => {
      stopPolling()
    }
  }, [analysisId])

  const cancel = () => {
    stopPolling()
  }

  return {
    isPolling,
    currentStatus,
    error,
    cancel,
  }
}
