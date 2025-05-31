
'use server';

import { clientPromise, dbName } from '@/lib/mongodb';
import type { ParsedResume } from '@/types';
import { z } from 'zod';
// ObjectId is not directly used in the StoredResume type but might be useful for queries if userId was an ObjectId
// For now, userId is treated as a string from localStorage.

// Zod schema for resume data to be stored in MongoDB.
// This ensures the structure we expect in the database.
const StoredResumeSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      dates: z.string(),
      description: z.string(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      dates: z.string(),
    })
  ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Type derived from the Zod schema for TypeScript type safety.
type StoredResume = z.infer<typeof StoredResumeSchema>;

export async function saveUserResume(userId: string, resumeData: ParsedResume): Promise<{ success: boolean; message: string }> {
  if (!userId) {
    return { success: false, message: 'User ID is required to save resume.' };
  }

  // Basic validation for resumeData structure (can be more comprehensive if needed)
  if (!resumeData || typeof resumeData.skills === 'undefined' || typeof resumeData.experience === 'undefined' || typeof resumeData.education === 'undefined') {
    return { success: false, message: 'Invalid resume data provided.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const resumesCollection = db.collection<Omit<StoredResume, 'createdAt' | 'updatedAt'>>('userResumes');

    const dataToStore = {
      userId,
      skills: resumeData.skills,
      experience: resumeData.experience,
      education: resumeData.education,
    };

    const result = await resumesCollection.updateOne(
      { userId: userId },
      {
        $set: { ...dataToStore, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0 || result.modifiedCount > 0 || result.matchedCount > 0 ) {
      return { success: true, message: 'Resume data saved successfully.' };
    }
    // This case should ideally not be hit with upsert: true if the operation was meant to do something.
    // If matchedCount > 0 but modifiedCount is 0, it means the data was identical.
    return { success: false, message: 'Resume data was not saved. The data might be identical to the existing record or an issue occurred.' };

  } catch (error) {
    console.error('Error saving resume data to MongoDB:', error);
    // Check if it's a Zod validation error or other error type for more specific feedback
    if (error instanceof z.ZodError) {
        return { success: false, message: `Invalid data format: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, message: 'An error occurred while saving resume data.' };
  }
}

export async function getUserResume(userId: string): Promise<{ success: boolean; message?: string; resume?: ParsedResume | null }> {
  if (!userId) {
    return { success: false, message: 'User ID is required to fetch resume.', resume: null };
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    // Specify the type for the collection, ensuring it matches what we expect to retrieve
    const resumesCollection = db.collection<StoredResume>('userResumes');

    const storedResume = await resumesCollection.findOne({ userId: userId });

    if (storedResume) {
      // Map StoredResume back to ParsedResume type for the client
      const parsedResume: ParsedResume = {
        skills: storedResume.skills,
        experience: storedResume.experience,
        education: storedResume.education,
      };
      return { success: true, resume: parsedResume };
    } else {
      return { success: true, resume: null, message: 'No resume found for this user.' };
    }
  } catch (error) {
    console.error('Error fetching resume data from MongoDB:', error);
    return { success: false, message: 'An error occurred while fetching resume data.', resume: null };
  }
}
