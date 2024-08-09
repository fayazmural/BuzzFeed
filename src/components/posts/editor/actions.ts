"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function createPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      user: {
        connect: {
          id: user.id,
        },
      },
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
