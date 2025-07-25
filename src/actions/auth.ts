
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
  email: z.string()
    .email({ message: "Invalid email address format." }) // Basic email format check
    .refine(email => {
      const parts = email.split('@');
      // Technically, .email() should catch if there's no @ or multiple @s,
      // but this is a defensive check.
      if (parts.length !== 2) return false;

      const localPart = parts[0];
      const domainPart = parts[1];

      // 1. Must end with @gmail.com (case-insensitive for "gmail.com")
      if (domainPart.toLowerCase() !== "gmail.com") return false;

      // 2. Local part (username) cannot be empty
      if (!localPart) return false;

      // 3. Local part can only contain letters (a-z, A-Z), numbers (0-9), and dots (.)
      //    No spaces or other special characters.
      const usernameRegex = /^[a-zA-Z0-9.]+$/;
      if (!usernameRegex.test(localPart)) return false;

      // 4. Dots (.) cannot be at the start or end of the local part, and no consecutive dots.
      if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
        return false;
      }
      
      // Note: Gmail username length is typically 6-30 chars. This validation
      // doesn't enforce length as it wasn't explicitly requested, but could be added.

      return true;
    }, {
      message: "Email must be a valid @gmail.com address. Username can only contain letters, numbers, and single periods (not at start/end or consecutive)."
    }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export async function registerUser(data: z.infer<typeof RegisterInputSchema>) {
  try {
    const validation = RegisterInputSchema.safeParse(data);
    if (!validation.success) {
      // Log client-side validation errors on server for completeness if needed, though client handles display
      console.error('Server-side validation failed for registration:', validation.error.flatten().fieldErrors);
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
    console.error('Registration error details:');
    let userFacingMessage: string;

    if (error instanceof MongoError) {
        console.error(`  Type: MongoError`);
        console.error(`  Code: ${error.code}`);
        console.error(`  Name: ${error.name}`);
        console.error(`  Message: ${error.message}`);
        if (error.stack) console.error(`  Stack:\n${error.stack}`);
        userFacingMessage = 'A database error occurred during registration. Please try again later.';
    } else if (error instanceof Error) {
        console.error(`  Type: Generic Error`);
        console.error(`  Name: ${error.name}`);
        console.error(`  Message: ${error.message}`);
        if (error.stack) console.error(`  Stack:\n${error.stack}`);
        userFacingMessage = 'An error occurred during registration. Please try again later.';
    } else {
        console.error('  Type: Unknown error type');
        console.error(error);
        userFacingMessage = 'An unexpected error of unknown type occurred. Please try again later.';
    }
    return { success: false, message: userFacingMessage };
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
      console.error('Server-side validation failed for login:', validation.error.flatten().fieldErrors);
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

    return {
      success: true,
      message: 'Login successful!',
      user: { email: user.email, id: user._id?.toString() }
    };
  } catch (error) {
    console.error('Login error details:');
    let userFacingMessage: string;

    if (error instanceof MongoError) {
        console.error(`  Type: MongoError`);
        console.error(`  Code: ${error.code}`);
        console.error(`  Name: ${error.name}`);
        console.error(`  Message: ${error.message}`);
        if (error.stack) console.error(`  Stack:\n${error.stack}`);
        userFacingMessage = 'A database error occurred during login. Please try again later.';
    } else if (error instanceof Error) {
        console.error(`  Type: Generic Error`);
        console.error(`  Name: ${error.name}`);
        console.error(`  Message: ${error.message}`);
        if (error.stack) console.error(`  Stack:\n${error.stack}`);
        userFacingMessage = 'An error occurred during login. Please try again later.';
    } else {
        console.error('  Type: Unknown error type');
        console.error(error);
        userFacingMessage = 'An unexpected error of unknown type occurred during login. Please try again later.';
    }
    return { success: false, message: userFacingMessage };
  }
}

