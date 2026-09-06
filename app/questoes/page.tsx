'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Question {
  id: string;
  statement: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  discipline: string;
}

export default function QuestaoPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            statement,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            explanation,
            disciplines ( title )
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map((q: any) => ({
            id: q.id,
            statement: q.statement,
            options: [
              `A) ${q.option_a}`,
              `B) ${q.option_b}`,
              `C) ${q.option_c}`,
              `D) ${q.option_d}`
            ],
            correctOptionIndex: q.correct_option,
            explanation: q.explanation || 'Sem explicação disponível.',
            discipline: q.disciplines?.title || 'Conhecimentos Gerais'
          }));
          setQuestions(formatted);
        }
      } catch (err) {
        console.error('Erro ao buscar questões:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || !currentQ) return;
    setShowAnswer(true);

    if (selectedOption === currentQ.correctOptionIndex) {
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowAnswer(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#1e293b', padding: '1rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#38bdf8' }}>Simulado & Questões</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Guarda Municipal de Itajaí / SC</p>
        </div>
        <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Voltar para Aulas
        </Link>
      </header>

      <main style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Acertos</span>
            <div style={{ fontSize: '1.5rem', color: '#34d399', fontWeight: 'bold' }}>{score.correct}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Erros</span>
            <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: 'bold' }}>{score.wrong}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ backgroundColor: '#1e293b', padding: '3rem', textAlign: 'center', borderRadius: '8px', color: '#94a3b8' }}>
            Carregando questões do banco de dados...
          </div>
        ) : currentQ ? (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.5rem', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#0284c7', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {currentQ.discipline}
            </span>

            <p style={{ marginTop: '1rem', fontSize: '1.05rem', lineHeight: '1.6', color: '#f1f5f9' }}>
              <strong>Questão {currentIndex + 1}:</strong> {currentQ.statement}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
              {currentQ.options.map((option, idx) => {
                let bg = '#0f172a';
                let borderColor = '#334155';

                if (selectedOption === idx) borderColor = '#38bdf8';

                if (showAnswer) {
                  if (idx === currentQ.correctOptionIndex) {
                    bg = '#065f46';
                    borderColor = '#34d399';
                  } else if (selectedOption === idx) {
                    bg = '#7f1d1d';
                    borderColor = '#f87171';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      borderRadius: '6px',
                      backgroundColor: bg,
                      border: `1px solid ${borderColor}`,
                      color: '#fff',
                      cursor: showAnswer ? 'default' : 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {!showAnswer ? (
              <button
                onClick={handleConfirm}
                disabled={selectedOption === null}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  backgroundColor: selectedOption !== null ? '#3b82f6' : '#475569',
                  color: '#fff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: selectedOption !== null ? 'pointer' : 'not-allowed'
                }}
              >
                Responder
              </button>
            ) : (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '6px', borderLeft: '4px solid #38bdf8', marginBottom: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <strong>Gabarito Comentado:</strong> {currentQ.explanation}
                </div>
                <button
                  onClick={handleNext}
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '0.85rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Próxima Questão →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: '#1e293b', padding: '3rem', textAlign: 'center', borderRadius: '8px', color: '#94a3b8' }}>
            Nenhuma questão cadastrada ainda. Acesse o <Link href="/admin" style={{ color: '#38bdf8' }}>Painel do Administrador</Link> para adicionar questões.
          </div>
        )}
      </main>
    </div>
  );
}
