'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Lesson {
  id: string;
  title: string;
  youtube_video_id: string;
  lesson_type?: string;
}

interface Topic {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Discipline {
  id: string;
  title: string;
  topics: Topic[];
}

export default function Home() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        // Verificar se usuário está logado
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user || null;
        setUser(currentUser);

        // Buscar disciplinas do edital
        const { data: discData } = await supabase
          .from('disciplines')
          .select(`
            id,
            title,
            topics (
              id,
              title,
              lessons (
                id,
                title,
                youtube_video_id,
                lesson_type
              )
            )
          `)
          .order('position', { ascending: true });

        if (discData && discData.length > 0) {
          setDisciplines(discData as unknown as Discipline[]);
          const firstLesson = discData[0]?.topics[0]?.lessons[0];
          if (firstLesson) setCurrentLesson(firstLesson);
        }

        // Se logado, carregar progresso do banco
        if (currentUser) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', currentUser.id);

          if (progressData) {
            setCompletedLessons(progressData.map((p) => p.lesson_id));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const toggleComplete = async (lessonId: string) => {
    if (!user) {
      alert('Faça login para salvar seu progresso permanentemente!');
    }

    const isDone = completedLessons.includes(lessonId);

    if (isDone) {
      setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
      if (user) {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
      }
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
      if (user) {
        await supabase
          .from('user_progress')
          .insert({ user_id: user.id, lesson_id: lessonId, status: 'COMPLETED' });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCompletedLessons([]);
  };

  const totalLessons = disciplines.reduce(
    (acc, disc) => acc + disc.topics.reduce((tAcc, top) => tAcc + top.lessons.length, 0),
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#1e293b', padding: '1rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>
            AprovaTrilha
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
            Concurso: Guarda Municipal de Itajaí / SC
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span>Progresso:</span>
              <span style={{ color: '#34d399', fontWeight: 'bold' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.3s ease' }} />
            </div>
          </div>
<Link
  href="/questoes"
  style={{ backgroundColor: '#0284c7', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}
>
  Treinar Questões
</Link>
          {user ? (
            <button
              onClick={handleLogout}
              style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              Sair
            </button>
          ) : (
            <Link
              href="/login"
              style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              Entrar / Cadastrar
            </Link>
          )}
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentLesson ? (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1rem', border: '1px solid #334155' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '6px' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  src={`https://www.youtube.com/embed/${currentLesson.youtube_video_id}?autoplay=1`}
                  title={currentLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f1f5f9' }}>
                  {currentLesson.title}
                </h2>

                <button
                  onClick={() => toggleComplete(currentLesson.id)}
                  style={{
                    backgroundColor: completedLessons.includes(currentLesson.id) ? '#059669' : '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {completedLessons.includes(currentLesson.id) ? '✓ Concluída' : 'Marcar como Concluída'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#1e293b', padding: '3rem', textAlign: 'center', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8' }}>{loading ? 'Carregando edital...' : 'Nenhuma aula encontrada.'}</p>
            </div>
          )}
        </section>

        <aside style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1rem', border: '1px solid #334155', maxHeight: '80vh', overflowY: 'auto' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
            Conteúdo Programático (Edital)
          </h2>

          {disciplines.map((disc) => (
            <div key={disc.id} style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: '#facc15', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {disc.title}
              </h3>

              {disc.topics?.map((top) => (
                <div key={top.id} style={{ marginLeft: '0.5rem', marginBottom: '0.75rem' }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                    • {top.title}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '0.75rem' }}>
                    {top.lessons?.map((lesson) => {
                      const isSelected = currentLesson?.id === lesson.id;
                      const isDone = completedLessons.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          style={{
                            textAlign: 'left',
                            backgroundColor: isSelected ? '#0284c7' : '#0f172a',
                            color: isSelected ? '#ffffff' : '#94a3b8',
                            border: '1px solid',
                            borderColor: isSelected ? '#38bdf8' : '#1e293b',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ▶ {lesson.title}
                          </span>
                          {isDone && <span style={{ color: '#34d399', fontWeight: 'bold', marginLeft: '0.5rem' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}
