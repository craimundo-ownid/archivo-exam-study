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
    setElapsedTime(0);
    setIsPaused(false);
    window.scrollTo(0, 0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-muted">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Cargando...</span>
      </div>
    </div>
  );

  if (!userName) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  const currentQuestion = activeQuestions[currentQuestionIndex];
  if (!currentQuestion) return null;

  const progress = Math.round(((currentQuestionIndex) / activeQuestions.length) * 100);
  const isCurrentAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink relative">
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 paper-texture pointer-events-none" />

      {/* Header */}
      <header className="bg-paper/95 backdrop-blur-sm border-b border-ink/10 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-terracotta rounded-md flex items-center justify-center text-white flex-shrink-0">
              <BookOpen size={16} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <h1 className="font-display text-lg hidden sm:block mr-3 text-ink">Archivo</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cream rounded-md text-xs font-medium text-muted">
                <User size={11} />
                <span className="max-w-[70px] sm:max-w-none truncate">{userName}</span>
                {!isFinished && (
                  <button
                    onClick={handleChangeUser}
                    className="ml-0.5 text-muted/60 hover:text-terracotta transition-colors"
                    title="Cambiar usuario"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {!isFinished && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Timer & Pause */}
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center gap-1 font-mono text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
                  isPaused ? 'bg-gold/10 text-gold' : 'bg-cream text-muted'
                }`}>
                  <Timer size={12} className={isPaused ? 'text-gold' : 'text-muted/60'} />
                  {formatTime(elapsedTime)}
                </div>
                <button
                  onClick={togglePause}
                  className={`p-1.5 rounded-md transition-colors ${
                    isPaused
                      ? 'bg-gold/10 text-gold hover:bg-gold/20'
                      : 'bg-cream text-muted hover:bg-ink/5'
                  }`}
                  title={isPaused ? "Reanudar" : "Pausar"}
                >
                  {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                </button>
              </div>

              {/* Progress */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
                  {currentQuestionIndex + 1} / {activeQuestions.length}
                </span>
                <div className="w-12 sm:w-20 h-1 bg-ink/5 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-terracotta transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Restart */}
              <button
                type="button"
                onClick={handleRestartClick}
                className="p-2 text-muted hover:text-terracotta hover:bg-terracotta/5 rounded-md transition-colors"
                title="Reiniciar examen"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-4 pt-6 pb-28 md:pb-8 md:pt-10 relative z-10">
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
          <div className="w-full max-w-xl flex flex-col items-center justify-center bg-cream/50 p-10 rounded-xl border border-ink/5 min-h-[350px]">
            <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-5">
              <Pause size={28} fill="currentColor" />
            </div>
            <h2 className="font-display text-2xl text-ink mb-2">Examen Pausado</h2>
            <p className="text-muted text-sm mb-8 text-center max-w-sm">
              El tiempo se ha detenido. La pregunta permanecerá oculta hasta que continúes.
            </p>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-terracotta hover:bg-terracotta-light text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Play size={18} fill="currentColor" /> Continuar
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
          </div>
        )}
      </main>

      {/* Fixed Bottom Actions - Mobile optimized */}
      {!isFinished && !isPaused && (
        <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-sm border-t border-ink/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-20 md:static md:bg-transparent md:border-0 md:p-0 md:pb-8">
          <div className="max-w-xl mx-auto flex gap-2">
            {/* Skip Button */}
            {!isCurrentAnswered && (
              <button
                onClick={handleSkip}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-cream border border-ink/10 text-muted hover:text-ink hover:border-ink/20 rounded-lg font-semibold text-base transition-colors select-none"
              >
                Saltar <SkipForward size={18} />
              </button>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className={`flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-semibold text-base transition-colors select-none ${
                isCurrentAnswered
                  ? 'bg-terracotta text-white hover:bg-terracotta-light'
                  : 'bg-ink/5 text-ink/30 cursor-not-allowed'
              }`}
            >
              {isLastQuestion ? (
                <>Ver Resultados <BarChart3 size={18} /></>
              ) : (
                <>Siguiente <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer - Desktop only */}
      {!isFinished && (
        <footer className="text-center py-4 text-muted/50 text-xs hidden md:block">
          <p>Preparación Oposiciones · Archivo y Documentación</p>
        </footer>
      )}
    </div>
  );
};

export default App;
