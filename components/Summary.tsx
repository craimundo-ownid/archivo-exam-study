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
  
  // Differentiate between answered incorrectly and not answered at all (skipped)
  const skippedQuestions = questions.filter(q => answers[q.id] === undefined);
  const incorrectQuestions = questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswerIndex);
  
  const skippedCount = skippedQuestions.length;
  const incorrectCount = incorrectQuestions.length;
  
  const percentage = Math.round((correctCount / total) * 100);

  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Result Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Resumen del Examen</h2>
          <div className="text-slate-500">Has completado el cuestionario.</div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-slate-100">
             <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
               <circle
                 className={`${percentage >= 50 ? 'text-emerald-500' : 'text-rose-500'} stroke-current`}
                 strokeWidth="8"
                 cx="50"
                 cy="50"
                 r="46"
                 fill="transparent"
                 strokeDasharray="289.026" // 2 * pi * 46
                 strokeDashoffset={289.026 - (289.026 * percentage) / 100}
                 strokeLinecap="round"
               />
             </svg>
             <div className="text-center">
               <span className={`text-4xl font-bold ${percentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                 {percentage}%
               </span>
               <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Aciertos</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
            <div className="text-emerald-800 font-bold text-xl">{correctCount}</div>
            <div className="text-emerald-600 text-xs">Correctas</div>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-center">
            <div className="text-rose-800 font-bold text-xl">{incorrectCount}</div>
            <div className="text-rose-600 text-xs">Incorrectas</div>
          </div>
          <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-center">
            <div className="text-slate-700 font-bold text-xl">{skippedCount}</div>
            <div className="text-slate-500 text-xs">Saltadas</div>
          </div>
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-center">
             <div className="text-indigo-800 font-bold text-xl">{formatDuration(duration)}</div>
             <div className="text-indigo-600 text-xs">Tiempo</div>
          </div>
        </div>

        {skippedQuestions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <SkipForward size={18} className="text-slate-400" />
              Preguntas sin responder:
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-40 overflow-y-auto">
              <ul className="space-y-2">
                {skippedQuestions.map(q => (
                  <li key={q.id} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                    <span>
                      <strong className="text-slate-800">{q.term}:</strong> {q.question}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {incorrectQuestions.length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" />
              Errores cometidos:
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 max-h-40 overflow-y-auto">
              <ul className="space-y-2">
                {incorrectQuestions.map(q => (
                  <li key={q.id} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0"></span>
                    <span>
                      <strong className="text-slate-800">{q.term}:</strong> {q.question}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition-colors shadow-sm order-3 sm:order-1"
          >
            <RefreshCcw size={18} />
            Reiniciar Todo
          </button>
          
          {incorrectCount > 0 && (
            <button
              onClick={() => onRetry('incorrect')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 border-2 border-rose-200 hover:border-rose-400 text-rose-700 hover:bg-rose-100 rounded-lg font-medium transition-all shadow-sm order-2"
            >
              <AlertCircle size={18} />
              Reintentar {incorrectCount} Fallos
            </button>
          )}

          {skippedCount > 0 && (
            <button
              onClick={() => onRetry('skipped')}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm order-1 sm:order-3 shadow-indigo-200"
            >
              <Play size={18} fill="currentColor" />
              Responder {skippedCount} Saltadas
            </button>
          )}
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
           <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
             <History size={20} className="text-slate-500" />
             <h3 className="font-bold text-slate-700">Historial de Intentos</h3>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                 <tr>
                   <th className="px-6 py-3 font-medium">Fecha</th>
                   <th className="px-6 py-3 font-medium">Usuario</th>
                   <th className="px-6 py-3 font-medium text-center">Tiempo</th>
                   <th className="px-6 py-3 font-medium text-center">Puntuación</th>
                   <th className="px-6 py-3 font-medium text-right">Nota</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {history.map((result, index) => (
                   <tr key={result.id} className={index === 0 ? "bg-indigo-50/50" : "hover:bg-slate-50"}>
                     <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                       {formatDate(result.timestamp)}
                       {index === 0 && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">Nuevo</span>}
                     </td>
                     <td className="px-6 py-4 text-slate-800 font-medium flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        {result.userName}
                     </td>
                     <td className="px-6 py-4 text-center text-slate-600 flex items-center justify-center gap-1">
                       <Clock size={14} className="text-slate-400" />
                       {formatDuration(result.duration || 0)}
                     </td>
                     <td className="px-6 py-4 text-center text-slate-600">
                       {result.score} / {result.totalQuestions}
                     </td>
                     <td className="px-6 py-4 text-right">
                       <span className={`font-bold ${result.percentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
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