import React from 'react';
import { Question, QuizResult } from '../types';
import { RefreshCcw, AlertCircle, Play, SkipForward, History, User, Clock } from 'lucide-react';

interface SummaryProps {
  questions: Question[];
  answers: Record<number, number>;
  history: QuizResult[];
  onRestart: () => void;
  onRetry: (mode: 'skipped' | 'incorrect') => void;
  duration: number;
}

const Summary: React.FC<SummaryProps> = ({ questions, answers, history, onRestart, onRetry, duration }) => {
  const total = questions.length;
  const correctCount = questions.filter(q => answers[q.id] === q.correctAnswerIndex).length;

  const skippedQuestions = questions.filter(q => answers[q.id] === undefined);
  const incorrectQuestions = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswerIndex);

  const skippedCount = skippedQuestions.length;
  const incorrectCount = incorrectQuestions.length;

  const percentage = Math.round((correctCount / total) * 100);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const isPassing = percentage >= 50;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Main Result Card */}
      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl sm:text-3xl text-ink mb-1">Resultados</h2>
            <p className="text-muted text-sm">Has completado el cuestionario</p>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-ink/5 stroke-current"
                  strokeWidth="6"
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                />
                <circle
                  className={`${isPassing ? 'text-sage' : 'text-red-400'} stroke-current transition-all duration-1000`}
                  strokeWidth="6"
                  cx="50"
                  cy="50"
                  r="44"
                  fill="transparent"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (276.46 * percentage) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className={`text-3xl font-bold ${isPassing ? 'text-sage' : 'text-red-500'}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-sage-light p-3 rounded-lg text-center">
              <div className="text-sage font-bold text-lg">{correctCount}</div>
              <div className="text-sage/70 text-[10px] font-medium uppercase tracking-wide">Correctas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-red-500 font-bold text-lg">{incorrectCount}</div>
              <div className="text-red-400 text-[10px] font-medium uppercase tracking-wide">Errores</div>
            </div>
            <div className="bg-cream p-3 rounded-lg text-center">
              <div className="text-muted font-bold text-lg">{skippedCount}</div>
              <div className="text-muted/70 text-[10px] font-medium uppercase tracking-wide">Saltadas</div>
            </div>
            <div className="bg-gold/10 p-3 rounded-lg text-center">
              <div className="text-gold font-bold text-lg">{formatDuration(duration)}</div>
              <div className="text-gold/70 text-[10px] font-medium uppercase tracking-wide">Tiempo</div>
            </div>
          </div>

          {/* Skipped Questions */}
          {skippedQuestions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-ink text-sm mb-2 flex items-center gap-2">
                <SkipForward size={14} className="text-muted" />
                Sin responder
              </h3>
              <div className="bg-cream/50 rounded-lg p-3 border border-ink/5 max-h-32 overflow-y-auto">
                <ul className="space-y-1.5">
                  {skippedQuestions.map(q => (
                    <li key={q.id} className="text-xs text-muted flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted/50 mt-1.5 flex-shrink-0" />
                      <span><strong className="text-ink/70">{q.term}:</strong> {q.question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Incorrect Questions */}
          {incorrectQuestions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-ink text-sm mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400" />
                Errores cometidos
              </h3>
              <div className="bg-red-50/50 rounded-lg p-3 border border-red-100 max-h-32 overflow-y-auto">
                <ul className="space-y-1.5">
                  {incorrectQuestions.map(q => (
                    <li key={q.id} className="text-xs text-red-600/80 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-300 mt-1.5 flex-shrink-0" />
                      <span><strong className="text-red-700/80">{q.term}:</strong> {q.question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-ink text-white rounded-lg font-semibold text-sm hover:bg-ink/90 transition-colors order-3 sm:order-1"
            >
              <RefreshCcw size={16} />
              Reiniciar
            </button>

            {incorrectCount > 0 && (
              <button
                onClick={() => onRetry('incorrect')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-100 transition-colors order-2"
              >
                <AlertCircle size={16} />
                Reintentar {incorrectCount}
              </button>
            )}

            {skippedCount > 0 && (
              <button
                onClick={() => onRetry('skipped')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-terracotta text-white rounded-lg font-semibold text-sm hover:bg-terracotta-light transition-colors order-1 sm:order-3"
              >
                <Play size={16} fill="currentColor" />
                Responder {skippedCount}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-cream/50 border-b border-ink/5 flex items-center gap-2">
            <History size={16} className="text-muted" />
            <h3 className="font-semibold text-ink text-sm">Historial</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-[10px] text-muted uppercase tracking-wider bg-cream/30 border-b border-ink/5">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-left">Fecha</th>
                  <th className="px-4 py-2.5 font-semibold text-left">Usuario</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Tiempo</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Puntuación</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {history.map((result, index) => (
                  <tr key={result.id} className={index === 0 ? "bg-terracotta/5" : "hover:bg-cream/30"}>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatDate(result.timestamp)}
                      {index === 0 && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-terracotta/10 text-terracotta uppercase">
                          Nuevo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink font-medium flex items-center gap-1.5">
                      <User size={12} className="text-muted/50" />
                      {result.userName}
                    </td>
                    <td className="px-4 py-3 text-center text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} className="text-muted/50" />
                        {formatDuration(result.duration || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted">
                      {result.score} / {result.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${result.percentage >= 50 ? 'text-sage' : 'text-red-500'}`}>
                        {result.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
