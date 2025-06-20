
'use server';

import { clientPromise, dbName } from '@/lib/mongodb';
// MY_PROFILE_RESUME_ID and MY_PROFILE_RESUME_TITLE are no longer directly used for list items
// but kept if other parts of the app might reference a generic profile view.
import type { UserHistoryEntry } from '@/types';
import { z } from 'zod';
import { ObjectId, MongoError } from 'mongodb';

const LogResumeViewInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  resumeId: z.string().min(1, "Resume ID is required."), // This will be the _id from userResumes
  resumeTitle: z.string().min(1, "Resume title (filename) is required."),
});

const MAX_HISTORY_ITEMS_PER_USER = 5; // Changed to 5

export async function logResumeView(
  userId: string,
  resumeId: string, // Actual ID of the resume document in userResumes
  resumeTitle: string // Original filename
): Promise<{ success: boolean; message: string }> {
  const validation = LogResumeViewInputSchema.safeParse({ userId, resumeId, resumeTitle });
  if (!validation.success) {
    console.error('Server-side validation failed for logging view:', validation.error.flatten().fieldErrors);
    return { success: false, message: "Invalid input for logging view." };
  }

  if (!userId) {
    return { success: false, message: 'User ID is required to log resume view.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const historyCollection = db.collection<Omit<UserHistoryEntry, '_id'>>('userHistory');

    // Always insert a new entry for each upload event
    await historyCollection.insertOne({
      userId,
      resumeId, // Store the actual resume document ID
      resumeTitle, // Store the filename
      viewedAt: new Date(),
    });

    // Trim older entries if the count exceeds MAX_HISTORY_ITEMS_PER_USER
    const userHistoryCount = await historyCollection.countDocuments({ userId });
    if (userHistoryCount > MAX_HISTORY_ITEMS_PER_USER) {
      const entriesToRemove = await historyCollection
        .find({ userId })
        .sort({ viewedAt: 1 }) // Oldest first
        .limit(userHistoryCount - MAX_HISTORY_ITEMS_PER_USER)
        .toArray();
      
      for (const entry of entriesToRemove) {
        // @ts-ignore _id exists on entries from DB
        await historyCollection.deleteOne({ _id: entry._id });
      }
    }
    
    return { success: true, message: 'Resume upload event logged successfully.' };
  } catch (error) {
    console.error('Error logging resume view to MongoDB:', error);
    if (error instanceof MongoError) {
      return { success: false, message: 'A database error occurred while logging the view.' };
    }
    return { success: false, message: 'An error occurred while logging resume view.' };
  }
}

export async function getRecentViews(userId: string): Promise<{
  success: boolean;
  message?: string;
  history?: Omit<UserHistoryEntry, '_id' & { _id: ObjectId }>[];
}> {
  if (!userId) {
    return { success: false, message: 'User ID is required to fetch recent views.' };
  }

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const historyCollection = db.collection<UserHistoryEntry>('userHistory');

    const recentViews = await historyCollection
      .find({ userId: userId })
      .sort({ viewedAt: -1 }) // Latest first
      .limit(MAX_HISTORY_ITEMS_PER_USER) // Limit here as well for fetching
      .toArray();
    
    const processedViews = recentViews.map(view => ({
      ...view,
      _id: view._id instanceof ObjectId ? view._id.toString() : view._id,
    }));

    return { success: true, history: processedViews as any };
  } catch (error) {
    console.error('Error fetching recent views from MongoDB:', error);
    if (error instanceof MongoError) {
        return { success: false, message: 'A database error occurred while fetching recent views.' };
    }
    return { success: false, message: 'An error occurred while fetching recent views.' };
  }
}
