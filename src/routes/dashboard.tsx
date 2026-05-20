"use client"

import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { Download, RotateCw } from "lucide-react"
import type { AnalysisStatusType } from "@/types/api"
import { triggerBlobDownload } from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UploadModal } from "@/components/upload-modal"

export const Route = createFileRoute("/dashboard")({
  component: Component,
})

export function Component() {
  // Note: Backend doesn't provide a list all analyses endpoint yet
  // For now, use the upload modal and polling for individual analyses

  const getStatusVariant = (
    status: AnalysisStatusType
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "analyzed":
        return "default"
      case "error":
        return "destructive"
      case "processing":
      case "received":
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: AnalysisStatusType): string => {
    switch (status) {
      case "received":
        return "Received"
      case "processing":
        return "Processing"
      case "analyzed":
        return "Analyzed"
      case "error":
        return "Error"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Architecture Diagram Analysis
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your architectural diagram for AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-8">
          <UploadModal />
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">How it works</h2>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">1.</span>
                <span>Upload a diagram image (PNG, JPEG, or PDF)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">2.</span>
                <span>The AI analyzes the diagram and extracts components</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">3.</span>
                <span>
                  View the analysis results with identified risks and
                  recommendations
                </span>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Status meanings</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Received</Badge>
                <span className="text-muted-foreground">
                  File uploaded and queued for processing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Processing</Badge>
                <span className="text-muted-foreground">
                  AI is analyzing the diagram
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>Analyzed</Badge>
                <span className="text-muted-foreground">
                  Analysis complete, results ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Error</Badge>
                <span className="text-muted-foreground">
                  An error occurred during processing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
