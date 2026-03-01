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
  Edit3, Save, Plus, Trash2, Wand2, RefreshCw, ChevronDown,
  Shield, Camera, AlertTriangle, ToggleLeft, ToggleRight,
  UserCheck, UserX, Bell
} from "lucide-react";
import "@/App.css";
import CourseEditorEnhanced from "./CourseEditor";
import FloatingSandbox from "./components/FloatingSandbox";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/recovery', '/auth/callback'];
      if (!publicPaths.some(path => window.location.pathname.includes(path))) {
        console.log("401 error - token may be expired");
      }
    }
    return Promise.reject(error);
  }
);

// ==================== SCREENSHOT PROTECTION ====================

const useScreenshotProtection = (onAttempt) => {
  useEffect(() => {
    // Detect Print Screen key
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))) {
        e.preventDefault();
        onAttempt?.('keyboard_screenshot');
      }
      // Detect Cmd+Shift+S (screen capture on Mac)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onAttempt?.('screen_capture_shortcut');
      }
    };

    // Detect visibility change (could indicate screen recording)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User switched away - could be recording
      }
    };

    // Detect right-click (context menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Add CSS to prevent selection and drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onAttempt]);
};

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
      localStorage.removeItem("equipped_token");
      localStorage.removeItem("equipped_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

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
      await axios.post(`${API}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {}
    localStorage.removeItem("equipped_token");
    localStorage.removeItem("equipped_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("equipped_user", JSON.stringify(userData));
  };

  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(response.data);
      localStorage.setItem("equipped_user", JSON.stringify(response.data));
      return response.data;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, setToken, setUser, refreshUser }}>
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
  const sizeClasses = { sm: "px-4 py-2 text-sm", default: "px-6 py-3", lg: "px-8 py-4" };
  const variants = {
    primary: "rounded-full bg-fuchsia-600 text-white hover:bg-fuchsia-500 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.5)]",
    outline: "rounded-full border-2 border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500/10",
    secondary: "rounded-xl bg-blue-600 text-white hover:bg-blue-500",
    ghost: "rounded-xl text-slate-300 hover:bg-white/10 hover:text-white",
    danger: "rounded-xl bg-red-600 text-white hover:bg-red-500",
    success: "rounded-xl bg-green-600 text-white hover:bg-green-500"
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
    <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-blue-500 to-fuchsia-500" />
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 bg-fuchsia-400 rounded-full animate-typing" style={{ animationDelay: `${i * 0.2}s` }} />)}
  </div>
);

const TrialBanner = ({ user }) => {
  if (user?.is_verified || user?.is_admin || user?.is_master) return null;
  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-amber-300 text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span><strong>Trial Mode:</strong> Complete Lesson 1 to preview. Purchase required for full access.</span>
      </div>
    </div>
  );
};

const MobileMenu = ({ isOpen, onClose, user, onLogout, onNavigate }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }} className="absolute right-0 top-0 h-full w-72 bg-surface border-l border-white/10 p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="text-lg font-bold text-white">Menu</span>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-flesh to-flesh-dim rounded-full flex items-center justify-center text-void font-bold">{user?.avatar || "U"}</div>
            <div>
              <p className="font-semibold text-white">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-400">{user?.is_verified ? 'Full Access' : 'Trial Mode'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={() => { onNavigate("/dashboard"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-300"><Home className="w-5 h-5" /> Dashboard</button>
            <button onClick={() => { onNavigate("/sandbox"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-300"><FlaskConical className="w-5 h-5" /> AI Sandbox</button>
            {user?.is_admin && <button onClick={() => { onNavigate("/admin"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-300"><BarChart3 className="w-5 h-5" /> Admin</button>}
            {user?.is_master && <button onClick={() => { onNavigate("/editor"); onClose(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-fuchsia-400"><Edit3 className="w-5 h-5" /> Course Editor</button>}
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <button onClick={() => { onLogout(); onClose(); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400"><LogOut className="w-5 h-5" /> Logout</button>
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-fuchsia-500/30">E</motion.div>
          <h1 className="text-2xl font-outfit font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Sign in to continue your AI mastery journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input pl-12" placeholder="Enter your email" data-testid="login-email-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input pl-12 pr-12" placeholder="Enter your password" data-testid="login-password-input" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-400 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-slate-600 bg-slate-800 text-fuchsia-500" /> Remember me
            </label>
            <button type="button" onClick={() => navigate("/recovery")} className="text-fuchsia-400 hover:text-fuchsia-300 font-medium">Forgot password?</button>
          </div>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</motion.div>}
          <NeonButton type="submit" className="w-full" loading={loading} data-testid="login-submit-btn">Sign In</NeonButton>
          <p className="text-center text-sm text-slate-400">Don't have an account? <button type="button" onClick={() => navigate("/register")} className="text-fuchsia-400 font-semibold hover:text-fuchsia-300">Create account</button></p>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-center text-slate-500 mb-4">Or continue with</p>
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition" data-testid="google-login-btn">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.5c1.77 0 3.37.66 4.61 1.72l3.5-3.5A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.24 6.65l4.03 3.11Z"/><path fill="#34A853" d="M16.04 18.01A7.12 7.12 0 0 1 12 19.5a7.08 7.08 0 0 1-6.73-5.26l-4.03 3.11A12 12 0 0 0 12 24c3.03 0 5.8-1.13 7.93-2.99l-3.89-3Z"/><path fill="#4A90E2" d="M19.93 21.01A11.95 11.95 0 0 0 24 12c0-.79-.08-1.58-.22-2.36H12v4.73h6.74a5.76 5.76 0 0 1-2.7 3.63l3.89 3.01Z"/><path fill="#FBBC05" d="M5.27 14.24A7.1 7.1 0 0 1 4.5 12c0-.79.13-1.54.37-2.24L1.24 6.65A11.94 11.94 0 0 0 0 12c0 1.93.46 3.76 1.24 5.35l4.03-3.11Z"/></svg>
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
  const [formData, setFormData] = useState({ email: "", username: "", password: "", first_name: "", last_name: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "password") setPasswordStrength(Math.min(value.length * 10, 100));
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
            <div><label className="block text-sm font-medium text-slate-300 mb-1">First Name</label><input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="glass-input" placeholder="John" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label><input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="glass-input" placeholder="Doe" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1">Username</label><input type="text" name="username" value={formData.username} onChange={handleChange} className="glass-input" placeholder="johndoe" required /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="glass-input" placeholder="john@example.com" required /></div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="glass-input pr-12" placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full transition-all ${passwordStrength < 40 ? 'bg-red-500' : passwordStrength < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${passwordStrength}%` }} /></div>
          </div>
          {error && <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
          <NeonButton type="submit" className="w-full" loading={loading}>Create Account</NeonButton>
          <p className="text-center text-sm text-slate-400">Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-fuchsia-400 font-semibold">Sign in</button></p>
        </form>
      </GlassCard>
    </div>
  );
};

const RecoveryPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await axios.post(`${API}/auth/recover`, { email, method: "email" }); setSuccess(true); } catch (err) {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <GlassCard className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-outfit font-bold text-white">Password Recovery</h1>
        </div>
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-green-400" /></div>
            <p className="text-green-400 font-semibold mb-2">Recovery instructions sent!</p>
            <NeonButton onClick={() => navigate("/login")} variant="outline" className="w-full mt-4">Back to Login</NeonButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input" placeholder="john@example.com" required /></div>
            <NeonButton type="submit" className="w-full" loading={loading}>Send Recovery Instructions</NeonButton>
            <NeonButton type="button" variant="ghost" onClick={() => navigate("/login")} className="w-full"><ArrowLeft className="w-4 h-4" /> Back to Login</NeonButton>
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
        try {
          const response = await axios.get(`${API}/auth/session`, { headers: { "X-Session-ID": sessionIdMatch[1] } });
          localStorage.setItem("equipped_token", response.data.token);
          localStorage.setItem("equipped_user", JSON.stringify(response.data.user));
          setToken(response.data.token);
          setUser(response.data.user);
          navigate("/dashboard", { replace: true });
        } catch (error) { navigate("/login", { replace: true }); }
      } else { navigate("/login", { replace: true }); }
    };
    processSession();
  }, [location, navigate, setUser, setToken]);

  return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;
};

