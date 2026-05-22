"use client"

import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { Download } from "lucide-react"
import { useEffect, useState } from "react"
import type { AnalysisStatusType, Analysis } from "@/types/api"
import { listReports } from "@/lib/api"
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
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const limit = 10

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true)
      const data = await listReports(selectedStatus, limit, currentPage * limit)
      setAnalyses(data.items)
      setTotal(data.total)
    } catch (error) {
      console.error("Failed to fetch analyses:", error)
      toast.error("Failed to load analyses")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(0)
  }, [selectedStatus])

  useEffect(() => {
    fetchAnalyses()
  }, [selectedStatus, currentPage])

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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-8">
          <UploadModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSuccess={() => {
              setIsModalOpen(false)
              fetchAnalyses()
            }}
          />
        </div>

        <div className="mt-12 space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Recent Analyses</h2>
            <div className="mt-4 flex gap-2 mb-4">
              <Button
                variant={selectedStatus === undefined ? "default" : "outline"}
                onClick={() => setSelectedStatus(undefined)}
              >
                All
              </Button>
              <Button
                variant={selectedStatus === "received" ? "default" : "outline"}
                onClick={() => setSelectedStatus("received")}
              >
                Received
              </Button>
              <Button
                variant={selectedStatus === "processing" ? "default" : "outline"}
                onClick={() => setSelectedStatus("processing")}
              >
                Processing
              </Button>
              <Button
                variant={selectedStatus === "analyzed" ? "default" : "outline"}
                onClick={() => setSelectedStatus("analyzed")}
              >
                Analyzed
              </Button>
              <Button
                variant={selectedStatus === "error" ? "default" : "outline"}
                onClick={() => setSelectedStatus("error")}
              >
                Error
              </Button>
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-border p-4 text-center text-muted-foreground">
                Loading analyses...
              </div>
            ) : analyses.length === 0 ? (
              <div className="rounded-lg border border-border p-4 text-center text-muted-foreground">
                No analyses found
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filename</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium">
                            {analysis.filename}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(analysis.status as AnalysisStatusType)}>
                              {getStatusLabel(analysis.status as AnalysisStatusType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(analysis.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            {(analysis.status as AnalysisStatusType) === "analyzed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  toast.success("View report feature coming soon")
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, total)} of {total}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
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
