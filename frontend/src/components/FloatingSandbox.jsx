import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Move, Sparkles, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

/**
 * FloatingSandbox - Advanced floating panel with:
 * - Draggable positioning
 * - Resizable dimensions
 * - Transparent/Opaque toggle with color spectrum ghost outline
 * - Applied learning and quiz integration
 */
const FloatingSandbox = ({ lessonId, onClose, user }) => {
  // Position and size state
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isTransparent, setIsTransparent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Content state
  const [mode, setMode] = useState('sandbox'); // 'sandbox', 'applied', 'quiz'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-5.2');
  const [sessionId, setSessionId] = useState(null);
  
  // Applied Learning state
  const [exercise, setExercise] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  // Quiz state
  const [quiz, setQuiz] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  
  // Status
  const [lessonStatus, setLessonStatus] = useState(null);
  
  const sandboxRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Load lesson status and exercise
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get lesson status
        const statusRes = await axios.get(`${API}/lessons/${lessonId}/status`);
        setLessonStatus(statusRes.data);
        
        // Get exercise
        const exerciseRes = await axios.get(`${API}/lessons/${lessonId}/exercise`);
        setExercise(exerciseRes.data);
        
        // Get quiz
        const quizRes = await axios.get(`${API}/lessons/${lessonId}/quiz`);
        setQuiz(quizRes.data);
        
        // Set initial mode
        if (!statusRes.data.applied_learning_completed) {
          setMode('applied');
        } else if (!statusRes.data.quiz_completed) {
          setMode('quiz');
        } else {
          setMode('sandbox');
        }
      } catch (err) {
        console.error('Error loading sandbox data:', err);
      }
    };
    loadData();
  }, [lessonId]);
  
  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Dragging handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.sandbox-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
      });
    }
    if (isResizing) {
      setSize({
        width: Math.max(300, Math.min(800, e.clientX - position.x)),
        height: Math.max(400, Math.min(900, e.clientY - position.y))
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, position, size]);
  
  // Send message in sandbox
  const sendMessage = async () => {
    if (!inputValue.trim() || sending) return;
    
    const msg = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInputValue('');
    setSending(true);
    
    try {
      const provider = selectedModel.includes('claude') ? 'anthropic' : selectedModel.includes('gemini') ? 'gemini' : 'openai';
      const response = await axios.post(`${API}/chat`, {
        content: msg,
        model: selectedModel,
        provider,
        session_id: sessionId,
        lesson_id: lessonId,
        guided_mode: true
      });
      
      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        quality_score: response.data.quality_score,
        tips: response.data.tips
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };
  
  // Submit prompt for evaluation (Applied Learning)
  const submitPrompt = async () => {
    if (!inputValue.trim() || evaluating) return;
    
    setEvaluating(true);
    try {
      const response = await axios.post(`${API}/lessons/${lessonId}/evaluate-prompt`, {
        exercise_id: exercise.exercise_id,
        lesson_id: lessonId,
        prompt: inputValue
      });
      
      setEvaluation(response.data);
      
      if (response.data.passed) {
        // Refresh status
        const statusRes = await axios.get(`${API}/lessons/${lessonId}/status`);
        setLessonStatus(statusRes.data);
        setTimeout(() => setMode('quiz'), 2000);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };
  
  // Submit quiz
  const submitQuiz = async () => {
    setSubmittingQuiz(true);
    try {
      const response = await axios.post(`${API}/lessons/${lessonId}/quiz`, {
        lesson_id: lessonId,
        answers: quizAnswers
      });
      
      setQuizResult(response.data);
      
      if (response.data.passed) {
        // Refresh status
        const statusRes = await axios.get(`${API}/lessons/${lessonId}/status`);
        setLessonStatus(statusRes.data);
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      alert(err.response?.data?.detail || 'Error submitting quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };
  
  // Click handler for transparency toggle
  const handleSandboxClick = (e) => {
    // If clicking inside the sandbox, make it opaque
    if (isTransparent && sandboxRef.current && sandboxRef.current.contains(e.target)) {
      setIsTransparent(false);
    }
  };
  
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isTransparent && sandboxRef.current && !sandboxRef.current.contains(e.target)) {
        setIsTransparent(true);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTransparent]);
  
  const containerStyle = isTransparent 
    ? {
        background: 'transparent',
        borderWidth: '4px',
        borderStyle: 'solid',
        borderImage: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6, #10b981, #a855f7) 1',
        animation: 'gradient-rotate 3s linear infinite'
      }
    : {
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(217, 70, 239, 0.3)'
      };
  
  return (
    <>
      <div
        ref={sandboxRef}
        className={`fixed rounded-xl shadow-2xl transition-all duration-300 z-50 flex flex-col overflow-hidden ${isTransparent ? 'pointer-events-auto' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          ...containerStyle
        }}
        onMouseDown={handleMouseDown}
        onClick={handleSandboxClick}
      >
      {/* Header - Draggable - Only visible when opaque or as ghost outline */}
      <div 
        className={`sandbox-handle cursor-move px-4 py-3 border-b flex items-center justify-between ${
          isTransparent 
            ? 'bg-transparent border-transparent' 
            : 'bg-slate-900/90 border-white/10'
        }`}
        style={{ opacity: isTransparent ? 0.3 : 1 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${isTransparent ? 'text-fuchsia-400 opacity-60' : 'text-fuchsia-400'}`} />
          <span className={`font-bold ${isTransparent ? 'text-white opacity-60' : 'text-white'}`}>
            {mode === 'applied' && 'Applied Learning'}
            {mode === 'quiz' && 'Quiz'}
            {mode === 'sandbox' && 'AI Sandbox'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode switcher (if applicable) */}
          {lessonStatus?.applied_learning_completed && !isTransparent && (
            <button
              onClick={() => setMode(mode === 'sandbox' ? 'quiz' : 'sandbox')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <Move className="w-4 h-4 text-slate-300" />
            </button>
          )}
          
          {/* Transparency toggle */}
          {!isTransparent && (
            <button
              onClick={() => setIsTransparent(!isTransparent)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
              title="Make Transparent (Click outside to auto-hide)"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
            </button>
          )}
          
          {/* Close */}
          {!isTransparent && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <X className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>
      </div>
      
      {/* Content Area - Only visible when opaque */}
      {!isTransparent && (
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-900/95">
          {mode === 'applied' && (
            <AppliedLearningContent
              exercise={exercise}
              inputValue={inputValue}
              setInputValue={setInputValue}
              submitPrompt={submitPrompt}
              evaluating={evaluating}
              evaluation={evaluation}
              isTransparent={isTransparent}
            />
          )}
          
          {mode === 'quiz' && (
            <QuizContent
              quiz={quiz}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              submitQuiz={submitQuiz}
              submittingQuiz={submittingQuiz}
              quizResult={quizResult}
              isTransparent={isTransparent}
            />
          )}
          
          {mode === 'sandbox' && (
            <SandboxContent
              messages={messages}
              inputValue={inputValue}
              setInputValue={setInputValue}
              sendMessage={sendMessage}
              sending={sending}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              chatContainerRef={chatContainerRef}
              isTransparent={isTransparent}
            />
          )}
        </div>
      )}
      
      {/* Ghost mode helper text */}
      {isTransparent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-fuchsia-500/50">
            <p className="text-xs text-fuchsia-400 font-medium">Click to open</p>
          </div>
        </div>
      )}
      
      {/* Resize handle - Only visible when opaque */}
      {!isTransparent && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
          }}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(217, 70, 239, 0.5) 50%)'
          }}
        />
      )}
    </div>
    
    {/* CSS for gradient animation */}
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes gradient-rotate {
        0%, 100% {
          filter: hue-rotate(0deg);
        }
        50% {
          filter: hue-rotate(360deg);
        }
      }
    `}} />
  </>
  );
};

// Applied Learning Content Component
const AppliedLearningContent = ({ exercise, inputValue, setInputValue, submitPrompt, evaluating, evaluation }) => {
  if (!exercise) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">{exercise.description}</h3>
        <div className="text-sm text-slate-400 whitespace-pre-wrap mb-4">
          {exercise.instructions}
        </div>
        
        <div className="text-xs text-slate-400 mb-2">Required Elements:</div>
        <ul className="space-y-1 mb-4">
          {exercise.required_elements.map((elem, idx) => (
            <li key={idx} className="text-xs text-slate-400 flex items-start">
              <span className="mr-2">•</span>
              <span>{elem}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex-1 flex flex-col">
        <label className="text-sm font-medium text-white mb-2">Your Prompt:</label>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 p-3 rounded-lg border bg-white/5 border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none"
          placeholder="Write your prompt here..."
        />
        
        <button
          onClick={submitPrompt}
          disabled={evaluating || !inputValue.trim()}
          className="mt-3 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {evaluating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit for Evaluation
            </>
          )}
        </button>
      </div>
      
      {evaluation && (
        <div className={`mt-4 p-4 rounded-lg ${evaluation.passed ? 'bg-green-500/20 border border-green-500/50' : 'bg-amber-500/20 border border-amber-500/50'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${evaluation.passed ? 'text-green-400' : 'text-amber-400'}`}>
              Score: {evaluation.score}/100
            </span>
            {evaluation.passed && <span className="text-sm text-green-300">✓ Passed!</span>}
          </div>
          <p className={`text-sm ${evaluation.passed ? 'text-green-200' : 'text-amber-200'} mb-2`}>
            {evaluation.feedback}
          </p>
          {evaluation.suggestions && (
            <p className={`text-xs ${evaluation.passed ? 'text-green-300' : 'text-amber-300'}`}>
              💡 {evaluation.suggestions}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Quiz Content Component
const QuizContent = ({ quiz, quizAnswers, setQuizAnswers, submitQuiz, submittingQuiz, quizResult }) => {
  if (quizResult) {
    return (
      <div className="flex-1 p-4 overflow-y-auto">
        <div className={`mb-4 p-4 rounded-lg ${quizResult.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <h3 className={`text-xl font-bold ${quizResult.passed ? 'text-green-400' : 'text-red-400'} mb-2`}>
            {quizResult.passed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'}
          </h3>
          <p className={`${quizResult.passed ? 'text-green-200' : 'text-red-200'}`}>
            Score: {quizResult.score}% ({quizResult.feedback.filter(f => f.is_correct).length}/{quizResult.total})
          </p>
        </div>
        
        <div className="space-y-4">
          {quizResult.feedback.map((item, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${item.is_correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className="text-sm font-medium text-white mb-2">
                {item.is_correct ? '✓' : '✗'} {item.question}
              </p>
              <p className="text-xs text-slate-400">{item.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-4 mb-4">
        {quiz.map((question, idx) => (
          <div key={question.question_id} className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="font-medium text-white mb-3">
              {idx + 1}. {question.question}
            </p>
            <div className="space-y-2">
              {question.options.map((option, optIdx) => (
                <label key={optIdx} className={`flex items-start p-2 rounded cursor-pointer ${quizAnswers[question.question_id] === optIdx ? 'bg-fuchsia-500/20 border-fuchsia-500' : 'bg-white/5 hover:bg-white/10 border-white/10'} border`}>
                  <input
                    type="radio"
                    name={question.question_id}
                    checked={quizAnswers[question.question_id] === optIdx}
                    onChange={() => setQuizAnswers(prev => ({ ...prev, [question.question_id]: optIdx }))}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-slate-200">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={submitQuiz}
        disabled={submittingQuiz || Object.keys(quizAnswers).length < quiz.length}
        className="w-full px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submittingQuiz ? 'Submitting...' : `Submit Quiz (${Object.keys(quizAnswers).length}/${quiz.length})`}
      </button>
    </div>
  );
};

// Sandbox Content Component
const SandboxContent = ({ messages, inputValue, setInputValue, sendMessage, sending, selectedModel, setSelectedModel, chatContainerRef }) => {
  return (
    <>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-fuchsia-500/20 text-white' : 'bg-white/10 text-slate-200'} text-sm`}>
              {msg.content}
              {msg.quality_score !== undefined && (
                <div className="mt-2 pt-2 border-t border-white/20 text-xs">
                  <div className={`font-bold ${msg.quality_score >= 80 ? 'text-green-400' : msg.quality_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    Prompt Score: {msg.quality_score}/100
                  </div>
                  {msg.tips && <div className="text-slate-400">{msg.tips}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full mb-2 p-2 rounded-lg bg-white/10 border-white/10 text-white border text-sm"
        >
          <option value="gpt-5.2">GPT-5.2 (OpenAI)</option>
          <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (Anthropic)</option>
          <option value="gemini-3-flash">Gemini 3 Flash (Google)</option>
        </select>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask AI anything..."
            className="flex-1 p-3 rounded-lg bg-white/10 border-white/10 text-white placeholder-slate-400 border focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !inputValue.trim()}
            className="px-4 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingSandbox;
