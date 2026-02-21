import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import confetti from "canvas-confetti";
import { 
  User, Lock, Mail, Eye, EyeOff, LogOut, Settings, 
  Play, FlaskConical, Home, BarChart3, Trophy, Flame, 
  Gem, ChevronRight, Check, Send, Sparkles, BookOpen,
  Clock, Award, ArrowLeft, ArrowRight, Loader2, AlertCircle,
  Users, TrendingUp, Activity, Zap, Brain, MessageSquare,
  Target, Layers, FileText, CheckCircle2, Bot
} from "lucide-react";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ==================== CONTEXT ====================

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("equipped_token"));

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("equipped_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem("equipped_token", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post(`${API}/auth/register`, userData);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem("equipped_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("equipped_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==================== COMPONENTS ====================

const GlassCard = ({ children, className = "", hover = false, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${hover ? 'transition-all duration-300 hover:bg-white/10 hover:border-white/20' : ''} ${className}`}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const NeonButton = ({ children, variant = "primary", className = "", loading = false, ...props }) => {
  const baseClasses = "relative flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "rounded-full bg-fuchsia-600 px-8 py-4 text-white hover:bg-fuchsia-500 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)]",
    outline: "rounded-full border-2 border-fuchsia-500 px-8 py-4 text-fuchsia-400 hover:bg-fuchsia-500/10",
    secondary: "rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]",
    ghost: "rounded-xl px-6 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

const CyberProgress = ({ value, className = "" }) => (
  <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-800 ${className}`}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500"
    />
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 bg-fuchsia-400 rounded-full animate-typing"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// ==================== AUTH PAGES ====================

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Effects */}
      <div className="glow-blob w-[600px] h-[600px] bg-fuchsia-600/20 -top-40 -right-40" />
      <div className="glow-blob w-[400px] h-[400px] bg-blue-600/20 -bottom-20 -left-20" />
      
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-fuchsia-500/30"
          >
            E
          </motion.div>
          <h1 className="text-2xl font-outfit font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-1">Sign in to continue your AI mastery journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-12"
                placeholder="Enter your email"
                data-testid="login-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-12 pr-12"
                placeholder="Enter your password"
                data-testid="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-400 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500" />
              Remember me
            </label>
            <button type="button" onClick={() => navigate("/recovery")} className="text-fuchsia-400 hover:text-fuchsia-300 font-medium">
              Forgot password?
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <NeonButton type="submit" className="w-full" loading={loading} data-testid="login-submit-btn">
            Sign In
          </NeonButton>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/register")} className="text-fuchsia-400 font-semibold hover:text-fuchsia-300">
              Create account
            </button>
          </p>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-center text-slate-500 mb-4">Or continue with</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.5c1.77 0 3.37.66 4.61 1.72l3.5-3.5A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.24 6.65l4.03 3.11Z"/>
              <path fill="#34A853" d="M16.04 18.01A7.12 7.12 0 0 1 12 19.5a7.08 7.08 0 0 1-6.73-5.26l-4.03 3.11A12 12 0 0 0 12 24c3.03 0 5.8-1.13 7.93-2.99l-3.89-3Z"/>
              <path fill="#4A90E2" d="M19.93 21.01A11.95 11.95 0 0 0 24 12c0-.79-.08-1.58-.22-2.36H12v4.73h6.74a5.76 5.76 0 0 1-2.7 3.63l3.89 3.01Z"/>
              <path fill="#FBBC05" d="M5.27 14.24A7.1 7.1 0 0 1 4.5 12c0-.79.13-1.54.37-2.24L1.24 6.65A11.94 11.94 0 0 0 0 12c0 1.93.46 3.76 1.24 5.35l4.03-3.11Z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "", username: "", password: "", first_name: "", last_name: "", phone: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "password") {
      const strength = Math.min(value.length * 10, 100);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-12">
      <div className="glow-blob w-[600px] h-[600px] bg-fuchsia-600/20 -top-40 -right-40" />
      <div className="glow-blob w-[400px] h-[400px] bg-blue-600/20 -bottom-20 -left-20" />
      
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-fuchsia-500/30">
            E
          </div>
          <h1 className="text-2xl font-outfit font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1">Start your AI mastery journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="glass-input"
                placeholder="John"
                data-testid="register-firstname-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="glass-input"
                placeholder="Doe"
                data-testid="register-lastname-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="glass-input pl-12"
                placeholder="johndoe"
                required
                data-testid="register-username-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="glass-input pl-12"
                placeholder="john@example.com"
                required
                data-testid="register-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="glass-input pl-12 pr-12"
                placeholder="Min 8 characters"
                required
                data-testid="register-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${passwordStrength}%` }}
              />
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <NeonButton type="submit" className="w-full" loading={loading} data-testid="register-submit-btn">
            Create Account
          </NeonButton>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button type="button" onClick={() => navigate("/login")} className="text-fuchsia-400 font-semibold hover:text-fuchsia-300">
              Sign in
            </button>
          </p>
        </form>
      </GlassCard>
    </div>
  );
};

const RecoveryPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/auth/recover`, { email, method });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="glow-blob w-[600px] h-[600px] bg-fuchsia-600/20 -top-40 -right-40" />
      
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-outfit font-bold text-white">Password Recovery</h1>
          <p className="text-slate-400 mt-1">Choose how you'd like to reset your password</p>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-green-400 font-semibold mb-2">Recovery instructions sent!</p>
            <p className="text-slate-400 text-sm mb-6">
              We've sent a {method === 'sms' ? '6-digit code' : 'reset link'} to {email}.
            </p>
            <NeonButton onClick={() => navigate("/login")} variant="outline" className="w-full">
              Back to Login
            </NeonButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-12"
                  placeholder="john@example.com"
                  required
                  data-testid="recovery-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Recovery Method</label>
              <div className="space-y-3">
                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition ${method === 'email' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                  <input type="radio" name="method" value="email" checked={method === 'email'} onChange={(e) => setMethod(e.target.value)} className="mr-3 text-fuchsia-500 focus:ring-fuchsia-500" />
                  <div>
                    <p className="font-semibold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-fuchsia-400" /> Email
                    </p>
                    <p className="text-sm text-slate-400">Receive reset link via email</p>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition ${method === 'sms' ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 hover:bg-white/5'}`}>
                  <input type="radio" name="method" value="sms" checked={method === 'sms'} onChange={(e) => setMethod(e.target.value)} className="mr-3 text-fuchsia-500 focus:ring-fuchsia-500" />
                  <div>
                    <p className="font-semibold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-400" /> SMS
                    </p>
                    <p className="text-sm text-slate-400">Receive 6-digit code via text</p>
                  </div>
                </label>
              </div>
            </div>

            <NeonButton type="submit" className="w-full" loading={loading} data-testid="recovery-submit-btn">
              Send Recovery Instructions
            </NeonButton>

            <NeonButton type="button" variant="ghost" onClick={() => navigate("/login")} className="w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </NeonButton>
          </form>
        )}
      </GlassCard>
    </div>
  );
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        try {
          const response = await axios.get(`${API}/auth/session`, {
            headers: { "X-Session-ID": sessionId },
            withCredentials: true
          });
          
          const { user, token } = response.data;
          localStorage.setItem("equipped_token", token);
          setToken(token);
          setUser(user);
          navigate("/dashboard", { replace: true, state: { user } });
        } catch (error) {
          console.error("OAuth callback error:", error);
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    };

    processSession();
  }, [location, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-fuchsia-500 mx-auto mb-4" />
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
};

