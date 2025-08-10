"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: number;
  title: string;
  description: string;
  author: string;
  skills: string[];
  collaborators: number;
  createdAt: string;
  status: 'active' | 'completed' | 'seeking';
}

interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  user: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // TODO: Fetch actual projects and activities from API
    // setProjects([]);
    // setActivities([]);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">Authentication Required</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">Please log in to access your dashboard.</p>
        <Link href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 transition-colors duration-200">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            Welcome back, {user.first_name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Ready to collaborate on research and share your skills? Here's what's happening in your network.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Projects Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/projects/new"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-200">Create Project</span>
                  </div>
                </Link>
                <Link
                  href="/skills/share"
                  className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-200">Share Skill</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">Recent Projects</h2>
                <Link href="/projects" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                  View All
                </Link>
              </div>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-gray-50 dark:bg-gray-700">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-200">{project.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 transition-colors duration-200">{project.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            <span>By {project.author}</span>
                            <span>{project.collaborators} collaborators</span>
                            <span className="capitalize">{project.status}</span>
                          </div>
                        </div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-200">No projects yet</p>
                  <Link
                    href="/projects/new"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                  >
                    Create your first project
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user.first_name?.[0] || user.email?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-200">{user.first_name} {user.last_name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{user.email}</p>
                </div>
              </div>
              <Link
                href={`/profile/${user.id || 'me'}`}
                className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors duration-200"
              >
                View Profile
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Recent Activity</h3>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
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
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">No recent activity</p>
                </div>
              )}
            </div>

            {/* Skill Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Recommended Skills</h3>
              <div className="space-y-2">
                <Link href="/skills" className="block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                  Explore skills in your field
                </Link>
                <Link href="/skills/share" className="block text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200">
                  Share your expertise
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
