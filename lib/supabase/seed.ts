import { supabase } from './config';

const samplePosts = [
  {
    title: "The Art of Anonymous Writing",
    content: "In a world where personal branding is everything, there's something liberating about writing anonymously. It allows ideas to stand on their own merit, free from the baggage of reputation or preconception...",
    image_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "Digital Privacy in 2024",
    content: "As our lives become increasingly intertwined with technology, the importance of digital privacy cannot be overstated. This post explores practical steps to protect your online presence...",
    image_url: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&auto=format&fit=crop&q=60",
  },
  {
    title: "The Future of Remote Work",
    content: "Remote work has transformed from a temporary solution to a permanent reality for many. Let's explore the challenges and opportunities this shift presents...",
    image_url: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=800&auto=format&fit=crop&q=60",
  }
];

const sampleTags = [
  { name: 'Technology' },
  { name: 'Privacy' },
  { name: 'Work' },
  { name: 'Writing' },
  { name: 'Future' }
];

export async function seedDatabase() {
  // Insert tags first
  const { data: tagData, error: tagError } = await supabase
    .from('tags')
    .upsert(sampleTags, { onConflict: 'name' })
    .select();

  if (tagError) {
    console.error('Error seeding tags:', tagError);
    return;
  }

  // Insert posts
  for (const post of samplePosts) {
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([post])
      .select();

    if (postError) {
      console.error('Error seeding post:', postError);
      continue;
    }

    if (postData && postData[0]) {
      // Add random tags to each post
      const randomTags = tagData
        ?.sort(() => 0.5 - Math.random())
        .slice(0, 2) || [];

      for (const tag of randomTags) {
        await supabase.from('post_tags').insert([
          { post_id: postData[0].id, tag_id: tag.id }
        ]);
      }

      // Add some random likes
      const numLikes = Math.floor(Math.random() * 50);
      for (let i = 0; i < numLikes; i++) {
        await supabase.from('likes').insert([
          { post_id: postData[0].id }
        ]);
      }

      // Add some random comments
      const numComments = Math.floor(Math.random() * 5);
      for (let i = 0; i < numComments; i++) {
        await supabase.from('comments').insert([
          {
            post_id: postData[0].id,
            username: `anonymous${Math.floor(Math.random() * 1000)}`,
            content: `This is a sample comment ${i + 1}`
          }
        ]);
      }
    }
  }
}