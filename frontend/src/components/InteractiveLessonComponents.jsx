import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X, Lightbulb, AlertTriangle, Info, Sparkles } from 'lucide-react';

/**
 * Interactive Accordion Component
 */
export const Accordion = ({ title, children, defaultOpen = false, variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const variants = {
    default: 'bg-slate-800/80 border-slate-600',
    primary: 'bg-fuchsia-900/30 border-fuchsia-500/50',
    success: 'bg-green-900/30 border-green-500/50',
    warning: 'bg-amber-900/30 border-amber-500/50',
    info: 'bg-blue-900/30 border-blue-500/50'
  };
  
  return (
    <div className={`rounded-xl border-2 ${variants[variant]} overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/10 transition"
      >
        <span className="font-semibold text-white text-base">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-slate-200 transition-transform" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-200 transition-transform" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t-2 border-white/20 text-slate-100 text-base space-y-2 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Tabbed Content Component
 */
export const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="rounded-xl border-2 border-slate-600 overflow-hidden bg-slate-800/50">
      <div className="flex border-b-2 border-slate-600 bg-slate-900/80">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === idx
                ? 'bg-fuchsia-600/90 text-white border-b-4 border-fuchsia-400'
                : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 text-slate-100 text-base leading-relaxed">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

/**
 * Collapsible Callout Component
 */
export const Callout = ({ type = 'info', title, children, collapsible = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const types = {
    tip: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: <Lightbulb className="w-5 h-5 text-blue-400" />,
      textColor: 'text-blue-200'
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      textColor: 'text-amber-200'
    },
    info: {
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/30',
      icon: <Info className="w-5 h-5 text-slate-400" />,
      textColor: 'text-slate-200'
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: <Check className="w-5 h-5 text-green-400" />,
      textColor: 'text-green-200'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: <X className="w-5 h-5 text-red-400" />,
      textColor: 'text-red-200'
    }
  };
  
  const style = types[type];
  
  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`}>
      <div
        className={`px-4 py-3 flex items-center gap-3 ${collapsible ? 'cursor-pointer hover:bg-white/5' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        {style.icon}
        <span className={`font-medium ${style.textColor} flex-1`}>{title}</span>
        {collapsible && (
          isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </div>
      {(!collapsible || isOpen) && (
        <div className={`px-4 py-3 ${title ? 'border-t border-white/10' : ''} text-sm ${style.textColor}`}>
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Interactive Challenge Box
 */
export const ChallengeBox = ({ title, description, tasks, onComplete }) => {
  const [completedTasks, setCompletedTasks] = useState([]);
  
  const toggleTask = (taskId) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
      if (completedTasks.length + 1 === tasks.length && onComplete) {
        setTimeout(() => onComplete(), 500);
      }
    }
  };
  
  const progress = (completedTasks.length / tasks.length) * 100;
  
  return (
    <div className="rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-fuchsia-500/30 bg-fuchsia-500/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-fuchsia-400" />
          <span className="font-bold text-fuchsia-400">{title}</span>
        </div>
        {description && <p className="text-sm text-slate-300">{description}</p>}
      </div>
      
      <div className="p-4 space-y-3">
        {tasks.map((task, idx) => {
          const taskId = `task-${idx}`;
          const isCompleted = completedTasks.includes(taskId);
          
          return (
            <div
              key={taskId}
              onClick={() => toggleTask(taskId)}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                isCompleted
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCompleted ? 'bg-green-500 border-green-500' : 'border-white/30'
                }`}>
                  {isCompleted && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-green-200 line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Progress</span>
          <span>{completedTasks.length}/{tasks.length} completed</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Code Comparison Component
 */
export const CodeComparison = ({ bad, good, badLabel = "❌ Bad", goodLabel = "✅ Good" }) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-red-500/30 overflow-hidden">
        <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/30">
          <span className="text-sm font-medium text-red-400">{badLabel}</span>
        </div>
        <pre className="p-4 bg-slate-900/50 text-sm text-slate-300 overflow-x-auto">
          <code>{bad}</code>
        </pre>
      </div>
      
      <div className="rounded-xl border border-green-500/30 overflow-hidden">
        <div className="px-3 py-2 bg-green-500/10 border-b border-green-500/30">
          <span className="text-sm font-medium text-green-400">{goodLabel}</span>
        </div>
        <pre className="p-4 bg-slate-900/50 text-sm text-slate-300 overflow-x-auto">
          <code>{good}</code>
        </pre>
      </div>
    </div>
  );
};

/**
 * Interactive Quiz Question (for inline practice)
 */
export const QuickQuiz = ({ question, options, correctAnswer, explanation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };
  
  const isCorrect = selectedAnswer === correctAnswer;
  
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
      <p className="font-medium text-white mb-3">{question}</p>
      
      <div className="space-y-2 mb-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !showExplanation && handleAnswer(idx)}
            disabled={showExplanation}
            className={`w-full text-left p-3 rounded-lg border transition ${
              showExplanation
                ? idx === correctAnswer
                  ? 'bg-green-500/20 border-green-500/50 text-green-200'
                  : idx === selectedAnswer
                  ? 'bg-red-500/20 border-red-500/50 text-red-200'
                  : 'bg-white/5 border-white/10 text-slate-400'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showExplanation && (
        <div className={`p-3 rounded-lg ${
          isCorrect ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
        }`}>
          <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-green-200' : 'text-red-200'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className={`text-xs ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>{explanation}</p>
          <button
            onClick={() => {
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
            className="mt-2 text-xs text-slate-400 hover:text-white transition"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Step-by-Step Guide Component
 */
export const StepGuide = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 overflow-hidden">
      <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/30">
        <span className="font-medium text-blue-400">Step {currentStep + 1} of {steps.length}</span>
      </div>
      
      <div className="p-4">
        <h4 className="font-bold text-white mb-2">{steps[currentStep].title}</h4>
        <div className="text-sm text-slate-300 mb-4">{steps[currentStep].content}</div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentStep ? 'bg-blue-400' : idx < currentStep ? 'bg-green-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
