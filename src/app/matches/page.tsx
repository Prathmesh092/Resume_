
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { ResumeInsightsCard } from '@/components/dashboard/resume-insights-card';
import { JobListings } from '@/components/dashboard/job-listings';
import type { ParsedResume } from '@/types';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, FileText, SearchX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PARSED_RESUME_LOCAL_STORAGE_KEY = 'jobmatcher_parsed_resume';

export default function JobMatchesPage() {
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [jobSearchTrigger, setJobSearchTrigger] = useState(0);
  const [errorLoadingResume, setErrorLoadingResume] = useState<string | null>(null);


  useEffect(() => {
    try {
      const storedResume = localStorage.getItem(PARSED_RESUME_LOCAL_STORAGE_KEY);
      if (storedResume) {
        const resumeData = JSON.parse(storedResume) as ParsedResume;
        // Basic validation of stored data structure
        if (resumeData && Array.isArray(resumeData.skills) && Array.isArray(resumeData.experience) && Array.isArray(resumeData.education)) {
            setParsedResume(resumeData);
            setJobSearchTrigger(prev => prev + 1); // Trigger job search
        } else {
            console.warn("Invalid resume data structure in localStorage.");
            setErrorLoadingResume("The stored resume data is not in the expected format. Please try uploading again.");
            localStorage.removeItem(PARSED_RESUME_LOCAL_STORAGE_KEY); // Clear invalid data
        }
      }
    } catch (error) {
      console.error("Error loading or parsing resume from localStorage:", error);
      setErrorLoadingResume("Could not load your resume data. It might be corrupted or an unexpected error occurred.");
    } finally {
      setIsLoadingResume(false);
    }
  }, []);

  if (isLoadingResume) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-12 w-1/2 mx-auto" /> {/* Title skeleton */}
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-64 w-full" /> {/* ResumeInsightsCard skeleton */}
          </div>
          <Separator className="my-8" />
           <Skeleton className="h-10 w-1/3 mx-auto mb-6" /> {/* JobListings title skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (errorLoadingResume) {
     return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
           <Alert variant="destructive" className="w-full max-w-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Loading Resume Data</AlertTitle>
            <AlertDescription>
              {errorLoadingResume}
              <Button asChild variant="link" className="mt-2">
                <Link href="/upload">Upload Resume Again</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (!parsedResume) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <div className="p-8 border border-dashed rounded-lg bg-card max-w-lg">
            <SearchX className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">No Resume Data Found</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you haven't uploaded a resume yet, or the data couldn't be loaded. 
              Please upload your resume to see personalized job matches.
            </p>
            <Button asChild size="lg">
              <Link href="/upload">
                <FileText className="mr-2 h-5 w-5" /> Upload Your Resume
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section for Resume Summary View */}
        <div className="space-y-6 py-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            Your Resume Summary
          </h2>
          <div className="max-w-4xl mx-auto">
            <ResumeInsightsCard resumeData={parsedResume} />
          </div>
        </div>

        <Separator className="my-8" />
        
        {/* Job Listings section */}
        <JobListings parsedResumeData={parsedResume} triggerSearch={jobSearchTrigger} />
      </div>
    </AppLayout>
  );
}
