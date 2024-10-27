import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase/config";
import { PostGridSkeleton } from "@/components/skeletons";
import { Suspense } from "react";

async function getPosts() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      likes (count),
      comments (count),
      post_tags (
        tags (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch posts. Please try again later.');
  }

  if (!posts) {
    return [];
  }

  return posts;
}

export async function PostGrid() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<PostGridSkeleton />}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
              {post.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <h2 className="text-2xl font-bold line-clamp-2">{post.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-muted-foreground">
                  {post.content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4">
                  <span className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes?.[0]?.count || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments?.[0]?.count || 0}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.post_tags?.map((tag) => (
                    <Badge key={tag.tags.name} variant="secondary">
                      {tag.tags.name}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </Suspense>
  );
}