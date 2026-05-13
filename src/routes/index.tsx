'use client'

import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { UploadModal } from '@/components/upload-modal'
import { FileUp, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false)
    // Redirect to dashboard to see the new analysis
    navigate({ to: '/dashboard' as any })
  }

  return (
    <div className="flex flex-col min-h-svh">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Architectural Diagram Analyzer</h1>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/dashboard' as any })}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold tracking-tight">
                Analyze Architectural Diagrams
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Upload your architectural diagrams and get instant AI-powered analysis
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <Button
                size="lg"
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full"
              >
                <FileUp className="mr-2 h-5 w-5" />
                Submit Diagram for Analysis
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <h3 className="font-semibold">Multiple Formats</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload PNG, JPG, GIF, WebP, or PDF files
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <h3 className="font-semibold">Real-time Progress</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Watch your analysis progress in real-time
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <h3 className="font-semibold">Download Reports</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get detailed analysis reports as PDF
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-8">
              <h3 className="font-semibold">How it works</h3>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    1
                  </span>
                  <span>Submit your architectural diagram</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    2
                  </span>
                  <span>Our AI analyzes the diagram</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    3
                  </span>
                  <span>Download the detailed analysis report</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}
