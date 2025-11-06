"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  institution?: string;
  field_of_study?: string;
}

export default function SearchPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchType, setSearchType] = useState<"users" | "projects">("users");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      // Transform backend data to match frontend interface
      const results: SearchResult[] = [];
      
      if (searchType === 'users' && data.users) {
        results.push(...data.users.map((user: any) => ({
          id: user.id,
          type: 'user' as const,
          name: `${user.first_name} ${user.last_name}`,
          description: user.bio || user.institution || 'No bio available',
          avatar: user.avatar
        })));
      }
      
      if (searchType === 'projects' && data.projects) {
        results.push(...data.projects.map((project: any) => ({
          id: project.id,
          type: 'project' as const,
          name: project.title,
          description: project.description,
          owner: `${project.first_name} ${project.last_name}`
        })));
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search
          </h1>
          <p className="text-muted-foreground">
            Find peers, projects, and collaborators
          </p>
        </div>

        {/* Search Bar */}
        <div className="glass-strong rounded-lg p-6 mb-6 border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for users, skills, or projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "users" | "projects")}
                className="input min-w-[120px]"
              >
                <option value="users">Users</option>
                <option value="projects">Projects</option>
              </select>
              
              <button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((result) => (
              <div key={result.id} className="glass-strong rounded-lg p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {result.first_name?.[0] || 'U'}{result.last_name?.[0] || ''}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground">
                      {result.first_name} {result.last_name}
                    </h3>
                    {result.institution && (
                      <p className="text-sm text-muted-foreground">{result.institution}</p>
                    )}
                    {result.field_of_study && (
                      <p className="text-sm text-muted-foreground/80">{result.field_of_study}</p>
                    )}
                    {result.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{result.bio}</p>
                    )}
                    <Link
                      href={`/profile/${result.id}`}
                      className="mt-3 inline-block px-4 py-2 bg-card border border-primary/30 text-primary rounded-lg hover:bg-primary/10 text-sm font-medium transition-all"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !searching ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No results found. Try a different search term.</p>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Enter a search term to find users and projects</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
