"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { UpdateUserProfile, updateUserProfileSchema } from "@/lib/validation";

export async function updateUserProfile(data: UpdateUserProfile) {
  const validatedValues = updateUserProfileSchema.parse(data);
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");
  const updateduser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      displayName: data.displayName,
      bio: data.bio,
    },
    select: getUserDataSelect(user.id),
  });

  return updateduser
}
