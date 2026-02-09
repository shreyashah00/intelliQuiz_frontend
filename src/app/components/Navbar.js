"use client";

import { useState, useEffect } from "react";
import { Menu, X, Brain, Sparkles, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/authStore";
import { authAPI } from "../../utils/api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="relative">
            <Brain className="w-8 h-8 text-indigo-400" />
            <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            IntelliQuiz
          </span>
        </button>

        <div className="hidden md:flex gap-8 items-center">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => router.push(user?.Role === 'teacher' ? '/teacher' : '/student')}
                className="text-slate-300 hover:text-indigo-400"
              >
                Dashboard
              </button>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-slate-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    {user?.ProfilePicture ? (
                      <img src={user.ProfilePicture} alt="Profile" className="w-full h-full rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{user?.Username}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-indigo-500/30 rounded-lg shadow-xl py-2">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push(`/${user?.Role}/profile`);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a href="#features" className="text-slate-300 hover:text-indigo-400">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-indigo-400">How It Works</a>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-slate-300 hover:text-white"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-slate-300">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 py-4 space-y-4 border-t border-indigo-500/20">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(user?.Role === 'teacher' ? '/teacher' : '/student');
                }}
                className="w-full text-left text-slate-300"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(`/${user?.Role}/profile`);
                }}
                className="w-full text-left text-slate-300"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full bg-red-600 text-white py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="block text-slate-300">Features</a>
              <a href="#how-it-works" className="block text-slate-300">How It Works</a>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
                className="w-full text-left text-slate-300"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/signup");
                }}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
