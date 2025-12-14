import React, { useState, useEffect } from 'react';
import { questions as allQuestions } from './data/questions';
import QuizCard from './components/QuizCard';
import Summary from './components/Summary';
import WelcomeScreen from './components/WelcomeScreen';
import { Question, QuizState, QuizResult, StorageKeys } from './types';
import { BookOpen, ChevronRight, BarChart3, RotateCcw, SkipForward, User, Play, Pause, Timer } from 'lucide-react';

const App: React.FC = () => {
  // Application State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(allQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  
  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Load state and history from local storage on mount
  useEffect(() => {
    // Load active state
    const savedState = localStorage.getItem(StorageKeys.QUIZ_STATE);
    if (savedState) {
      try {
        const parsed: QuizState = JSON.parse(savedState);
        setAnswers(parsed.answers);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setIsFinished(parsed.isFinished);
        setElapsedTime(parsed.elapsedTime || 0);
        setIsPaused(parsed.isPaused || false);
        if (parsed.userName) setUserName(parsed.userName);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }

    // Load History
    const savedHistory = localStorage.getItem(StorageKeys.QUIZ_HISTORY);
    if (savedHistory) {
      try {
        setQuizHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    setHasLoaded(true);
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused && !isFinished && hasLoaded && userName) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isFinished, hasLoaded, userName]);

  // Save state to local storage whenever it changes
  useEffect(() => {
    if (!hasLoaded) return;
    
    const state: QuizState = {
      userName,
      currentQuestionIndex,
      answers,
      isFinished,
      history: activeQuestions.map(q => q.id),
      elapsedTime,
      isPaused
    };
    localStorage.setItem(StorageKeys.QUIZ_STATE, JSON.stringify(state));
  }, [userName, currentQuestionIndex, answers, isFinished, activeQuestions, hasLoaded, elapsedTime, isPaused]);

  const saveToHistory = () => {
    const correctCount = activeQuestions.filter(q => answers[q.id] === q.correctAnswerIndex).length;
    const total = activeQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const newResult: QuizResult = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userName: userName,
      score: correctCount,
      totalQuestions: total,
      percentage: percentage,
      duration: elapsedTime
    };

    const updatedHistory = [newResult, ...quizHistory];
    setQuizHistory(updatedHistory);
    localStorage.setItem(StorageKeys.QUIZ_HISTORY, JSON.stringify(updatedHistory));
  };

  const handleStart = (name: string) => {
    setUserName(name);
    setElapsedTime(0);
    setIsPaused(false);
    window.scrollTo(0, 0);
  };

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = activeQuestions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      saveToHistory();
      setIsFinished(true);
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      saveToHistory();
      setIsFinished(true);
      window.scrollTo(0, 0);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetState = () => {
    // Keep userName but reset quiz progress
    setActiveQuestions(allQuestions);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
    setElapsedTime(0);
    setIsPaused(false);
  };

  const handleRestartClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (window.confirm("¿Estás seguro de que quieres reiniciar? Se perderá el progreso actual.")) {
        resetState();
    }
  };

  const handleChangeUser = () => {
    if (window.confirm("¿Cambiar de usuario? Se perderá el progreso actual.")) {
      setUserName('');
      resetState();
    }
  };

  const handleRetry = (mode: 'skipped' | 'incorrect') => {
    const questionsToRetry = activeQuestions.filter(q => {
      const isSkipped = answers[q.id] === undefined;
      const isIncorrect = answers[q.id] !== undefined && answers[q.id] !== q.correctAnswerIndex;
      
      if (mode === 'skipped') return isSkipped;
      if (mode === 'incorrect') return isIncorrect;
      return false;
    });

    if (questionsToRetry.length === 0) return;

    const idsToRetry = questionsToRetry.map(q => q.id);
    const nextQuestions = allQuestions.filter(q => idsToRetry.includes(q.id));

    setActiveQuestions(nextQuestions);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setIsFinished(false);
    setElapsedTime(0); // Reset timer for retry attempt
    setIsPaused(false);
    window.scrollTo(0, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasLoaded) return <div className="min-h-screen flex items-center justify-center text-slate-400">Cargando...</div>;

  // Show Welcome Screen if no user name
  if (!userName) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  const currentQuestion = activeQuestions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const progress = Math.round(((currentQuestionIndex) / activeQuestions.length) * 100);
  const isCurrentAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
              <BookOpen size={18} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center">
              <h1 className="font-bold text-lg hidden sm:block mr-2">Oposiciones Archivo</h1>
              <div className="flex items-center gap-1 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                <User size={12} /> <span className="max-w-[80px] sm:max-w-auto truncate">{userName}</span>
                {!isFinished && (
                  <button 
                    onClick={handleChangeUser}
                    className="ml-1 text-slate-400 hover:text-indigo-600 px-1"
                    title="Cambiar usuario"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {!isFinished && (
            <div className="flex items-center gap-3 sm:gap-4">
               {/* Timer & Pause Control */}
               <div className="flex items-center gap-2 mr-1 sm:mr-4">
                  <div className={`flex items-center gap-1.5 font-mono text-sm font-medium px-2 py-1 rounded-md ${isPaused ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'}`}>
                    <Timer size={14} className={isPaused ? 'text-amber-500' : 'text-slate-400'} />
                    {formatTime(elapsedTime)}
                  </div>
                  <button
                    onClick={togglePause}
                    className={`p-1.5 rounded-full transition-colors ${
                      isPaused 
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isPaused ? "Reanudar" : "Pausar"}
                  >
                    {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                  </button>
               </div>

               {/* Progress Indicator - Visible on all screens */}
               <div className="flex flex-col items-end">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                   {currentQuestionIndex + 1} / {activeQuestions.length}
                 </span>
                 <div className="w-16 sm:w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                   <div 
                    className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                   />
                 </div>
               </div>
               
               <button
                type="button"
                onClick={handleRestartClick}
                className="flex items-center justify-center p-2 sm:gap-2 sm:px-3 sm:py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-sm font-medium group active:bg-indigo-100"
                title="Reiniciar examen desde el principio"
               >
                 <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
               </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 py-8 md:py-12 relative">
        {isFinished ? (
          <Summary 
            questions={activeQuestions} 
            answers={answers} 
            history={quizHistory}
            onRestart={resetState}
            onRetry={handleRetry}
            duration={elapsedTime}
          />
        ) : isPaused ? (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm p-8 rounded-xl border border-dashed border-slate-300 min-h-[400px]">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
              <Pause size={40} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Examen Pausado</h2>
            <p className="text-slate-500 mb-8 text-center max-w-md">
              El tiempo se ha detenido. El contenido de la pregunta está oculto hasta que reanudes el examen.
            </p>
            <button 
              onClick={togglePause}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Play size={20} fill="currentColor" /> Reanudar Examen
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <QuizCard 
              key={currentQuestion.id}
              question={currentQuestion}
              selectedOptionIndex={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />
            
            {/* Mobile-friendly Sticky Bottom Action or Inline */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-200 md:static md:bg-transparent md:border-0 md:p-0 md:w-auto md:mt-8 z-20">
               <div className="max-w-2xl mx-auto md:w-[28rem] flex gap-3">
                {/* Skip Button - Only shown if not answered yet */}
                {!isCurrentAnswered && (
                  <button
                    onClick={handleSkip}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 rounded-lg font-semibold text-lg transition-all active:scale-95"
                  >
                    Saltar <SkipForward size={20} />
                  </button>
                )}
                
                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={!isCurrentAnswered}
                  className={`flex-[2] flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-lg shadow-lg transition-all transform active:scale-95 ${
                    isCurrentAnswered 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 cursor-pointer' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isLastQuestion ? (
                    <>Ver Resultados <BarChart3 size={20} /></>
                  ) : (
                    <>Siguiente <ChevronRight size={20} /></>
                  )}
                </button>
               </div>
            </div>
            
            {/* Spacer for mobile bottom bar */}
            <div className="h-20 md:hidden"></div>
          </div>
        )}
      </main>

      {/* Footer */}
      {!isFinished && (
         <footer className="text-center py-6 text-slate-400 text-sm hidden md:block">
           <p>Estudio de Oposiciones &bull; Archivo y Documentación</p>
         </footer>
      )}
    </div>
  );
};

export default App;