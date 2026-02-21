import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import confetti from "canvas-confetti";
import { 
  User, Lock, Mail, Eye, EyeOff, LogOut, Settings, 
  Play, FlaskConical, Home, BarChart3, Trophy, Flame, 
  Gem, ChevronRight, Check, Send, Sparkles, BookOpen,
  Clock, Award, ArrowLeft, ArrowRight, Loader2, AlertCircle,
  Users, TrendingUp, Activity, Zap, Brain, MessageSquare,
  Target, Layers, FileText, CheckCircle2, Bot, X, Menu,
  Edit3, Save, Plus, Trash2, Wand2, RefreshCw, ChevronDown
} from "lucide-react";
import "@/App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add axios interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("equipped_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add axios response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - but don't redirect during login/register
      const publicPaths = ['/login', '/register', '/recovery', '/auth/callback'];
      if (!publicPaths.some(path => window.location.pathname.includes(path))) {
        // Token is invalid, clear storage but let the auth check handle redirect
        console.log("401 error - token may be expired");
      }
    }
    return Promise.reject(error);
  }
);

// ==================== CONTEXT ====================

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("equipped_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("equipped_token"));

  const checkAuth = useCallback(async () => {
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
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      localStorage.setItem("equipped_user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("equipped_token");
      localStorage.removeItem("equipped_user");
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
    localStorage.setItem("equipped_user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post(`${API}/auth/register`, userData);
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem("equipped_token", newToken);
    localStorage.setItem("equipped_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("equipped_token");
    localStorage.removeItem("equipped_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("equipped_user", JSON.stringify(userData));
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

const NeonButton = ({ children, variant = "primary", className = "", loading = false, size = "default", ...props }) => {
  const baseClasses = "relative flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3",
    lg: "px-8 py-4"
  };
  const variants = {
    primary: "rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-500 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)]",
    outline: "rounded-full border-2 border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10",
    secondary: "rounded-xl bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)]",
    ghost: "rounded-xl text-slate-300 hover:bg-white/10 hover:text-white",
    danger: "rounded-xl bg-red-600 text-white hover:bg-red-500"
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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
      <span key={i} className="w-2 h-2 bg-fuchsia-400 rounded-full animate-typing" style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

const MobileMenu = ({ isOpen, onClose, user, onLogout, onNavigate }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 lg:hidden"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="absolute right-0 top-0 h-full w-72 bg-surface border-l border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-lg font-bold text-white">Menu</span>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-flesh to-flesh-dim rounded-full flex items-center justify-center text-void font-bold">
              {user?.avatar || "U"}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-400">Level {user?.current_level || 1}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button onClick={() => { onNavigate("/dashboard"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-300 transition">
              <Home className="w-5 h-5" /> Dashboard
            </button>
            <button onClick={() => { onNavigate("/sandbox"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-300 transition">
              <FlaskConical className="w-5 h-5" /> AI Sandbox
            </button>
            {user?.is_admin && (
              <button onClick={() => { onNavigate("/admin"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-300 transition">
                <BarChart3 className="w-5 h-5" /> Admin
              </button>
            )}
            {user?.is_master && (
              <button onClick={() => { onNavigate("/editor"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-fuchsia-400 transition">
                <Edit3 className="w-5 h-5" /> Course Editor
              </button>
            )}
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <button onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
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
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="glow-blob w-[600px] h-[600px] bg-fuchsia-600/20 -top-40 -right-40" />
      <div className="glow-blob w-[400px] h-[400px] bg-blue-600/20 -bottom-20 -left-20" />
      
      <GlassCard className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-fuchsia-500/30"
          >
            E
          </motion.div>
          <h1 className="text-2xl font-outfit font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Sign in to continue your AI mastery journey</p>
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
              <input type="checkbox" className="mr-2 rounded border-slate-600 bg-slate-800 text-fuchsia-500" />
              Remember me
            </label>
            <button type="button" onClick={() => navigate("/recovery")} className="text-fuchsia-400 hover:text-fuchsia-300 font-medium">
              Forgot password?
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
        
        <div className="mt-4 p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg">
          <p className="text-xs text-fuchsia-300 text-center">
            <strong>Demo:</strong> admin@equipped.ai / admin123<br/>
            <strong>Master Editor:</strong> master@equipped.ai / master123
          </p>
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
      setPasswordStrength(Math.min(value.length * 10, 100));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-8">
      <div className="glow-blob w-[600px] h-[600px] bg-fuchsia-600/20 -top-40 -right-40" />
      
      <GlassCard className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">E</div>
          <h1 className="text-2xl font-outfit font-bold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Start your AI mastery journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="glass-input" placeholder="John" data-testid="register-firstname-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="glass-input" placeholder="Doe" data-testid="register-lastname-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="glass-input" placeholder="johndoe" required data-testid="register-username-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="glass-input" placeholder="john@example.com" required data-testid="register-email-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="glass-input pr-12" placeholder="Min 8 characters" required data-testid="register-password-input" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${passwordStrength}%` }} />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          <NeonButton type="submit" className="w-full" loading={loading} data-testid="register-submit-btn">Create Account</NeonButton>

          <p className="text-center text-sm text-slate-400">
            Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-fuchsia-400 font-semibold">Sign in</button>
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
      
      <GlassCard className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-outfit font-bold text-white">Password Recovery</h1>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-green-400 font-semibold mb-2">Recovery instructions sent!</p>
            <NeonButton onClick={() => navigate("/login")} variant="outline" className="w-full mt-4">Back to Login</NeonButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input" placeholder="john@example.com" required data-testid="recovery-email-input" />
            </div>
            <NeonButton type="submit" className="w-full" loading={loading}>Send Recovery Instructions</NeonButton>
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
            headers: { "X-Session-ID": sessionId }
          });
          const { user, token } = response.data;
          localStorage.setItem("equipped_token", token);
          localStorage.setItem("equipped_user", JSON.stringify(user));
          setToken(token);
          setUser(user);
          navigate("/dashboard", { replace: true });
        } catch (error) {
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
      <Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" />
    </div>
  );
};

// ==================== DASHBOARD ====================

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} onLogout={logout} onNavigate={navigate} />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-fuchsia-500/20">E</div>
              <span className="text-lg sm:text-xl font-outfit font-bold gradient-text hidden sm:block">E-Quipped AI</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Stats */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-400 animate-flame" />
                  <span className="text-sm font-bold text-orange-400">{user?.daily_streak || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
                  <Gem className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-sm font-bold text-fuchsia-400">{(user?.xp_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">Lv.{user?.current_level || 1}</span>
                </div>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button onClick={() => navigate("/dashboard")} className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white">
                  <Home className="w-4 h-4 inline mr-1" />Dashboard
                </button>
                {user?.is_admin && (
                  <button onClick={() => navigate("/admin")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5">
                    <BarChart3 className="w-4 h-4 inline mr-1" />Admin
                  </button>
                )}
                {user?.is_master && (
                  <button onClick={() => navigate("/editor")} className="px-3 py-2 rounded-lg text-sm font-medium text-fuchsia-400 hover:bg-fuchsia-500/10">
                    <Edit3 className="w-4 h-4 inline mr-1" />Editor
                  </button>
                )}
              </div>

              {/* User Avatar */}
              <div className="relative group hidden sm:block">
                <button className="w-10 h-10 bg-gradient-to-br from-flesh to-flesh-dim rounded-full flex items-center justify-center text-void font-bold shadow-lg" data-testid="user-avatar-btn">
                  {user?.avatar || "U"}
                </button>
                <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-surface border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2" data-testid="logout-btn">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-lg">
                <Menu className="w-6 h-6 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-fuchsia-600/20 via-surface to-blue-600/20 p-6 sm:p-8 mb-6 sm:mb-8 border border-white/10">
          <div className="glow-blob w-[400px] h-[400px] bg-fuchsia-600/30 -top-20 -right-20" />
          
          <div className="relative z-10">
            <p className="text-fuchsia-300 mb-2 text-sm sm:text-base">Welcome back, {user?.first_name || 'Learner'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-outfit font-bold text-white mb-4">Continue Your AI Mastery Journey</h1>
            <p className="text-slate-300 max-w-xl text-sm sm:text-base">You're making great progress! Complete the next lesson to unlock advanced techniques.</p>
            
            {/* Mobile Stats */}
            <div className="flex flex-wrap gap-3 mt-4 lg:hidden">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">{user?.daily_streak || 0} days</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
                <Gem className="w-4 h-4 text-fuchsia-400" />
                <span className="text-sm font-bold text-fuchsia-400">{(user?.xp_total || 0).toLocaleString()} XP</span>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <NeonButton onClick={() => currentLesson && navigate(`/lesson/${currentLesson.lesson_id}`)} className="animate-pulse-glow" data-testid="continue-learning-btn">
                <Play className="w-5 h-5" /> Continue Learning
              </NeonButton>
              <NeonButton variant="outline" onClick={() => navigate("/sandbox")} data-testid="open-sandbox-btn">
                <FlaskConical className="w-5 h-5" /> Open Sandbox
              </NeonButton>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Modules */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <GlassCard hover className="p-5 sm:p-6 cursor-pointer group" onClick={() => navigate("/sandbox")}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Online</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Sandbox</h3>
                <p className="text-sm text-slate-400 mb-4">Practice prompts with multiple AI models.</p>
                <div className="flex items-center text-sm text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  Launch Sandbox <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </GlassCard>

              <GlassCard hover className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <span className="text-xs text-slate-500">2,847 students</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Community</h3>
                <p className="text-sm text-slate-400 mb-4">Join discussions and share prompts.</p>
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
    <GlassCard className={`p-5 sm:p-6 ${isActive ? 'ring-2 ring-fuchsia-500' : ''} ${isLocked ? 'opacity-60' : ''}`}>
      {isActive && <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-fuchsia-500 text-white text-xs font-semibold">ACTIVE</span>}
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <Lock className="w-8 h-8 text-white" />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-fuchsia-400">MODULE {index + 1}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${progress === 100 ? 'bg-green-500/20 text-green-400' : progress > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
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
              className={`flex items-center p-2 sm:p-3 rounded-xl transition cursor-pointer ${
                lesson.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' :
                lesson.status === 'in_progress' || lesson.status === 'available' ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20' :
                'bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'
              }`}
              data-testid={`lesson-item-${lesson.lesson_id}`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0 ${
                lesson.status === 'completed' ? 'bg-green-500 text-white' :
                lesson.status === 'in_progress' || lesson.status === 'available' ? 'bg-fuchsia-500 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {lesson.status === 'completed' ? <Check className="w-4 h-4" /> : lidx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{lesson.title}</p>
                <p className={`text-xs ${lesson.status === 'completed' ? 'text-green-400' : lesson.status === 'in_progress' ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                  {lesson.status === 'completed' ? `${lesson.score || 100}%` : lesson.status === 'in_progress' ? `${lesson.progress || 0}%` : lesson.status === 'available' ? 'Ready' : 'Locked'}
                </p>
              </div>
              {(lesson.status === 'in_progress' || lesson.status === 'available') && <Play className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />}
              {lesson.status === 'locked' && <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />}
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
    <GlassCard className="p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold">Lesson {lesson.order_index}</span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold capitalize">{lesson.difficulty_level}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-outfit font-bold text-white">{lesson.title}</h2>
        </div>
        <NeonButton variant="secondary" onClick={() => navigate(`/lesson/${lesson.lesson_id}`)} className="w-full sm:w-auto" data-testid="resume-lesson-btn">
          <Play className="w-5 h-5" /> {lesson.status === 'in_progress' ? 'Resume' : 'Start'}
        </NeonButton>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <Clock className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-xs text-slate-400">Duration</p>
          <p className="font-bold text-white text-sm sm:text-base">{Math.floor(lesson.estimated_minutes / 60)}h {lesson.estimated_minutes % 60}m</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          <Trophy className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-xs text-slate-400">XP Reward</p>
          <p className="font-bold text-white text-sm sm:text-base">{lesson.xp_reward} XP</p>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
          <CheckCircle2 className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-xs text-slate-400">Prerequisites</p>
          <p className="font-bold text-white text-sm sm:text-base">{lesson.order_index === 1 ? 'None' : `Lesson ${lesson.order_index - 1}`}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-3">What You'll Learn</h3>
      <ul className="space-y-2 text-slate-300 text-sm">
        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /><span>Break large documents into manageable sections using the "Outline First" strategy</span></li>
        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /><span>Use AI to create and refine comprehensive outlines</span></li>
        <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /><span>Generate consistent, coherent long-form content</span></li>
      </ul>
    </GlassCard>
  );
};

// ==================== LESSON VIEW ====================

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-5.2");
  const [sessionId, setSessionId] = useState(null);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("equipped_token");
        const response = await axios.get(`${API}/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLesson(response.data);
        setMessages([{
          role: "assistant",
          content: `Welcome! I'm here to help you with **${response.data.title}**.\n\n🎯 **Challenge:** ${response.data.challenge_description || 'Practice your prompt engineering skills!'}\n\nUse the 4 Core Elements: Role, Task, Context, and Constraints.`,
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
    
    setMessages(prev => [...prev, { role: "user", content: inputValue, timestamp: new Date().toISOString() }]);
    const msg = inputValue;
    setInputValue("");
    setSending(true);
    
    try {
      const token = localStorage.getItem("equipped_token");
      const provider = selectedModel.includes("claude") ? "anthropic" : selectedModel.includes("gemini") ? "gemini" : "openai";
      
      const response = await axios.post(`${API}/chat`, {
        content: msg,
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
      setMessages(prev => [...prev, { role: "assistant", content: "Error occurred. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  const completeLesson = async () => {
    setCompleting(true);
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
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#D946EF', '#3B82F6', '#10B981'] });
      
      if (response.data.xp_gained) {
        updateUser({ ...user, xp_total: response.data.new_total, current_level: response.data.level });
      }
      
      // Navigate to next lesson if available
      if (response.data.next_lesson) {
        setTimeout(() => navigate(`/lesson/${response.data.next_lesson.lesson_id}`), 2000);
      } else {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      console.error("Failed to complete lesson:", error);
    } finally {
      setCompleting(false);
    }
  };

  const goToNextLesson = () => {
    if (lesson?.next_lesson) {
      navigate(`/lesson/${lesson.next_lesson.lesson_id}`);
    }
  };

  const goToPrevLesson = () => {
    if (lesson?.prev_lesson) {
      navigate(`/lesson/${lesson.prev_lesson.lesson_id}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-void flex flex-col lg:flex-row">
      {/* Lesson Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 bg-void/90 backdrop-blur-sm border-b border-white/10 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition" data-testid="back-to-dashboard-btn">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs sm:text-sm text-slate-400">{lesson?.module_title} • Lesson {lesson?.order_index}/{lesson?.total_lessons_in_module}</p>
                <h2 className="text-base sm:text-xl font-bold text-white truncate max-w-[200px] sm:max-w-none">{lesson?.title}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Mobile Sandbox Toggle */}
              <button onClick={() => setSandboxOpen(true)} className="lg:hidden px-3 py-2 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 text-sm font-medium">
                <FlaskConical className="w-4 h-4 inline mr-1" /> Sandbox
              </button>
              
              <div className="hidden sm:block w-12 h-12 relative">
                <svg className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"/>
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#D946EF" strokeWidth="3" 
                          strokeDasharray="125.6" strokeDashoffset={125.6 * (1 - (lesson?.user_progress?.progress || 25) / 100)} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-fuchsia-400">
                  {lesson?.user_progress?.progress || 25}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Objective */}
          <GlassCard className="p-4 sm:p-6 mb-6 bg-fuchsia-500/10 border-fuchsia-500/20">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-fuchsia-400" /> Learning Objective
            </h3>
            <p className="text-slate-300 text-sm sm:text-base">{lesson?.description}</p>
          </GlassCard>

          {/* Learning Objectives */}
          {lesson?.learning_objectives?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">What You'll Learn</h3>
              <ul className="space-y-2">
                {lesson.learning_objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm sm:text-base">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <h3 className="text-lg font-bold text-white mb-3">The Challenge</h3>
            <p className="text-slate-300 mb-4">{lesson?.challenge_description || lesson?.content}</p>

            <div className="rounded-xl bg-surface border border-white/10 p-4 mb-6 font-mono text-sm">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center text-green-400">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-2 text-xs">1</span>
                  Generate Outline
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                <div className="flex items-center text-blue-400">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 text-xs">2</span>
                  Refine
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                <div className="flex items-center text-fuchsia-400">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center mr-2 text-xs">3</span>
                  Write
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
              <p className="text-amber-200 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span><strong>Your Task:</strong> Use the sandbox to practice. The AI will evaluate your prompt quality.</span>
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 sm:gap-4 mb-8 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
            <div className="flex items-center flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-fuchsia-500 text-white flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-xs sm:text-sm font-medium text-fuchsia-400">Outline</span>
            </div>
            <div className="flex-1 h-px bg-slate-700 min-w-[20px]" />
            <div className="flex items-center opacity-50 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-xs sm:text-sm font-medium text-slate-500">Expand</span>
            </div>
            <div className="flex-1 h-px bg-slate-700 min-w-[20px]" />
            <div className="flex items-center opacity-50 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-xs sm:text-sm font-medium text-slate-500">Review</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-white/10">
            <NeonButton variant="ghost" onClick={goToPrevLesson} disabled={!lesson?.prev_lesson} className="order-2 sm:order-1">
              <ArrowLeft className="w-4 h-4" /> {lesson?.prev_lesson?.title || 'Previous'}
            </NeonButton>
            <NeonButton onClick={completeLesson} loading={completing} className="order-1 sm:order-2" data-testid="complete-lesson-btn">
              {lesson?.next_lesson ? 'Complete & Continue' : 'Mark Complete'} <ArrowRight className="w-4 h-4" />
            </NeonButton>
          </div>
          
          {lesson?.next_lesson && (
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <span><strong>Next:</strong> {lesson.next_lesson.title}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sandbox - Desktop */}
      <div className="hidden lg:flex w-[500px] xl:w-[600px] flex-col bg-[#0d1117] border-l border-slate-700">
        <SandboxContent 
          messages={messages} 
          inputValue={inputValue} 
          setInputValue={setInputValue}
          sending={sending}
          sendMessage={sendMessage}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          chatContainerRef={chatContainerRef}
        />
      </div>

      {/* Sandbox - Mobile Drawer */}
      <AnimatePresence>
        {sandboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSandboxOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute inset-x-0 bottom-0 h-[85vh] bg-[#0d1117] rounded-t-3xl border-t border-white/10 flex flex-col"
            >
              {/* Close Button */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="text-white font-semibold">AI Sandbox</span>
                <button onClick={() => setSandboxOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition" data-testid="close-sandbox-btn">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <SandboxContent 
                messages={messages} 
                inputValue={inputValue} 
                setInputValue={setInputValue}
                sending={sending}
                sendMessage={sendMessage}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                chatContainerRef={chatContainerRef}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SandboxContent = ({ messages, inputValue, setInputValue, sending, sendMessage, selectedModel, setSelectedModel, chatContainerRef }) => (
  <>
    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-[#161b22]">
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

    {/* Messages */}
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin" data-testid="chat-container">
      <AnimatePresence>
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={msg.role === "user" ? "flex justify-end" : ""}>
            {msg.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl bg-fuchsia-600 px-4 py-3 text-white shadow-lg">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#161b22] border-l-4 border-green-500 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-300 mb-1">AI Tutor</p>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    
                    {msg.quality_score !== undefined && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Quality:</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full max-w-24">
                          <div className={`h-full rounded-full ${msg.quality_score >= 80 ? 'bg-green-500' : msg.quality_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${msg.quality_score}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${msg.quality_score >= 80 ? 'text-green-400' : msg.quality_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{msg.quality_score}/100</span>
                      </div>
                    )}
                    
                    {msg.tips && (
                      <div className="mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-400"><Sparkles className="w-3 h-3 inline mr-1" />{msg.tips}</p>
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

    {/* Input */}
    <div className="p-4 bg-[#161b22] border-t border-slate-700">
      <div className="relative">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Role: [Who?] Task: [What?] Context: [Why?] Constraints: [How?]"
          className="w-full rounded-xl bg-[#21262d] border border-slate-700 px-4 py-3 pr-12 text-white placeholder-slate-500 font-mono text-sm resize-none focus:outline-none focus:border-fuchsia-500"
          rows={3}
          data-testid="sandbox-input"
        />
        <button onClick={sendMessage} disabled={sending || !inputValue.trim()} className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-fuchsia-500 text-white flex items-center justify-center hover:bg-fuchsia-400 transition disabled:opacity-50" data-testid="send-message-btn">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  </>
);

// ==================== STANDALONE SANDBOX ====================

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
      content: `Welcome to the AI Sandbox! 🚀\n\nI'm your AI assistant. Practice prompts and improve your skills.\n\n**4 Core Elements:**\n• **Role** - Who should I be?\n• **Task** - What to do?\n• **Context** - What's the situation?\n• **Constraints** - Any limits?`,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    
    setMessages(prev => [...prev, { role: "user", content: inputValue, timestamp: new Date().toISOString() }]);
    const msg = inputValue;
    setInputValue("");
    setSending(true);
    
    try {
      const token = localStorage.getItem("equipped_token");
      const provider = selectedModel.includes("claude") ? "anthropic" : selectedModel.includes("gemini") ? "gemini" : "openai";
      
      const response = await axios.post(`${API}/chat`, { content: msg, model: selectedModel, provider, session_id: sessionId }, {
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
      setMessages(prev => [...prev, { role: "assistant", content: "Error occurred. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <nav className="border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-xl font-outfit font-bold gradient-text hidden sm:block">AI Sandbox</span>
            </div>
            
            <div className="flex items-center gap-3">
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-white/10 text-white text-sm rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-fuchsia-500" data-testid="sandbox-model-selector">
                <option value="gpt-5.2">GPT-5.2</option>
                <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                <option value="gemini-3-flash">Gemini 3 Flash</option>
              </select>
              
              <NeonButton variant="ghost" size="sm" onClick={() => navigate("/dashboard")} data-testid="back-to-dashboard-from-sandbox">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
              </NeonButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin" data-testid="sandbox-chat-container">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={msg.role === "user" ? "flex justify-end" : ""}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-fuchsia-600 px-5 py-4 text-white shadow-lg shadow-fuchsia-500/20">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <GlassCard className="p-5 border-l-4 border-fuchsia-500">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-2">AI Assistant</p>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        
                        {msg.quality_score !== undefined && (
                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-xs text-slate-500">Score:</span>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full max-w-32">
                              <div className={`h-full rounded-full ${msg.quality_score >= 80 ? 'bg-green-500' : msg.quality_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${msg.quality_score}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${msg.quality_score >= 80 ? 'text-green-400' : msg.quality_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{msg.quality_score}/100</span>
                          </div>
                        )}
                        
                        {msg.tips && (
                          <div className="mt-3 p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                            <p className="text-xs text-fuchsia-300"><Sparkles className="w-4 h-4 inline mr-1" />{msg.tips}</p>
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

        <div className="p-4 sm:p-6 border-t border-white/10">
          <div className="relative">
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Type your prompt here..." className="w-full glass-input pr-14 resize-none font-dm text-base" rows={3} data-testid="sandbox-main-input" />
            <button onClick={sendMessage} disabled={sending || !inputValue.trim()} className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center hover:bg-fuchsia-400 transition disabled:opacity-50 shadow-lg shadow-fuchsia-500/30" data-testid="sandbox-send-btn">
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
        const response = await axios.get(`${API}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } });
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="min-h-screen bg-void">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-xl font-outfit font-bold gradient-text hidden sm:block">Admin</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button onClick={() => navigate("/dashboard")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5">
                  <Home className="w-4 h-4 inline mr-1" />Dashboard
                </button>
                <button className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white">
                  <BarChart3 className="w-4 h-4 inline mr-1" />Admin
                </button>
              </div>

              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-bold text-white">Platform Analytics</h1>
            <p className="text-slate-400 mt-1 text-sm">Real-time metrics and monitoring</p>
          </div>
          <NeonButton variant="outline" size="sm">
            <Activity className="w-4 h-4" /> Export
          </NeonButton>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <GlassCard hover className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <span className="flex items-center text-green-400 text-xs sm:text-sm font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 12%
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{analytics?.total_users?.toLocaleString() || 0}</p>
            <p className="text-xs sm:text-sm text-slate-400">Total Users</p>
          </GlassCard>

          <GlassCard hover className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <span className="flex items-center text-green-400 text-xs sm:text-sm font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 8%
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{analytics?.avg_completion_rate || 0}%</p>
            <p className="text-xs sm:text-sm text-slate-400">Completion</p>
          </GlassCard>

          <GlassCard hover className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">4.2h</p>
            <p className="text-xs sm:text-sm text-slate-400">Avg Time</p>
          </GlassCard>

          <GlassCard hover className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <span className="flex items-center text-green-400 text-xs sm:text-sm font-semibold">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 24%
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{(analytics?.sandbox_sessions || 0).toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-slate-400">Sessions</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <GlassCard className="p-5 sm:p-6">
            <h3 className="font-bold text-white mb-4">Module Completion</h3>
            <div className="space-y-4">
              {analytics?.completion_rates?.map((rate, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-300 truncate mr-2">{rate.title}</span>
                    <span className={`font-semibold flex-shrink-0 ${rate.completion_rate >= 70 ? 'text-green-400' : rate.completion_rate >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{rate.completion_rate}%</span>
                  </div>
                  <CyberProgress value={rate.completion_rate} />
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <h3 className="font-bold text-white mb-4">Daily Active Users</h3>
            <div className="h-40 sm:h-48 flex items-end gap-1">
              {analytics?.daily_users?.slice(-15).map((day, idx) => {
                const maxCount = Math.max(...(analytics.daily_users?.map(d => d.count) || [1]));
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-blue-500 to-fuchsia-500 rounded-t hover:from-blue-400 hover:to-fuchsia-400 transition-all cursor-pointer" style={{ height: `${height}%` }} title={`${day.count} users`} />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>15 days ago</span>
              <span>Today</span>
            </div>
          </GlassCard>
        </div>

        {/* Top Performers */}
        <GlassCard className="p-5 sm:p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Top Performers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics?.top_performers?.slice(0, 6).map((performer, idx) => (
              <div key={idx} className={`flex items-center p-3 rounded-xl ${idx === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-600'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate text-sm">{performer.first_name} {performer.last_name}</p>
                  <p className="text-xs text-slate-400">Level {performer.current_level}</p>
                </div>
                <span className={`font-bold text-sm ${idx === 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {performer.xp_total?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// ==================== MASTER EDITOR ====================

const CourseEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem("equipped_token");
      const response = await axios.get(`${API}/modules`, { headers: { Authorization: `Bearer ${token}` } });
      setModules(response.data);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectModule = (module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setEditData({ title: module.title, description: module.description, difficulty: module.difficulty, estimated_hours: module.estimated_hours });
  };

  const selectLesson = async (lesson) => {
    try {
      const token = localStorage.getItem("equipped_token");
      const response = await axios.get(`${API}/lessons/${lesson.lesson_id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedLesson(response.data);
      setEditData({
        title: response.data.title,
        description: response.data.description,
        content: response.data.content || "",
        difficulty_level: response.data.difficulty_level,
        estimated_minutes: response.data.estimated_minutes,
        xp_reward: response.data.xp_reward,
        learning_objectives: response.data.learning_objectives || [],
        challenge_description: response.data.challenge_description || ""
      });
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("equipped_token");
      if (selectedLesson) {
        await axios.put(`${API}/lessons/${selectedLesson.lesson_id}`, editData, { headers: { Authorization: `Bearer ${token}` } });
      } else if (selectedModule) {
        await axios.put(`${API}/modules/${selectedModule.module_id}`, editData, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchModules();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateWithAI = async (contentType) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("equipped_token");
      const prompt = contentType === 'objectives' 
        ? `Generate learning objectives for: ${editData.title}. ${editData.description}`
        : contentType === 'challenge'
        ? `Generate a practical challenge for: ${editData.title}. Context: ${editData.description}`
        : `Improve and expand this content: ${editData.content || editData.description}`;
      
      const response = await axios.post(`${API}/ai/generate-content`, {
        prompt,
        content_type: contentType,
        context: selectedModule?.title
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      const generated = response.data.generated_content;
      
      if (contentType === 'objectives') {
        try {
          const objectives = JSON.parse(generated);
          setEditData(prev => ({ ...prev, learning_objectives: objectives }));
        } catch {
          setEditData(prev => ({ ...prev, learning_objectives: [generated] }));
        }
      } else if (contentType === 'challenge') {
        try {
          const parsed = JSON.parse(generated);
          setEditData(prev => ({ ...prev, challenge_description: parsed.challenge_description || generated }));
        } catch {
          setEditData(prev => ({ ...prev, challenge_description: generated }));
        }
      } else {
        setEditData(prev => ({ ...prev, content: generated }));
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="min-h-screen bg-void">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-xl font-outfit font-bold gradient-text hidden sm:block">Course Editor</span>
              <span className="px-2 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold">MASTER</span>
            </div>

            <div className="flex items-center gap-3">
              <NeonButton variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" /> Back
              </NeonButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <GlassCard className="p-4">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-fuchsia-400" /> Modules
              </h3>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.module_id}>
                    <button
                      onClick={() => selectModule(module)}
                      className={`w-full text-left p-3 rounded-xl transition ${selectedModule?.module_id === module.module_id ? 'bg-fuchsia-500/20 border border-fuchsia-500/30' : 'hover:bg-white/5'}`}
                    >
                      <p className="font-semibold text-white text-sm truncate">{module.title}</p>
                      <p className="text-xs text-slate-400">{module.lessons?.length || 0} lessons</p>
                    </button>
                    
                    {selectedModule?.module_id === module.module_id && module.lessons && (
                      <div className="ml-4 mt-2 space-y-1">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.lesson_id}
                            onClick={() => selectLesson(lesson)}
                            className={`w-full text-left p-2 rounded-lg text-sm transition ${selectedLesson?.lesson_id === lesson.lesson_id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                          >
                            {lesson.order_index}. {lesson.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Editor */}
          <div className="lg:col-span-9">
            {selectedLesson ? (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs text-fuchsia-400 font-semibold">EDITING LESSON</span>
                    <h2 className="text-xl font-bold text-white">{selectedLesson.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <NeonButton variant="ghost" size="sm" onClick={() => setSelectedLesson(null)}>
                      <X className="w-4 h-4" />
                    </NeonButton>
                    <NeonButton size="sm" onClick={saveChanges} loading={saving}>
                      <Save className="w-4 h-4" /> Update
                    </NeonButton>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                      <input type="text" value={editData.title || ""} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} className="glass-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                      <select value={editData.difficulty_level || ""} onChange={(e) => setEditData(prev => ({ ...prev, difficulty_level: e.target.value }))} className="glass-input">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea value={editData.description || ""} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} className="glass-input" rows={2} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">Content</label>
                      <button onClick={() => generateWithAI('content')} disabled={generating} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> {generating ? 'Generating...' : 'Enhance with AI'}
                      </button>
                    </div>
                    <textarea value={editData.content || ""} onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))} className="glass-input font-mono text-sm" rows={6} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">Learning Objectives</label>
                      <button onClick={() => generateWithAI('objectives')} disabled={generating} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> Generate with AI
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editData.learning_objectives || []).map((obj, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input type="text" value={obj} onChange={(e) => {
                            const newObj = [...(editData.learning_objectives || [])];
                            newObj[idx] = e.target.value;
                            setEditData(prev => ({ ...prev, learning_objectives: newObj }));
                          }} className="glass-input flex-1" />
                          <button onClick={() => {
                            const newObj = editData.learning_objectives.filter((_, i) => i !== idx);
                            setEditData(prev => ({ ...prev, learning_objectives: newObj }));
                          }} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setEditData(prev => ({ ...prev, learning_objectives: [...(prev.learning_objectives || []), ""] }))} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add Objective
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">Challenge Description</label>
                      <button onClick={() => generateWithAI('challenge')} disabled={generating} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" /> Generate with AI
                      </button>
                    </div>
                    <textarea value={editData.challenge_description || ""} onChange={(e) => setEditData(prev => ({ ...prev, challenge_description: e.target.value }))} className="glass-input" rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                      <input type="number" value={editData.estimated_minutes || ""} onChange={(e) => setEditData(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">XP Reward</label>
                      <input type="number" value={editData.xp_reward || ""} onChange={(e) => setEditData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : selectedModule ? (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs text-fuchsia-400 font-semibold">EDITING MODULE</span>
                    <h2 className="text-xl font-bold text-white">{selectedModule.title}</h2>
                  </div>
                  <NeonButton size="sm" onClick={saveChanges} loading={saving}>
                    <Save className="w-4 h-4" /> Update
                  </NeonButton>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input type="text" value={editData.title || ""} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} className="glass-input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea value={editData.description || ""} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} className="glass-input" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                      <select value={editData.difficulty || ""} onChange={(e) => setEditData(prev => ({ ...prev, difficulty: e.target.value }))} className="glass-input">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Est. Hours</label>
                      <input type="number" value={editData.estimated_hours || ""} onChange={(e) => setEditData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) }))} className="glass-input" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center">
                <Edit3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Select Content to Edit</h3>
                <p className="text-slate-400">Choose a module or lesson from the sidebar to start editing.</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== PROTECTED ROUTE ====================

const ProtectedRoute = ({ children, adminOnly = false, masterOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-void"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (adminOnly && !user.is_admin) return <Navigate to="/dashboard" replace />;
  
  if (masterOnly && !user.is_master) return <Navigate to="/dashboard" replace />;

  return children;
};

// ==================== APP ROUTER ====================

const AppRouter = () => {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) return <AuthCallback />;

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
      <Route path="/editor" element={<ProtectedRoute masterOnly><CourseEditor /></ProtectedRoute>} />
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
          <div className="noise-overlay" />
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
