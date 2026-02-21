import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import axios from "axios";
import confetti from "canvas-confetti";
import {
  ArrowLeft, Save, Plus, Trash2, Wand2, X, ChevronDown, ChevronUp,
  GripVertical, Edit3, BookOpen, FileText, Image, Video, Music,
  Code, AlertCircle, Info, Lightbulb, MessageSquare, Type, Heading1,
  Heading2, Loader2, Check, Upload, Link, Play, Eye, EyeOff,
  MoreVertical, Copy, Move, Layers, Settings, RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ==================== UI COMPONENTS ====================

const GlassCard = ({ children, className = "", ...props }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl ${className}`} {...props}>
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const NeonButton = ({ children, variant = "primary", size = "default", loading = false, className = "", ...props }) => {
  const base = "relative flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-sm", default: "px-4 py-2", lg: "px-6 py-3" };
  const variants = {
    primary: "rounded-xl bg-fuchsia-600 text-white hover:bg-fuchsia-500",
    secondary: "rounded-xl bg-blue-600 text-white hover:bg-blue-500",
    ghost: "rounded-xl text-slate-300 hover:bg-white/10",
    danger: "rounded-xl bg-red-600 text-white hover:bg-red-500",
    success: "rounded-xl bg-green-600 text-white hover:bg-green-500",
    outline: "rounded-xl border border-white/20 text-white hover:bg-white/10"
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// ==================== BLOCK TYPE DEFINITIONS ====================

const BLOCK_TYPES = [
  { type: "heading", icon: Heading1, label: "Heading", category: "text" },
  { type: "text", icon: Type, label: "Text", category: "text" },
  { type: "image", icon: Image, label: "Image", category: "media" },
  { type: "video", icon: Video, label: "Video", category: "media" },
  { type: "audio", icon: Music, label: "Audio", category: "media" },
  { type: "code", icon: Code, label: "Code Block", category: "content" },
  { type: "callout", icon: Info, label: "Callout Box", category: "content" },
  { type: "divider", icon: MoreVertical, label: "Divider", category: "layout" }
];

const SECTION_TYPES = [
  { type: "intro", label: "Introduction", icon: BookOpen, color: "blue" },
  { type: "content", label: "Main Content", icon: FileText, color: "fuchsia" },
  { type: "challenge", label: "Challenge", icon: Lightbulb, color: "amber" },
  { type: "quiz", label: "Quiz", icon: MessageSquare, color: "green" },
  { type: "custom", label: "Custom Section", icon: Layers, color: "slate" }
];

const CALLOUT_TYPES = [
  { type: "info", label: "Info", icon: Info, color: "blue" },
  { type: "tip", label: "Tip", icon: Lightbulb, color: "green" },
  { type: "warning", label: "Warning", icon: AlertCircle, color: "amber" },
  { type: "note", label: "Note", icon: MessageSquare, color: "purple" }
];

// ==================== CONTENT BLOCK COMPONENT ====================

const ContentBlockEditor = ({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [expanded, setExpanded] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", block.type === "image" ? "image" : block.type === "video" ? "video" : "audio");

    try {
      const response = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onChange({ ...block, url: response.data.url, caption: file.name });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const blockIcon = BLOCK_TYPES.find(b => b.type === block.type)?.icon || FileText;
  const BlockIcon = blockIcon;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
      {/* Block Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/10">
        <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
        <BlockIcon className="w-4 h-4 text-fuchsia-400" />
        <span className="text-sm font-medium text-slate-300 capitalize">{block.type}</span>
        <div className="flex-1" />
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-white/10 rounded">
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4 text-slate-400" /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4 text-slate-400" /></button>
          <button onClick={onDelete} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Block Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-3">
              {/* TEXT BLOCK */}
              {block.type === "text" && (
                <textarea
                  value={block.content || ""}
                  onChange={(e) => onChange({ ...block, content: e.target.value })}
                  placeholder="Enter text content..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 resize-none min-h-[100px] focus:outline-none focus:border-fuchsia-500"
                />
              )}

              {/* HEADING BLOCK */}
              {block.type === "heading" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={block.level || 2}
                      onChange={(e) => onChange({ ...block, level: parseInt(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value={1}>H1 - Large</option>
                      <option value={2}>H2 - Medium</option>
                      <option value={3}>H3 - Small</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={block.content || ""}
                    onChange={(e) => onChange({ ...block, content: e.target.value })}
                    placeholder="Heading text..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              )}

              {/* IMAGE/VIDEO/AUDIO BLOCK */}
              {["image", "video", "audio"].includes(block.type) && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"
                      accept={block.type === "image" ? "image/*" : block.type === "video" ? "video/*" : "audio/*"} />
                    <NeonButton size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload
                    </NeonButton>
                    <span className="text-slate-400 text-sm self-center">or</span>
                    <input
                      type="url"
                      value={block.url || ""}
                      onChange={(e) => onChange({ ...block, url: e.target.value })}
                      placeholder="Paste URL..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  {block.url && (
                    <div className="rounded-lg overflow-hidden bg-black/20">
                      {block.type === "image" && <img src={block.url.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${block.url}` : block.url} alt={block.alt_text || ""} className="max-h-48 mx-auto" />}
                      {block.type === "video" && <video src={block.url.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${block.url}` : block.url} controls className="max-h-48 mx-auto" />}
                      {block.type === "audio" && <audio src={block.url.startsWith("/") ? `${process.env.REACT_APP_BACKEND_URL}${block.url}` : block.url} controls className="w-full" />}
                    </div>
                  )}
                  <input
                    type="text"
                    value={block.caption || ""}
                    onChange={(e) => onChange({ ...block, caption: e.target.value })}
                    placeholder="Caption (optional)..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                  {block.type === "image" && (
                    <input
                      type="text"
                      value={block.alt_text || ""}
                      onChange={(e) => onChange({ ...block, alt_text: e.target.value })}
                      placeholder="Alt text for accessibility..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-fuchsia-500"
                    />
                  )}
                </div>
              )}

              {/* CODE BLOCK */}
              {block.type === "code" && (
                <div className="space-y-2">
                  <select
                    value={block.language || "python"}
                    onChange={(e) => onChange({ ...block, language: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="json">JSON</option>
                    <option value="bash">Bash</option>
                    <option value="sql">SQL</option>
                  </select>
                  <textarea
                    value={block.content || ""}
                    onChange={(e) => onChange({ ...block, content: e.target.value })}
                    placeholder="// Your code here..."
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-4 py-3 text-green-400 font-mono text-sm resize-none min-h-[120px] focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              )}

              {/* CALLOUT BLOCK */}
              {block.type === "callout" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {CALLOUT_TYPES.map((ct) => (
                      <button
                        key={ct.type}
                        onClick={() => onChange({ ...block, callout_type: ct.type })}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                          block.callout_type === ct.type
                            ? `bg-${ct.color}-500/20 text-${ct.color}-400 border border-${ct.color}-500/30`
                            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <ct.icon className="w-4 h-4" />
                        {ct.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={block.content || ""}
                    onChange={(e) => onChange({ ...block, content: e.target.value })}
                    placeholder="Callout content..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 resize-none min-h-[80px] focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              )}

              {/* DIVIDER BLOCK */}
              {block.type === "divider" && (
                <div className="py-2">
                  <div className="border-t border-white/20" />
                  <p className="text-xs text-slate-500 text-center mt-2">Visual divider</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== SECTION EDITOR COMPONENT ====================

const SectionEditor = ({ section, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const sectionType = SECTION_TYPES.find(s => s.type === section.type) || SECTION_TYPES[4];
  const SectionIcon = sectionType.icon;

  const addBlock = (type) => {
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content: "",
      order_index: section.blocks?.length || 0
    };
    onChange({
      ...section,
      blocks: [...(section.blocks || []), newBlock]
    });
    setShowBlockMenu(false);
  };

  const updateBlock = (blockId, updates) => {
    onChange({
      ...section,
      blocks: section.blocks.map(b => b.id === blockId ? updates : b)
    });
  };

  const deleteBlock = (blockId) => {
    onChange({
      ...section,
      blocks: section.blocks.filter(b => b.id !== blockId)
    });
  };

  const moveBlock = (blockId, direction) => {
    const blocks = [...section.blocks];
    const index = blocks.findIndex(b => b.id === blockId);
    if ((direction === "up" && index === 0) || (direction === "down" && index === blocks.length - 1)) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    onChange({ ...section, blocks });
  };

  return (
    <GlassCard className="overflow-hidden">
      {/* Section Header */}
      <div className={`flex items-center gap-3 px-4 py-3 bg-${sectionType.color}-500/10 border-b border-white/10`}>
        <GripVertical className="w-5 h-5 text-slate-500 cursor-grab" />
        <SectionIcon className={`w-5 h-5 text-${sectionType.color}-400`} />
        <input
          type="text"
          value={section.title || ""}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          placeholder="Section title..."
          className="flex-1 bg-transparent text-white font-semibold placeholder-slate-500 focus:outline-none"
        />
        <select
          value={section.type}
          onChange={(e) => onChange({ ...section, type: e.target.value })}
          className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
        >
          {SECTION_TYPES.map(st => (
            <option key={st.type} value={st.type}>{st.label}</option>
          ))}
        </select>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/10 rounded">
          {collapsed ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronUp className="w-5 h-5 text-slate-400" />}
        </button>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><ChevronUp className="w-4 h-4 text-slate-400" /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 hover:bg-white/10 rounded disabled:opacity-30"><ChevronDown className="w-4 h-4 text-slate-400" /></button>
          <button onClick={onDelete} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-3">
              {/* Blocks */}
              {section.blocks?.map((block, idx) => (
                <ContentBlockEditor
                  key={block.id}
                  block={block}
                  onChange={(updated) => updateBlock(block.id, updated)}
                  onDelete={() => deleteBlock(block.id)}
                  onMoveUp={() => moveBlock(block.id, "up")}
                  onMoveDown={() => moveBlock(block.id, "down")}
                  isFirst={idx === 0}
                  isLast={idx === section.blocks.length - 1}
                />
              ))}

              {/* Add Block Button */}
              <div className="relative">
                <button
                  onClick={() => setShowBlockMenu(!showBlockMenu)}
                  className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-slate-400 hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Block
                </button>

                {/* Block Type Menu */}
                <AnimatePresence>
                  {showBlockMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-2 grid grid-cols-4 gap-2">
                        {BLOCK_TYPES.map((bt) => (
                          <button
                            key={bt.type}
                            onClick={() => addBlock(bt.type)}
                            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/10 transition"
                          >
                            <bt.icon className="w-5 h-5 text-fuchsia-400" />
                            <span className="text-xs text-slate-300">{bt.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// ==================== MAIN COURSE EDITOR COMPONENT ====================

const CourseEditorEnhanced = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState("module"); // module, lesson
  const [showNewModuleModal, setShowNewModuleModal] = useState(false);
  const [showNewLessonModal, setShowNewLessonModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", difficulty: "Beginner", estimated_hours: 8 });
  const [lessonForm, setLessonForm] = useState({
    title: "", description: "", content: "", difficulty_level: "beginner",
    estimated_minutes: 30, xp_reward: 100, learning_objectives: [], challenge_description: "", sections: []
  });

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${API}/modules`);
      setModules(response.data);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== MODULE CRUD ====================

  const createModule = async () => {
    setSaving(true);
    try {
      const data = {
        ...moduleForm,
        slug: moduleForm.title.toLowerCase().replace(/\s+/g, "-"),
        order_index: modules.length + 1,
        is_published: true
      };
      await axios.post(`${API}/modules`, data);
      await fetchModules();
      setShowNewModuleModal(false);
      setModuleForm({ title: "", description: "", difficulty: "Beginner", estimated_hours: 8 });
      confetti({ particleCount: 50, spread: 60 });
    } catch (error) {
      console.error("Failed to create module:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateModule = async () => {
    if (!selectedModule) return;
    setSaving(true);
    try {
      await axios.put(`${API}/modules/${selectedModule.module_id}`, moduleForm);
      await fetchModules();
      confetti({ particleCount: 30, spread: 40 });
    } catch (error) {
      console.error("Failed to update module:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (moduleId) => {
    setSaving(true);
    try {
      await axios.delete(`${API}/modules/${moduleId}`);
      await fetchModules();
      setSelectedModule(null);
      setSelectedLesson(null);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete module:", error);
    } finally {
      setSaving(false);
    }
  };

  const selectModule = (module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setEditMode("module");
    setModuleForm({
      title: module.title,
      description: module.description,
      difficulty: module.difficulty,
      estimated_hours: module.estimated_hours
    });
  };

  // ==================== LESSON CRUD ====================

  const createLesson = async () => {
    if (!selectedModule) return;
    setSaving(true);
    try {
      const data = {
        ...lessonForm,
        module_id: selectedModule.module_id,
        slug: lessonForm.title.toLowerCase().replace(/\s+/g, "-"),
        order_index: (selectedModule.lessons?.length || 0) + 1
      };
      await axios.post(`${API}/lessons`, data);
      await fetchModules();
      setShowNewLessonModal(false);
      setLessonForm({
        title: "", description: "", content: "", difficulty_level: "beginner",
        estimated_minutes: 30, xp_reward: 100, learning_objectives: [], challenge_description: "", sections: []
      });
      confetti({ particleCount: 50, spread: 60 });
    } catch (error) {
      console.error("Failed to create lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateLesson = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      await axios.put(`${API}/lessons/${selectedLesson.lesson_id}`, lessonForm);
      await fetchModules();
      confetti({ particleCount: 30, spread: 40 });
    } catch (error) {
      console.error("Failed to update lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    setSaving(true);
    try {
      await axios.delete(`${API}/lessons/${lessonId}`);
      await fetchModules();
      setSelectedLesson(null);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  const selectLesson = async (lesson) => {
    try {
      const response = await axios.get(`${API}/lessons/${lesson.lesson_id}`);
      const data = response.data;
      setSelectedLesson(data);
      setEditMode("lesson");
      setLessonForm({
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
        difficulty_level: data.difficulty_level || "beginner",
        estimated_minutes: data.estimated_minutes || 30,
        xp_reward: data.xp_reward || 100,
        learning_objectives: data.learning_objectives || [],
        challenge_description: data.challenge_description || "",
        sections: data.sections || []
      });
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    }
  };

  // ==================== SECTION HELPERS ====================

  const addSection = (type = "custom") => {
    const newSection = {
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: SECTION_TYPES.find(s => s.type === type)?.label || "New Section",
      type,
      blocks: [],
      order_index: lessonForm.sections.length
    };
    setLessonForm(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSection = (sectionId, updates) => {
    setLessonForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? updates : s)
    }));
  };

  const deleteSection = (sectionId) => {
    setLessonForm(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  const moveSection = (sectionId, direction) => {
    const sections = [...lessonForm.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    if ((direction === "up" && index === 0) || (direction === "down" && index === sections.length - 1)) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    setLessonForm(prev => ({ ...prev, sections }));
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <Loader2 className="w-12 h-12 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-blue-500 bg-clip-text text-transparent hidden sm:block">Course Editor</span>
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
          <div className="lg:col-span-3 space-y-4">
            {/* Modules List */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-fuchsia-400" /> Modules
                </h3>
                <NeonButton size="sm" variant="ghost" onClick={() => setShowNewModuleModal(true)}>
                  <Plus className="w-4 h-4" />
                </NeonButton>
              </div>
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.module_id}>
                    <div
                      onClick={() => selectModule(module)}
                      className={`w-full text-left p-3 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                        selectedModule?.module_id === module.module_id
                          ? "bg-fuchsia-500/20 border border-fuchsia-500/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{module.title}</p>
                        <p className="text-xs text-slate-400">{module.lessons?.length || 0} lessons</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: "module", id: module.module_id, title: module.title }); }}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded text-red-400 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Lessons within module */}
                    {selectedModule?.module_id === module.module_id && module.lessons && (
                      <div className="ml-4 mt-2 space-y-1">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.lesson_id}
                            onClick={() => selectLesson(lesson)}
                            className={`w-full text-left p-2 rounded-lg text-sm transition cursor-pointer flex items-center justify-between group ${
                              selectedLesson?.lesson_id === lesson.lesson_id
                                ? "bg-blue-500/20 text-blue-400"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span className="truncate">{lesson.order_index}. {lesson.title}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: "lesson", id: lesson.lesson_id, title: lesson.title }); }}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded text-red-400 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setShowNewLessonModal(true)}
                          className="w-full text-left p-2 rounded-lg text-sm text-fuchsia-400 hover:bg-fuchsia-500/10 transition flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Lesson
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-9 space-y-4">
            {editMode === "lesson" && selectedLesson ? (
              <>
                {/* Lesson Header */}
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-xs text-fuchsia-400 font-semibold">EDITING LESSON</span>
                      <h2 className="text-xl font-bold text-white">{selectedLesson.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <NeonButton variant="ghost" size="sm" onClick={() => { setSelectedLesson(null); setEditMode("module"); }}>
                        <X className="w-4 h-4" />
                      </NeonButton>
                      <NeonButton size="sm" onClick={updateLesson} loading={saving}>
                        <Save className="w-4 h-4" /> Save
                      </NeonButton>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                      <select
                        value={lessonForm.difficulty_level}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, difficulty_level: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white resize-none focus:outline-none focus:border-fuchsia-500"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={lessonForm.estimated_minutes}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">XP Reward</label>
                      <input
                        type="number"
                        value={lessonForm.xp_reward}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                  </div>
                </GlassCard>

                {/* Rich Content Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-fuchsia-400" /> Content Sections
                    </h3>
                    <div className="flex items-center gap-2">
                      {SECTION_TYPES.slice(0, 4).map(st => (
                        <NeonButton key={st.type} size="sm" variant="outline" onClick={() => addSection(st.type)}>
                          <st.icon className="w-4 h-4" /> {st.label}
                        </NeonButton>
                      ))}
                    </div>
                  </div>

                  {lessonForm.sections.map((section, idx) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      onChange={(updated) => updateSection(section.id, updated)}
                      onDelete={() => deleteSection(section.id)}
                      onMoveUp={() => moveSection(section.id, "up")}
                      onMoveDown={() => moveSection(section.id, "down")}
                      isFirst={idx === 0}
                      isLast={idx === lessonForm.sections.length - 1}
                    />
                  ))}

                  {lessonForm.sections.length === 0 && (
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                      <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 mb-4">No sections yet. Add a section to start building your lesson.</p>
                      <NeonButton variant="outline" onClick={() => addSection("intro")}>
                        <Plus className="w-4 h-4" /> Add First Section
                      </NeonButton>
                    </div>
                  )}
                </div>
              </>
            ) : selectedModule ? (
              /* Module Editor */
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs text-fuchsia-400 font-semibold">EDITING MODULE</span>
                    <h2 className="text-xl font-bold text-white">{selectedModule.title}</h2>
                  </div>
                  <NeonButton size="sm" onClick={updateModule} loading={saving}>
                    <Save className="w-4 h-4" /> Save
                  </NeonButton>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white resize-none focus:outline-none focus:border-fuchsia-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                      <select
                        value={moduleForm.difficulty}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Hours</label>
                      <input
                        type="number"
                        value={moduleForm.estimated_hours}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ) : (
              /* Empty State */
              <GlassCard className="p-12 text-center">
                <Edit3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Select Content to Edit</h3>
                <p className="text-slate-400 mb-6">Choose a module or lesson from the sidebar, or create new content.</p>
                <NeonButton onClick={() => setShowNewModuleModal(true)}>
                  <Plus className="w-5 h-5" /> Create New Module
                </NeonButton>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* New Module Modal */}
      <AnimatePresence>
        {showNewModuleModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Create New Module</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., AI Fundamentals"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What will students learn?"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-fuchsia-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                      <select
                        value={moduleForm.difficulty}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Est. Hours</label>
                      <input
                        type="number"
                        value={moduleForm.estimated_hours}
                        onChange={(e) => setModuleForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 8 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <NeonButton variant="ghost" onClick={() => setShowNewModuleModal(false)}>Cancel</NeonButton>
                  <NeonButton onClick={createModule} loading={saving}>Create Module</NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Lesson Modal */}
      <AnimatePresence>
        {showNewLessonModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Create New Lesson</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Introduction to Prompts"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the lesson"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-fuchsia-500"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                      <select
                        value={lessonForm.difficulty_level}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, difficulty_level: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-fuchsia-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Minutes</label>
                      <input
                        type="number"
                        value={lessonForm.estimated_minutes}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, estimated_minutes: parseInt(e.target.value) || 30 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">XP</label>
                      <input
                        type="number"
                        value={lessonForm.xp_reward}
                        onChange={(e) => setLessonForm(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 100 }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <NeonButton variant="ghost" onClick={() => setShowNewLessonModal(false)}>Cancel</NeonButton>
                  <NeonButton onClick={createLesson} loading={saving}>Create Lesson</NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm">
              <GlassCard className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Delete {showDeleteConfirm.type}?</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <NeonButton variant="ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</NeonButton>
                  <NeonButton
                    variant="danger"
                    loading={saving}
                    onClick={() => showDeleteConfirm.type === "module" ? deleteModule(showDeleteConfirm.id) : deleteLesson(showDeleteConfirm.id)}
                  >
                    Delete
                  </NeonButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseEditorEnhanced;
