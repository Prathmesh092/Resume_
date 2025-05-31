
import type { ParseResumeOutput as GenAIParseResumeOutput } from '@/ai/flows/resume-parsing';
import type { SmartJobMatchingOutput as GenAISmartJobMatchingOutput } from '@/ai/flows/smart-job-matching';
import type { Job as MockJobType } from '@/lib/mock-jobs';

export type ParsedResume = GenAIParseResumeOutput;

export interface MatchedJob extends MockJobType, GenAISmartJobMatchingOutput {}

// Interface for resume data as it might be structured with a userId,
// potentially useful for more complex DB interactions or type safety.
// For now, server actions handle this internally.
export interface UserResumeProfile extends ParsedResume {
  userId: string;
  _id?: string; // From MongoDB, typically ObjectId.toString()
  createdAt?: Date;
  updatedAt?: Date;
}
