import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizById, submitQuizAnswers } from '../../services/quizService';
import { ROUTES } from '../../config/routes';
import ProgressBar from '../../components/common/ProgressBar';

// PUBLIC_INTERFACE
export default function Quiz() {
  /** Quiz component: renders questions, tracks local progress, and shows results. */
  const { lessonId: idFromPath } = useParams(); // quiz path uses lessonId for simplicity
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      // We use same id for quiz as lessonId in fallback mock; adjust when backend differs
      const data = await getQuizById(idFromPath || 'quiz-intro');
      if (mounted) setQuiz(data);
    }
    load();
    return () => { mounted = false; };
  }, [idFromPath]);

  const total = useMemo(() => (quiz?.questions?.length || 0), [quiz]);
  const completed = useMemo(
    () => Object.keys(answers).filter((k) => answers[k] !== undefined && answers[k] !== null).length,
    [answers]
  );

  function onChoose(qid, choiceIndex) {
    setAnswers((prev) => ({ ...prev, [qid]: choiceIndex }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAnswers(quiz.id, answers);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (!quiz) {
    return <div className="page"><p>Loading quiz…</p></div>;
  }

  if (result) {
    const pct = total ? Math.round((Number(result.score || 0) / total) * 100) : 0;
    return (
      <div className="page">
        <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
          <Link to={ROUTES.LESSONS}>&larr; All Lessons</Link>
        </nav>
        <h1>Quiz Results: {quiz.title}</h1>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={result.score || 0} max={total || 1} label="Quiz score" />
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            Score: {result.score} / {total} ({pct}%)
          </div>
        </div>
        <section style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Review</h2>
          <ol>
            {result.details?.map((d, idx) => (
              <li key={d.questionId} style={{ marginBottom: 12 }}>
                <div>
                  <strong>Q{idx + 1}:</strong>{' '}
                  {quiz.questions[idx]?.prompt || 'Question'}
                </div>
                <div>
                  Your answer: {quiz.questions[idx]?.choices?.[d.chosenIndex] ?? '—'}
                  {' '}| Correct: {quiz.questions[idx]?.choices?.[d.correctIndex]}
                </div>
                {d.explanation && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {d.explanation}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn" to={`${ROUTES.LESSONS}/${encodeURIComponent(quiz.lessonId || 'intro-rules')}`}>Back to Lesson</Link>
          <button className="btn" onClick={() => { setResult(null); setAnswers({}); }} style={{ background: '#6c757d' }}>
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <nav aria-label="Breadcrumb" style={{ marginBottom: 8 }}>
        <Link to={ROUTES.LESSONS}>&larr; All Lessons</Link>
      </nav>
      <h1>{quiz.title}</h1>
      <div style={{ marginTop: 12 }}>
        <ProgressBar value={completed} max={total || 1} label="Quiz completion progress" />
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
          {completed}/{total} answered
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
        <ol>
          {quiz.questions?.map((q, index) => (
            <li key={q.id} style={{ marginBottom: 16 }}>
              <fieldset style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
                <legend style={{ padding: '0 6px' }}>
                  Q{index + 1}. {q.prompt}
                </legend>
                {q.choices?.map((choice, cidx) => {
                  const inputId = `${q.id}-${cidx}`;
                  return (
                    <div key={cidx} style={{ marginBottom: 6 }}>
                      <input
                        id={inputId}
                        type="radio"
                        name={q.id}
                        value={cidx}
                        checked={Number(answers[q.id]) === cidx}
                        onChange={() => onChoose(q.id, cidx)}
                      />
                      <label htmlFor={inputId} style={{ marginLeft: 8 }}>{choice}</label>
                    </div>
                  );
                })}
              </fieldset>
            </li>
          ))}
        </ol>
        <button className="btn" type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? 'Submitting…' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
}
