"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5051";

export default function ShareSkillsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Available skills categories
  const skillCategories = [
    "Programming",
    "Data Science",
    "Machine Learning",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "DevOps",
    "Database",
    "UI/UX Design",
    "Research",
    "Writing",
    "Other"
  ];
  
  const [formData, setFormData] = useState({
    skillName: "",
    category: "",
    proficiencyLevel: "intermediate",
    description: "",
    yearsOfExperience: "",
    willingToMentor: true,
    willingToCollaborate: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!formData.skillName.trim() || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          skill_name: formData.skillName,
          category: formData.category,
          proficiency_level: formData.proficiencyLevel,
          description: formData.description,
          years_of_experience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
          willing_to_mentor: formData.willingToMentor,
          willing_to_collaborate: formData.willingToCollaborate
        })
      });

      if (response.ok) {
        setSuccess("Skill added successfully!");
        // Reset form
        setFormData({
          skillName: "",
          category: "",
          proficiencyLevel: "intermediate",
          description: "",
          yearsOfExperience: "",
          willingToMentor: true,
          willingToCollaborate: true
        });
        
        // Redirect to skills page after 2 seconds
        setTimeout(() => {
          router.push("/skills");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add skill");
      }
    } catch (err) {
      console.error("Error adding skill:", err);
      setError("Failed to add skill. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/skills"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Skills
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground">Share Your Skills</h1>
          <p className="mt-2 text-muted-foreground">
            Let others know what you're good at and how you can help
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md p-6 space-y-6">
          {/* Skill Name */}
          <div>
            <label htmlFor="skillName" className="block text-sm font-medium text-foreground mb-2">
              Skill Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="skillName"
              name="skillName"
              value={formData.skillName}
              onChange={handleChange}
              placeholder="e.g., Python, Machine Learning, Research Writing"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
              required
            >
              <option value="">Select a category</option>
              {skillCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Proficiency Level */}
          <div>
            <label htmlFor="proficiencyLevel" className="block text-sm font-medium text-foreground mb-2">
              Proficiency Level
            </label>
            <select
              id="proficiencyLevel"
              name="proficiencyLevel"
              value={formData.proficiencyLevel}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Years of Experience */}
          <div>
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-foreground mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min="0"
              max="50"
              placeholder="e.g., 3"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your experience with this skill, projects you've worked on, or what you can help others with..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-card text-foreground"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="willingToMentor"
                name="willingToMentor"
                checked={formData.willingToMentor}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="willingToMentor" className="ml-3 text-sm text-foreground">
                <span className="font-medium">Willing to mentor others</span>
                <p className="text-muted-foreground">Help others learn this skill</p>
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="willingToCollaborate"
                name="willingToCollaborate"
                checked={formData.willingToCollaborate}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="willingToCollaborate" className="ml-3 text-sm text-foreground">
                <span className="font-medium">Open to collaboration</span>
                <p className="text-muted-foreground">Work with others on projects using this skill</p>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-border text-foreground rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg border border-blue-700 hover:border-blue-800"
            >
              {submitting ? "Adding..." : "Add Skill"}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">💡 Tips for sharing skills</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>• Be specific about your skill level to set realistic expectations</li>
            <li>• Include examples or context in your description</li>
            <li>• Check "willing to mentor" if you enjoy teaching others</li>
            <li>• Enable collaboration to find project opportunities</li>
            <li>• You can add multiple skills to showcase your full skillset</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
