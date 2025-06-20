
'use server';

import { clientPromise, dbName } from '@/lib/mongodb';
import { MY_PROFILE_RESUME_ID, MY_PROFILE_RESUME_TITLE } from '@/lib/constants';
import type { UserHistoryEntry } from '@/types';
import { z } from 'zod';
import { ObjectId, MongoError } from 'mongodb';

const LogResumeViewInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  resumeId: z.string().min(1, "Resume ID is required."),
  resumeTitle: z.string().min(1, "Resume title is required."),
});

const MAX_HISTORY_ITEMS_PER_USER = 15;

export async function logResumeView(
  userId: string,
  resumeId: string = MY_PROFILE_RESUME_ID,
  resumeTitle: string = MY_PROFILE_RESUME_TITLE
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

    // To keep the history limited to MAX_HISTORY_ITEMS_PER_USER:
    // 1. Find existing entries for this specific resumeId and userId
    const existingEntry = await historyCollection.findOne(
      { userId, resumeId },
      { sort: { viewedAt: -1 } } 
    );

    // 2. If it exists, update its timestamp. Otherwise, insert a new one.
    if (existingEntry) {
      await historyCollection.updateOne(
        // @ts-ignore _id exists on existingEntry from DB
        { _id: existingEntry._id },
        { $set: { viewedAt: new Date() } }
      );
    } else {
      // Count current entries for the user to decide if we need to remove the oldest
      const userHistoryCount = await historyCollection.countDocuments({ userId });
      if (userHistoryCount >= MAX_HISTORY_ITEMS_PER_USER) {
        // Find and remove the oldest entry for this user (not specific to resumeId)
        const oldestEntry = await historyCollection.findOne(
            { userId },
            { sort: { viewedAt: 1 } } // Ascending to get the oldest
        );
        if (oldestEntry) {
            // @ts-ignore _id exists on oldestEntry from DB
            await historyCollection.deleteOne({ _id: oldestEntry._id });
        }
      }
      // Insert the new view
      await historyCollection.insertOne({
        userId,
        resumeId,
        resumeTitle,
        viewedAt: new Date(),
      });
    }
    
    return { success: true, message: 'Resume view logged successfully.' };
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
      .limit(MAX_HISTORY_ITEMS_PER_USER)
      .toArray();
    
    // Ensure _id is converted to string if it exists and is an ObjectId
    const processedViews = recentViews.map(view => ({
      ...view,
      _id: view._id instanceof ObjectId ? view._id.toString() : view._id,
    }));

    return { success: true, history: processedViews as any }; // Cast to any to bypass complex _id typing for now
  } catch (error) {
    console.error('Error fetching recent views from MongoDB:', error);
    if (error instanceof MongoError) {
        return { success: false, message: 'A database error occurred while fetching recent views.' };
    }
    return { success: false, message: 'An error occurred while fetching recent views.' };
  }
}
