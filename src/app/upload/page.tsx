
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { ResumeUploadForm } from '@/components/dashboard/resume-upload-form';
import type { ParsedResume } from '@/types';
import { Loader2, ScanText, FileUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PARSED_RESUME_LOCAL_STORAGE_KEY = 'jobmatcher_parsed_resume';

export default function UploadResumePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const router = useRouter();

  const handleParsingStart = () => {
    setIsProcessing(true);
    setProcessingError(null);
  };

  const handleParsingComplete = (data: ParsedResume) => {
    try {
      localStorage.setItem(PARSED_RESUME_LOCAL_STORAGE_KEY, JSON.stringify(data));
      setIsProcessing(false);
      router.push('/matches'); 
    } catch (error) {
      console.error("Error storing resume data in localStorage:", error);
      setProcessingError("Could not save resume data. Please try again.");
      setIsProcessing(false);
    }
  };
  
  const handleParsingError = (errorMsg: string) => {
    setIsProcessing(false);
    setProcessingError(errorMsg);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileUp className="h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-bold">Upload Your Resume</CardTitle>
                <CardDescription>
                    Let our AI analyze your resume to find the best job matches for you. 
                    Supports PDF, DOC, DOCX files.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResumeUploadForm 
                    onParsingStart={handleParsingStart}
                    onParsingComplete={handleParsingComplete}
                    onParsingError={handleParsingError}
                />

                {isProcessing && (
                <div className="mt-6 flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-lg bg-card">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                    <p className="text-md font-semibold text-foreground">Analyzing your resume...</p>
                    <p className="text-sm text-muted-foreground">This might take a few moments.</p>
                </div>
                )}

                {processingError && !isProcessing && (
                <Alert variant="destructive" className="mt-6">
                    <ScanText className="h-4 w-4" />
                    <AlertTitle>Resume Processing Failed</AlertTitle>
                    <AlertDescription>{processingError}</AlertDescription>
                </Alert>
                )}
            </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
