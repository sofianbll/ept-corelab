import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axios';

function QuizPage() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  async function loadQuiz() {
    try {
      setLoading(true);
      setQuiz(await api.quizzes.get(quizId));
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de charger le QCM.');
    } finally {
      setLoading(false);
    }
  }

  function toggleAnswer(questionIndex, option) {
    setAnswers((current) => {
      const selected = current[questionIndex] || [];
      const next = selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option];
      return { ...current, [questionIndex]: next };
    });
  }

  async function submitQuiz(e) {
    e.preventDefault();
    const payload = quiz.questions.map((_, index) => answers[index] || []);
    try {
      setResult(await api.quizzes.submit(quiz._id, payload));
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de soumettre le QCM.');
    }
  }

  if (loading) {
    return <div className="panel">Chargement du QCM...</div>;
  }

  if (!quiz) {
    return <div className="panel">QCM introuvable.</div>;
  }

  return (
    <form className="page-stack" onSubmit={submitQuiz}>
      <div className="page-heading">
        <div>
          <p className="eyebrow">QCM</p>
          <h1>{quiz.title}</h1>
        </div>
        <span className="status-pill">Seuil {quiz.passingScore}%</span>
      </div>

      {error && <div className="form-error">{error}</div>}

      {quiz.questions.map((question, questionIndex) => (
        <section className="panel quiz-question" key={question._id || questionIndex}>
          <div className="panel-header">
            <h2>{question.text}</h2>
            <span>{question.points || 1} pt</span>
          </div>
          <div className="answer-list">
            {question.options.map((option) => (
              <label className="answer-row" key={option}>
                <input
                  type="checkbox"
                  checked={(answers[questionIndex] || []).includes(option)}
                  onChange={() => toggleAnswer(questionIndex, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </section>
      ))}

      {result && (
        <div className={result.passed ? 'result-card passed' : 'result-card failed'}>
          <strong>{result.passed ? 'QCM réussi' : 'QCM à retravailler'}</strong>
          <span>{result.score} / {result.maxScore} points</span>
        </div>
      )}

      <button className="primary-button" type="submit">Soumettre le QCM</button>
    </form>
  );
}

export default QuizPage;
