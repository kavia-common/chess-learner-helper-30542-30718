import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLessons } from '../../store/lessons';

/**
 * PUBLIC_INTERFACE
 * Quiz renders lesson quiz questions, allows answer selection, validates, and submits.
 */
export function Quiz() {
  const { id } = useParams();
  const { state, actions } = useLessons();
  const { data, loading, error, submitting, result } = state.quiz;

  const [answers, setAnswers] = useState({}); // { [questionId]: { answerIndex } }
  const [formError, setFormError] = useState('');

  useEffect(() => {
    actions.fetchQuiz(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setAnswers({});
    setFormError('');
  }, [id]);

  const allAnswered = useMemo(() => {
    const count = data?.questions?.length || 0;
    const answered = Object.keys(answers).length;
    return count > 0 && answered === count;
  }, [answers, data]);

  const onSelect = (qid, idx) => {
    setAnswers(a => ({ ...a, [qid]: { answerIndex: idx } }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!data || !data.questions?.length) {
      setFormError('No quiz to submit.');
      return;
    }
    if (!allAnswered) {
      setFormError('Please answer all questions before submitting.');
      return;
    }
    await actions.submitQuiz(id, answers);
  };

  return (
    <section aria-labelledby="quiz-title">
      <h1 id="quiz-title">Quiz</h1>
      {loading && <div role="status">Loading quiz…</div>}
      {error && <div role="alert" style={{ color: 'crimson' }}>{error}</div>}
      {!loading && !error && data && (
        <form onSubmit={onSubmit} aria-describedby={formError ? 'quiz-error' : undefined}>
          {data.questions?.map((q, idx) => (
            <fieldset key={q.id} style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <legend>{idx + 1}. {q.prompt}</legend>
              <div role="radiogroup" aria-label={`Question ${idx + 1}`}>
                {q.options.map((opt, oidx) => {
                  const inputId = `${q.id}-${oidx}`;
                  return (
                    <div key={inputId} style={{ margin: '6px 0' }}>
                      <input
                        type="radio"
                        name={q.id}
                        id={inputId}
                        checked={answers[q.id]?.answerIndex === oidx}
                        onChange={() => onSelect(q.id, oidx)}
                      />
                      <label htmlFor={inputId} style={{ marginLeft: 8 }}>{opt}</label>
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {formError && <div id="quiz-error" role="alert" style={{ color: 'crimson', marginBottom: 8 }}>{formError}</div>}
          <button type="submit" className="theme-toggle" style={{ position: 'static' }} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Answers'}
          </button>
        </form>
      )}
      {result && (
        <section aria-labelledby="quiz-result-title" style={{ marginTop: 16 }}>
          <h2 id="quiz-result-title">Results</h2>
          <p>Score: {result.score}%</p>
          <ul>
            {result.results?.map((r) => (
              <li key={r.questionId}>
                Q {r.questionId}: {r.correct ? 'Correct' : 'Incorrect'}{r.explanation ? ` — ${r.explanation}` : ''}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8 }}>
            <Link to={`/lessons/${id}`}>Back to lesson</Link>
          </div>
        </section>
      )}
      <div style={{ marginTop: 12 }}>
        <Link to="/lessons">Back to lessons</Link>
      </div>
    </section>
  );
}
