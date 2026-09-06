'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ⚠️ DIGITE AQUI O SEU E-MAIL DE ADMINISTRADOR:
const ADMIN_EMAIL = 'samueldoolar@gmail.com';

interface Discipline {
  id: string;
  title: string;
}

interface Topic {
  id: string;
  title: string;
  discipline_id: string;
}

export default function AdminPanel() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState<'lesson' | 'question'>('lesson');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Estados Form Aula
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Estados Form Questão
  const [qDiscipline, setQDiscipline] = useState('');
  const [qStatement, setQStatement] = useState('');
  const [qOptionA, setQOptionA] = useState('');
  const [qOptionB, setQOptionB] = useState('');
  const [qOptionC, setQOptionC] = useState('');
  const [qOptionD, setQOptionD] = useState('');
  const [qCorrect, setQCorrect] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function checkAdminAuth() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user || null;
      setCurrentUser(user);
      setCheckingAuth(false);

      if (user && (user.email === ADMIN_EMAIL || ADMIN_EMAIL === 'seu-email@admin.com')) {
        loadDisciplines();
      }
    }

    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (selectedDiscipline && selectedDiscipline !== 'new') {
      loadTopics(selectedDiscipline);
    } else {
      setTopics([]);
    }
  }, [selectedDiscipline]);

  const loadDisciplines = async () => {
    const { data } = await supabase.from('disciplines').select('id, title').order('position', { ascending: true });
    if (data) setDisciplines(data);
  };

  const loadTopics = async (disciplineId: string) => {
    const { data } = await supabase.from('topics').select('id, title, discipline_id').eq('discipline_id', disciplineId);
    if (data) setTopics(data);
  };

  const extractYoutubeId = (urlOrId: string) => {
    if (urlOrId.includes('v=')) return urlOrId.split('v=')[1]?.split('&')[0] || urlOrId;
    if (urlOrId.includes('youtu.be/')) return urlOrId.split('youtu.be/')[1]?.split('?')[0] || urlOrId;
    return urlOrId.trim();
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      let discId = selectedDiscipline;
      if (selectedDiscipline === 'new') {
        if (!newDiscipline.trim()) throw new Error('Digite o nome da disciplina');
        const { data: newDisc, error: discErr } = await supabase
          .from('disciplines')
          .insert({ title: newDiscipline.trim(), position: disciplines.length + 1 })
          .select()
          .single();
        if (discErr) throw discErr;
        discId = newDisc.id;
      }

      let topId = selectedTopic;
      if (selectedTopic === 'new' || selectedDiscipline === 'new') {
        if (!newTopic.trim()) throw new Error('Digite o nome do tópico');
        const { data: newTop, error: topErr } = await supabase
          .from('topics')
          .insert({ title: newTopic.trim(), discipline_id: discId })
          .select()
          .single();
        if (topErr) throw topErr;
        topId = newTop.id;
      }

      const cleanYoutubeId = extractYoutubeId(youtubeId);
      if (!cleanYoutubeId) throw new Error('ID ou link do YouTube inválido');

      const { error: lessonErr } = await supabase.from('lessons').insert({
        title: lessonTitle.trim(),
        youtube_video_id: cleanYoutubeId,
        pdf_url: pdfUrl.trim() || null,
        topic_id: topId,
        lesson_type: 'VIDEO'
      });

      if (lessonErr) throw lessonErr;

      setStatus('✅ Aula cadastrada com sucesso!');
      setLessonTitle('');
      setYoutubeId('');
      setPdfUrl('');
      setNewDiscipline('');
      setNewTopic('');
      loadDisciplines();
    } catch (err: any) {
      setStatus(`❌ Erro: ${err.message || 'Falha ao salvar'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const { error } = await supabase.from('questions').insert({
        discipline_id: qDiscipline || null,
        statement: qStatement.trim(),
        option_a: qOptionA.trim(),
        option_b: qOptionB.trim(),
        option_c: qOptionC.trim(),
        option_d: qOptionD.trim(),
        correct_option: Number(qCorrect),
        explanation: qExplanation.trim()
      });

      if (error) throw error;

      setStatus('✅ Questão cadastrada com sucesso!');
      setQStatement('');
      setQOptionA('');
      setQOptionB('');
      setQOptionC('');
      setQOptionD('');
      setQExplanation('');
    } catch (err: any) {
      setStatus(`❌ Erro ao cadastrar questão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Verificando permissões de acesso...
      </div>
    );
  }

  const isAuthorized = currentUser && (currentUser.email === ADMIN_EMAIL || ADMIN_EMAIL === 'seu-email@admin.com');

  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ color: '#ef4444', fontSize: '1.5rem', marginTop: 0 }}>Acesso Restrito 🔒</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Apenas administradores autorizados podem acessar este painel.
          </p>
          <Link href="/login" style={{ display: 'inline-block', marginTop: '1rem', backgroundColor: '#3b82f6', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            Fazer Login como Administrador
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#38bdf8' }}>Painel do Administrador</h1>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Logado como: {currentUser?.email}</span>
          </div>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>← Voltar ao Site</Link>
        </div>

        {/* Abas de Navegação Admin */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => { setActiveTab('lesson'); setStatus(''); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'lesson' ? '#38bdf8' : '#0f172a',
              color: activeTab === 'lesson' ? '#0f172a' : '#94a3b8',
              fontWeight: 'bold'
            }}
          >
            📹 Cadastrar Aula
          </button>
          <button
            onClick={() => { setActiveTab('question'); setStatus(''); }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'question' ? '#38bdf8' : '#0f172a',
              color: activeTab === 'question' ? '#0f172a' : '#94a3b8',
              fontWeight: 'bold'
            }}
          >
            ❓ Cadastrar Questão
          </button>
        </div>

        {status && (
          <div style={{ padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', backgroundColor: status.startsWith('✅') ? '#065f46' : '#991b1b', color: '#fff', fontSize: '0.875rem' }}>
            {status}
          </div>
        )}

        {activeTab === 'lesson' ? (
          <form onSubmit={handleLessonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Disciplina</label>
              <select
                value={selectedDiscipline}
                onChange={(e) => { setSelectedDiscipline(e.target.value); setSelectedTopic(''); }}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
              >
                <option value="">Selecione uma disciplina...</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
                <option value="new">+ Criar Nova Disciplina</option>
              </select>
            </div>

            {selectedDiscipline === 'new' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Nova Disciplina</label>
                <input
                  type="text"
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value)}
                  placeholder="Ex: Direito Penal"
                  required
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {selectedDiscipline && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Tópico do Edital</label>
                {selectedDiscipline === 'new' ? (
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Ex: Crimes contra a Pessoa"
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                  />
                ) : (
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
                  >
                    <option value="">Selecione um tópico...</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                    <option value="new">+ Criar Novo Tópico</option>
                  </select>
                )}
              </div>
            )}

            {selectedTopic === 'new' && selectedDiscipline !== 'new' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Novo Tópico</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Ex: Crase"
                  required
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Título da Aula</label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Ex: Aula 01 - Introdução"
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Link do Vídeo do YouTube</label>
              <input
                type="text"
                value={youtubeId}
                onChange={(e) => setYoutubeId(e.target.value)}
                placeholder="Ex: https://www.youtube.com/watch?v=..."
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Link do PDF de Apoio (Opcional)</label>
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="Ex: https://link-do-seu-pdf.com/aula.pdf"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Aula'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleQuestionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Disciplina Associada</label>
              <select
                value={qDiscipline}
                onChange={(e) => setQDiscipline(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
              >
                <option value="">Geral / Sem Disciplina Específica</option>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Enunciado da Questão</label>
              <textarea
                value={qStatement}
                onChange={(e) => setQStatement(e.target.value)}
                placeholder="Digite a pergunta da questão..."
                required
                rows={3}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Alternativa A</label>
              <input
                type="text"
                value={qOptionA}
                onChange={(e) => setQOptionA(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Alternativa B</label>
              <input
                type="text"
                value={qOptionB}
                onChange={(e) => setQOptionB(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Alternativa C</label>
              <input
                type="text"
                value={qOptionC}
                onChange={(e) => setQOptionC(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Alternativa D</label>
              <input
                type="text"
                value={qOptionD}
                onChange={(e) => setQOptionD(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Gabarito (Alternativa Correta)</label>
              <select
                value={qCorrect}
                onChange={(e) => setQCorrect(Number(e.target.value))}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
              >
                <option value={0}>Alternativa A</option>
                <option value={1}>Alternativa B</option>
                <option value={2}>Alternativa C</option>
                <option value={3}>Alternativa D</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Explicação / Comentário da Resposta</label>
              <textarea
                value={qExplanation}
                onChange={(e) => setQExplanation(e.target.value)}
                placeholder="Explique por que esta resposta é a correta..."
                rows={2}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Questão'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
