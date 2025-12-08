"use client"

import { useState, useRef, type ChangeEvent, type DragEvent } from "react"
import { Upload, X, FileText, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  value?: File | null
  onChange: (file: File | null) => void
  accept?: string
  maxSize?: number // in MB
  className?: string
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*,.pdf,.doc,.docx",
  maxSize = 5,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) validateAndSetFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const validateAndSetFile = (file: File) => {
    setError(null)

    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    onChange(file)
  }

  const removeFile = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

 const getFileIcon = () => {
  if (!value) {
    return <Upload className="h-8 w-8 text-muted-foreground" />
  }

  // If value is a string URL (Supabase or external)
  if (typeof value === "string") {
    return <ImageIcon className="h-8 w-8 text-primary" />
  }

  // If value is a File but type missing
  if (!value.type) {
    return <FileText className="h-8 w-8 text-primary" />
  }

  // Image file
  if (value.type.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-primary" />
  }

  return <FileText className="h-8 w-8 text-primary" />
}


  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          error && "border-destructive",
        )}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

        <div className="flex flex-col items-center gap-2">
          {getFileIcon()}

          {value ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate max-w-[200px]">{value.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">Drop file here or click to upload</p>
              <p className="text-xs text-muted-foreground">Max {maxSize}MB</p>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}
