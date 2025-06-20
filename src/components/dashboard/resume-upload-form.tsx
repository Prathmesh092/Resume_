
"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { useToast } from '@/hooks/use-toast';
import { parseResume, type ParseResumeOutput } from '@/ai/flows/resume-parsing';
import { Loader2 } from 'lucide-react';

interface ResumeUploadFormProps {
  onParsingStart: () => void;
  onParsingComplete: (data: ParseResumeOutput) => void;
  onParsingError: (error: string) => void;
}

export function ResumeUploadForm({ 
  onParsingStart, 
  onParsingComplete,
  onParsingError
}: ResumeUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a resume file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    onParsingStart();

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resumeDataUri = reader.result as string;
        try {
          const result = await parseResume({ resumeDataUri });
          onParsingComplete(result);
          toast({
            title: 'Resume Parsed Successfully',
            description: "We've extracted insights from your resume.",
            variant: 'default',
            className: 'bg-accent text-accent-foreground'
          });
        } catch (error: any) {
          console.error('Error parsing resume:', error);
          let errorMsg = 'Failed to parse resume. Please try again.';
          if (error.message && (error.message.includes('429') || error.message.includes('QuotaFailure') || error.message.includes('rate limit'))) {
            errorMsg = 'The AI resume parsing service has reached its free tier usage limit (Error 429: Too Many Requests). Please wait a few minutes for the quota to reset, or check your Google Cloud project for billing details. Ensure your file is a valid PDF/DOCX.';
          }
          onParsingError(errorMsg);
          toast({
            title: 'Parsing Error',
            description: errorMsg, // Use the potentially more specific error message
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        onParsingError('Failed to read file.');
        toast({
          title: 'File Read Error',
          description: 'Could not read the selected file.',
          variant: 'destructive',
        });
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing file submission:', error);
      onParsingError('An unexpected error occurred.');
      toast({
        title: 'Submission Error',
        description: 'An unexpected error occurred while submitting your resume.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
        <CardDescription>
          Let our AI analyze your resume to find the best job matches for you. Supports PDF, DOC, DOCX.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileInput 
            onFileChange={handleFileChange} 
            accept=".pdf,.doc,.docx" 
            aria-label="Resume upload"
          />
          <Button type="submit" className="w-full" disabled={isProcessing || !file}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Parse Resume & Find Jobs'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
