import { useEffect, useMemo, useState } from 'react'

const QUESTIONS = [
  // DASS-21 items 1..21 in order
  'I found it hard to wind down',
  'I was aware of dryness of my mouth',
  'I couldn’t seem to experience any positive feeling at all',
  'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)',
  'I found it difficult to work up the initiative to do things',
  'I tended to over-react to situations',
  'I experienced trembling (e.g., in the hands)',
  'I felt that I was using a lot of nervous energy',
  'I was worried about situations in which I might panic and make a fool of myself',
  'I felt that I had nothing to look forward to',
  'I found myself getting agitated',
  'I found it difficult to relax',
  'I felt down-hearted and blue',
  'I was intolerant of anything that kept me from getting on with what I was doing',
  'I felt I was close to panic',
  'I was unable to become enthusiastic about anything',
  'I felt I wasn’t worth much as a person',
  'I felt that I was rather touchy',
  'I was aware of the beating of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)',
  'I felt scared without any good reason',
  'I felt that life was meaningless',
]

const OPTIONS = [
  { value: 0, label: 'Did not apply to me at all' },
  { value: 1, label: 'Applied to me to some degree' },
  { value: 2, label: 'Applied to me a considerable degree' },
  { value: 3, label: 'Applied to me very much or most of the time' },
]

function SeverityBadge({ label }) {
  const color = {
    Normal: 'bg-emerald-100 text-emerald-700',
    Mild: 'bg-yellow-100 text-yellow-700',
    Moderate: 'bg-orange-100 text-orange-700',
    Severe: 'bg-red-100 text-red-700',
    'Extremely Severe': 'bg-rose-100 text-rose-700',
  }[label] || 'bg-gray-100 text-gray-700'
  return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>
}

function ProgressBar({ score, max = 21, color = 'bg-blue-500' }) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div className="w-full bg-gray-100 h-3 rounded">
      <div className={`h-3 ${color} rounded`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [context, setContext] = useState('')
  const [answers, setAnswers] = useState(Array(21).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [recent, setRecent] = useState([])

  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  useEffect(() => {
    fetch(`${baseUrl}/api/assessments`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setRecent(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => {})
  }, [baseUrl])

  const allAnswered = answers.every(a => a !== null)

  const setAnswer = (idx, value) => {
    const next = [...answers]
    next[idx] = value
    setAnswers(next)
  }

  const reset = () => {
    setAnswers(Array(21).fill(null))
    setResult(null)
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!allAnswered) {
      setError('Please answer all 21 questions before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        student_name: name || undefined,
        student_email: email || undefined,
        age: age ? Number(age) : undefined,
        context: context || undefined,
        answers: answers.map(Number),
      }
      const res = await fetch(`${baseUrl}/api/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to score. Please try again.')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <header className="px-6 py-5 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">D</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">DASS‑21 Student Check</h1>
              <p className="text-xs text-gray-500">Depression · Anxiety · Stress</p>
            </div>
          </div>
          <a href="/test" className="text-sm text-indigo-600 hover:underline">System check</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {!result ? (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-1">Complete the DASS‑21</h2>
                    <p className="text-sm text-gray-600">Think about the past week and choose the option that best describes how much each statement applied to you.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name (optional)" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (optional)" type="email" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input value={age} onChange={e=>setAge(e.target.value)} placeholder="Age (optional)" type="number" min="5" max="120" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input value={context} onChange={e=>setContext(e.target.value)} placeholder="Class / context (optional)" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>

                  <div className="space-y-4">
                    {QUESTIONS.map((q, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <p className="font-medium text-gray-800 mb-3">{i+1}. {q}</p>
                        <div className="grid sm:grid-cols-4 gap-2">
                          {OPTIONS.map((opt) => (
                            <label key={opt.value} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 ${answers[i]===opt.value? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50' : ''}`}>
                              <input
                                type="radio"
                                name={`q${i}`}
                                className="hidden"
                                value={opt.value}
                                checked={answers[i] === opt.value}
                                onChange={() => setAnswer(i, opt.value)}
                              />
                              <span className="text-sm font-medium">{opt.value}</span>
                              <span className="text-xs text-gray-600">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

                  <div className="flex items-center justify-between">
                    <button type="button" onClick={reset} className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50">Reset</button>
                    <button disabled={!allAnswered || submitting} className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
                      {submitting ? 'Scoring…' : 'Submit & See Results'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-1">Your Results</h2>
                    <p className="text-sm text-gray-600">These scores reflect the past week. If you are distressed, please speak with a counselor or a trusted adult.</p>
                  </div>

                  <div className="grid gap-4">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Depression: {result.depression_score} / 21</div>
                        <SeverityBadge label={result.depression_severity} />
                      </div>
                      <ProgressBar score={result.depression_score} color="bg-indigo-500" />
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Anxiety: {result.anxiety_score} / 21</div>
                        <SeverityBadge label={result.anxiety_severity} />
                      </div>
                      <ProgressBar score={result.anxiety_score} color="bg-teal-500" />
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Stress: {result.stress_score} / 21</div>
                        <SeverityBadge label={result.stress_severity} />
                      </div>
                      <ProgressBar score={result.stress_score} color="bg-amber-500" />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border text-sm text-gray-700">
                    <p className="mb-2"><span className="font-medium">Total score:</span> {result.total_score} / 63</p>
                    {result.assessment_id && (
                      <p className="text-xs text-gray-500">Saved with ID: {result.assessment_id}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={reset} className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50">Take Again</button>
                    <a href="/" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Home</a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-gray-800 mb-2">About DASS‑21</h3>
              <p className="text-sm text-gray-600">A 21‑item screening tool that measures depression, anxiety, and stress over the past week. It is not a diagnosis. For concerns, consult a professional.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Assessments</h3>
              <ul className="space-y-3">
                {recent.length === 0 && <li className="text-sm text-gray-500">No records yet or database not connected.</li>}
                {recent.map((r, idx) => (
                  <li key={idx} className="text-sm text-gray-700 border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{r.student_name || 'Anonymous'}</div>
                      <span className="text-xs text-gray-500">{new Date(r.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">D {r.depression_score ?? '-'} · A {r.anxiety_score ?? '-'} · S {r.stress_score ?? '-'}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-gray-800 mb-2">If you need help</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Talk to your school counselor or mental health professional.</li>
                <li>Reach out to a trusted teacher, family member, or friend.</li>
                <li>If you feel unsafe, contact local emergency services immediately.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-500">
        For educational screening only, not a medical diagnosis.
      </footer>
    </div>
  )
}
