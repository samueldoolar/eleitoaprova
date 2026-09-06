'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Question {
  id: string;
  discipline: string;
  statement: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

const mockQuestions: Question[] = [
  {
    id: 'q1',
    discipline: 'Legislação Especial (Lei 13.022/14)',
    statement: 'Segundo o Estatuto Geral das Guardas Municipais (Lei nº 13.022/2014), é princípio mínimo de atuação das guardas municipais:',
    options: [
      'A) Uso da força letal como primeira opção de resposta.',
      'B) Proteção dos direitos humanos fundamentais e do exercício da cidadania.',
      'C) Subordinação direta e exclusiva ao Exército Brasileiro.',
      'D) Aplicação de penas privativas de liberdade em âmbito municipal.'
    ],
    correctOptionIndex: 1,
    explanation: 'Gabarito: B. O Art. 3º da Lei 13.022/14 estabelece como princípios mínimos a proteção dos direitos humanos fundamentais, preservação da vida e compromisso com a evolução social.'
  },
  {
    id: 'q2',
    discipline: 'Direito Constitucional',
    statement: 'Nos termos do Art. 5º da Constituição Federal de 1988, assinale a alternativa correta:',
    options: [
      'A) É livre a manifestação do pensamento, sendo permitido o anonimato.',
      'B) A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, salvo em caso de flagrante delito ou desastre.',
      'C) A prática do racismo constitui crime afiançável e prescritível.',
      'D) Haverá penas de morte em qualquer circunstância no território nacional.'
    ],
    correctOptionIndex: 1,
    explanation: 'Gabarito: B. Conforme Art. 5º, XI da CF/88. O anonimato é vedado (inciso IV) e o racismo é inafiançável e imprescritível (inciso XLII).'
  },
  {
    id: 'q3',
    discipline: 'Língua Portuguesa',
    statement: 'Assinale a opção em que o uso do sinal indicativo de crase é OBRIGATÓRIO:',
    options: [
      'A) Fomos caminhar a pé pelo centro de Itajaí.',
      'B) Ele entregou o relatório a uma secretária.',
      'C) Chegamos à cidade de Itajaí no início da noite.',
      'D) O candidato começou a estudar logo cedo.'
    ],
    correctOptionIndex: 2,
    explanation: 'Gabarito: C. "Chegamos à cidade" possui a fusão da preposição "a" exigida pelo verbo chegar com o artigo feminino "a" que especifica a palavra cidade.'
  }
];

export default function QuestaoPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const currentQ = mockQuestions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (showAnswer) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
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
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Reiniciar banco
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
        {/* Placar de desempenho */}
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

        {/* Card da Questão */}
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

              if (selectedOption === idx) {
                borderColor = '#38bdf8';
              }

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
                {currentQ.explanation}
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
      </main>
    </div>
  );
}
