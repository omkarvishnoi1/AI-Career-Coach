"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { currentUser } from "@clerk/nextjs/server";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    const result = await db.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await db.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000,
      }
    );

    return {success:true,...result};

  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user"+error.message);
  }
}


export async function getUserOnboardingStatus() {
  const userSession = await auth();
  if (!userSession?.userId) throw new Error("Unauthorized");

  // Get full Clerk user
  const user = await currentUser();
  if (!user || !user.emailAddresses?.[0]?.emailAddress) {
    throw new Error("User email not found");
  }

  let dbUser = await db.user.findUnique({
    where: { clerkUserId: userSession.userId },
  });

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        clerkUserId: userSession.userId,
        email: user.emailAddresses[0].emailAddress, // <-- fix here
        industry: null,
        experience: null,
        bio: null,
        skills: [],
      },
    });
  }

  return {
    isOnboarded: !!dbUser?.industry,
  };
}
