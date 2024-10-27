import { PostGrid } from "@/components/post-grid";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Anonymous Blog</h1>
        <form action="/api/seed" method="POST">
          <Button type="submit" variant="outline" size="sm">
            Seed Sample Data
          </Button>
        </form>
      </div>
      <PostGrid />
    </main>
  );
}