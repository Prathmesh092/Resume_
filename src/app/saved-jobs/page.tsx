
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { JobCard } from '@/components/dashboard/job-card';
import { mockJobs, type Job } from '@/lib/mock-jobs';
import type { MatchedJob } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookmarkX, Search, FileText } from 'lucide-react';

const SAVED_JOBS_LOCAL_STORAGE_KEY = 'jobmatcher_saved_jobs';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<MatchedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const savedJobsString = localStorage.getItem(SAVED_JOBS_LOCAL_STORAGE_KEY);
      if (savedJobsString) {
        const savedJobIds: string[] = JSON.parse(savedJobsString);
        
        // We need to find the full job details from mockJobs based on IDs.
        // And since JobCard expects MatchedJob, we'll add dummy matchScore & justification.
        const foundJobs = savedJobIds.map(id => {
          const jobDetail = mockJobs.find(job => job.id === id);
          if (jobDetail) {
            // Augment with dummy MatchedJob properties if not present
            // In a real app, saved jobs might store full MatchedJob data or re-fetch match scores.
            return {
              ...jobDetail,
              matchScore: (jobDetail as MatchedJob).matchScore || 0, // Use existing or default
              justification: (jobDetail as MatchedJob).justification || "Not available for saved job.", // Use existing or default
            } as MatchedJob;
          }
          return null;
        }).filter(job => job !== null) as MatchedJob[];

        setSavedJobs(foundJobs.reverse()); // Show most recently saved first
      } else {
        setSavedJobs([]);
      }
    } catch (e) {
      console.error("Error loading saved jobs:", e);
      setError("Could not load your saved jobs. The data might be corrupted.");
      setSavedJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-12 w-1/2 mx-auto mb-10" /> {/* Title skeleton */}
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

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
           <Alert variant="destructive" className="w-full max-w-lg">
            <BookmarkX className="h-5 w-5" />
            <AlertTitle>Error Loading Saved Jobs</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        <h1 className="text-3xl font-bold tracking-tight text-center text-primary">
          Your Saved Jobs
        </h1>

        {savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="p-8 border border-dashed rounded-lg bg-card max-w-lg mx-auto">
                <BookmarkX className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-3">No Saved Jobs Yet</h2>
                <p className="text-muted-foreground mb-6">
                You haven't saved any jobs. Start by finding matches and bookmarking the ones you like!
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/matches">
                            <Search className="mr-2 h-5 w-5" /> Find Job Matches
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/upload">
                            <FileText className="mr-2 h-5 w-5" /> Upload Resume
                        </Link>
                    </Button>
                </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
