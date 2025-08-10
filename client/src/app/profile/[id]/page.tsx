"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  institution?: string;
  field_of_study?: string;
  avatar?: string;
  joined_date?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'seeking';
  skills: string[];
  collaborators: number;
  maxCollaborators: number;
  createdAt: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  rating: number;
  reviews: number;
  createdAt: string;
  tags: string[];
  isAvailable: boolean;
}

interface Post {
  id: number;
  title: string;
  content: string;
  type: 'research' | 'discussion' | 'announcement' | 'question';
  likes: number;
  comments: number;
  createdAt: string;
  tags: string[];
}

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  relatedId?: number;
  relatedType?: string;
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  
  console.log("ProfilePage rendered with params:", { id, currentUser, authLoading });
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'skills' | 'posts' | 'activity'>('overview');

  useEffect(() => {
    console.log("Profile useEffect triggered:", { id, authLoading, currentUser });
    
    if (!id || authLoading) {
      console.log("Early return:", { id, authLoading });
      return;
    }

    // If no current user, don't fetch profile data
    if (!currentUser) {
      console.log("No current user");
      return;
    }

    // Fetch profile data
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return;
    }

    console.log("Fetching profile for ID:", id);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/users/${id}`;
    console.log("API URL:", apiUrl);

    fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        console.log("Response status:", res.status);
        const text = await res.text();
        console.log("Response text:", text);
        if (!res.ok) throw new Error(text || "Failed to fetch profile");
        return JSON.parse(text);
      })
      .then((data) => {
        console.log("Profile data received:", data);
        setProfile(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch profile:", error);
        setLoading(false);
      });

    // TODO: Fetch actual data from API
    // For now, set empty arrays
    setProjects([]);
    setSkills([]);
    setPosts([]);
    setActivities([]);
  }, [id, currentUser, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">Please log in to view profiles.</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">The profile you're looking for doesn't exist.</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#fbbf24"/>
              <stop offset="50%" stopColor="#e5e7eb"/>
            </linearGradient>
          </defs>
          <path fill="url(#halfStar)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-3xl">
                {profile.first_name?.[0] || profile.email?.[0] || 'U'}
              </span>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                {profile.first_name} {profile.last_name}
              </h1>
              {profile.field_of_study && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-200">{profile.field_of_study}</p>
              )}
              {profile.institution && (
                <p className="text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-200">{profile.institution}</p>
              )}
              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-200 mb-3 transition-colors duration-200">{profile.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <span>Member since {profile.joined_date || '2024'}</span>
                <span>•</span>
                <span>{projects.length} projects</span>
                <span>•</span>
                <span>{skills.length} skills shared</span>
                <span>•</span>
                <span>{posts.length} posts</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Connect
              </button>
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'projects', label: 'Projects' },
              { id: 'skills', label: 'Skills' },
              { id: 'posts', label: 'Posts' },
              { id: 'activity', label: 'Activity' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">About</h2>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-200">
                  {profile.bio || `${profile.first_name} is a researcher and educator passionate about sharing knowledge and collaborating on innovative projects.`}
                </p>
              </div>

              {/* Recent Projects */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Recent Projects</h2>
                  <Link href={`/profile/${id}?tab=projects`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                    View All
                  </Link>
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{project.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 transition-colors duration-200">{project.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <span className="capitalize">{project.status}</span>
                          <span>{project.collaborators}/{project.maxCollaborators} collaborators</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 transition-colors duration-200">No projects yet</p>
                )}
              </div>

              {/* Recent Posts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Recent Posts</h2>
                  <Link href={`/profile/${id}?tab=posts`} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                    View All
                  </Link>
                </div>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{post.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 transition-colors duration-200">{post.content.substring(0, 150)}...</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <span className="capitalize">{post.type}</span>
                          <span>{post.likes} likes • {post.comments} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 transition-colors duration-200">No posts yet</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Top Skills</h3>
                {skills.length > 0 ? (
                  <div className="space-y-3">
                    {skills.slice(0, 5).map((skill) => (
                      <div key={skill.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{skill.name}</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(skill.rating)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">No skills shared yet</p>
                )}
                <Link href={`/profile/${id}?tab=skills`} className="block text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-4 transition-colors duration-200">
                  View All Skills
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Recent Activity</h3>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{activity.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Projects</h2>
              <Link
                href="/projects/new"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Create New Project
              </Link>
            </div>
            
            {projects.length > 0 ? (
              <div className="grid gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{project.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-200">{project.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          project.status === 'seeking' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        } transition-colors duration-200`}>
                          {project.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.difficulty === 'beginner' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          project.difficulty === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        } transition-colors duration-200`}>
                          {project.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded transition-colors duration-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-200">
                      <span>{project.collaborators}/{project.maxCollaborators} collaborators</span>
                      <span>{project.createdAt}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                      >
                        View Details
                      </Link>
                      <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{project.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">No projects yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-200">Start your research journey by creating your first project.</p>
                <Link
                  href="/projects/new"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Create Your First Project
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Skills & Knowledge</h2>
              <Link
                href="/skills/share"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Share a Skill
              </Link>
            </div>
            
            {skills.length > 0 ? (
              <div className="grid gap-6">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{skill.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-200">{skill.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          skill.level === 'beginner' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          skill.level === 'intermediate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                          skill.level === 'advanced' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        } transition-colors duration-200`}>
                          {skill.level}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          skill.isAvailable ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        } transition-colors duration-200`}>
                          {skill.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {skill.tags.map((tag, index) => (
                        <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded transition-colors duration-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-200">
                      <span>{skill.createdAt}</span>
                      <span>{skill.category}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(skill.rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">({skill.reviews} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/skills/${skill.id}`}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">No skills shared yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-200">Share your expertise with the community.</p>
                <Link
                  href="/skills/share"
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Share Your First Skill
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Posts & Discussions</h2>
              <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Create Post
              </button>
            </div>
            
            {posts.length > 0 ? (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-200">{post.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-200">{post.content}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.type === 'research' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        post.type === 'discussion' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        post.type === 'announcement' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      } transition-colors duration-200`}>
                        {post.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded transition-colors duration-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      <span>{post.createdAt}</span>
                      <div className="flex items-center space-x-4">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">No posts yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-200">Start a discussion or share your research findings.</p>
                <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">Recent Activity</h2>
            
            {activities.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                {activities.map((activity, index) => (
                  <div key={activity.id} className={`p-6 ${index !== activities.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white transition-colors duration-200">{activity.message}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">No recent activity</h3>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-200">Start contributing to see your activity here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
