"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function deletePost(id: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const post = await prisma.post.findFirst({
    where: {
      id,
      user: {
        id: user.id,
      },
    },
  });

  if (!post) throw new Error("Post Not Found");

  const deletedPost = await prisma.post.delete({
    where: {
      id,
      user: {
        id: user.id,
      },
    },
    include: getPostDataInclude(user.id),
  });

  return deletedPost;
}
