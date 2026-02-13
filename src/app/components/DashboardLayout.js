'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  PlusCircle,
  ClipboardList,
  TrendingUp,
  Bell,
  Search,
  Brain,
  Sparkles,
  ChevronDown,
  Home,
  Users,
  Trophy,
  Shield,
  BarChart3,
  UserCog,
  FileQuestion
} from 'lucide-react';

export default function DashboardLayout({ children, role }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const teacherNavItems = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'File Management', href: '/file-management', icon: FileText },
    { name: 'Generate Quiz', href: '/teacher/generate-quiz', icon: PlusCircle },
    { name: 'Quiz Management', href: '/teacher/quiz-management', icon: ClipboardList },
    { name: 'Question Bank', href: '/teacher/question-bank', icon: BookOpen },
    { name: 'Group Management', href: '/teacher/group-management', icon: Users },
    { name: 'Leaderboards', href: '/teacher/leaderboard', icon: Trophy },
    { name: 'Profile', href: '/teacher/profile', icon: User },
  ];

  const studentNavItems = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Groups', href: '/student/groups', icon: Users },
    { name: 'Available Quizzes', href: '/student/quizzes', icon: BookOpen },
    { name: 'My Results', href: '/student/results', icon: TrendingUp },
    { name: 'Profile', href: '/student/profile', icon: User },
  ];

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: UserCog },
    { name: 'System Stats', href: '/admin/stats', icon: BarChart3 },
    { name: 'Quiz Oversight', href: '/admin/quizzes', icon: BookOpen },
    { name: 'Question Review', href: '/admin/questions', icon: FileQuestion },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  const navItems = role === 'admin' ? adminNavItems : (role === 'teacher' ? teacherNavItems : studentNavItems);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-700 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    IntelliQuiz
                  </h1>
                  <p className="text-xs text-gray-600 capitalize">{role} Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="p-2 text-gray-700 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              
              {/* Notifications */}
              <button className="p-2 text-gray-700 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.FirstName || user?.Username}</p>
                    <p className="text-xs text-gray-600 capitalize">{role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2">
                    <Link
                      href={`/${role}/profile`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setProfileDropdown(false)}
                    >
                      <Home className="w-4 h-4" />
                      Back to Home
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white/95 backdrop-blur-xl border-r border-blue-200/50 shadow-2xl`}>
        <div className="h-full px-3 pb-4 overflow-y-auto pt-24">{/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-700 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <ul className="space-y-2 font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close sidebar on mobile when clicking a link
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`flex items-center p-3 rounded-xl transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                    } transition-colors`} />
                    <span className="ml-3 font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Need Help?</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-3">Check our documentation</div>
              <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Get Support
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} min-h-screen`}>
        <main className="pt-20 px-4 sm:px-6 pb-6">
          <div className="max-w-7xl mx-auto mt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}