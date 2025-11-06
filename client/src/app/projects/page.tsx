"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Project {
  id: number;
  title: string;
  description: string;
  author: string;
  authorId: number;
  skills: string[];
  collaborators: number;
  maxCollaborators: number;
  createdAt: string;
  status: 'active' | 'completed' | 'seeking';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [loading, setLoading] = useState(true);

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

  const projectCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5051'}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched projects:', data);
          
          // Transform backend data to match frontend interface
          const transformedProjects = data.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            author: project.user_name || 'Unknown',
            authorId: project.user_id,
            skills: [],
            collaborators: 0,
            maxCollaborators: 5,
            createdAt: project.created_at,
            status: project.status || 'seeking',
            category: 'Research',
            difficulty: 'intermediate' as const
          }));
          
          setProjects(transformedProjects);
          setFilteredProjects(transformedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }
    
    if (selectedStatus !== "all") {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }
    
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(project => project.difficulty === selectedDifficulty);
    }
    
    setFilteredProjects(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, selectedDifficulty, projects]);

  const categories = ["Computer Science", "Physics", "Environmental Science", "Education", "Biology", "Chemistry", "Mathematics"];
  const difficulties = ["beginner", "intermediate", "advanced"];

  if (loading) {
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

  return (
    <motion.div 
      className="min-h-screen py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Research Projects</h1>
            <p className="text-muted-foreground mt-2">Discover and collaborate on cutting-edge research projects</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/projects/new"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg border border-green-700 hover:border-green-800 hover:text-white"
            >
              Create Project
            </Link>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="glass-strong rounded-lg p-6 mb-8 border border-border"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="seeking">Seeking Collaborators</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-foreground mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input w-full"
              >
                <option value="all">All Levels</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div 
                key={project.id} 
                className="glass-strong rounded-lg border border-border p-6 hover:shadow-lg"
                variants={projectCardVariants}
                whileHover={{ scale: 1.02, borderColor: 'rgb(16, 163, 127)' }}
                whileTap={{ scale: 0.98 }}
                custom={index}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{project.title}</h3>
                    <p className="text-muted-foreground mb-3">{project.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'seeking' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {project.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.difficulty === 'beginner' ? 'bg-blue-500/20 text-blue-400' :
                      project.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map((skill, index) => (
                    <span key={index} className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <span>By {project.author}</span>
                  <span>{project.collaborators}/{project.maxCollaborators} collaborators</span>
                  <span className="text-muted-foreground">{project.createdAt}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/profile/${project.authorId}`}
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    View Author Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-24 h-24 glass-strong rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {projects.length === 0 
                ? "Be the first to create a research project!" 
                : "Try adjusting your filters to find more projects."
              }
            </p>
            {projects.length === 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/projects/new"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg border border-green-700 hover:border-green-800 hover:text-white"
                >
                  Create Your First Project
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
