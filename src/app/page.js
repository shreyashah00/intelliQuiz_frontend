'use client';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Upload, 
  Zap, 
  Shield,
  Users,
  BookOpen,
  Trophy,
  Sparkles,
  Play,
  Clock,
  Target,
  Lightbulb,
  Brain,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart File Upload",
      description: "Upload PDFs, documents, or images and our AI will intelligently extract content for quiz generation.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Quiz Generation", 
      description: "Generate comprehensive quizzes in seconds with our advanced AI algorithms.",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Adaptive Learning",
      description: "智能适应学习系统根据学生表现调整题目难度，提供个性化学习体验。",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Collaborative Platform",
      description: "Teachers and students collaborate seamlessly with real-time feedback and progress tracking.",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Rich Content Library",
      description: "Access a vast library of educational materials and pre-built quiz templates.",
      gradient: "from-rose-500 to-orange-600"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track progress with detailed analytics and insights to improve learning outcomes.",
      gradient: "from-orange-500 to-yellow-600"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Upload Content",
      description: "Simply upload your study materials, documents, or images to get started.",
      icon: <Upload className="w-6 h-6" />
    },
    {
      number: "02", 
      title: "AI Processing",
      description: "Our advanced AI analyzes your content and identifies key concepts and topics.",
      icon: <Brain className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Quiz Generation",
      description: "Intelligent algorithms create comprehensive quizzes tailored to your content.",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Take & Learn",
      description: "Students take quizzes and receive instant feedback with detailed explanations.",
      icon: <Target className="w-6 h-6" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "High School Teacher",
      image: "/api/placeholder/64/64",
      content: "IntelliQuiz has revolutionized how I create assessments. What used to take hours now takes minutes!",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "University Professor", 
      image: "/api/placeholder/64/64",
      content: "The AI-powered quiz generation is incredibly accurate and saves me so much time in course preparation.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      image: "/api/placeholder/64/64", 
      content: "The adaptive learning system helped me improve my grades significantly. Highly recommend!",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Teachers", icon: <Users className="w-6 h-6" /> },
    { number: "100K+", label: "Quizzes Created", icon: <BookOpen className="w-6 h-6" /> },
    { number: "500K+", label: "Students Engaged", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "98%", label: "Success Rate", icon: <Award className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IntelliQuiz
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Reviews</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-full px-6 py-3 mb-8">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-semibold">AI-Powered Quiz Generation</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Learning with
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Intelligent Quizzes
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload any document and watch our AI create engaging, personalized quizzes in seconds. 
              Perfect for educators, students, and lifelong learners who want to maximize their learning potential.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:scale-105"
              >
                Start Creating Quizzes
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="group px-8 py-4 bg-white border-2 border-blue-200 text-blue-600 font-bold rounded-xl text-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <Play className="w-5 h-5 mr-2 inline" />
                See How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-full px-6 py-3 mb-6">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700 font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Revolutionize Learning
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with intuitive design to create 
              the ultimate quiz generation and learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 rounded-full px-6 py-3 mb-6">
              <Play className="w-5 h-5 text-indigo-600" />
              <span className="text-indigo-700 font-semibold">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              From Idea to Quiz in
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Just 4 Easy Steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes creating engaging quizzes effortless. 
              No technical expertise required – just upload and let our AI do the magic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connection line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 z-0"></div>
                )}
                
                <div className="relative bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 z-10">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    {step.number}
                  </div>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-full px-6 py-3 mb-6">
              <Star className="w-5 h-5 text-yellow-600 fill-current" />
              <span className="text-yellow-700 font-semibold">Testimonials</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Loved by Educators
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent block">
                Around the World
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what teachers and students are saying about their experience with IntelliQuiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform
              <span className="block">Your Learning Experience?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Join thousands of educators and students who are already creating amazing quizzes with IntelliQuiz. 
              Start your free trial today and see the difference AI can make.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-white text-blue-600 font-bold rounded-xl text-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl text-lg hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">IntelliQuiz</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering educators and students with AI-powered quiz generation for enhanced learning experiences.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 IntelliQuiz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}