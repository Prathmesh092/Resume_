
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentViews } from '@/actions/history';
import type { UserHistoryEntry } from '@/types'; // UserHistoryEntry is general
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { History, FileUp, ArrowRight, UploadCloud } from 'lucide-react'; // Changed icon
import { formatDistanceToNow } from 'date-fns';

interface RecentlyViewedCardProps {
  userId: string | null;
}

interface DisplayHistoryItem extends Omit<UserHistoryEntry, 'viewedAt' | '_id' | 'resumeId'> {
  id: string; // MongoDB ObjectId as string
  resumeTitle: string; // This will be the filename
  viewedAt: Date; // Keep as Date for formatting
}


export function RecentlyViewedCard({ userId }: RecentlyViewedCardProps) {
  const [recentUploads, setRecentUploads] = useState<DisplayHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getRecentViews(userId);
        if (result.success && result.history) {
          const mappedHistory = result.history.map(item => ({
            id: String(item._id), 
            resumeTitle: item.resumeTitle, // This is now the filename
            viewedAt: new Date(item.viewedAt),
          }));
          setRecentUploads(mappedHistory as DisplayHistoryItem[]);
        } else {
          setError(result.message || "Could not fetch recent uploads.");
          setRecentUploads([]);
        }
      } catch (e) {
        console.error("Error fetching recent uploads:", e);
        setError("An unexpected error occurred while fetching history.");
        setRecentUploads([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (!userId) {
    return null; 
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-2">
            <FileUp className="h-6 w-6 text-primary mr-2" />
            <CardTitle className="text-xl">Recently Uploaded Resumes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => ( // Show 3 skeletons as an example, actual limit is 5
            <div key={i} className="flex justify-between items-center p-2 border-b">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-1/5" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-2">
            <FileUp className="h-6 w-6 text-primary mr-2" />
            <CardTitle className="text-xl">Recently Uploaded Resumes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-center mb-2">
          <FileUp className="h-7 w-7 text-primary mr-3" />
          <CardTitle className="text-2xl">Recently Uploaded</CardTitle>
        </div>
        <CardDescription>
          Your 5 most recently uploaded resumes. Insights are based on the latest one.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {recentUploads.length > 0 ? (
          <ul className="space-y-3">
            {recentUploads.map((item) => (
              <li key={item.id} className="p-3 border rounded-md bg-background/50 hover:bg-muted/80 transition-colors">
                <Link href="/matches" className="flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary truncate max-w-[200px] sm:max-w-[250px]" title={item.resumeTitle}>
                      {item.resumeTitle} {/* Display filename */}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 flex-shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <UploadCloud className="h-10 w-10 mx-auto mb-3" />
            <p className="text-sm">No resume uploads recorded yet.</p>
            <p className="text-xs">Upload a resume to see it listed here.</p>
          </div>
        )}
      </CardContent>
      {recentUploads.length > 0 && (
         <CardFooter className="pt-4 border-t">
            <Button asChild variant="link" className="w-full text-sm">
                <Link href="/upload">Upload Another Resume</Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
