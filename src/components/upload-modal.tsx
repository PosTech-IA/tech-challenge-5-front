"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react"
import { uploadFile } from "@/lib/api"
import { usePolling } from "@/hooks/usePolling"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export interface UploadModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (analysisId: string) => void
}

export function UploadModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: (data) => {
      setAnalysisId(data.id)
      toast.success("File uploaded successfully. Analyzing...")
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to upload file"
      toast.error(message)
    },
  })

  // Polling for status updates
  const {
    isPolling,
    currentStatus,
    error: pollingError,
  } = usePolling(analysisId, {
    onStatusUpdate: () => {
      // Status updates handled internally, progress displayed in UI
    },
    onComplete: (status) => {
      if (status.status === "analyzed") {
        toast.success("Analysis completed successfully!")
        onSuccess?.(analysisId!)
      } else if (status.status === "error") {
        toast.error(
          `Analysis failed: ${status.error_message || "Unknown error"}`
        )
      }
    },
    onError: (errorMsg) => {
      toast.error(errorMsg)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (PNG, JPEG, PDF only as per backend)
      const validTypes = ["image/png", "image/jpeg", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload PNG, JPEG, or PDF.")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    uploadMutation.mutate(selectedFile)
  }

  const isUploading = uploadMutation.isPending
  const isProcessing = isPolling && analysisId
  const isComplete = currentStatus?.status === "analyzed"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 transition-opacity duration-200"
        onClick={() => !isUploading && !isProcessing && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-border bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg leading-none font-semibold tracking-tight">
            Submit Architectural Diagram
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload an image or PDF of your architectural diagram for AI analysis
          </p>
        </div>

        <div className="space-y-6 py-4">
          {!analysisId ? (
            // File selection view
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8">
                <label className="flex cursor-pointer flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : "Choose a file"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF, WebP or PDF
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={isUploading}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Progress view
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {currentStatus?.status === "analyzed"
                      ? "Analysis Complete"
                      : currentStatus?.status === "error"
                        ? "Analysis Failed"
                        : "Analyzing..."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedFile?.name}
                  </p>
                </div>
                {isProcessing && currentStatus?.status === "processing" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : currentStatus?.status === "analyzed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    currentStatus?.status === "analyzed"
                      ? "default"
                      : currentStatus?.status === "error"
                        ? "destructive"
                        : currentStatus?.status === "processing"
                          ? "secondary"
                          : "secondary"
                  }
                >
                  {currentStatus?.status &&
                    (currentStatus.status === "received"
                      ? "Received"
                      : currentStatus.status === "processing"
                        ? "Processing"
                        : currentStatus.status === "analyzed"
                          ? "Analyzed"
                          : currentStatus.status === "error"
                            ? "Error"
                            : currentStatus.status.charAt(0).toUpperCase() +
                              currentStatus.status.slice(1))}
                </Badge>
              </div>

              {/* Error message */}
              {pollingError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {pollingError}
                </div>
              )}

              {currentStatus?.error_message && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {currentStatus.error_message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {!analysisId ? (
            <>
              <Button
                variant="outline"
                disabled={isUploading}
                onClick={() => !isUploading && onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload & Analyze"
                )}
              </Button>
            </>
          ) : (
            <>
              {isComplete && (
                <Button
                  onClick={() => {
                    setSelectedFile(null)
                    setAnalysisId(null)
                    onOpenChange(false)
                    onSuccess?.(analysisId)
                  }}
                >
                  View Results in Dashboard
                </Button>
              )}
              {!isProcessing && (
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
