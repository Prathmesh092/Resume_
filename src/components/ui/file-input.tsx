"use client";

import * as React from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  onFileChange: (file: File | null) => void;
  label?: string;
  accept?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFileChange, label = "Upload Resume", accept = ".pdf,.doc,.docx", ...props }, ref) => {
    const internalRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      setFileName(file?.name || null);
      onFileChange(file);
    };
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0] || null;
      if (file) {
         if (internalRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          internalRef.current.files = dataTransfer.files;
        }
        setFileName(file.name);
        onFileChange(file);
      }
    };

    const handleRemoveFile = () => {
      setFileName(null);
      onFileChange(null);
      if (internalRef.current) {
        internalRef.current.value = ""; // Reset the input value
      }
    };

    const triggerFileInput = () => {
      internalRef.current?.click();
    };

    return (
      <div className={cn("w-full space-y-2", className)}>
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/70 transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border",
            fileName ? "border-primary bg-primary/5" : ""
          )}
          onClick={triggerFileInput}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloud className={cn("w-10 h-10 mb-3", fileName ? "text-primary" : "text-muted-foreground")} />
          <p className="mb-2 text-sm text-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            {accept.split(',').map(ext => ext.toUpperCase().replace('.', '')).join(', ')} (MAX. 5MB)
          </p>
          <Input
            type="file"
            ref={(node) => {
              if (ref) {
                if (typeof ref === 'function') {
                  ref(node);
                } else {
                  ref.current = node;
                }
              }
              (internalRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }}
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
            {...props}
          />
        </div>
        {fileName && (
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div className="flex items-center space-x-2">
              <FileIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground truncate max-w-xs sm:max-w-sm md:max-w-md">
                {fileName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              className="w-7 h-7"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }
);
FileInput.displayName = "FileInput";

export { FileInput };
