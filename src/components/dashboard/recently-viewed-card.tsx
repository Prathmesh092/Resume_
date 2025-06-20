
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentViews } from '@/actions/history';
import type { UserHistoryEntry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { History, EyeOff, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentlyViewedCardProps {
  userId: string | null;
}

interface DisplayHistoryItem extends Omit<UserHistoryEntry, 'viewedAt' | '_id'> {
  id: string; // MongoDB ObjectId as string
  viewedAt: Date; // Keep as Date for formatting
}


export function RecentlyViewedCard({ userId }: RecentlyViewedCardProps) {
  const [recentViews, setRecentViews] = useState<DisplayHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      //setError("User not logged in."); // Or simply show nothing
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getRecentViews(userId);
        if (result.success && result.history) {
          // Ensure _id is correctly mapped and viewedAt is a Date object
          const mappedHistory = result.history.map(item => ({
            ...item,
            id: String(item._id), // Ensure _id is string
            viewedAt: new Date(item.viewedAt), // Ensure viewedAt is Date
          }));
          setRecentViews(mappedHistory as DisplayHistoryItem[]);
        } else {
          setError(result.message || "Could not fetch recent views.");
          setRecentViews([]);
        }
      } catch (e) {
        console.error("Error fetching recent views:", e);
        setError("An unexpected error occurred while fetching history.");
        setRecentViews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (!userId) {
    return null; // Don't render if no user
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-2">
            <History className="h-6 w-6 text-primary mr-2" />
            <CardTitle className="text-xl">Recently Viewed Resumes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
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
            <History className="h-6 w-6 text-primary mr-2" />
            <CardTitle className="text-xl">Recently Viewed Resumes</CardTitle>
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
          <History className="h-7 w-7 text-primary mr-3" />
          <CardTitle className="text-2xl">Recently Viewed</CardTitle>
        </div>
        <CardDescription>
          Quick access to resume profiles you recently checked.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {recentViews.length > 0 ? (
          <ul className="space-y-3">
            {recentViews.map((item) => (
              <li key={item.id} className="p-3 border rounded-md bg-background/50 hover:bg-muted/80 transition-colors">
                <Link href="/matches" className="flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-foreground group-hover:text-primary">{item.resumeTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Viewed {formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <EyeOff className="h-10 w-10 mx-auto mb-3" />
            <p className="text-sm">No resume views recorded yet.</p>
            <p className="text-xs">View your resume insights on the 'My Matches' page to populate this list.</p>
          </div>
        )}
      </CardContent>
      {recentViews.length > 0 && (
         <CardFooter className="pt-4 border-t">
            <Button asChild variant="link" className="w-full text-sm">
                <Link href="/matches">View Full Resume Insights</Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