// ==================== DASHBOARD ====================

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("equipped_token");
        const response = await axios.get(`${API}/modules`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setModules(response.data);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const currentModule = modules[0];
  const currentLesson = currentModule?.lessons?.find(l => l.status === 'in_progress' || l.status === 'available');

  return (
    <div className="min-h-screen bg-void">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-fuchsia-500/20">
                E
              </div>
              <span className="text-xl font-outfit font-bold gradient-text hidden sm:block">E-Quipped AI</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-400 animate-flame" />
                  <span className="text-sm font-bold text-orange-400">{user?.daily_streak || 0} day streak</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
                  <Gem className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm font-bold text-fuchsia-400">{(user?.xp_total || 0).toLocaleString()} XP</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">Level {user?.current_level || 1}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white">
                  <Home className="w-4 h-4 inline mr-2" />Dashboard
                </button>
                {user?.is_admin && (
                  <button onClick={() => navigate("/admin")} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition">
                    <BarChart3 className="w-4 h-4 inline mr-2" />Admin
                  </button>
                )}
              </div>

              <div className="relative group">
                <button className="w-10 h-10 bg-gradient-to-br from-flesh to-flesh-dim rounded-full flex items-center justify-center text-void font-bold shadow-lg hover:shadow-flesh/30 transition" data-testid="user-avatar-btn">
                  {user?.avatar || user?.first_name?.[0] || "U"}
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-surface border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => navigate("/settings")} className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2" data-testid="logout-btn">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-600/20 via-surface to-blue-600/20 p-8 mb-8 border border-white/10"
        >
          <div className="glow-blob w-[400px] h-[400px] bg-fuchsia-600/30 -top-20 -right-20" />
          <div className="glow-blob w-[300px] h-[300px] bg-blue-600/20 bottom-0 left-1/4" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-fuchsia-300 mb-2">Welcome back, {user?.first_name || 'Learner'}!</p>
              <h1 className="text-3xl lg:text-4xl font-outfit font-bold text-white mb-4">
                Continue Your AI Mastery Journey
              </h1>
              <p className="text-slate-300 max-w-xl">
                You're making great progress! Complete the next lesson to unlock advanced techniques.
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <NeonButton onClick={() => currentLesson && navigate(`/lesson/${currentLesson.lesson_id}`)} className="animate-pulse-glow" data-testid="continue-learning-btn">
                  <Play className="w-5 h-5" /> Continue Learning
                </NeonButton>
                <NeonButton variant="outline" onClick={() => navigate("/sandbox")} data-testid="open-sandbox-btn">
                  <FlaskConical className="w-5 h-5" /> Open Sandbox
                </NeonButton>
              </div>
            </div>
            
            <div className="hidden lg:block text-center">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">
                    {currentModule ? Math.round((currentModule.completed_lessons / currentModule.total_lessons) * 100) : 0}%
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Complete</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Modules Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
              </div>
            ) : (
              modules.map((module, idx) => (
                <ModuleCard key={module.module_id} module={module} index={idx} isActive={idx === 0} />
              ))
            )}
          </div>

          {/* Current Lesson */}
          <div className="lg:col-span-8 space-y-6">
            {currentLesson && <CurrentLessonCard lesson={currentLesson} module={currentModule} />}
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard hover className="p-6 cursor-pointer group" onClick={() => navigate("/sandbox")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Online</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Sandbox</h3>
                <p className="text-sm text-slate-400 mb-4">Practice prompts without leaving the platform. Choose from multiple AI models.</p>
                <div className="flex items-center text-sm text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Launch Sandbox <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>

              <GlassCard hover className="p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <span className="text-xs text-slate-500">2,847 students</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Community</h3>
                <p className="text-sm text-slate-400 mb-4">Join discussions, share prompts, and learn from peers.</p>
                <div className="flex items-center text-sm text-fuchsia-400 font-semibold">
                  View Discussions <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, index, isActive }) => {
  const navigate = useNavigate();
  const isLocked = index > 0 && module.completed_lessons === 0;
  const progress = module.total_lessons > 0 ? (module.completed_lessons / module.total_lessons) * 100 : 0;

  return (
    <GlassCard className={`p-6 ${isActive ? 'ring-2 ring-fuchsia-500' : ''} ${isLocked ? 'opacity-60' : ''}`}>
      {isActive && (
        <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-fuchsia-500 text-white text-xs font-semibold">
          ACTIVE
        </span>
      )}
      
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-fuchsia-400">MODULE {index + 1}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          progress === 100 ? 'bg-green-500/20 text-green-400' : 
          progress > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
        }`}>
          {progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Not Started'}
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
      <p className="text-sm text-slate-400 mb-4">{module.description}</p>
      
      {!isLocked && module.lessons && (
        <div className="space-y-2 mb-4">
          {module.lessons.map((lesson, lidx) => (
            <div 
              key={lesson.lesson_id}
              onClick={() => lesson.status !== 'locked' && navigate(`/lesson/${lesson.lesson_id}`)}
              className={`flex items-center p-3 rounded-xl transition cursor-pointer ${
                lesson.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                lesson.status === 'in_progress' || lesson.status === 'available' ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20' :
                'bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
              }`}
              data-testid={`lesson-item-${lesson.lesson_id}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 ${
                lesson.status === 'completed' ? 'bg-green-500 text-white' :
                lesson.status === 'in_progress' || lesson.status === 'available' ? 'bg-fuchsia-500 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {lesson.status === 'completed' ? <Check className="w-4 h-4" /> : lidx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{lesson.title}</p>
                <p className={`text-xs ${
                  lesson.status === 'completed' ? 'text-green-400' :
                  lesson.status === 'in_progress' ? 'text-fuchsia-400' : 'text-slate-500'
                }`}>
                  {lesson.status === 'completed' ? `${lesson.score || 100}% Score` :
                   lesson.status === 'in_progress' ? `${lesson.progress || 0}% Complete` :
                   lesson.status === 'available' ? 'Ready to start' : 'Locked'}
                </p>
              </div>
              {lesson.status === 'in_progress' || lesson.status === 'available' ? (
                <Play className="w-5 h-5 text-fuchsia-400" />
              ) : lesson.status === 'locked' ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : null}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-400">{module.completed_lessons}/{module.total_lessons} Lessons</span>
        <span className="font-bold text-fuchsia-400">{Math.round(progress)}%</span>
      </div>
      <CyberProgress value={progress} />
    </GlassCard>
  );
};

