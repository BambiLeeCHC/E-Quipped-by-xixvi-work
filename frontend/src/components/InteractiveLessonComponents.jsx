import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X, Lightbulb, AlertTriangle, Info, Sparkles } from 'lucide-react';

/**
 * Interactive Accordion Component
 */
export const Accordion = ({ title, children, defaultOpen = false, variant = 'default' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const variants = {
    default: 'bg-slate-100 border-slate-400',
    primary: 'bg-fuchsia-50 border-fuchsia-400',
    success: 'bg-green-50 border-green-400',
    warning: 'bg-amber-50 border-amber-400',
    info: 'bg-blue-50 border-blue-400'
  };
  
  return (
    <div className={`rounded-xl border-2 ${variants[variant]} overflow-hidden transition-all duration-300 shadow-sm`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-200 transition"
      >
        <span className="font-semibold text-slate-900 text-base">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-slate-700 transition-transform" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-700 transition-transform" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t-2 border-slate-300 text-slate-800 text-base space-y-2 leading-relaxed bg-white">
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
    <div className="rounded-xl border-2 border-slate-400 overflow-hidden bg-slate-100/50">
      <div className="flex border-b-2 border-slate-400 bg-white/80">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
              activeTab === idx
                ? 'bg-fuchsia-600/90 text-slate-900 border-b-4 border-fuchsia-400'
                : 'text-slate-800 hover:text-slate-900 hover:bg-slate-700/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 text-slate-900 text-base leading-relaxed">
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
      bg: 'bg-blue-50/40',
      border: 'border-blue-400',
      icon: <Lightbulb className="w-5 h-5 text-blue-300" />,
      textColor: 'text-blue-900',
      titleColor: 'text-blue-950'
    },
    warning: {
      bg: 'bg-amber-50/40',
      border: 'border-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-300" />,
      textColor: 'text-amber-900',
      titleColor: 'text-amber-950'
    },
    info: {
      bg: 'bg-slate-100/60',
      border: 'border-slate-400',
      icon: <Info className="w-5 h-5 text-slate-700" />,
      textColor: 'text-slate-900',
      titleColor: 'text-slate-50'
    },
    success: {
      bg: 'bg-green-50/40',
      border: 'border-green-400',
      icon: <Check className="w-5 h-5 text-green-300" />,
      textColor: 'text-green-900',
      titleColor: 'text-green-950'
    },
    error: {
      bg: 'bg-red-50/40',
      border: 'border-red-400',
      icon: <X className="w-5 h-5 text-red-300" />,
      textColor: 'text-red-900',
      titleColor: 'text-red-950'
    }
  };
  
  const style = types[type];
  
  return (
    <div className={`rounded-xl border-2 ${style.border} ${style.bg} overflow-hidden`}>
      <div
        className={`px-4 py-3 flex items-center gap-3 ${collapsible ? 'cursor-pointer hover:bg-white/10' : ''}`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        {style.icon}
        <span className={`font-semibold ${style.titleColor} flex-1 text-base`}>{title}</span>
        {collapsible && (
          isOpen ? <ChevronDown className="w-4 h-4 text-slate-800" /> : <ChevronRight className="w-4 h-4 text-slate-800" />
        )}
      </div>
      {(!collapsible || isOpen) && (
        <div className={`px-4 py-3 ${title ? 'border-t-2 border-white/20' : ''} text-base ${style.textColor} leading-relaxed`}>
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
    <div className="rounded-xl border-2 border-fuchsia-500/50 bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 overflow-hidden">
      <div className="px-5 py-4 border-b-2 border-fuchsia-500/50 bg-fuchsia-50/40">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-fuchsia-300" />
          <span className="font-bold text-fuchsia-900 text-lg">{title}</span>
        </div>
        {description && <p className="text-sm text-slate-900 leading-relaxed">{description}</p>}
      </div>
      
      <div className="p-5 space-y-3">
        {tasks.map((task, idx) => {
          const taskId = `task-${idx}`;
          const isCompleted = completedTasks.includes(taskId);
          
          return (
            <div
              key={taskId}
              onClick={() => toggleTask(taskId)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                isCompleted
                  ? 'bg-green-600/30 border-green-400'
                  : 'bg-slate-100/80 border-slate-400 hover:bg-slate-700/80 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCompleted ? 'bg-green-500 border-green-400' : 'border-slate-400'
                }`}>
                  {isCompleted && <Check className="w-5 h-5 text-slate-900" />}
                </div>
                <div className="flex-1">
                  <p className={`text-base font-semibold ${isCompleted ? 'text-green-950 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className={`text-sm mt-1 ${isCompleted ? 'text-green-900' : 'text-slate-800'}`}>{task.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between text-sm text-slate-800 mb-2 font-medium">
          <span>Progress</span>
          <span>{completedTasks.length}/{tasks.length} completed</span>
        </div>
        <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-slate-400">
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
      <div className="rounded-xl border-2 border-red-500/60 overflow-hidden">
        <div className="px-4 py-2 bg-red-50/40 border-b-2 border-red-500/60">
          <span className="text-sm font-bold text-red-900">{badLabel}</span>
        </div>
        <pre className="p-4 bg-slate-900 text-sm text-slate-900 overflow-x-auto leading-relaxed">
          <code>{bad}</code>
        </pre>
      </div>
      
      <div className="rounded-xl border-2 border-green-500/60 overflow-hidden">
        <div className="px-4 py-2 bg-green-50/40 border-b-2 border-green-500/60">
          <span className="text-sm font-bold text-green-900">{goodLabel}</span>
        </div>
        <pre className="p-4 bg-slate-900 text-sm text-slate-900 overflow-x-auto leading-relaxed">
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
    <div className="rounded-xl border-2 border-purple-500/50 bg-purple-50/30 p-5">
      <p className="font-semibold text-slate-900 mb-4 text-base leading-relaxed">{question}</p>
      
      <div className="space-y-3 mb-4">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !showExplanation && handleAnswer(idx)}
            disabled={showExplanation}
            className={`w-full text-left p-3 rounded-lg border-2 transition ${
              showExplanation
                ? idx === correctAnswer
                  ? 'bg-green-600/40 border-green-400 text-green-950 font-medium'
                  : idx === selectedAnswer
                  ? 'bg-red-600/40 border-red-400 text-red-950'
                  : 'bg-slate-100/50 border-slate-400 text-slate-700'
                : 'bg-slate-100/80 border-slate-400 text-slate-900 hover:bg-slate-700 hover:border-slate-500 font-medium'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      
      {showExplanation && (
        <div className={`p-4 rounded-lg border-2 ${
          isCorrect ? 'bg-green-600/30 border-green-400' : 'bg-red-600/30 border-red-400'
        }`}>
          <p className={`text-base font-bold mb-2 ${isCorrect ? 'text-green-950' : 'text-red-950'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className={`text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'} leading-relaxed`}>{explanation}</p>
          <button
            onClick={() => {
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
            className="mt-3 text-sm text-slate-900 hover:text-slate-900 font-medium transition underline"
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
    <div className="rounded-xl border-2 border-blue-500/50 bg-blue-50/30 overflow-hidden">
      <div className="px-5 py-3 bg-blue-50/50 border-b-2 border-blue-500/50">
        <span className="font-bold text-blue-900 text-base">Step {currentStep + 1} of {steps.length}</span>
      </div>
      
      <div className="p-5">
        <h4 className="font-bold text-slate-900 text-lg mb-3">{steps[currentStep].title}</h4>
        <div className="text-base text-slate-900 mb-5 leading-relaxed">{steps[currentStep].content}</div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-5 py-2.5 rounded-lg bg-slate-700 text-slate-900 text-sm font-semibold hover:bg-slate-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  idx === currentStep ? 'bg-blue-400 scale-125' : idx < currentStep ? 'bg-green-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 text-slate-900 text-sm font-semibold hover:shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
