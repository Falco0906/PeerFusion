"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/chat/Chat';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-2">
            Chat with your connections and collaborators
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
          <Chat />
        </div>
      </div>
    </div>
  );
}
