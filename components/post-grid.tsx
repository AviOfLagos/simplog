"use client";

import { Card, CardContent, CardFooter, CardHeader } from "components/ui/card";
import { Badge } from "components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "lib/supabase/config";
import { useState, useEffect } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: { id: string }[];
  comments: { id: string }[];
  post_tags: { tags: { name: string } }[];
}

async function fetchPosts(retries = 3): Promise<Post[]> {
  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        likes (*),
        comments (*),
        post_tags (
          tags (
            name
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      if (retries > 0) {
        console.log(`Retrying... (${3 - retries + 1})`);
        return fetchPosts(retries - 1);
      }
      throw new Error("Failed to fetch posts after multiple attempts.");
    }

    return posts || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts. Please try again later.");
  }
}

export function PostGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await fetchPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post: Post) => (
        <Link key={post.id} href={`/post/${post.id}`}>
          <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader>
              <h2 className="text-2xl font-bold line-clamp-2">{post.title}</h2>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
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
                  <span>{post.likes?.length || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments?.length || 0}</span>
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
  );
}
