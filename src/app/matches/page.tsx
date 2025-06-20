
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { ResumeInsightsCard } from '@/components/dashboard/resume-insights-card';
import { JobListings } from '@/components/dashboard/job-listings';
import type { ParsedResume } from '@/types';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, FileText, SearchX, UserCog } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserResume } from '@/actions/resume';
// import { logResumeView } from '@/actions/history'; // Removed as history logs uploads now
import { JOBMATCHER_USER_ID_KEY } from '@/lib/constants'; // Removed MY_PROFILE_RESUME_ID, MY_PROFILE_RESUME_TITLE

export default function JobMatchesPage() {
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [jobSearchTrigger, setJobSearchTrigger] = useState(0);
  const [errorLoadingResume, setErrorLoadingResume] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const userId = localStorage.getItem(JOBMATCHER_USER_ID_KEY);
    if (!userId) {
      setErrorLoadingResume("User not identified. Please log in to view your matches or upload a resume.");
      setIsLoadingResume(false);
      return;
    }

    const loadResume = async () => {
      setIsLoadingResume(true);
      setErrorLoadingResume(null);
      try {
        const result = await getUserResume(userId);

        if (result.success) {
          if (result.resume) {
            if (result.resume && Array.isArray(result.resume.skills) && Array.isArray(result.resume.experience) && Array.isArray(result.resume.education)) {
                setParsedResume(result.resume);
                setJobSearchTrigger(prev => prev + 1);
                // Removed: await logResumeView(userId, MY_PROFILE_RESUME_ID, MY_PROFILE_RESUME_TITLE);
            } else {
                console.warn("Invalid resume data structure from DB.");
                setErrorLoadingResume("The resume data from the server is not in the expected format. Try uploading again.");
                setParsedResume(null);
            }
          } else {
            setParsedResume(null); 
          }
        } else {
          console.error("Error fetching resume from DB:", result.message);
          setErrorLoadingResume(result.message || "Could not load your resume data from the server.");
          setParsedResume(null);
        }
      } catch (error) {
        console.error("Error in loadResume effect:", error);
        setErrorLoadingResume("An unexpected error occurred while trying to load your resume data.");
        setParsedResume(null);
      } finally {
        setIsLoadingResume(false);
      }
    };

    loadResume();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoadingResume) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-12 w-1/2 mx-auto" /> 
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-64 w-full" /> 
          </div>
          <Separator className="my-8" />
           <Skeleton className="h-10 w-1/3 mx-auto mb-6" /> 
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
     if (errorLoadingResume.includes("User not identified")) {
        return (
            <AppLayout>
                <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
                <Alert variant="destructive" className="w-full max-w-lg">
                    <UserCog className="h-5 w-5" />
                    <AlertTitle>Authentication Required</AlertTitle>
                    <AlertDescription>
                    {errorLoadingResume}
                    <Button asChild variant="link" className="mt-2">
                        <Link href="/login">Go to Login</Link>
                    </Button>
                    </AlertDescription>
                </Alert>
                </div>
            </AppLayout>
        );
     }
     return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
           <Alert variant="destructive" className="w-full max-w-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Loading Resume Data</AlertTitle>
            <AlertDescription>
              {errorLoadingResume}
              <Button asChild variant="link" className="mt-2">
                <Link href="/upload">Try Uploading Again</Link>
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
            <h2 className="text-2xl font-semibold text-foreground mb-3">No Resume Found</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you haven't uploaded a resume to your profile yet. 
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
        <div className="space-y-6 py-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            Your Resume Summary
          </h2>
          <div className="max-w-4xl mx-auto">
            <ResumeInsightsCard resumeData={parsedResume} />
          </div>
        </div>

        <Separator className="my-8" />
        
        <JobListings parsedResumeData={parsedResume} triggerSearch={jobSearchTrigger} />
      </div>
    </AppLayout>
  );
}
