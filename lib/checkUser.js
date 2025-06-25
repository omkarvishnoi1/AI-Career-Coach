
// This function checks if the currently signed-in Clerk user already exists in the database. 
// It first retrieves the user using Clerk's `currentUser()` method. If no user is signed in, it returns null. 
// If a user is found, it tries to find a matching user in the database using the Clerk `user.id` (stored as `clerkUserId`). 
// If the user already exists, it simply returns that user object. Otherwise, it creates a new user entry in the database 
// with basic profile info (name, image, email) from Clerk and sets the default industry to "Unknown". 
// This ensures that every authenticated Clerk user has a corresponding record in your app's database.


import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        industry: "Unknown",
      },
    });

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};

