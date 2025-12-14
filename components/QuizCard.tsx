import React, { useMemo } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  selectedOptionIndex: number | undefined;
  onSelectOption: (index: number) => void;
}

// Shuffle options and return new correct index
function shuffleOptions(options: string[], correctIndex: number, seed: number): {
  shuffledOptions: string[];
  shuffledCorrectIndex: number;
  originalIndices: number[];
} {
  // Create array of indices and shuffle using seeded random
  const indices = options.map((_, i) => i);

  // Simple seeded random for consistent shuffling per question
  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // Fisher-Yates shuffle with seed
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const shuffledOptions = indices.map(i => options[i]);
  const shuffledCorrectIndex = indices.indexOf(correctIndex);

  return { shuffledOptions, shuffledCorrectIndex, originalIndices: indices };
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  selectedOptionIndex, // This is the ORIGINAL index stored in App.tsx
  onSelectOption,
}) => {
  // Shuffle options once per question, using question.id + timestamp as seed for randomness
  const { shuffledOptions, shuffledCorrectIndex, originalIndices } = useMemo(
    () => shuffleOptions(question.options, question.correctAnswerIndex, question.id + Date.now() % 10000),
    [question.id]
  );

  // Convert original selected index to shuffled position for display
  const shuffledSelectedIndex = selectedOptionIndex !== undefined
    ? originalIndices.indexOf(selectedOptionIndex)
    : undefined;

  const isAnswered = shuffledSelectedIndex !== undefined;

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase rounded-full mb-2">
            {question.term}
          </span>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-tight">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3 mt-6">
          {shuffledOptions.map((option, shuffledIndex) => {
            const isSelected = shuffledSelectedIndex === shuffledIndex;
            const isCorrect = shuffledIndex === shuffledCorrectIndex;
            const isWrongSelected = isSelected && !isCorrect;
            const showCorrect = isAnswered && isCorrect;

            // Get original index to send back to App.tsx
            const originalIndex = originalIndices[shuffledIndex];

            let cardClass = "relative w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group ";

            if (!isAnswered) {
              cardClass += "border-slate-100 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer";
            } else {
              if (showCorrect) {
                cardClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
              } else if (isWrongSelected) {
                cardClass += "border-rose-500 bg-rose-50 text-rose-900";
              } else {
                cardClass += "border-slate-100 opacity-50 cursor-not-allowed";
              }
            }

            return (
              <button
                key={shuffledIndex}
                onClick={() => !isAnswered && onSelectOption(originalIndex)}
                disabled={isAnswered}
                className={cardClass}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    showCorrect ? 'border-emerald-500 bg-emerald-500 text-white' :
                    isWrongSelected ? 'border-rose-500 bg-rose-500 text-white' :
                    'border-slate-300 group-hover:border-indigo-400'
                  }`}>
                  {showCorrect && <CheckCircle2 size={14} />}
                  {isWrongSelected && <XCircle size={14} />}
                  {!showCorrect && !isWrongSelected && (
                    <span className={`text-xs font-bold ${isAnswered ? 'text-slate-400' : 'text-slate-500'}`}>
                      {String.fromCharCode(65 + shuffledIndex)}
                    </span>
                  )}
                </div>
                <span className="text-sm md:text-base pt-0.5">{option}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {isAnswered && (
        <div className={`px-6 py-4 border-t ${
          shuffledSelectedIndex === shuffledCorrectIndex ? 'bg-emerald-100 border-emerald-200' : 'bg-rose-100 border-rose-200'
        }`}>
           <div className="flex items-center gap-2">
            {shuffledSelectedIndex === shuffledCorrectIndex ? (
               <>
                <CheckCircle2 className="text-emerald-600" />
                <span className="font-semibold text-emerald-800">¡Correcto!</span>
               </>
            ) : (
              <>
                <XCircle className="text-rose-600" />
                <span className="font-semibold text-rose-800">Incorrecto. La respuesta correcta era la opción {String.fromCharCode(65 + shuffledCorrectIndex)}.</span>
              </>
            )}
           </div>
        </div>
      )}
    </div>
  );
};

export default QuizCard;