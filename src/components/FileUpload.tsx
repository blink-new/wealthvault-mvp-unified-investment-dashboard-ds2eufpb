import React, { useState, useCallback } from 'react'
import { Upload, FileText, Image, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { cn } from '../lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onUploadProgress?: (progress: number) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  className?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUploadProgress,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSize = 10,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`
    }

    return null
  }, [maxSize, acceptedTypes])

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError(null)
    setUploadSuccess(false)
    
    const error = validateFile(file)
    if (error) {
      setUploadError(error)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Call the parent handler
      await onFileSelect(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadSuccess(true)
      
      if (onUploadProgress) {
        onUploadProgress(100)
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [validateFile, onFileSelect, onUploadProgress])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (extension === 'pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return <Image className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-slate-500" />
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-slate-400',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Processing document...</p>
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-slate-500">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="space-y-2">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
            <p className="text-sm text-green-700 font-medium">Document uploaded successfully!</p>
            <p className="text-xs text-slate-500">Extracting data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-8 w-8 text-slate-400 mx-auto" />
            <div>
              <p className="text-sm text-slate-600 font-medium">
                Drag & drop your document here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {acceptedTypes.join(', ').toUpperCase()} supported • Max {maxSize}MB
              </p>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button variant="outline" disabled={isUploading}>
                Browse Files
              </Button>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      <div className="text-xs text-slate-500 space-y-1">
        <p><strong>Supported formats:</strong> PDF documents, JPG/PNG images</p>
        <p><strong>What we extract:</strong> Policy number, premium, maturity date, nominee, coverage amount</p>
      </div>
    </div>
  )
}