// ==================== DASHBOARD ====================

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScreenshotAttempt = useCallback(async (type) => {
    try {
      await axios.post(`${API}/security/screenshot-attempt`, { type, page: 'dashboard' });
    } catch (e) {}
  }, []);

  useScreenshotProtection(handleScreenshotAttempt);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`${API}/modules`);
        setModules(response.data);
      } catch (error) {} finally { setLoading(false); }
    };
    fetchModules();
    refreshUser();
  }, [refreshUser]);

  const currentModule = modules.find(m => m.completed_lessons < m.total_lessons) || modules[0];
  const currentLesson = currentModule?.lessons?.find(l => l.status === 'in_progress' || l.status === 'available');

  // Check if user can access content (verified or trial lesson 1 only)
  const canAccessLesson = (lesson) => {
    if (user?.is_verified || user?.is_admin || user?.is_master) return true;
    return lesson?.order_index === 1 && lesson?.module_id === modules[0]?.module_id;
  };

  return (
    <div className="min-h-screen bg-void">
      <TrialBanner user={user} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} user={user} onLogout={logout} onNavigate={navigate} />
      
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-fuchsia-500/20">E</div>
              <span className="text-lg sm:text-xl font-outfit font-bold gradient-text hidden sm:block">E-Quipped AI</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20"><Flame className="w-4 h-4 text-orange-400 animate-flame" /><span className="text-sm font-bold text-orange-400">{user?.daily_streak || 0}</span></div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20"><Gem className="w-4 h-4 text-fuchsia-400" /><span className="text-sm font-bold text-fuchsia-400">{(user?.xp_total || 0).toLocaleString()}</span></div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20"><Trophy className="w-4 h-4 text-amber-400" /><span className="text-sm font-bold text-amber-400">Lv.{user?.current_level || 1}</span></div>
              </div>
              <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                <button onClick={() => navigate("/dashboard")} className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white"><Home className="w-4 h-4 inline mr-1" />Dashboard</button>
                {user?.is_admin && <button onClick={() => navigate("/admin")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"><BarChart3 className="w-4 h-4 inline mr-1" />Admin</button>}
                {user?.is_master && <button onClick={() => navigate("/editor")} className="px-3 py-2 rounded-lg text-sm font-medium text-fuchsia-400 hover:bg-fuchsia-500/10"><Edit3 className="w-4 h-4 inline mr-1" />Editor</button>}
              </div>
              <div className="relative group hidden sm:block">
                <button className="w-10 h-10 bg-gradient-to-br from-flesh to-flesh-dim rounded-full flex items-center justify-center text-void font-bold shadow-lg">{user?.avatar || "U"}</button>
                <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-surface border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-slate-400">{user?.is_verified ? '✓ Full Access' : 'Trial Mode'}</p>
                  </div>
                  <button onClick={logout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 hover:bg-white/10 rounded-lg"><Menu className="w-6 h-6 text-slate-300" /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-fuchsia-600/20 via-surface to-blue-600/20 p-6 sm:p-8 mb-6 sm:mb-8 border border-white/10">
          <div className="glow-blob w-[400px] h-[400px] bg-fuchsia-600/30 -top-20 -right-20" />
          <div className="relative z-10">
            <p className="text-fuchsia-300 mb-2 text-sm sm:text-base">Welcome back, {user?.first_name || 'Learner'}!</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-outfit font-bold text-white mb-4">Continue Your AI Mastery Journey</h1>
            {!user?.is_verified && !user?.is_admin && !user?.is_master && (
              <p className="text-amber-300 text-sm mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Trial mode - Complete Lesson 1 to preview the course</p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <NeonButton onClick={() => currentLesson && canAccessLesson(currentLesson) && navigate(`/lesson/${currentLesson.lesson_id}`)} disabled={!canAccessLesson(currentLesson)} className={canAccessLesson(currentLesson) ? "animate-pulse-glow" : ""}><Play className="w-5 h-5" /> Continue Learning</NeonButton>
              <NeonButton variant="outline" onClick={() => navigate("/sandbox")}><FlaskConical className="w-5 h-5" /> Open Sandbox</NeonButton>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {loading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" /></div> : (
              modules.map((module, idx) => <ModuleCard key={module.module_id} module={module} index={idx} user={user} canAccessLesson={canAccessLesson} />)
            )}
          </div>
          <div className="lg:col-span-8 space-y-6">
            {currentLesson && <CurrentLessonCard lesson={currentLesson} module={currentModule} canAccess={canAccessLesson(currentLesson)} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <GlassCard hover className="p-5 sm:p-6 cursor-pointer group" onClick={() => navigate("/sandbox")}>
                <div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"><FlaskConical className="w-6 h-6 text-blue-400" /></div><span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Online</span></div>
                <h3 className="text-lg font-bold text-white mb-2">AI Sandbox</h3>
                <p className="text-sm text-slate-400 mb-4">Practice with multiple AI models.</p>
                <div className="flex items-center text-sm text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">Launch Sandbox <ChevronRight className="w-4 h-4 ml-1" /></div>
              </GlassCard>
              <GlassCard hover className="p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center"><Users className="w-6 h-6 text-fuchsia-400" /></div></div>
                <h3 className="text-lg font-bold text-white mb-2">Community</h3>
                <p className="text-sm text-slate-400 mb-4">Join discussions and share prompts.</p>
                <div className="flex items-center text-sm text-fuchsia-400 font-semibold">Coming Soon</div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, index, user, canAccessLesson }) => {
  const navigate = useNavigate();
  const isVerified = user?.is_verified || user?.is_admin || user?.is_master;
  
  // Module is locked if: not first module AND (previous module not complete OR user not verified)
  const prevModuleComplete = index === 0 || (module.completed_lessons > 0);
  const isModuleLocked = !isVerified && index > 0;
  const progress = module.total_lessons > 0 ? (module.completed_lessons / module.total_lessons) * 100 : 0;

  return (
    <GlassCard className={`p-5 sm:p-6 ${index === 0 && !isModuleLocked ? 'ring-2 ring-fuchsia-500' : ''} ${isModuleLocked ? 'opacity-60' : ''}`}>
      {index === 0 && !isModuleLocked && <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-fuchsia-500 text-white text-xs font-semibold">ACTIVE</span>}
      {isModuleLocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 p-4">
          <Lock className="w-8 h-8 text-white mb-2" />
          <p className="text-white text-sm text-center">Purchase required to unlock</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-fuchsia-400">MODULE {index + 1}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${progress === 100 ? 'bg-green-500/20 text-green-400' : progress > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>{progress === 100 ? 'Complete' : progress > 0 ? 'In Progress' : 'Not Started'}</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
      <p className="text-sm text-slate-400 mb-4">{module.description}</p>
      {!isModuleLocked && module.lessons && (
        <div className="space-y-2 mb-4">
          {module.lessons.map((lesson, lidx) => {
            const canAccess = canAccessLesson(lesson);
            const isLocked = lesson.status === 'locked' || !canAccess;
            return (
              <div key={lesson.lesson_id} onClick={() => !isLocked && navigate(`/lesson/${lesson.lesson_id}`)}
                className={`flex items-center p-2 sm:p-3 rounded-xl transition cursor-pointer ${lesson.status === 'completed' ? 'bg-green-500/10 border border-green-500/20' : !isLocked ? 'bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20' : 'bg-white/5 border border-white/5 opacity-50 cursor-not-allowed'}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0 ${lesson.status === 'completed' ? 'bg-green-500 text-white' : !isLocked ? 'bg-fuchsia-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {lesson.status === 'completed' ? <Check className="w-4 h-4" /> : lidx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{lesson.title}</p>
                  <p className={`text-xs ${lesson.status === 'completed' ? 'text-green-400' : !isLocked ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                    {lesson.status === 'completed' ? `${lesson.score || 100}%` : !isLocked ? (lesson.progress ? `${lesson.progress}%` : 'Ready') : (!canAccess ? 'Purchase Required' : 'Complete previous')}
                  </p>
                </div>
                {!isLocked && lesson.status !== 'completed' && <Play className="w-5 h-5 text-fuchsia-400 flex-shrink-0" />}
                {isLocked && <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center justify-between text-sm mb-2"><span className="text-slate-400">{module.completed_lessons}/{module.total_lessons} Lessons</span><span className="font-bold text-fuchsia-400">{Math.round(progress)}%</span></div>
      <CyberProgress value={progress} />
    </GlassCard>
  );
};

const CurrentLessonCard = ({ lesson, module, canAccess }) => {
  const navigate = useNavigate();
  return (
    <GlassCard className="p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold">Lesson {lesson.order_index}</span>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold capitalize">{lesson.difficulty_level}</span>
            {!canAccess && <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">Trial Preview</span>}
          </div>
          <h2 className="text-xl sm:text-2xl font-outfit font-bold text-white">{lesson.title}</h2>
        </div>
        <NeonButton variant="secondary" onClick={() => canAccess && navigate(`/lesson/${lesson.lesson_id}`)} disabled={!canAccess} className="w-full sm:w-auto">
          {canAccess ? <><Play className="w-5 h-5" /> {lesson.status === 'in_progress' ? 'Resume' : 'Start'}</> : <><Lock className="w-5 h-5" /> Purchase Required</>}
        </NeonButton>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10"><Clock className="w-5 h-5 text-blue-400 mb-2" /><p className="text-xs text-slate-400">Duration</p><p className="font-bold text-white text-sm sm:text-base">{Math.floor(lesson.estimated_minutes / 60)}h {lesson.estimated_minutes % 60}m</p></div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10"><Trophy className="w-5 h-5 text-amber-400 mb-2" /><p className="text-xs text-slate-400">XP Reward</p><p className="font-bold text-white text-sm sm:text-base">{lesson.xp_reward} XP</p></div>
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1"><CheckCircle2 className="w-5 h-5 text-green-400 mb-2" /><p className="text-xs text-slate-400">Prerequisites</p><p className="font-bold text-white text-sm sm:text-base">{lesson.order_index === 1 ? 'None' : `Lesson ${lesson.order_index - 1}`}</p></div>
      </div>
      <p className="text-slate-400 text-sm">{lesson.description}</p>
    </GlassCard>
  );
};

// ==================== LESSON VIEW ====================

const LessonView = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, refreshUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sandboxOpen, setSandboxOpen] = useState(true); // Start open
  const [completing, setCompleting] = useState(false);

  const handleScreenshotAttempt = useCallback(async (type) => {
    try { await axios.post(`${API}/security/screenshot-attempt`, { type, page: 'lesson', lesson_id: lessonId }); } catch (e) {}
  }, [lessonId]);

  useScreenshotProtection(handleScreenshotAttempt);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(`${API}/lessons/${lessonId}`);
        setLesson(response.data);
        
        // Check access
        const canAccess = user?.is_verified || user?.is_admin || user?.is_master || (response.data.order_index === 1 && response.data.module_id === 'mod_001');
        if (!canAccess) {
          navigate('/dashboard');
          return;
        }
      } catch (error) { navigate('/dashboard'); } finally { setLoading(false); }
    };
    fetchLesson();
  }, [lessonId, navigate, user]);

  const completeLesson = async () => {
    setCompleting(true);
    try {
      const response = await axios.post(`${API}/progress`, { lesson_id: lessonId, progress: 100, score: 95, completed: true });
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#D946EF', '#3B82F6', '#10B981'] });
      if (response.data.xp_gained) {
        const newUser = await refreshUser();
        if (newUser) updateUser(newUser);
      }
      if (response.data.next_lesson) {
        setTimeout(() => navigate(`/lesson/${response.data.next_lesson.lesson_id}`), 2000);
      } else {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {} finally { setCompleting(false); }
  };

  const renderLessonContent = () => {
    // Check if lesson has sections (rich content)
    if (lesson?.sections && lesson.sections.length > 0) {
      return (
        <div className="space-y-8">
          {lesson.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              {section.title && (
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
              )}
              {section.blocks && section.blocks.map((block, bIdx) => (
                <div key={bIdx}>
                  {block.type === 'heading' && (
                    <div className={`font-bold text-white ${block.level === 1 ? 'text-3xl' : block.level === 2 ? 'text-2xl' : block.level === 3 ? 'text-xl' : 'text-lg'}`}>
                      {block.content}
                    </div>
                  )}
                  {block.type === 'text' && (
                    <p className="text-slate-300 leading-relaxed">{block.content}</p>
                  )}
                  {block.type === 'gif' && block.url && (
                    <div className="rounded-xl overflow-hidden border border-fuchsia-500/30 bg-slate-900/50 p-4">
                      <img 
                        src={block.url} 
                        alt={block.alt_text || 'Demonstration'}
                        className="w-full rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center py-8 text-slate-400">
                        <Camera className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">GIF Placeholder</p>
                        <p className="text-xs text-slate-500 mt-1">{block.caption}</p>
                      </div>
                      {block.caption && (
                        <p className="text-sm text-slate-400 mt-2 text-center italic">{block.caption}</p>
                      )}
                    </div>
                  )}
                  {block.type === 'code' && (
                    <pre className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-green-400">{block.content}</code>
                    </pre>
                  )}
                  {block.type === 'callout' && (
                    <div className={`p-4 rounded-lg border ${
                      block.callout_type === 'tip' ? 'bg-blue-500/10 border-blue-500/30' :
                      block.callout_type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                      block.callout_type === 'note' ? 'bg-purple-500/10 border-purple-500/30' :
                      'bg-slate-500/10 border-slate-500/30'
                    }`}>
                      <p className="text-slate-200 text-sm">{block.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback to regular content
    return (
      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 whitespace-pre-wrap">{lesson?.content}</div>
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 bg-void/90 backdrop-blur-sm border-b border-white/10 z-10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <p className="text-xs sm:text-sm text-slate-400">Module {lesson?.module_id?.split('_')[1]} • Lesson {lesson?.order_index}</p>
                <h2 className="text-base sm:text-xl font-bold text-white">{lesson?.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSandboxOpen(!sandboxOpen)} 
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                <span className="hidden sm:inline">{sandboxOpen ? 'Hide' : 'Show'} Sandbox</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <GlassCard className="p-4 sm:p-6 mb-6 bg-fuchsia-500/10 border-fuchsia-500/20">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2"><Target className="w-5 h-5 text-fuchsia-400" /> Learning Objectives</h3>
            <p className="text-slate-300 text-sm sm:text-base mb-3">{lesson?.description}</p>
            {lesson?.learning_objectives?.length > 0 && (
              <ul className="space-y-2 mt-3">
                {lesson.learning_objectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <div className="mb-8">
            {renderLessonContent()}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-white/10">
            <NeonButton variant="ghost" onClick={() => lesson?.prev_lesson && navigate(`/lesson/${lesson.prev_lesson.lesson_id}`)} disabled={!lesson?.prev_lesson}>
              <ArrowLeft className="w-4 h-4" /> Previous
            </NeonButton>
            <NeonButton onClick={completeLesson} loading={completing}>
              {lesson?.next_lesson ? 'Complete & Next' : 'Complete Lesson'} <ArrowRight className="w-4 h-4" />
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

      {/* Floating Sandbox */}
      {sandboxOpen && (
        <FloatingSandbox
          lessonId={lessonId}
          onClose={() => setSandboxOpen(false)}
          user={user}
        />
      )}
    </div>
  );
};

// ==================== OTHER VIEWS ====================

// ==================== STANDALONE SANDBOX ====================

const SandboxPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-5.2");
  const [sessionId, setSessionId] = useState(null);
  const [guidedMode, setGuidedMode] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: `Welcome to the AI Sandbox! 🚀\n\nYou can chat with me in **Open Mode** for natural conversation, or switch to **Guided Mode** to practice prompt engineering with quality scoring.\n\nChoose your AI model and let's begin!`, timestamp: new Date().toISOString() }]);
  }, []);

  useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    setMessages(prev => [...prev, { role: "user", content: inputValue, timestamp: new Date().toISOString() }]);
    const msg = inputValue;
    setInputValue("");
    setSending(true);
    try {
      const provider = selectedModel.includes("claude") ? "anthropic" : selectedModel.includes("gemini") ? "gemini" : "openai";
      const response = await axios.post(`${API}/chat`, { content: msg, model: selectedModel, provider, session_id: sessionId, guided_mode: guidedMode });
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.data.response,
        quality_score: guidedMode ? response.data.quality_score : undefined,
        tips: guidedMode ? response.data.tips : undefined,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error occurred. Please try again.", timestamp: new Date().toISOString() }]);
    } finally { setSending(false); }
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
              <button onClick={() => setGuidedMode(!guidedMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${guidedMode ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                {guidedMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {guidedMode ? 'Guided Mode' : 'Open Mode'}
              </button>
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-white/10 text-white text-sm rounded-xl px-3 py-2 border border-white/10">
                <option value="gpt-5.2">GPT-5.2 (OpenAI)</option>
                <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                <option value="gemini-3-flash">Gemini 3 Flash</option>
              </select>
              <NeonButton variant="ghost" size="sm" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span></NeonButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={msg.role === "user" ? "flex justify-end" : ""}>
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl bg-fuchsia-600 px-5 py-4 text-white shadow-lg shadow-fuchsia-500/20"><p className="text-sm whitespace-pre-wrap">{msg.content}</p></div>
                ) : (
                  <GlassCard className="p-5 border-l-4 border-fuchsia-500">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-blue-500 flex items-center justify-center text-white flex-shrink-0"><Bot className="w-5 h-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white mb-2">AI Assistant</p>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        {msg.quality_score !== undefined && (
                          <div className="mt-4 flex items-center gap-3">
                            <span className="text-xs text-slate-500">Score:</span>
                            <div className="flex-1 h-2 bg-slate-700 rounded-full max-w-32"><div className={`h-full rounded-full ${msg.quality_score >= 80 ? 'bg-green-500' : msg.quality_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${msg.quality_score}%` }} /></div>
                            <span className={`text-sm font-bold ${msg.quality_score >= 80 ? 'text-green-400' : msg.quality_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{msg.quality_score}/100</span>
                          </div>
                        )}
                        {msg.tips && <div className="mt-3 p-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20"><p className="text-xs text-fuchsia-300"><Sparkles className="w-4 h-4 inline mr-1" />{msg.tips}</p></div>}
                      </div>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {sending && <GlassCard className="p-5 border-l-4 border-fuchsia-500"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-400 to-blue-500 flex items-center justify-center text-white"><Bot className="w-5 h-5" /></div><TypingIndicator /></div></GlassCard>}
        </div>
        <div className="p-4 sm:p-6 border-t border-white/10">
          <div className="relative">
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={guidedMode ? "Use the 4 Core Elements: Role, Task, Context, Constraints..." : "Chat naturally with the AI..."} className="w-full glass-input pr-14 resize-none font-dm text-base" rows={3} />
            <button onClick={sendMessage} disabled={sending || !inputValue.trim()} className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-fuchsia-500 text-white flex items-center justify-center hover:bg-fuchsia-400 disabled:opacity-50 shadow-lg shadow-fuchsia-500/30">{sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">{guidedMode ? '📊 Guided Mode: Your prompts will be analyzed and scored' : '💬 Open Mode: Natural conversation without scoring'}</p>
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [screenshotAlerts, setScreenshotAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, usersRes, alertsRes] = await Promise.all([
          axios.get(`${API}/admin/analytics`),
          axios.get(`${API}/admin/users`),
          axios.get(`${API}/admin/screenshot-alerts`).catch(() => ({ data: [] }))
        ]);
        setAnalytics(analyticsRes.data);
        setUsers(usersRes.data);
        setScreenshotAlerts(alertsRes.data || []);
      } catch (error) {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleUserVerification = async (userId, currentStatus) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/verify`, { is_verified: !currentStatus });
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_verified: !currentStatus } : u));
    } catch (error) {}
  };

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
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/dashboard")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"><Home className="w-4 h-4 inline mr-1" />Dashboard</button>
              {user?.is_master && <button onClick={() => navigate("/editor")} className="px-3 py-2 rounded-lg text-sm font-medium text-fuchsia-400 hover:bg-fuchsia-500/10"><Edit3 className="w-4 h-4 inline mr-1" />Editor</button>}
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${activeTab === 'analytics' ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><BarChart3 className="w-4 h-4 inline mr-2" />Analytics</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${activeTab === 'users' ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><Users className="w-4 h-4 inline mr-2" />User Access</button>
          <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${activeTab === 'security' ? 'bg-fuchsia-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}><Shield className="w-4 h-4 inline mr-2" />Security{screenshotAlerts.length > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 rounded-full text-xs">{screenshotAlerts.length}</span>}</button>
        </div>

        {activeTab === 'analytics' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <GlassCard hover className="p-4 sm:p-6"><div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Users className="w-5 h-5 text-blue-400" /></div></div><p className="text-2xl font-bold text-white">{analytics?.total_users?.toLocaleString() || 0}</p><p className="text-xs text-slate-400">Total Users</p></GlassCard>
              <GlassCard hover className="p-4 sm:p-6"><div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><UserCheck className="w-5 h-5 text-green-400" /></div></div><p className="text-2xl font-bold text-white">{users.filter(u => u.is_verified).length}</p><p className="text-xs text-slate-400">Verified Users</p></GlassCard>
              <GlassCard hover className="p-4 sm:p-6"><div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-400" /></div></div><p className="text-2xl font-bold text-white">{users.filter(u => !u.is_verified).length}</p><p className="text-xs text-slate-400">Trial Users</p></GlassCard>
              <GlassCard hover className="p-4 sm:p-6"><div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center"><FlaskConical className="w-5 h-5 text-fuchsia-400" /></div></div><p className="text-2xl font-bold text-white">{(analytics?.sandbox_sessions || 0).toLocaleString()}</p><p className="text-xs text-slate-400">Sandbox Sessions</p></GlassCard>
            </div>
            <GlassCard className="p-5 sm:p-6">
              <h3 className="font-bold text-white mb-4">Module Completion</h3>
              <div className="space-y-4">{analytics?.completion_rates?.map((rate, idx) => (<div key={idx}><div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-300 truncate mr-2">{rate.title}</span><span className={`font-semibold ${rate.completion_rate >= 70 ? 'text-green-400' : 'text-amber-400'}`}>{rate.completion_rate}%</span></div><CyberProgress value={rate.completion_rate} /></div>))}</div>
            </GlassCard>
          </>
        )}

        {activeTab === 'users' && (
          <GlassCard className="p-5 sm:p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-green-400" /> User Access Management</h3>
            <p className="text-slate-400 text-sm mb-4">Grant or revoke full course access. Trial users can only access Lesson 1.</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-left text-slate-400 text-sm border-b border-white/10"><th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">XP</th><th className="pb-3">Action</th></tr></thead>
                <tbody>
                  {users.filter(u => !u.is_admin && !u.is_master).map((u) => (
                    <tr key={u.user_id} className="border-b border-white/5">
                      <td className="py-3 pr-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">{u.avatar || u.first_name?.[0] || 'U'}</div><span className="text-white font-medium">{u.first_name} {u.last_name}</span></div></td>
                      <td className="py-3 pr-4 text-slate-400 text-sm">{u.email}</td>
                      <td className="py-3 pr-4">{u.is_verified ? <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Verified</span> : <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">Trial</span>}</td>
                      <td className="py-3 pr-4 text-white font-medium">{u.xp_total?.toLocaleString() || 0}</td>
                      <td className="py-3"><NeonButton size="sm" variant={u.is_verified ? "danger" : "success"} onClick={() => toggleUserVerification(u.user_id, u.is_verified)}>{u.is_verified ? <><UserX className="w-4 h-4" /> Revoke</> : <><UserCheck className="w-4 h-4" /> Grant Access</>}</NeonButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {activeTab === 'security' && (
          <GlassCard className="p-5 sm:p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-red-400" /> Screenshot/Recording Alerts</h3>
            <p className="text-slate-400 text-sm mb-4">Notifications when users attempt to screenshot or screen record.</p>
            {screenshotAlerts.length === 0 ? (
              <div className="text-center py-8"><Shield className="w-12 h-12 text-green-400 mx-auto mb-2" /><p className="text-slate-400">No screenshot attempts detected</p></div>
            ) : (
              <div className="space-y-2">{screenshotAlerts.map((alert, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div className="flex-1"><p className="text-white font-medium">{alert.user_email || 'Unknown user'}</p><p className="text-xs text-slate-400">{alert.type} on {alert.page} - {new Date(alert.timestamp).toLocaleString()}</p></div>
                </div>
              ))}</div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
};

// ==================== COURSE EDITOR ====================

const CourseEditor = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    try { const response = await axios.get(`${API}/modules`); setModules(response.data); } catch (error) {} finally { setLoading(false); }
  };

  const selectModule = (module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setEditData({ title: module.title, description: module.description, difficulty: module.difficulty, estimated_hours: module.estimated_hours });
  };

  const selectLesson = async (lesson) => {
    try {
      const response = await axios.get(`${API}/lessons/${lesson.lesson_id}`);
      setSelectedLesson(response.data);
      setEditData({
        title: response.data.title, description: response.data.description, content: response.data.content || "",
        difficulty_level: response.data.difficulty_level, estimated_minutes: response.data.estimated_minutes, xp_reward: response.data.xp_reward,
        learning_objectives: response.data.learning_objectives || [], challenge_description: response.data.challenge_description || ""
      });
    } catch (error) {}
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      if (selectedLesson) await axios.put(`${API}/lessons/${selectedLesson.lesson_id}`, editData);
      else if (selectedModule) await axios.put(`${API}/modules/${selectedModule.module_id}`, editData);
      await fetchModules();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (error) {} finally { setSaving(false); }
  };

  const generateWithAI = async (contentType) => {
    setGenerating(true);
    try {
      const prompt = contentType === 'objectives' ? `Generate learning objectives for: ${editData.title}. ${editData.description}` : contentType === 'challenge' ? `Generate a practical challenge for: ${editData.title}` : `Improve this content: ${editData.content || editData.description}`;
      const response = await axios.post(`${API}/ai/generate-content`, { prompt, content_type: contentType, context: selectedModule?.title });
      const generated = response.data.generated_content;
      if (contentType === 'objectives') {
        try { setEditData(prev => ({ ...prev, learning_objectives: JSON.parse(generated) })); } catch { setEditData(prev => ({ ...prev, learning_objectives: [generated] })); }
      } else if (contentType === 'challenge') {
        try { const parsed = JSON.parse(generated); setEditData(prev => ({ ...prev, challenge_description: parsed.challenge_description || generated })); } catch { setEditData(prev => ({ ...prev, challenge_description: generated })); }
      } else { setEditData(prev => ({ ...prev, content: generated })); }
    } catch (error) {} finally { setGenerating(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" /></div>;

  return (
    <div className="min-h-screen bg-void">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div><span className="text-xl font-outfit font-bold gradient-text hidden sm:block">Course Editor</span><span className="px-2 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold">MASTER</span></div>
            <div className="flex items-center gap-3"><NeonButton variant="ghost" size="sm" onClick={() => navigate("/dashboard")}><ArrowLeft className="w-4 h-4" /> Back</NeonButton></div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <GlassCard className="p-4">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-fuchsia-400" /> Modules</h3>
              <div className="space-y-2">{modules.map((module) => (
                <div key={module.module_id}>
                  <button onClick={() => selectModule(module)} className={`w-full text-left p-3 rounded-xl transition ${selectedModule?.module_id === module.module_id ? 'bg-fuchsia-500/20 border border-fuchsia-500/30' : 'hover:bg-white/5'}`}><p className="font-semibold text-white text-sm truncate">{module.title}</p><p className="text-xs text-slate-400">{module.lessons?.length || 0} lessons</p></button>
                  {selectedModule?.module_id === module.module_id && module.lessons && (
                    <div className="ml-4 mt-2 space-y-1">{module.lessons.map((lesson) => (<button key={lesson.lesson_id} onClick={() => selectLesson(lesson)} className={`w-full text-left p-2 rounded-lg text-sm transition ${selectedLesson?.lesson_id === lesson.lesson_id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{lesson.order_index}. {lesson.title}</button>))}</div>
                  )}
                </div>
              ))}</div>
            </GlassCard>
          </div>

          <div className="lg:col-span-9">
            {selectedLesson ? (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div><span className="text-xs text-fuchsia-400 font-semibold">EDITING LESSON</span><h2 className="text-xl font-bold text-white">{selectedLesson.title}</h2></div>
                  <div className="flex items-center gap-2"><NeonButton variant="ghost" size="sm" onClick={() => setSelectedLesson(null)}><X className="w-4 h-4" /></NeonButton><NeonButton size="sm" onClick={saveChanges} loading={saving}><Save className="w-4 h-4" /> Update</NeonButton></div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">Title</label><input type="text" value={editData.title || ""} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} className="glass-input" /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label><select value={editData.difficulty_level || ""} onChange={(e) => setEditData(prev => ({ ...prev, difficulty_level: e.target.value }))} className="glass-input"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-300 mb-2">Description</label><textarea value={editData.description || ""} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} className="glass-input" rows={2} /></div>
                  <div><div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-slate-300">Content</label><button onClick={() => generateWithAI('content')} disabled={generating} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"><Wand2 className="w-3 h-3" /> {generating ? 'Generating...' : 'Enhance with AI'}</button></div><textarea value={editData.content || ""} onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))} className="glass-input font-mono text-sm" rows={6} /></div>
                  <div><div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-slate-300">Learning Objectives</label><button onClick={() => generateWithAI('objectives')} disabled={generating} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Generate with AI</button></div>
                    <div className="space-y-2">{(editData.learning_objectives || []).map((obj, idx) => (<div key={idx} className="flex items-center gap-2"><input type="text" value={obj} onChange={(e) => { const n = [...(editData.learning_objectives || [])]; n[idx] = e.target.value; setEditData(prev => ({ ...prev, learning_objectives: n })); }} className="glass-input flex-1" /><button onClick={() => setEditData(prev => ({ ...prev, learning_objectives: editData.learning_objectives.filter((_, i) => i !== idx) }))} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button></div>))}<button onClick={() => setEditData(prev => ({ ...prev, learning_objectives: [...(prev.learning_objectives || []), ""] }))} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Objective</button></div>
                  </div>
                  <div><div className="flex items-center justify-between mb-2"><label className="block text-sm font-medium text-slate-300">Challenge Description</label><button onClick={() => generateWithAI('challenge')} disabled={generating} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1"><Wand2 className="w-3 h-3" /> Generate with AI</button></div><textarea value={editData.challenge_description || ""} onChange={(e) => setEditData(prev => ({ ...prev, challenge_description: e.target.value }))} className="glass-input" rows={3} /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label><input type="number" value={editData.estimated_minutes || ""} onChange={(e) => setEditData(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) }))} className="glass-input" /></div><div><label className="block text-sm font-medium text-slate-300 mb-2">XP Reward</label><input type="number" value={editData.xp_reward || ""} onChange={(e) => setEditData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) }))} className="glass-input" /></div></div>
                </div>
              </GlassCard>
            ) : selectedModule ? (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6"><div><span className="text-xs text-fuchsia-400 font-semibold">EDITING MODULE</span><h2 className="text-xl font-bold text-white">{selectedModule.title}</h2></div><NeonButton size="sm" onClick={saveChanges} loading={saving}><Save className="w-4 h-4" /> Update</NeonButton></div>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-300 mb-2">Title</label><input type="text" value={editData.title || ""} onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))} className="glass-input" /></div>
                  <div><label className="block text-sm font-medium text-slate-300 mb-2">Description</label><textarea value={editData.description || ""} onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))} className="glass-input" rows={3} /></div>
                  <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label><select value={editData.difficulty || ""} onChange={(e) => setEditData(prev => ({ ...prev, difficulty: e.target.value }))} className="glass-input"><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div><div><label className="block text-sm font-medium text-slate-300 mb-2">Est. Hours</label><input type="number" value={editData.estimated_hours || ""} onChange={(e) => setEditData(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) }))} className="glass-input" /></div></div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-12 text-center"><Edit3 className="w-16 h-16 text-slate-600 mx-auto mb-4" /><h3 className="text-xl font-bold text-white mb-2">Select Content to Edit</h3><p className="text-slate-400">Choose a module or lesson from the sidebar.</p></GlassCard>
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
      <Route path="/editor" element={<ProtectedRoute masterOnly><CourseEditorEnhanced /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App relative">
          <div className="noise-overlay" />
          <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="glow-blob w-[800px] h-[800px] bg-fuchsia-600/10 -top-96 -right-96" /><div className="glow-blob w-[600px] h-[600px] bg-blue-600/10 -bottom-72 -left-72" /></div>
          <AppRouter />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
