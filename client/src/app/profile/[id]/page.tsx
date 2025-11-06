"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  bio?: string;
  institution?: string;
  field_of_study?: string;
  avatar?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  scholar_url?: string;
  orcid?: string;
  website_url?: string;
  phone?: string;
  is_profile_public?: boolean;
  profile_views?: number;
  created_at?: string;
}

interface Skill {
  id: number;
  user_id: number;
  skill_name: string;
  category: string;
  proficiency_level: string;
  description?: string;
  years_of_experience?: number;
  willing_to_mentor: boolean;
  willing_to_collaborate: boolean;
  created_at: string;
}

interface Publication {
  id: number;
  user_id: number;
  title: string;
  authors?: string;
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  citation_count: number;
  created_at: string;
}

interface Project {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  link?: string;
  status: string;
  created_at: string;
}

interface UserStats {
  projects: number;
  skills: number;
  endorsements: number;
  publications: number;
  profileViews: number;
}

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'publications' | 'projects'>('overview');
  const [connectionStatus, setConnectionStatus] = useState<{status: string, isRequester?: boolean, canAccept?: boolean}>({ status: 'none' });
  const [connectionLoading, setConnectionLoading] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  useEffect(() => {
    if (!id || authLoading || !currentUser) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Handle "me" as current user's ID
    const userId = id === 'me' ? currentUser.id : id;
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`;
    
    console.log('Fetching profile for user ID:', userId, '(original id:', id, ')');
    console.log('API URL:', apiUrl);

    Promise.all([
      fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
        .then(async res => {
          if (res.ok) return res.json();
          const errorText = await res.text();
          console.error(`Profile fetch failed (${res.status}):`, errorText);
          return Promise.reject({ status: res.status, message: errorText });
        }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/skills`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .catch(() => []),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/publications`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : [])
        .catch(() => []),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/stats`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : { projects: 0, skills: 0, endorsements: 0, publications: 0, profileViews: 0 })
        .catch(() => ({ projects: 0, skills: 0, endorsements: 0, publications: 0, profileViews: 0 })),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/status/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : { status: 'none' })
        .catch(() => ({ status: 'none' })),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async res => {
          if (res.ok) {
            const data = await res.json();
            console.log(`Fetched ${data.length} projects for user ${userId}:`, data);
            return data;
          }
          return [];
        })
        .catch((err) => {
          console.error('Error fetching projects:', err);
          return [];
        }),
    ])
    .then(([profileData, skillsData, publicationsData, statsData, connectionData, projectsData]) => {
      console.log('Profile data loaded successfully:', profileData);
      console.log('Projects data:', projectsData);
      setProfile(profileData);
      setSkills(Array.isArray(skillsData) ? skillsData : []);
      setPublications(Array.isArray(publicationsData) ? publicationsData : []);
      setStats(statsData);
      setConnectionStatus(connectionData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Failed to fetch profile:", {
        error,
        id,
        userId: id === 'me' ? currentUser.id : id,
        apiUrl,
        hasToken: !!token,
        currentUser: currentUser ? { id: currentUser.id, email: currentUser.email } : null
      });
      setProfile(null);
      setLoading(false);
    });
  }, [id, currentUser, authLoading]);

  const handleSendConnectionRequest = async () => {
    if (!id || connectionLoading) return;
    setConnectionLoading(true);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/request/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setConnectionStatus({ status: 'pending', isRequester: true });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!connectionStatus.canAccept || connectionLoading) return;
    setConnectionLoading(true);

    const token = localStorage.getItem("token");
    try {
      // Need to get connection ID first - for now we'll refetch
      const reqResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (reqResponse.ok) {
        const requests = await reqResponse.json();
        const matchingRequest = requests.find((r: any) => r.id === parseInt(id as string));
        
        if (matchingRequest) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/accept/${matchingRequest.connection_id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            setConnectionStatus({ status: 'accepted' });
          }
        }
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!id || connectionLoading) return;
    if (!confirm('Are you sure you want to remove this connection?')) return;
    
    setConnectionLoading(true);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setConnectionStatus({ status: 'none' });
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleEndorseSkill = async (skillId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/skills/${skillId}/endorse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Skill endorsed successfully!');
        // Refresh stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to endorse skill');
      }
    } catch (error) {
      console.error('Error endorsing skill:', error);
    }
  };

  const handleOpenChat = () => {
    // Store the user ID in sessionStorage and navigate to dashboard where chat can be opened
    if (profile) {
      sessionStorage.setItem('openChatWith', profile.id.toString());
      router.push('/dashboard');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </motion.div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to view profiles.</p>
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Go to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
          <Link href="/dashboard" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    );
  }

  const isOwnProfile = currentUser.id === profile.id;

  return (
    <motion.div 
      className="min-h-screen py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Profile Header with Cover */}
        <motion.div 
          className="glass-strong rounded-xl overflow-hidden mb-6 border border-border shadow-xl"
          variants={itemVariants}
          whileHover={{ scale: 1.005 }}
        >
          {/* Cover Image / Gradient Background */}
          <div className="h-48 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50 dark:from-primary dark:via-primary/80 dark:to-primary/60 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Profile Content */}
          <div className="px-6 pb-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Avatar and Basic Info */}
              <div className="flex items-end space-x-6">
                {/* Enhanced Avatar */}
                <motion.div 
                  className="w-32 h-32 bg-gradient-to-br from-primary to-primary/80 dark:from-primary dark:to-primary/70 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl ring-4 ring-background relative overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="relative z-10">
                    {profile.first_name?.[0]?.toUpperCase()}
                  </span>
                </motion.div>
                
                {/* Name and Title */}
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.field_of_study && (
                    <p className="text-lg font-medium text-primary mb-1">{profile.field_of_study}</p>
                  )}
                  {profile.institution && (
                    <p className="text-sm text-muted-foreground flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {profile.institution}
                    </p>
                  )}
                  {profile.location && (
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 md:pb-2">
                {isOwnProfile ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/profile/edit"
                      className="btn-primary flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    {connectionStatus.status === 'none' && (
                      <motion.button
                        onClick={handleSendConnectionRequest}
                        disabled={connectionLoading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Connect
                      </motion.button>
                    )}
                    
                    {connectionStatus.status === 'pending' && connectionStatus.isRequester && (
                      <motion.button
                        disabled
                        className="btn-secondary flex items-center gap-2 opacity-70 cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                      >
                        <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Request Sent
                      </motion.button>
                    )}
                    
                    {connectionStatus.status === 'pending' && connectionStatus.canAccept && (
                      <>
                        <motion.button
                        onClick={handleAcceptConnection}
                        disabled={connectionLoading}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </motion.button>
                      <motion.button
                        onClick={handleRemoveConnection}
                        disabled={connectionLoading}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Decline
                      </motion.button>
                    </>
                  )}
                  
                  {connectionStatus.status === 'accepted' && (
                    <>
                      <motion.button 
                        className="btn-secondary flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Connected
                      </motion.button>
                      <motion.button
                        onClick={handleRemoveConnection}
                        disabled={connectionLoading}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove connection"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </>
                  )}
                  
                  <motion.button
                    onClick={handleOpenChat}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <motion.div 
              className="mt-6 px-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h3>
              <p className="text-foreground leading-relaxed">{profile.bio}</p>
            </motion.div>
          )}

          {/* Social Links */}
          {(profile.linkedin_url || profile.github_url || profile.scholar_url || profile.website_url || profile.email) && (
            <motion.div 
              className="mt-6 px-6 pb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Connect</h3>
              <div className="flex flex-wrap gap-3">
                {profile.email && (
                  <motion.a 
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 px-4 py-2 glass-strong border border-border rounded-lg hover:border-primary/50 transition-colors group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-foreground">Email</span>
                  </motion.a>
                )}
                {profile.linkedin_url && (
                  <motion.a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass-strong border border-border rounded-lg hover:border-blue-500/50 transition-colors group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm font-medium text-foreground">LinkedIn</span>
                  </motion.a>
                )}
                {profile.github_url && (
                  <motion.a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass-strong border border-border rounded-lg hover:border-gray-500/50 transition-colors group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-foreground group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm font-medium text-foreground">GitHub</span>
                  </motion.a>
                )}
                {profile.scholar_url && (
                  <motion.a 
                    href={profile.scholar_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass-strong border border-border rounded-lg hover:border-blue-700/50 transition-colors group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-blue-700 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0L1 8v2.25h22V8zm5.5 12h-11v5.5h11z"/>
                    </svg>
                    <span className="text-sm font-medium text-foreground">Scholar</span>
                  </motion.a>
                )}
                {profile.website_url && (
                  <motion.a 
                    href={profile.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 glass-strong border border-border rounded-lg hover:border-primary/50 transition-colors group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-sm font-medium text-foreground">Website</span>
                  </motion.a>
                )}
              </div>
            </motion.div>
          )}
          </div>
        </motion.div>

        {/* Enhanced Stats Cards - No Icons, Professional */}
        {stats && (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
            variants={containerVariants}
          >
            {[
              { value: stats.projects, label: 'Projects', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10', tab: 'projects' },
              { value: stats.skills, label: 'Skills', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/10', tab: 'skills' },
              { value: stats.endorsements, label: 'Endorsements', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/10', tab: null },
              { value: stats.publications, label: 'Publications', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/10', tab: 'publications' },
              { value: stats.profileViews, label: 'Profile Views', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-500/10', tab: null },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="glass-strong p-6 rounded-xl border border-border cursor-pointer relative overflow-hidden group"
                variants={statsVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (stat.tab === 'projects') setActiveTab('projects');
                  else if (stat.tab === 'skills') setActiveTab('skills');
                  else if (stat.tab === 'publications') setActiveTab('publications');
                }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`text-4xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
                
                {/* Decorative Element */}
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${stat.bgColor} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div 
          className="glass-strong rounded-lg mb-6 border border-border"
          variants={itemVariants}
        >
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'skills', 'publications', 'projects'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Skills Preview */}
                {skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">Top Skills</h3>
                      <button
                        onClick={() => setActiveTab('skills')}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 6).map((skill) => (
                        <motion.span
                          key={skill.id}
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                        >
                          {skill.skill_name} • {skill.proficiency_level}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Projects Preview */}
                {projects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
                      <button
                        onClick={() => setActiveTab('projects')}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {projects.slice(0, 3).map((project) => (
                        <motion.div
                          key={project.id}
                          whileHover={{ x: 5 }}
                          className="glass-strong border-l-4 border-primary pl-4 pr-4 py-3 rounded-r-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{project.title}</h4>
                              {project.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full ml-3 ${
                              project.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : project.status === 'seeking'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Publications Preview */}
                {publications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">Recent Publications</h3>
                      <button
                        onClick={() => setActiveTab('publications')}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {publications.slice(0, 3).map((pub) => (
                        <motion.div
                          key={pub.id}
                          whileHover={{ x: 5 }}
                          className="glass-strong border-l-4 border-primary pl-4 pr-4 py-3 rounded-r-lg"
                        >
                          <h4 className="font-medium text-foreground">{pub.title}</h4>
                          {pub.authors && <p className="text-sm text-muted-foreground">{pub.authors}</p>}
                          <p className="text-sm text-muted-foreground/80 mt-1">
                            {pub.journal} ({pub.year}) • {pub.citation_count} citations
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Empty State */}
                {skills.length === 0 && publications.length === 0 && projects.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 glass-strong rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Profile Under Construction</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile 
                        ? "Start building your profile by adding skills, projects, and publications." 
                        : "This user is still building their profile."}
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="grid gap-4 md:grid-cols-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{skill.skill_name}</h4>
                        <p className="text-sm text-muted-foreground">{skill.category}</p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                        {skill.proficiency_level}
                      </span>
                    </div>
                    {skill.description && (
                      <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
                    )}
                    {skill.years_of_experience && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {skill.years_of_experience} years experience
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      {skill.willing_to_mentor && (
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                          Willing to Mentor
                        </span>
                      )}
                      {skill.willing_to_collaborate && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          Open to Collaborate
                        </span>
                      )}
                    </div>
                    {!isOwnProfile && (
                      <button
                        onClick={() => handleEndorseSkill(skill.id)}
                        className="mt-3 w-full px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-all shadow-md hover:shadow-lg border border-blue-700 hover:border-blue-800"
                      >
                        Endorse Skill
                      </button>
                    )}
                  </div>
                ))}
                {skills.length === 0 && (
                  <p className="text-muted-foreground">No skills added yet.</p>
                )}
              </div>
            )}

            {/* Publications Tab */}
            {activeTab === 'publications' && (
              <div className="space-y-4">
                {publications.map((pub) => (
                  <div key={pub.id} className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-foreground mb-2">{pub.title}</h4>
                    {pub.authors && (
                      <p className="text-sm text-muted-foreground mb-1">{pub.authors}</p>
                    )}
                    {pub.journal && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {pub.journal} • {pub.year}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-sm text-muted-foreground">
                        📊 {pub.citation_count} citations
                      </span>
                      {pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          DOI: {pub.doi}
                        </a>
                      )}
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Paper →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {publications.length === 0 && (
                  <p className="text-muted-foreground">No publications added yet.</p>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-strong border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {project.title}
                          </h4>
                          {project.description && (
                            <p className="text-muted-foreground leading-relaxed mb-3">
                              {project.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            project.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : project.status === 'seeking'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : project.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </motion.span>
                      </div>

                      {/* Project Link */}
                      {project.link && (
                        <motion.a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors group/link"
                          whileHover={{ x: 5 }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>View Project</span>
                          <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.a>
                      )}

                      {/* Project Metadata */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            Created {new Date(project.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 glass-strong rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile 
                        ? "Start showcasing your research projects to collaborate with peers." 
                        : "This user hasn't added any projects yet."}
                    </p>
                    {isOwnProfile && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6">
                        <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Your First Project
                        </Link>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
