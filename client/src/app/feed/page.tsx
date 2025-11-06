"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: number;
  user_id: number;
  content: string;
  image_url?: string;
  post_type: string;
  created_at: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  institution?: string;
  like_count: number;
  comment_count: number;
  user_liked: boolean;
}

interface Comment {
  id: number;
  content: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  created_at: string;
}

// Animation variants
const postVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    transition: { duration: 0.3 }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        setError("Failed to load posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      const token = localStorage.getItem("token");
      console.log("Creating post with token:", token ? "exists" : "missing");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost, post_type: "update" }),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        console.log("Post created successfully!");
        setNewPost("");
        fetchPosts();
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Failed to create post: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create post'}`);
    }
  };

  const toggleLike = async (postId: number, isLiked: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/posts/${postId}/like`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  like_count: post.like_count + (isLiked ? -1 : 1),
                  user_liked: !isLiked,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => ({ ...prev, [postId]: data }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleComments = (postId: number) => {
    const isShowing = showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: !isShowing }));
    if (!isShowing && !comments[postId]) {
      fetchComments(postId);
    }
  };

  const addComment = async (postId: number) => {
    const content = newComment[postId];
    if (!content?.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
        fetchComments(postId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, comment_count: post.comment_count + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to view the feed.</p>
          <Link href="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Feed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button onClick={fetchPosts} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-3xl mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Feed
        </motion.h1>

        {/* Create Post Card */}
        <motion.div 
          className="glass-strong rounded-lg p-6 mb-6 border border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0] || "U"}
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an update, research insight, or achievement..."
                className="input w-full min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-3">
                <motion.button
                  onClick={createPost}
                  disabled={!newPost.trim()}
                  className="btn-primary disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Post
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Feed */}
        <AnimatePresence>
          <motion.div className="space-y-6" variants={containerVariants}>
            {posts.map((post, index) => (
              <motion.div 
                key={post.id} 
                className="glass-strong rounded-lg border border-border overflow-hidden"
                variants={postVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(16, 163, 127, 0.2)"
                }}
                transition={{ delay: index * 0.1 }}
              >
              {/* Post Header */}
              <div className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Link href={`/profile/${post.user_id}`}>
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer hover:opacity-80 transition-opacity">
                      {post.first_name?.[0] || 'U'}{post.last_name?.[0] || ''}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${post.user_id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                        {post.first_name || 'Unknown'} {post.last_name || 'User'}
                      </h3>
                    </Link>
                    {post.institution && (
                      <p className="text-sm text-muted-foreground">{post.institution}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{formatTime(post.created_at)}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="rounded-lg w-full object-cover max-h-96 mb-4"
                  />
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/30 pt-3 mt-3">
                  <span>{post.like_count} likes</span>
                  <span>{post.comment_count} comments</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 border-t border-border/30 pt-3 mt-3">
                  <motion.button
                    onClick={() => toggleLike(post.id, post.user_liked)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                      post.user_liked
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-muted/30"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg 
                      className="w-5 h-5" 
                      fill={post.user_liked ? "currentColor" : "none"} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{
                        scale: post.user_liked ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </motion.svg>
                    Like
                  </motion.button>
                  <motion.button
                    onClick={() => toggleComments(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-muted/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comment
                  </motion.button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 border-t border-border/30 pt-4">
                    {/* Add Comment */}
                    <div className="flex items-start space-x-2 mb-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user?.first_name?.[0] || "U"}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newComment[post.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyPress={(e) => e.key === "Enter" && addComment(post.id)}
                          placeholder="Write a comment..."
                          className="input flex-1 py-2"
                        />
                        <button onClick={() => addComment(post.id)} className="btn-primary py-2 px-4">
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex items-start space-x-2">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {comment.first_name?.[0] || 'U'}{comment.last_name?.[0] || ''}
                          </div>
                          <div className="flex-1">
                            <div className="glass rounded-lg p-3">
                              <p className="font-semibold text-sm text-foreground">
                                {comment.first_name} {comment.last_name}
                              </p>
                              <p className="text-sm text-foreground mt-1">{comment.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 ml-3">
                              {formatTime(comment.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-muted-foreground text-lg">No posts yet</p>
              <p className="text-muted-foreground text-sm mt-2">
                Be the first to share an update!
              </p>
            </motion.div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
