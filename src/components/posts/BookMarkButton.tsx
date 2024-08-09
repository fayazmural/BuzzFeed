"use client";
import { BookMarkInfo, LikeInfo } from "@/lib/types";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { useToast } from "../ui/use-toast";
import { Bookmark, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookMarkButtonProps {
  postId: string;
  initialState: BookMarkInfo;
}

export default function BookMarkButton({
  initialState,
  postId,
}: BookMarkButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", postId];
  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookMarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isBookMarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`),
    onMutate: async () => {
      toast({
        description: `Post ${data.isBookMarkedByUser ? "un" : ""}bookmarked`,
      });
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookMarkInfo>(queryKey);

      queryClient.setQueryData<BookMarkInfo>(queryKey, () => ({
        isBookMarkedByUser: !previousState?.isBookMarkedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later",
      });
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookMarkedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
