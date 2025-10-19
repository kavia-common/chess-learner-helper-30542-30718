import React, { useState } from 'react';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';

const categories = ['Rules', 'Openings', 'Tactics', 'Endgames'];

export default function TimedQuizzes() {
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [category, setCategory] = useState(categories[0]);

  const startQuiz = () => {
    setActive(true);
    setTimeLeft(60);
    // Note: This is a simple mock timer not using setInterval to avoid side effects in SPA.
  };

  return (
    <main className="container" aria-labelledby="tq-title">
      <header className="page-header">
        <h1 id="tq-title">Timed Quizzes</h1>
        <p className="text-muted">Answer quickly and accurately to earn more points.</p>
      </header>

      {!active ? (
        <section className="card" aria-label="Quiz setup">
          <div className="card-body grid-2">
            <label>
              <span className="label">Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Select quiz category">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <div className="align-end">
              <button className="btn btn-primary" onClick={startQuiz}>Start 60s Quiz</button>
            </div>
          </div>
        </section>
      ) : (
        <section className="card" aria-label="Quiz in progress">
          <div className="card-header">
            <h2 className="card-title">Category: {category}</h2>
            <Badge label="60s" color="warning" />
          </div>
          <div className="card-body">
            <ProgressBar value={Math.max(0, (timeLeft / 60) * 100)} label={`Time left: ${timeLeft}s`} />
            <p className="text-muted">Mock quiz: integrate real questions via quizService in future iterations.</p>
            <div className="grid-2">
              <button className="btn btn-success" onClick={() => setTimeLeft(Math.max(0, timeLeft - 10))}>Answer A</button>
              <button className="btn btn-outline" onClick={() => setTimeLeft(Math.max(0, timeLeft - 10))}>Answer B</button>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn" onClick={() => setActive(false)}>End Quiz</button>
          </div>
        </section>
      )}
    </main>
  );
}
