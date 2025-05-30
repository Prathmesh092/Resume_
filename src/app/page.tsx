
"use client";

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ResumeUploadForm } from '@/components/dashboard/resume-upload-form';
import { ResumeInsightsCard } from '@/components/dashboard/resume-insights-card';
import { JobListings } from '@/components/dashboard/job-listings';
import type { ParsedResume } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Loader2, ScanText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function DashboardPage() {
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [isProcessingInitial, setIsProcessingInitial] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [jobSearchTrigger, setJobSearchTrigger] = useState(0);

  const handleParsingStart = () => {
    setIsProcessingInitial(true);
    setProcessingError(null);
    setParsedResume(null); // Clear previous results
  };

  const handleParsingComplete = (data: ParsedResume) => {
    setParsedResume(data);
    setIsProcessingInitial(false);
    setJobSearchTrigger(prev => prev + 1); // Trigger job search/matching
  };
  
  const handleParsingError = (errorMsg: string) => {
    setIsProcessingInitial(false);
    setProcessingError(errorMsg);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        <ResumeUploadForm 
          onParsingStart={handleParsingStart}
          onParsingComplete={handleParsingComplete}
          onParsingError={handleParsingError}
        />

        {isProcessingInitial && (
          <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed rounded-lg bg-card">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold text-foreground">Analyzing your resume...</p>
            <p className="text-muted-foreground">This might take a few moments. We're working hard to find you the best opportunities!</p>
          </div>
        )}

        {processingError && !isProcessingInitial && (
           <Alert variant="destructive">
            <ScanText className="h-4 w-4" />
            <AlertTitle>Resume Processing Failed</AlertTitle>
            <AlertDescription>{processingError}</AlertDescription>
          </Alert>
        )}

        {parsedResume && !isProcessingInitial && !processingError && (
          <>
            <Separator />
            {/* Section for Resume Summary View */}
            <div className="space-y-6 py-8">
              <h2 className="text-3xl font-bold tracking-tight text-center">
                Your Resume Summary
              </h2>
              <div className="max-w-4xl mx-auto">
                <ResumeInsightsCard resumeData={parsedResume} />
              </div>
            </div>

            <Separator className="my-8" /> {/* Adjusted margin for visual separation */}
            
            {/* Job Listings section - JobListings component already has its own title */}
            <JobListings parsedResumeData={parsedResume} triggerSearch={jobSearchTrigger} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