const CurrentLessonCard = ({ lesson, module }) => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold">
              Lesson {lesson.order_index}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold capitalize">
              {lesson.difficulty_level}
            </span>
          </div>
          <h2 className="text-2xl font-outfit font-bold text-white">{lesson.title}</h2>
        </div>
        <NeonButton variant="secondary" onClick={() => navigate(`/lesson/${lesson.lesson_id}`)} data-testid="resume-lesson-btn">
          <Play className="w-5 h-5" /> {lesson.status === 'in_progress' ? 'Resume' : 'Start'} Lesson
        </NeonButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Clock className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-sm text-slate-400">Duration</p>
          <p className="font-bold text-white">{Math.floor(lesson.estimated_minutes / 60)}h {lesson.estimated_minutes % 60}m</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Trophy className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-sm text-slate-400">XP Reward</p>
          <p className="font-bold text-white">{lesson.xp_reward} XP</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-sm text-slate-400">Prerequisites</p>
          <p className="font-bold text-white">{lesson.order_index === 1 ? 'None' : `Lesson ${lesson.order_index - 1}`}</p>
        </div>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-lg font-bold text-white mb-3">What You'll Learn</h3>
        <ul className="space-y-3 text-slate-300">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Break large documents into manageable sections using the <strong className="text-white">"Outline First"</strong> strategy</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Use AI to create and refine comprehensive outlines before writing</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <span>Generate consistent, coherent long-form content (2000+ words)</span>
          </li>
        </ul>
      </div>
    </GlassCard>
  );
};

