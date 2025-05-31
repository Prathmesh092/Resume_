
"use client";

import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Upload, ListChecks, ArrowRight } from 'lucide-react';
// PARSED_RESUME_LOCAL_STORAGE_KEY is no longer needed here
// import { PARSED_RESUME_LOCAL_STORAGE_KEY } from '@/lib/constants';
// useState and useEffect for hasProcessedResume are no longer needed

export default function DashboardHomePage() {
  // const [hasProcessedResume, setHasProcessedResume] = useState(false); // Removed

  // useEffect(() => { // Removed
  //   const storedResume = localStorage.getItem(PARSED_RESUME_LOCAL_STORAGE_KEY);
  //   setHasProcessedResume(!!storedResume);
  // }, []);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        <section className="text-center py-10 sm:py-16 bg-card shadow-xl rounded-xl border">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
            <Briefcase className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Welcome to JobMatcher AI
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-card-foreground/90 sm:text-xl px-4">
            Unlock your career potential. Upload your resume, and let our AI find the perfect job matches for you. We analyze your skills and experience to connect you with opportunities that truly fit.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center mb-3">
                <Upload className="h-8 w-8 text-primary mr-3" />
                <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
              </div>
              <CardDescription>
                Get started by uploading your resume. Our AI will parse it, save it to your profile, and help you find relevant job opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button asChild className="w-full mt-4" size="lg">
                <Link href="/upload">
                  Upload Resume <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
               <div className="flex items-center mb-3">
                <ListChecks className="h-8 w-8 text-primary mr-3" />
                <CardTitle className="text-2xl">View Job Matches</CardTitle>
              </div>
              <CardDescription>
                See the job roles that best match your skills and experience. If you haven't uploaded a resume yet, you'll be guided to do so.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Button asChild className="w-full mt-4" size="lg">
                <Link href="/matches">
                  View My Matches <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </AppLayout>
  );
}
