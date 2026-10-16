import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  FileText,
  X
} from 'lucide-react'

export default function PdfViewer({
  pdfUrl,
  title = 'PDF Viewer',
  documentNumber = '',
  filename = 'document.pdf',
  onClose,
  onDownload
}) {
  const [zoom, setZoom] = useState(100)
  const [isFitWidth, setIsFitWidth] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  // Zoom steps
  const ZOOM_STEP = 15
  const MIN_ZOOM = 50
  const MAX_ZOOM = 220

  const handleZoomIn = () => {
    setIsFitWidth(false)
    setZoom(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP))
  }

  const handleZoomOut = () => {
    setIsFitWidth(false)
    setZoom(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP))
  }

  const handleResetZoom = () => {
    setIsFitWidth(false)
    setZoom(100)
  }

  const handleToggleFit = () => {
    setIsFitWidth(prev => !prev)
    if (!isFitWidth) {
      setZoom(100)
    }
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  // Handle Ctrl+wheel to zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
        setIsFitWidth(false)
        setZoom(prev => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)))
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Handle Escape key to exit fullscreen or close viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else if (onClose) {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, onClose])

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload()
      return
    }
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = filename || 'document.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const handleOpenNewTab = () => {
    if (!pdfUrl) return
    window.open(pdfUrl, '_blank')
  }

  // Base dimensions of document for scaling
  const baseWidth = 850
  const currentWidth = Math.round(baseWidth * (zoom / 100))

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col w-screen h-screen overflow-hidden'
          : 'w-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-7rem)] min-h-[640px]'
      }
    >
      {/* Top Controls Toolbar */}
      <div className="px-4 py-3 sm:px-6 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs z-10">
        {/* Left: Back button & Document Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-700 font-medium text-sm transition-all shadow-2xs cursor-pointer"
            title="Back to list (Esc)"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight truncate">
                  {title}
                </h1>
                {documentNumber && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                    {documentNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate hidden md:block">
                Hold Ctrl + Scroll to zoom • Use scrollbars or wheel to navigate
              </p>
            </div>
          </div>
        </div>

        {/* Center: Zoom & Fit Controls */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 shadow-2xs">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM && !isFitWidth}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut size={16} />
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1 text-xs font-bold font-mono text-gray-700 hover:text-gray-900 hover:bg-white rounded-md transition-all cursor-pointer min-w-[52px] text-center"
            title="Click to reset to 100%"
          >
            {isFitWidth ? 'Fit' : `${zoom}%`}
          </button>

          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn size={16} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-1" />

          <button
            onClick={handleToggleFit}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
              isFitWidth
                ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
            title="Toggle Fit to Window Width"
          >
            <Maximize size={13} />
            <span className="hidden sm:inline">Fit Width</span>
          </button>

          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white transition-all cursor-pointer"
            title="Reset Zoom to 100%"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Right: Actions (Open New Tab, Download, Fullscreen) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewTab}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
            title="Open in new browser tab"
          >
            <ExternalLink size={16} />
          </button>

          <button
            onClick={handleDownloadClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-medium text-xs sm:text-sm transition-all shadow-2xs cursor-pointer"
            title="Download PDF"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen mode'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {isFullscreen && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer ml-1"
              title="Close Viewer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Canvas */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 bg-slate-900/95 overflow-auto p-4 sm:p-6 md:p-8 flex justify-center items-start custom-pdf-scroll"
        style={{
          scrollbarGutter: 'stable',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          style={{
            width: isFitWidth ? '100%' : `${currentWidth}px`,
            maxWidth: isFitWidth ? '100%' : 'none',
            height: isFitWidth ? '100%' : `${Math.round(1150 * (zoom / 100))}px`,
            minHeight: isFitWidth ? '100%' : `${Math.round(1150 * (zoom / 100))}px`,
            transition: 'width 0.15s ease-out, height 0.15s ease-out'
          }}
          className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-700/60 relative flex flex-col"
        >
          <iframe
            key={`${pdfUrl}-${isFitWidth ? 'fit' : zoom}`}
            src={`${pdfUrl}#toolbar=1&navpanes=0&view=${isFitWidth ? 'FitH' : 'Fit'}`}
            className="w-full h-full border-0 block flex-1"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
