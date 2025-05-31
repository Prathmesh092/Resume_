
'use server';
import { clientPromise, dbName } from '@/lib/mongodb';
import { z } from 'zod';
import { MongoError } from 'mongodb';

// IMPORTANT: In a real application, you MUST hash passwords using a library like bcryptjs.
// Storing plain text passwords is a major security risk.

const UserDBSchema = z.object({
  email: z.string().email(),
  password: z.string(), // This will store the plain text password for now. NOT FOR PRODUCTION.
  createdAt: z.date().optional(),
});
type UserDB = z.infer<typeof UserDBSchema> & { _id?: import('mongodb').ObjectId };


const RegisterInputSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export async function registerUser(data: z.infer<typeof RegisterInputSchema>) {
  try {
    const validation = RegisterInputSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: "Invalid input.", errors: validation.error.flatten().fieldErrors };
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const usersCollection = db.collection<UserDB>('users');

    const existingUser = await usersCollection.findOne({ email: validation.data.email });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    // const hashedPassword = await bcrypt.hash(validation.data.password, 10); // Example for production
    await usersCollection.insertOne({
      email: validation.data.email,
      password: validation.data.password, // Store plain password - NOT FOR PRODUCTION
      createdAt: new Date(),
    });
    return { success: true, message: 'User registered successfully. Please log in.' };
  } catch (error) {
    console.error('Registration error:', error);
    let message = 'An error occurred during registration. Please try again later.';
    if (error instanceof MongoError) {
        message = 'A database error occurred during registration. Please try again later.';
        console.error(`MongoError Code: ${error.code}, Name: ${error.name}`);
    } else if (error instanceof Error) {
        console.error('Non-MongoDB Error name:', error.name);
        // Potentially use error.message if it's deemed safe and user-friendly
        // For now, stick to a generic message for client.
    }
    return { success: false, message: message };
  }
}

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required." }),
});

export async function loginUser(data: z.infer<typeof LoginInputSchema>) {
  try {
    const validation = LoginInputSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, message: "Invalid input.", errors: validation.error.flatten().fieldErrors };
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const usersCollection = db.collection<UserDB>('users');

    const user = await usersCollection.findOne({ email: validation.data.email });
    if (!user) {
      return { success: false, message: 'Incorrect email or password.' };
    }

    // const isPasswordValid = await bcrypt.compare(validation.data.password, user.password); // Example for production
    const isPasswordValid = validation.data.password === user.password; // Plain text comparison - NOT FOR PRODUCTION

    if (!isPasswordValid) {
      return { success: false, message: 'Incorrect email or password.' };
    }

    // In a real app, generate and return a session token/JWT here.
    // For this prototype, we return basic user info.
    return {
      success: true,
      message: 'Login successful!',
      user: { email: user.email, id: user._id?.toString() }
    };
  } catch (error) {
    console.error('Login error:', error);
    let message = 'An error occurred during login. Please try again later.';
    if (error instanceof MongoError) {
        message = 'A database error occurred during login. Please try again later.';
        console.error(`MongoError Code: ${error.code}, Name: ${error.name}`);
    } else if (error instanceof Error) {
        console.error('Non-MongoDB Error name:', error.name);
    }
    return { success: false, message: message };
  }
}

