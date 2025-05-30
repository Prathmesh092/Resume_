import type { MatchedJob } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, MapPin, ExternalLink, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: MatchedJob;
}

export function JobCard({ job }: JobCardProps) {
  const matchColor = job.matchScore >= 75 ? 'bg-accent' : job.matchScore >= 50 ? 'bg-yellow-400' : 'bg-red-400';
  const matchTextColor = job.matchScore >= 75 ? 'text-accent-foreground' : 'text-white';

  const linkedInSearchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + job.company)}`;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mb-2 space-x-2">
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={`text-sm px-3 py-1 whitespace-nowrap ${matchColor} ${matchTextColor} border-0`}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {job.matchScore}% Match
          </Badge>
        </div>
        <Progress value={job.matchScore} aria-label={`Match score: ${job.matchScore}%`} className="h-2 mt-1" indicatorClassName={matchColor} />
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-foreground/80 line-clamp-4 mb-2">
          {job.description}
        </CardDescription>
        <div className="mt-3 p-3 bg-muted/50 rounded-md border border-dashed">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                <Info className="w-3.5 h-3.5 mr-1.5"/>
                AI Justification:
            </h4>
            <p className="text-xs text-foreground/70 italic">{job.justification}</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" >
          Save Job
        </Button>
        <Button asChild size="sm" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={linkedInSearchUrl} target="_blank" rel="noopener noreferrer">
            Apply on LinkedIn
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
