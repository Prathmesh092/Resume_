
import * as React from 'react';
import type { ParsedResume } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Lightbulb } from 'lucide-react';

interface ResumeInsightsCardProps {
  resumeData: ParsedResume;
}

export const ResumeInsightsCard = React.memo(function ResumeInsightsCard({ resumeData }: ResumeInsightsCardProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Your Resume Snapshot</CardTitle>
        <CardDescription>Key information extracted by our AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-primary" />
            Skills
          </h3>
          {resumeData.skills && resumeData.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No skills extracted.</p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-primary" />
            Experience
          </h3>
          {resumeData.experience && resumeData.experience.length > 0 ? (
            <ul className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <li key={index} className="p-4 border rounded-md bg-background shadow-sm transition-all hover:shadow-md">
                  <h4 className="font-medium text-foreground">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company} | {exp.dates}</p>
                  <p className="text-sm mt-1 text-foreground/80">{exp.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No experience extracted.</p>
          )}
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-primary" />
            Education
          </h3>
          {resumeData.education && resumeData.education.length > 0 ? (
            <ul className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <li key={index} className="p-3 border rounded-md bg-background shadow-sm transition-all hover:shadow-md">
                  <h4 className="font-medium text-foreground">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institution} | {edu.dates}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No education extracted.</p>
          )}
        </section>
      </CardContent>
    </Card>
  );
});

ResumeInsightsCard.displayName = 'ResumeInsightsCard';
