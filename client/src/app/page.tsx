import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PeerFusion
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
              The ultimate platform for students and teachers to collaborate on research, 
              share skills, and build meaningful connections in academia and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn btn-primary px-8 py-3 text-lg font-semibold"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="btn btn-outline px-8 py-3 text-lg font-semibold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse transition-colors duration-300"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse delay-1000 transition-colors duration-300"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full opacity-20 animate-pulse delay-500 transition-colors duration-300"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Why Choose PeerFusion?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Connect, collaborate, and grow with like-minded individuals in your field
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center p-6 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Collaborative Research</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Work together on research projects, share findings, and build on each other's work
              </p>
            </div>
            
            <div className="card text-center p-6 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Skill Sharing</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Teach what you know, learn from others, and expand your expertise
              </p>
            </div>
            
            <div className="card text-center p-6 transition-all duration-300 hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Networking</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Connect with peers, mentors, and collaborators in your academic field
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-colors duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Create Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Set up your academic profile, highlight your skills, and showcase your research interests
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-colors duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Connect & Collaborate</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Find like-minded individuals, join research groups, and start collaborative projects
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold transition-colors duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Share & Grow</h3>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Share your knowledge, learn from others, and advance your academic career
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Showcase Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Beautiful in Every Theme
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Experience PeerFusion in light, dark, or system theme - all with smooth transitions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center transition-colors duration-300">Light Theme</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm transition-colors duration-300">
                Clean, bright interface perfect for daytime use
              </p>
            </div>
            
            <div className="card p-6 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center transition-colors duration-300">Dark Theme</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm transition-colors duration-300">
                Easy on the eyes for late-night study sessions
              </p>
            </div>
            
            <div className="card p-6 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center transition-colors duration-300">System Theme</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm transition-colors duration-300">
                Automatically matches your device preference
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4 transition-colors duration-300">
            Ready to Start Your Academic Journey?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 transition-colors duration-300">
            Join thousands of students and teachers already collaborating on PeerFusion
          </p>
          <Link
            href="/register"
            className="btn bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold transition-all duration-200 inline-block"
          >
            Join PeerFusion Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">PeerFusion</h3>
              <p className="text-gray-400 dark:text-gray-500 transition-colors duration-300">
                Empowering academic collaboration and skill sharing for students and teachers worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                <li><Link href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors duration-200">Search</Link></li>
                <li><Link href="/projects" className="hover:text-white transition-colors duration-200">Projects</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                <li><Link href="/help" className="hover:text-white transition-colors duration-200">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors duration-200">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-md font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                <li><Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
            <p>&copy; 2024 PeerFusion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
