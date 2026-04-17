import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrainCircuit, CheckCircle2, ChevronLeft, Flag, Play, XCircle, RotateCcw, Target, Settings, ArrowLeft } from 'lucide-react';
import { defaultQuestions, parseQuestionsText } from './data/questions';

export default function App() {
  const [status, setStatus] = useState<'start' | 'playing' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const [customQuestions, setCustomQuestions] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('quiz_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const activeQuestions = customQuestions.length > 0 ? customQuestions : defaultQuestions;
  const currentQuestion = activeQuestions[currentIndex];
  
  const hasAnsweredOrSkipped = answers[currentIndex] !== undefined || skipped[currentIndex];

  const handleStart = () => {
    setStatus('playing');
    setCurrentIndex(0);
    setAnswers({});
    setSkipped({});
    setScore(0);
  };

  const handleSelectOption = (option: string) => {
    if (hasAnsweredOrSkipped) return;
    
    // Check if correct
    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handleSkip = () => {
    if (hasAnsweredOrSkipped) return;
    setSkipped(prev => ({
      ...prev,
      [currentIndex]: true
    }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setStatus('results');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  };

  const getOptionStatus = (option: string) => {
    if (!hasAnsweredOrSkipped) return 'idle';
    
    // If user skipped or answered, we always reveal the correct answer.
    if (option === currentQuestion.answer) return 'correct';
    
    // If the user selected this one and it's wrong:
    if (answers[currentIndex] === option) return 'wrong';
    
    return 'dimmed';
  };

  if (showImport) {
    const parsedPreview = parseQuestionsText(importText);
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4 font-sans text-[#f4f4f5]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-[#16161e] border border-[#27272a] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        >
          <div className="p-8 border-b border-[#27272a] flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#f4f4f5]">Import Question Bank</h1>
            <button 
              onClick={() => setShowImport(false)}
              className="p-2 bg-[#1f1f29] rounded-full text-[#a1a1aa] hover:text-white transition-colors border border-[#27272a]"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-8 flex flex-col gap-4">
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              Paste your raw question text below. The system automatically supports texts with questions starting with numbers ("1. "), options starting with letters ("A." or "a)"), and answers starting with "Answer: " or "Correct Answer: ".
            </p>
            <textarea
              className="w-full h-64 bg-[#0a0a0c] border border-[#27272a] rounded-[12px] p-4 text-[#f4f4f5] font-mono text-sm resize-none focus:border-[#7c3aed] focus:outline-none placeholder:text-[#27272a]"
              placeholder="1. Question text here?&#10;A. Option 1&#10;B. Option 2&#10;Answer: B"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-[#10b981] font-semibold bg-[#10b981]/10 px-4 py-2 rounded-lg border border-[#10b981]/20">
                Found {parsedPreview.length} valid questions
              </span>
              
              <button 
                onClick={() => {
                  if (parsedPreview.length > 0) {
                    setCustomQuestions(parsedPreview);
                    localStorage.setItem('quiz_questions', JSON.stringify(parsedPreview));
                    setShowImport(false);
                    setImportText("");
                  }
                }}
                disabled={parsedPreview.length === 0}
                className="flex items-center gap-2 bg-[#7c3aed] text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 px-6 rounded-[12px] transition-all hover:bg-[#6d28d9]"
              >
                Save & Play 
              </button>
            </div>
            {customQuestions.length > 0 && (
               <button onClick={() => {
                  setCustomQuestions([]);
                  localStorage.removeItem('quiz_questions');
                  setImportText("");
               }} className="text-sm text-red-500 mt-4 hover:underline text-left inline-block self-start">
                  Remove custom questions and use default
               </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'start') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4 font-sans text-[#f4f4f5]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#16161e] border border-[#27272a] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-center relative"
        >
          <button 
             onClick={() => setShowImport(true)}
             className="absolute top-4 right-4 p-2 text-[#a1a1aa] hover:text-white bg-[#1f1f29] rounded-full border border-[#27272a] transition-colors"
             title="Import Custom Questions"
          >
             <Settings className="w-5 h-5" />
          </button>
          
          <div className="p-8 pt-12 flex justify-center">
            <div className="p-4 bg-[#1f1f29] rounded-[16px] border border-[#27272a]">
              <BrainCircuit className="w-16 h-16 text-[#7c3aed]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="p-8 pb-12 pt-0 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-[#f4f4f5] mb-2">Knowledge Quiz</h1>
            <p className="text-[#a1a1aa] mb-8 text-[15px]">Test your understanding of the Sustainable Development Goals (SDGs).</p>
            
            <div className="flex flex-col gap-3 mb-8 text-left w-full">
              <div className="flex items-center gap-3 text-[#text-dim] bg-[#1f1f29] p-4 rounded-[16px] border border-[#27272a]">
                <Target className="w-5 h-5 text-[#7c3aed]" />
                <span className="font-medium text-[14px] text-[#a1a1aa]">{activeQuestions.length} Questions total</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1f1f29] p-4 rounded-[16px] border border-[#27272a]">
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                <span className="font-medium text-[14px] text-[#a1a1aa]">No negative marking</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1f1f29] p-4 rounded-[16px] border border-[#27272a]">
                <Flag className="w-5 h-5 text-[#f59e0b]" />
                <span className="font-medium text-[14px] text-[#a1a1aa]">You can skip questions</span>
              </div>
            </div>

            <button 
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] text-[#f4f4f5] font-semibold py-4 px-6 rounded-[12px] transition-all hover:bg-[#6d28d9]"
            >
              Start Quiz 
              <Play className="w-5 h-5 fill-current" />
            </button>
            
            <button 
              onClick={() => setShowImport(true)}
              className="mt-6 text-sm text-[#a1a1aa] hover:text-[#7c3aed] transition-colors underline decoration-dashed decoration-[#27272a] underline-offset-4"
            >
              Have a custom text bank? Import all 800+ questions here.
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'results') {
    const percentage = Math.round((score / activeQuestions.length) * 100);
    let message = "Good effort!";
    if (percentage >= 80) message = "Excellent!";
    else if (percentage >= 50) message = "Well done!";

    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4 font-sans text-[#f4f4f5]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#16161e] border border-[#27272a] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-center"
        >
          <div className="p-10 flex flex-col items-center bg-[#1f1f29] border-b border-[#27272a]">
            <h2 className="text-[#a1a1aa] text-[12px] uppercase tracking-[2px] font-bold mb-8">Quiz Completed</h2>
            
            <div className="relative mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#27272a" strokeWidth="12" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" 
                  stroke="#10b981" strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 56}`} 
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                  className="transition-all duration-1000 ease-out flex" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#f4f4f5]">
                <span className="text-3xl font-bold">{percentage}%</span>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-3xl font-bold text-[#f4f4f5] mb-2">{message}</h3>
            <p className="text-[16px] text-[#a1a1aa] mb-8">
              You scored <span className="font-bold text-[#10b981]">{score}</span> out of <span className="font-bold text-[#f4f4f5]">{activeQuestions.length}</span>
            </p>
            
            <button 
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-[#f4f4f5] font-semibold py-4 px-6 rounded-[12px] transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] font-sans text-[#f4f4f5] flex flex-col font-['Inter',_'Helvetica_Neue',_Arial,_sans-serif]">
      {/* Header section with live score */}
      <header className="w-full max-w-[800px] mx-auto pt-8 pb-4 px-4 flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[12px] uppercase tracking-[0.1em] text-[#a1a1aa] font-semibold">Current Score</span>
          <div className="flex items-baseline gap-2">
			<span className="text-[32px] font-bold text-[#10b981]">{score.toString().padStart(2, '0')}</span>
			<span className="text-[16px] text-[#a1a1aa]">/ {activeQuestions.length}</span>
		  </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[14px] font-medium text-[#f4f4f5] mb-2">Question {(currentIndex + 1).toString().padStart(2, '0')} of {activeQuestions.length}</span>
          <div className="w-[180px] sm:w-[240px] h-[6px] bg-[#27272a] rounded-[3px] overflow-hidden">
            <div 
              className="h-full bg-[#7c3aed] transition-all duration-300 ease-out rounded-[3px]" 
              style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>
      
      {/* Quiz Body */}
      <main className="flex-1 max-w-[800px] mx-auto w-full p-4 flex flex-col relative w-full mb-8">
        <div className="bg-[#16161e] border border-[#27272a] rounded-[24px] p-6 sm:p-8 md:p-12 flex-1 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col w-full"
            >
              <div className="text-[12px] uppercase text-[#7c3aed] font-bold tracking-[2px] mb-4">
                Sustainability Knowledge
              </div>
              <h1 className="text-[24px] sm:text-[28px] leading-[1.4] font-semibold text-[#f4f4f5] mb-10 w-full break-words">
                {currentQuestion.question}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {currentQuestion.options.map((option: string, index: number) => {
                  const optStatus = getOptionStatus(option);
                  
                  let baseClasses = "relative w-full text-left p-6 rounded-[16px] border transition-all duration-200 outline-none flex items-start justify-between gap-4 ";
                  let icon = null;

                  if (optStatus === 'idle') {
                    baseClasses += "border-[#27272a] bg-[#1f1f29] hover:border-[#7c3aed] hover:bg-[#252533] cursor-pointer";
                  } else if (optStatus === 'correct') {
                    baseClasses += "border-[#10b981] bg-[#16161e] text-[#10b981] cursor-default z-10";
                    icon = <CheckCircle2 className="w-5 h-5 text-[#10b981]" />;
                  } else if (optStatus === 'wrong') {
                    baseClasses += "border-[#ef4444] bg-[#1f1f29] text-[#ef4444] cursor-default opacity-80";
                    icon = <XCircle className="w-5 h-5 text-[#ef4444]" />;
                  } else if (optStatus === 'dimmed') {
                    baseClasses += "border-[#27272a] bg-[#16161e] opacity-40 cursor-default";
                  }

                  return (
                    <button
                      key={index}
                      disabled={hasAnsweredOrSkipped}
                      onClick={() => handleSelectOption(option)}
                      className={baseClasses}
                    >
                      <div className="flex flex-col gap-1 w-full text-left">
                         <span className={`text-[14px] font-semibold tracking-wide ${optStatus === 'idle' ? 'text-[#a1a1aa]' : 'opacity-80'}`}>Option {String.fromCharCode(65 + index)}</span>
                         <span className={`text-[16px] sm:text-[18px] font-medium leading-[1.4] ${optStatus === 'idle' || optStatus === 'dimmed' ? 'text-[#f4f4f5]' : 'text-current'}`}>{option}</span>
                      </div>
                      {icon && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 mt-3">
                          {icon}
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

               {/* Design requested legend */}
               {hasAnsweredOrSkipped && (
                 <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8 opacity-60">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-[3px] bg-[#10b981]"></div>
                     <span className="text-[12px] text-[#f4f4f5]">Correct: +1 pt</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-[3px] bg-[#f59e0b]"></div>
                     <span className="text-[12px] text-[#f4f4f5]">Skipped: 0 pts (Shows Answer)</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-[3px] bg-[#ef4444]"></div>
                     <span className="text-[12px] text-[#f4f4f5]">Wrong: 0 pts</span>
                   </div>
                 </motion.div>
               )}

            </motion.div>
          </AnimatePresence>

          {/* Footer controls inside card logic */}
          <div className="mt-10 pt-6 border-t border-[#27272a] flex flex-col-reverse sm:flex-row items-center justify-between gap-4 z-10">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] font-semibold text-[14px] transition-all border ${
                currentIndex === 0 
                  ? 'border-[#27272a] text-[#a1a1aa] opacity-30 cursor-not-allowed bg-transparent' 
                  : 'border-[#27272a] text-[#a1a1aa] hover:border-[#7c3aed] hover:text-[#f4f4f5] bg-transparent'
              } w-full sm:w-auto`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {hasAnsweredOrSkipped && (
                 <div className="flex items-center gap-2">
                    {skipped[currentIndex] && <span className="text-[10px] font-extrabold uppercase bg-[#f59e0b] text-[#000] px-2 py-0.5 rounded-[4px] ml-2">Skipped</span>}
                    <span className="text-[#a1a1aa] text-[13px] mr-2">Selected answers cannot be changed</span>
                 </div>
              )}
              
              {!hasAnsweredOrSkipped && (
                <button
                  onClick={handleSkip}
                  className="px-8 py-3 rounded-[12px] font-semibold text-[14px] bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] hover:bg-[rgba(245,158,11,0.2)] transition-colors w-full sm:w-auto"
                >
                  Skip Question
                </button>
              )}
              
              {hasAnsweredOrSkipped && (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-[12px] font-semibold text-[14px] bg-[#7c3aed] border border-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {currentIndex === activeQuestions.length - 1 ? 'Finish' : 'Next'}
                  {currentIndex < activeQuestions.length - 1 && <ChevronLeft className="w-4 h-4 rotate-180" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
