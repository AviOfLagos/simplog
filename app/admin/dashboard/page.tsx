'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch posts from the admin API
    const fetchPosts = async () => {
      const response = await fetch('/api/admin/posts', {
        headers: {
          'Authorization': 'Bearer your_admin_token',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      } else {
        setMessage(data.error || 'Failed to fetch posts');
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    const response = await fetch('/api/admin/posts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_admin_token',
      },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (response.ok) {
      setPosts(posts.filter(post => post.id !== id));
      setMessage('Post deleted successfully');
    } else {
      setMessage(data.error || 'Failed to delete post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {message && <p className="text-sm text-red-500">{message}</p>}
      <button
        onClick={() => router.push('/admin/create')}
        className="mb-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
      >
        Create New Blog
      </button>
      <table className="min-w-full border-bg-white">
        <thead>
          <tr>
            <th className="py-2">Title</th>
            <th className="py-2">Time Posted</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td className="border px-4 py-2">{post.title}</td>
              <td className="border px-4 py-2">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => router.push(`/admin/edit/${post.id}`)}
                  className="mr-2 inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
