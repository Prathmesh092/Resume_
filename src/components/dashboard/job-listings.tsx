
"use client";

import { useEffect, useState, useCallback } from 'react';
import { mockJobs, type Job } from '@/lib/mock-jobs';
import { smartJobMatching } from '@/ai/flows/smart-job-matching';
import type { ParsedResume, MatchedJob } from '@/types';
import { JobCard } from './job-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'; // Import full Card components
import { FileSearch, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface JobListingsProps {
  parsedResumeData: ParsedResume | null;
  triggerSearch: number; // Used to re-trigger search when resume changes
}

// Helper to synthesize resume text for matching
function formatResumeAsText(parsedData: ParsedResume): string {
  let text = "Skills:\n";
  text += parsedData.skills.join(", ") + "\n\n";

  text += "Experience:\n";
  parsedData.experience.forEach(exp => {
    text += `- Title: ${exp.title}\n  Company: ${exp.company}\n  Dates: ${exp.dates}\n  Description: ${exp.description}\n\n`;
  });

  text += "Education:\n";
  parsedData.education.forEach(edu => {
    text += `- Degree: ${edu.degree}\n  Institution: ${edu.institution}\n  Dates: ${edu.dates}\n\n`;
  });
  return text.trim();
}


export function JobListings({ parsedResumeData, triggerSearch }: JobListingsProps) {
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndMatchJobs = useCallback(async () => {
    if (!parsedResumeData) return;

    setIsLoading(true);
    setError(null);
    setMatchedJobs([]);

    try {
      const resumeText = formatResumeAsText(parsedResumeData);
      // In a real app, fetch jobs from an API like GitHub Jobs (deprecated) or others.
      // For now, using mockJobs.
      const jobsToMatch: Job[] = mockJobs; 

      const matchPromises = jobsToMatch.map(async (job) => {
        try {
          const matchResult = await smartJobMatching({
            resumeText,
            jobDescription: job.description,
          });
          return { ...job, ...matchResult };
        } catch (matchError) {
          console.error(`Error matching job ${job.id}:`, matchError);
          // Optionally return job with a default low score or error state
          return { ...job, matchScore: 0, justification: "Error in matching process." };
        }
      });

      const results = await Promise.all(matchPromises);
      // Sort by match score descending
      results.sort((a, b) => b.matchScore - a.matchScore);
      setMatchedJobs(results);

    } catch (e) {
      console.error('Error fetching or matching jobs:', e);
      setError('Failed to load and match job listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [parsedResumeData]);

  useEffect(() => {
    if (parsedResumeData && triggerSearch > 0) {
      fetchAndMatchJobs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedResumeData, triggerSearch]); // fetchAndMatchJobs is memoized with useCallback

  if (!parsedResumeData) {
    return null; // Don't show anything if resume isn't parsed yet
  }
  
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-center">Finding best matches...</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="w-full shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error} <Button variant="link" onClick={fetchAndMatchJobs} className="p-0 h-auto">Try again</Button></AlertDescription>
      </Alert>
    );
  }

  if (matchedJobs.length === 0 && !isLoading) {
    return (
       <Alert className="w-full">
        <FileSearch className="h-4 w-4" />
        <AlertTitle>No Jobs Found</AlertTitle>
        <AlertDescription>
          We couldn't find any job matches based on your current resume. You might want to try uploading an updated resume or checking back later.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="w-full space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-center">Your Top Job Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {matchedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
