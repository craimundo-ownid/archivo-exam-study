import React, { useMemo } from 'react';
import { Question } from '../types';
import { Check, X } from 'lucide-react';

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
  const indices = options.map((_, i) => i);

  const seededRandom = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

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
  selectedOptionIndex,
  onSelectOption,
}) => {
  const { shuffledOptions, shuffledCorrectIndex, originalIndices } = useMemo(
    () => shuffleOptions(question.options, question.correctAnswerIndex, question.id + Date.now() % 10000),
    [question.id]
  );

  const shuffledSelectedIndex = selectedOptionIndex !== undefined
    ? originalIndices.indexOf(selectedOptionIndex)
    : undefined;

  const isAnswered = shuffledSelectedIndex !== undefined;

  return (
    <div className="w-full max-w-xl">
      {/* Question Card */}
      <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm">
        <div className="p-5 sm:p-7">
          {/* Term Badge */}
          <div className="mb-4">
            <span className="inline-block px-2.5 py-1 bg-terracotta/10 text-terracotta text-xs font-bold tracking-wide uppercase rounded-md">
              {question.term}
            </span>
          </div>

          {/* Question */}
          <h2 className="font-display text-xl sm:text-2xl text-ink leading-snug">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="px-5 sm:px-7 pb-5 sm:pb-7 space-y-2">
          {shuffledOptions.map((option, shuffledIndex) => {
            const isSelected = shuffledSelectedIndex === shuffledIndex;
            const isCorrect = shuffledIndex === shuffledCorrectIndex;
            const isWrongSelected = isSelected && !isCorrect;
            const showCorrect = isAnswered && isCorrect;

            const originalIndex = originalIndices[shuffledIndex];

            let optionClass = "w-full text-left p-3.5 sm:p-4 rounded-lg border-2 transition-all duration-150 flex items-start gap-3 select-none ";

            if (!isAnswered) {
              optionClass += "border-ink/5 bg-cream/30 hover:border-terracotta/30 hover:bg-terracotta/5 cursor-pointer active:bg-terracotta/10";
            } else {
              if (showCorrect) {
                optionClass += "border-sage bg-sage-light";
              } else if (isWrongSelected) {
                optionClass += "border-red-400 bg-red-50";
              } else {
                optionClass += "border-ink/5 bg-cream/20 opacity-50";
              }
            }

            return (
              <button
                key={shuffledIndex}
                onClick={() => !isAnswered && onSelectOption(originalIndex)}
                disabled={isAnswered}
                className={optionClass}
              >
                {/* Letter Circle */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  showCorrect
                    ? 'bg-sage text-white'
                    : isWrongSelected
                    ? 'bg-red-400 text-white'
                    : isAnswered
                    ? 'bg-ink/10 text-ink/40'
                    : 'bg-ink/5 text-ink/60'
                }`}>
                  {showCorrect ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isWrongSelected ? (
                    <X size={14} strokeWidth={3} />
                  ) : (
                    String.fromCharCode(65 + shuffledIndex)
                  )}
                </div>

                {/* Option Text */}
                <span className={`text-sm sm:text-base leading-relaxed pt-0.5 ${
                  showCorrect
                    ? 'text-sage font-medium'
                    : isWrongSelected
                    ? 'text-red-700'
                    : isAnswered
                    ? 'text-ink/50'
                    : 'text-ink/80'
                }`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Bar */}
        {isAnswered && (
          <div className={`px-5 sm:px-7 py-4 border-t ${
            shuffledSelectedIndex === shuffledCorrectIndex
              ? 'bg-sage-light border-sage/20'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {shuffledSelectedIndex === shuffledCorrectIndex ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-sage text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="font-semibold text-sage text-sm">¡Correcto!</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-red-400 text-white flex items-center justify-center">
                    <X size={12} strokeWidth={3} />
                  </div>
                  <span className="font-semibold text-red-700 text-sm">
                    Incorrecto — La respuesta era la {String.fromCharCode(65 + shuffledCorrectIndex)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
