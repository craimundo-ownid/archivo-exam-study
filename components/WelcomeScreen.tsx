import React, { useState } from 'react';
import { BookOpen, ArrowRight, User } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper p-4 relative">
      {/* Subtle texture */}
      <div className="fixed inset-0 paper-texture pointer-events-none" />

      <div className="max-w-sm w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-terracotta rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-terracotta/20">
            <BookOpen size={28} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl text-ink mb-2">Oposiciones Archivo</h1>
          <p className="text-muted text-sm">Test interactivo de preparación</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-ink mb-2">
                  ¿Cómo te llamas?
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-muted/50" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    required
                    className="block w-full pl-10 pr-4 py-3 bg-cream/50 border border-ink/10 rounded-lg text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30 transition-all"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  Guardaremos tu historial de puntuaciones.
                </p>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-semibold text-white bg-terracotta hover:bg-terracotta-light focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all select-none"
              >
                Comenzar <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-muted/50 text-xs">
          Archivo y Documentación
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
