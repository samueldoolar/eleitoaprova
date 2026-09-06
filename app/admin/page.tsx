'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [newDiscipline, setNewDiscipline] = useState('');

  const [selectedTopic, setSelectedTopic] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const [lessonTitle, setLessonTitle] = useState('');
  const [youtubeId, setYoutubeId] = useState('');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadDisciplines();
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
    if (urlOrId.includes('v=')) {
      return urlOrId.split('v=')[1]?.split('&')[0] || urlOrId;
    }
    if (urlOrId.includes('youtu.be/')) {
      return urlOrId.split('youtu.be/')[1]?.split('?')[0] || urlOrId;
    }
    return urlOrId.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      let discId = selectedDiscipline;

      if (selectedDiscipline === 'new') {
        if (!newDiscipline.trim()) throw new Error('Digite o nome da nova disciplina');
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
        if (!newTopic.trim()) throw new Error('Digite o nome do novo tópico');
        const { data: newTop, error: topErr } = await supabase
          .from('topics')
          .insert({ title: newTopic.trim(), discipline_id: discId })
          .select()
          .single();

        if (topErr) throw topErr;
        topId = newTop.id;
      }

      const cleanYoutubeId = extractYoutubeId(youtubeId);
      if (!cleanYoutubeId) throw new Error('Informe um ID ou link do YouTube válido');

      const { error: lessonErr } = await supabase.from('lessons').insert({
        title: lessonTitle.trim(),
        youtube_video_id: cleanYoutubeId,
        topic_id: topId,
        lesson_type: 'VIDEO'
      });

      if (lessonErr) throw lessonErr;

      setStatus('✅ Aula cadastrada com sucesso!');
      setLessonTitle('');
      setYoutubeId('');
      setNewDiscipline('');
      setNewTopic('');
      loadDisciplines();
    } catch (err: any) {
      setStatus(`❌ Erro: ${err.message || 'Falha ao salvar'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#38bdf8' }}>Painel do Administrador</h1>
          <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem' }}>← Voltar ao Site</Link>
        </div>

        {status && (
          <div style={{ padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', backgroundColor: status.startsWith('✅') ? '#065f46' : '#991b1b', color: '#fff', fontSize: '0.875rem' }}>
            {status}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Disciplina</label>
            <select
              value={selectedDiscipline}
              onChange={(e) => {
                setSelectedDiscipline(e.target.value);
                setSelectedTopic('');
              }}
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
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Nome da Nova Disciplina</label>
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
                  placeholder="Ex: Crimes Contra a Administração Pública"
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
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Nome do Novo Tópico</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Ex: Crase e Pontuação"
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
              placeholder="Ex: Aula 01 - Conceitos Fundamentais"
              required
              style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.25rem' }}>Link ou ID do Vídeo do YouTube</label>
            <input
              type="text"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              required
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
      </div>
    </div>
  );
}
