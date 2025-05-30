import type { ParseResumeOutput as GenAIParseResumeOutput } from '@/ai/flows/resume-parsing';
import type { SmartJobMatchingOutput as GenAISmartJobMatchingOutput } from '@/ai/flows/smart-job-matching';
import type { Job as MockJobType } from '@/lib/mock-jobs';

export type ParsedResume = GenAIParseResumeOutput;

export interface MatchedJob extends MockJobType, GenAISmartJobMatchingOutput {}