// ==================== LESSON VIEW ====================

const LessonView = () => {
  const { lessonId } = require("react-router-dom").useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-5.2");
  const [sessionId, setSessionId] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("equipped_token");
        const response = await axios.get(`${API}/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLesson(response.data);
        
        // Add initial AI message
        setMessages([{
          role: "assistant",
          content: `Welcome to the Lesson Sandbox! I'm here to help you practice the "Outline First" strategy.\n\n🎯 **Your Mission:**\nCreate a detailed outline for a **2,000-word Remote Work Policy** document.\n\n**Required sections:**\n• Executive Summary\n• Eligibility & Requirements\n• Communication Protocols\n• Performance Management\n• Security & Compliance\n\nTry using the 4 Core Elements: Role, Task, Context, and Constraints in your prompt!`,
          timestamp: new Date().toISOString()
        }]);
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    
    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSending(true);
    
    try {
      const token = localStorage.getItem("equipped_token");
      const provider = selectedModel.includes("claude") ? "anthropic" : 
                       selectedModel.includes("gemini") ? "gemini" : "openai";
      
      const response = await axios.post(`${API}/chat`, {
        content: inputValue,
        model: selectedModel,
        provider,
        session_id: sessionId,
        lesson_id: lessonId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessionId(response.data.session_id);
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.response,
        quality_score: response.data.quality_score,
        tips: response.data.tips,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  const completeLesson = async () => {
    try {
      const token = localStorage.getItem("equipped_token");
      const response = await axios.post(`${API}/progress`, {
        lesson_id: lessonId,
        progress: 100,
        score: 95,
        completed: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D946EF', '#3B82F6', '#10B981']
      });
      
      if (response.data.xp_gained) {
        updateUser({
          ...user,
          xp_total: response.data.new_total,
          current_level: response.data.level
        });
      }
      
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-void flex">
      {/* Left: Lesson Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-void/90 backdrop-blur-sm py-4 -mx-6 px-6 -mt-6 z-10 border-b border-white/10">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition" data-testid="back-to-dashboard-btn">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm text-slate-400">Module 1 • Lesson {lesson?.order_index}</p>
                <h2 className="text-xl font-bold text-white">{lesson?.title}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#D946EF" strokeWidth="3" 
                          strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - (lesson?.user_progress?.progress || 25) / 100)} 
                          className="transition-all duration-500"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-fuchsia-400">
                  {lesson?.user_progress?.progress || 25}%
                </div>
              </div>
            </div>
          </div>

          {/* Learning Objective */}
          <GlassCard className="p-6 mb-6 bg-fuchsia-500/10 border-fuchsia-500/20">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-fuchsia-400" /> Learning Objective
            </h3>
            <p className="text-slate-300">
              Master the "Outline First" strategy for creating documents over 1,000 words using section-by-section generation.
            </p>
          </GlassCard>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <h3 className="text-lg font-bold text-white mb-3">The Challenge</h3>
            <p className="text-slate-300 mb-4 leading-relaxed">
              You need to create a 2,000-word "Remote Work Policy" document. Instead of asking AI to write it all at once 
              (which often produces generic, repetitive content), you'll use a structured approach:
            </p>

            <div className="rounded-xl bg-surface border border-white/10 p-4 mb-6 font-mono text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-green-400">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2 text-xs">1</span>
                  Generate Outline
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="flex items-center text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 text-xs">2</span>
                  Refine Structure
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600" />
                <div className="flex items-center text-fuchsia-400">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center mr-2 text-xs">3</span>
                  Write Sections
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
              <p className="text-amber-200 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Your Task:</strong> Use the sandbox on the right to complete each step. The AI will evaluate your prompt quality and guide you through the process.</span>
              </p>
            </div>

            <h3 className="text-lg font-bold text-white mb-3">Why This Approach Works</h3>
            <ul className="space-y-3 text-slate-300 mb-6">
              <li className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Better Structure:</strong> AI can maintain logical flow across sections when guided by a clear outline</span>
              </li>
              <li className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Consistency:</strong> Each section builds on the previous with proper context</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Easier Editing:</strong> Spot issues at the outline stage, not after 2,000 words</span>
              </li>
            </ul>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-fuchsia-500/30">1</div>
              <span className="ml-2 text-sm font-medium text-fuchsia-400">Outline</span>
            </div>
            <div className="flex-1 h-px bg-slate-700" />
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-slate-500">Expand</span>
            </div>
            <div className="flex-1 h-px bg-slate-700" />
            <div className="flex items-center opacity-50">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-slate-500">Review</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <NeonButton variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" /> Previous Lesson
            </NeonButton>
            <NeonButton onClick={completeLesson} data-testid="complete-lesson-btn">
              Mark Complete & Continue <ArrowRight className="w-4 h-4" />
            </NeonButton>
          </div>
        </div>
      </div>

      {/* Right: Sandbox */}
      <div className="w-full lg:w-[500px] xl:w-[600px] flex flex-col bg-[#0d1117] border-l border-slate-700">
        {/* Sandbox Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#161b22]">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-blue-400" />
            <span className="text-slate-300 text-sm font-medium">Lesson Sandbox</span>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">Live</span>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-slate-800 text-slate-300 text-xs rounded px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-fuchsia-500"
            data-testid="model-selector"
          >
            <option value="gpt-5.2">GPT-5.2</option>
            <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
            <option value="gemini-3-flash">Gemini 3 Flash</option>
          </select>
        </div>

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin" data-testid="chat-container">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.role === "user" ? "flex justify-end" : ""}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-fuchsia-600 px-4 py-3 text-white shadow-lg">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#161b22] border-l-4 border-green-500 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-300">AI Tutor</p>
                          <span className="text-xs text-slate-500">Just now</span>
                        </div>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                          {msg.content}
                        </div>
                        
                        {msg.quality_score !== undefined && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Prompt Quality:</span>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full max-w-24">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  msg.quality_score >= 80 ? 'bg-green-500' : 
                                  msg.quality_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${msg.quality_score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${
                              msg.quality_score >= 80 ? 'text-green-400' : 
                              msg.quality_score >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {msg.quality_score}/100
                            </span>
                          </div>
                        )}
                        
                        {msg.tips && (
                          <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-blue-400 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 flex-shrink-0" />
                              {msg.tips}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {sending && (
            <div className="rounded-2xl bg-[#161b22] border-l-4 border-green-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#161b22] border-t border-slate-700">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Role: [Who should I be?]&#10;Task: [What do you want?]&#10;Context: [Audience and tone?]&#10;Constraints: [Word count, format?]"
              className="w-full rounded-xl bg-[#21262d] border border-slate-700 px-4 py-3 pr-12 text-white placeholder-slate-500 font-mono text-sm resize-none focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/20"
              rows={4}
              data-testid="sandbox-input"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !inputValue.trim()}
              className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-fuchsia-500 text-white flex items-center justify-center hover:bg-fuchsia-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="send-message-btn"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Enter to send</span>
              <span>Shift+Enter for new line</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded bg-slate-800 text-slate-400 text-xs hover:bg-slate-700 transition">
                <Sparkles className="w-3 h-3 inline mr-1" /> Enhance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SANDBOX ====================

const SandboxPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-5.2");
  const [sessionId, setSessionId] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: `Welcome to the AI Sandbox! 🚀\n\nI'm your AI assistant. You can practice prompts, test ideas, and improve your prompt engineering skills.\n\n**Try using the 4 Core Elements:**\n• **Role** - Who should I act as?\n• **Task** - What do you want me to do?\n• **Context** - What's the situation?\n• **Constraints** - Any limits or format requirements?\n\nChoose your preferred AI model from the dropdown and start experimenting!`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    
    const userMessage = { role: "user", content: inputValue, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setSending(true);
    
    try {
      const token = localStorage.getItem("equipped_token");
      const provider = selectedModel.includes("claude") ? "anthropic" : 
                       selectedModel.includes("gemini") ? "gemini" : "openai";
      
      const response = await axios.post(`${API}/chat`, {
        content: inputValue,
        model: selectedModel,
        provider,
        session_id: sessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.response,
        quality_score: response.data.quality_score,
        tips: response.data.tips,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Header */}
      <nav className="border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="text-xl font-outfit font-bold gradient-text">AI Sandbox</span>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white/10 text-white text-sm rounded-xl px-4 py-2 border border-white/10 focus:outline-none focus:border-fuchsia-500"
                data-testid="sandbox-model-selector"
              >
                <option value="gpt-5.2">GPT-5.2 (OpenAI)</option>
                <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (Anthropic)</option>
                <option value="gemini-3-flash">Gemini 3 Flash (Google)</option>
              </select>
              
              <NeonButton variant="ghost" onClick={() => navigate("/dashboard")} data-testid="back-to-dashboard-from-sandbox">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </NeonButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin" data-testid="sandbox-chat-container">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.role === "user" ? "flex justify-end" : ""}
              >
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-fuchsia-600 px-5 py-4 text-white shadow-lg shadow-fuchsia-500/20">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <GlassCard className="p-5 border-l-4 border-fuchsia-500">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-white">AI Assistant</p>
                          <span className="text-xs text-slate-500 capitalize">{selectedModel.replace(/-/g, ' ')}</span>
                        </div>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        
                        {msg.quality_score !== undefined && (
                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-xs text-slate-500">Prompt Score:</span>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full max-w-32">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  msg.quality_score >= 80 ? 'bg-green-500' : 
                                  msg.quality_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${msg.quality_score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${
                              msg.quality_score >= 80 ? 'text-green-400' : 
                              msg.quality_score >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {msg.quality_score}/100
                            </span>
                          </div>
                        )}
                        
                        {msg.tips && (
                          <div className="mt-3 p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                            <p className="text-xs text-fuchsia-300 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              {msg.tips}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {sending && (
            <GlassCard className="p-5 border-l-4 border-fuchsia-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-blue-500 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <TypingIndicator />
              </div>
            </GlassCard>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your prompt here... Try using Role, Task, Context, and Constraints!"
              className="w-full glass-input pr-14 resize-none font-dm text-base"
              rows={3}
              data-testid="sandbox-main-input"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !inputValue.trim()}
              className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center hover:bg-fuchsia-400 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/30"
              data-testid="sandbox-send-btn"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ADMIN DASHBOARD ====================

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("equipped_token");
        const response = await axios.get(`${API}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="text-xl font-outfit font-bold gradient-text">Admin Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition">
                  <Home className="w-4 h-4 inline mr-2" />Dashboard
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white">
                  <BarChart3 className="w-4 h-4 inline mr-2" />Admin
                </button>
              </div>

              <div className="relative group">
                <button className="w-10 h-10 bg-gradient-to-br from-flesh to-flesh-dim rounded-full flex items-center justify-center text-void font-bold">
                  {user?.avatar || "A"}
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-surface border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-outfit font-bold text-white">Platform Analytics</h1>
            <p className="text-slate-400 mt-1">Real-time metrics and user progress monitoring</p>
          </div>
          <NeonButton variant="outline">
            <Activity className="w-4 h-4" /> Export Report
          </NeonButton>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="flex items-center text-green-400 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 mr-1" /> 12%
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.total_users?.toLocaleString() || 0}</p>
            <p className="text-sm text-slate-400">Total Users</p>
          </GlassCard>

          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <span className="flex items-center text-green-400 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 mr-1" /> 8%
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.avg_completion_rate || 0}%</p>
            <p className="text-sm text-slate-400">Avg. Completion Rate</p>
          </GlassCard>

          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-fuchsia-400" />
              </div>
              <span className="flex items-center text-red-400 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 mr-1 rotate-180" /> 3%
              </span>
            </div>
            <p className="text-3xl font-bold text-white">4.2h</p>
            <p className="text-sm text-slate-400">Avg. Time per Lesson</p>
          </GlassCard>

          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-amber-400" />
              </div>
              <span className="flex items-center text-green-400 text-sm font-semibold">
                <TrendingUp className="w-4 h-4 mr-1" /> 24%
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{(analytics?.sandbox_sessions || 0).toLocaleString()}</p>
            <p className="text-sm text-slate-400">Sandbox Sessions</p>
          </GlassCard>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Module Completion Rates */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Module Completion Rates</h3>
            <div className="space-y-4">
              {analytics?.completion_rates?.map((rate, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-300">{rate.title}</span>
                    <span className={`font-semibold ${rate.completion_rate >= 70 ? 'text-green-400' : rate.completion_rate >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {rate.completion_rate}%
                    </span>
                  </div>
                  <CyberProgress value={rate.completion_rate} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Daily Active Users Chart */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4">Daily Active Users (Last 30 Days)</h3>
            <div className="h-48 flex items-end gap-1">
              {analytics?.daily_users?.map((day, idx) => {
                const maxCount = Math.max(...(analytics.daily_users?.map(d => d.count) || [1]));
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-fuchsia-500 rounded-t hover:from-blue-400 hover:to-fuchsia-400 transition-all cursor-pointer group relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-white/10">
                      {day.count} users
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </GlassCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performers */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Top Performers
            </h3>
            <div className="space-y-3">
              {analytics?.top_performers?.slice(0, 5).map((performer, idx) => (
                <div key={idx} className={`flex items-center p-3 rounded-xl ${idx === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-600'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{performer.first_name} {performer.last_name}</p>
                    <p className="text-xs text-slate-400">Level {performer.current_level}</p>
                  </div>
                  <span className={`font-bold ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {performer.xp_total?.toLocaleString()} XP
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Sandbox Analytics */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-blue-400" /> Sandbox Analytics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 text-sm">Total Sessions</span>
                <span className="font-bold text-white">{analytics?.sandbox_sessions?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 text-sm">Prompts Tested</span>
                <span className="font-bold text-white">{analytics?.prompts_tested?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 text-sm">Avg. Duration</span>
                <span className="font-bold text-white">18 min</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-slate-400 text-sm">Top Model</span>
                <span className="font-bold text-fuchsia-400">GPT-5.2</span>
              </div>
            </div>
          </GlassCard>

          {/* Popular Scenarios */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-fuchsia-400" /> Popular Use Cases
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Email Drafts', value: 85, color: 'from-blue-500 to-blue-400' },
                { name: 'Reports', value: 65, color: 'from-fuchsia-500 to-fuchsia-400' },
                { name: 'Summaries', value: 45, color: 'from-green-500 to-green-400' },
                { name: 'Code Review', value: 30, color: 'from-amber-500 to-amber-400' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-slate-400">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// ==================== PROTECTED ROUTE ====================

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==================== APP ROUTER ====================

const AppRouter = () => {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/recovery" element={<RecoveryPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
      <Route path="/sandbox" element={<ProtectedRoute><SandboxPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// ==================== MAIN APP ====================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App relative">
          {/* Noise Overlay */}
          <div className="noise-overlay" />
          
          {/* Background Glows */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="glow-blob w-[800px] h-[800px] bg-fuchsia-600/10 -top-96 -right-96" />
            <div className="glow-blob w-[600px] h-[600px] bg-blue-600/10 -bottom-72 -left-72" />
          </div>
          
          <AppRouter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
