'use client'

import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAllAnalyses, downloadReport, triggerBlobDownload } from '@/lib/api'
import type { Analysis } from '@/types/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Loader2, RotateCw } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: Component,
})

export function Component() {
  const {
    data: analysesList,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => getAllAnalyses(),
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  })

  const analyses = analysesList?.analyses ?? []

  const handleDownload = async (analysis: Analysis) => {
    if (!analysis.reportUrl) {
      toast.error('Report URL not available')
      return
    }

    try {
      const blob = await downloadReport(analysis.id)
      const fileName = `${analysis.fileName.split('.')[0]}-report.pdf`
      triggerBlobDownload(blob, fileName)
      toast.success('Report downloaded successfully')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to download report'
      toast.error(message)
    }
  }

  const getStatusVariant = (
    status: Analysis['status']
  ): 'default' | 'pending' | 'processing' | 'success' | 'destructive' => {
    switch (status) {
      case 'complete':
        return 'success'
      case 'failed':
        return 'destructive'
      case 'processing':
        return 'processing'
      case 'pending':
        return 'pending'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Analysis Dashboard
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                View all your architectural diagram analyses
              </p>
            </div>
            <Button onClick={() => refetch()} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {isError && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load analyses'}
          </div>
        )}

        {analyses.length === 0 && !isLoading ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No analyses yet. Go to the home page to submit your first diagram.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading analyses...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  analyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">
                        {analysis.fileName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(analysis.uploadDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(analysis.status)}>
                          {analysis.status.charAt(0).toUpperCase() +
                            analysis.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {analysis.status === 'complete' &&
                          analysis.reportUrl ? (
                            <Button
                              size="sm"
                              onClick={() => handleDownload(analysis)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Report
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                            >
                              Not Ready
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
