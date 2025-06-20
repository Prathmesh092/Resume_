
'use server';

import { clientPromise, dbName } from '@/lib/mongodb';
import type { ParsedResume } from '@/types';
import { z } from 'zod';
import type { ObjectId } from 'mongodb';

// Zod schema for resume data to be stored in MongoDB.
const StoredResumeSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  originalFilename: z.string().optional(), // Added to store original filename
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
type StoredResume = z.infer<typeof StoredResumeSchema> & { _id?: ObjectId };

export async function saveUserResume(
  userId: string,
  resumeData: ParsedResume,
  originalFilename: string // Added originalFilename
): Promise<{ success: boolean; message: string; resumeId?: string }> {
  if (!userId) {
    return { success: false, message: 'User ID is required to save resume.' };
  }

  if (!resumeData || typeof resumeData.skills === 'undefined' || typeof resumeData.experience === 'undefined' || typeof resumeData.education === 'undefined') {
    return { success: false, message: 'Invalid resume data provided.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const resumesCollection = db.collection<Omit<StoredResume, 'createdAt' | 'updatedAt' | '_id'>>('userResumes');

    const dataToStore = {
      userId,
      originalFilename, // Store the original filename
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

    if (result.upsertedCount > 0 || result.modifiedCount > 0 || result.matchedCount > 0) {
      // Fetch the document to get its _id, as upsertedId is only populated on insert
      const savedDocument = await resumesCollection.findOne({ userId: userId });
      if (savedDocument && savedDocument._id) {
        return { success: true, message: 'Resume data saved successfully.', resumeId: savedDocument._id.toString() };
      }
      return { success: true, message: 'Resume data saved, but could not retrieve ID.' };
    }
    
    return { success: false, message: 'Resume data was not saved. The data might be identical or an issue occurred.' };

  } catch (error) {
    console.error('Error saving resume data to MongoDB:', error);
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
    const resumesCollection = db.collection<StoredResume>('userResumes');

    const storedResume = await resumesCollection.findOne({ userId: userId });

    if (storedResume) {
      const parsedResume: ParsedResume = {
        // originalFilename is not part of ParsedResume, so we don't map it here for the client
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
