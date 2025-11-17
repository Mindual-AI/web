import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const formatISODate = (date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const initialMessages = useMemo(
    () => [
      {
        id: 'user-1',
        role: 'user',
        name: '나',
        content: '○○공기청정기에서 필터 교체 알림이 떴는데, 어떻게 교체하나요?'
      },
      {
        id: 'agent-1',
        role: 'agent',
        name: 'Mindual',
        content:
          '제품의 전원을 끈 뒤 전면 커버를 분리하고 필터를 화살표 방향으로 당겨 빼세요.\n새 필터를 장착 후 RESET 버튼을 3초간 눌러 초기화하면 알림이 사라집니다.\n(출처: LG_Purifier_Manual.pdf, p.28 "필터 교체 방법")'
      },
      {
        id: 'user-2',
        role: 'user',
        name: '나',
        content: '이번 주말에 □□에어컨 청소를 해야 하는데 필요한 도구를 알려줘.'
      },
      {
        id: 'agent-2',
        role: 'agent',
        name: 'Mindual',
        content:
          '청소 전 준비물 목록을 만들었어요.\n극세사천, 중성세제, 드라이버, 새 필터 (선택)\n원하시면 리마인더로 저장해둘까요?'
      },
      {
        id: 'agent-3',
        role: 'agent',
        name: 'Mindual',
        variant: 'reminder',
        content: '토요일 오전 10시 ‘에어컨 청소’ 일정이 추가되었습니다.'
      }
    ],
    []
  )

  const [messages, setMessages] = useState(initialMessages)
  const [question, setQuestion] = useState('')

  const calendar = useMemo(() => {
    const year = today.getFullYear()
    const monthIndex = today.getMonth()

    const firstDay = new Date(year, monthIndex, 1)
    const startWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const currentDate = new Date(year, monthIndex, day)
      cells.push({
        key: formatISODate(currentDate),
        label: day,
        isToday: day === today.getDate()
      })
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    return {
      label: `${year}년 ${monthIndex + 1}월`,
      cells
    }
  }, [today])

  const calendarEvents = useMemo(
    () => [
      {
        id: 'event-3',
        title: '배포 캘린더 동기화 체크',
        time: '09:00',
        location: 'Slack huddle',
        date: formatISODate(new Date(today.getFullYear(), today.getMonth(), 17))
      }
    ],
    [today]
  )

  return (
    <div className="app">
      <div className="brand-bar">
        <div className="brand-title">MINDUAL</div>
        <div className="header-actions">
          <button type="button" className="primary ghost">
            메뉴얼
          </button>
          <button type="button" className="primary">사용자 설정</button>
        </div>
      </div>
      <main className="layout">
        <section className="panel chat-panel">
          <header>
            <div className="chat-title">
              <h1>질문하기</h1>
              <p className="subtitle">
                RAG 기반 에이전트 MINDUAL에게 궁금한 것을 전달하고 사용법에 대한 답변을 한눈에 확인하세요.
              </p>
            </div>
            <span className="tag">Live</span>
          </header>

          <div className="chat-window">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-row ${message.role} ${message.variant ?? ''}`}
              >
                <div className="avatar">{message.role === 'agent' ? '🤖' : '🙂'}</div>
                <div className="bubble">
                  <div className="bubble-header">
                    <span className="name">{message.name}</span>
                    {message.role === 'agent' && message.variant !== 'reminder' && (
                      <span className="source">지식 베이스 · 최신 매뉴얼</span>
                    )}
                  </div>
                  <p>
                    {message.content.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="input-area"
            onSubmit={(event) => {
              event.preventDefault()
              const trimmed = question.trim()
              if (!trimmed) return

              const userMessage = {
                id: `user-${Date.now()}`,
                role: 'user',
                name: '사용자',
                content: trimmed
              }

              const placeholderAnswer = {
                id: `agent-${Date.now()}`,
                role: 'agent',
                name: 'Mindual',
                content:
                  'RAG 파이프라인과 연결되면 여기에서 맞춤형 답변이 제공됩니다.\n현재는 데모 응답입니다.'
              }

              setMessages((prev) => [...prev, userMessage, placeholderAnswer])
              setQuestion('')
            }}
          >
            <label htmlFor="question" className="sr-only">
              사용자 질문
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="질문을 입력하세요. ( ex. 제품 A의 필터 교체 주기를 알려줘. )"
            />
            <div className="form-actions">
              <button type="button" className="secondary">
                지식 베이스 연결
              </button>
              <button type="submit" className="primary">
                전송
              </button>
            </div>
          </form>
        </section>

        <aside className="panel assistant-panel">
          <div className="info-card">
            <h3>연결된 문서</h3>
            <ul>
              <li>LG_Purifier 공기청정기 사용설명서<span className="pill success">동기화</span></li>
              <li>LG 에어컨 청소 가이드 <span className="pill warning">업데이트 필요</span></li>
              <li>서비스 FAQ.xlsx <span className="pill info">RAG 캐시</span></li>
            </ul>
          </div>

          <div className="info-card">
            <h3>자동화 워크플로</h3>
            <div className="workflow">
              <div className="workflow-step">
                <span className="icon">🔍</span>
                <div>
                  <p className="label">임베딩 검색</p>
                  <p className="desc">질문과 유사한 문서를 Azure AI Search에서 조회</p>
                </div>
              </div>
              <div className="workflow-step">
                <span className="icon">🧠</span>
                <div>
                  <p className="label">컨텍스트 생성</p>
                  <p className="desc">관련 문단을 조합해 LLM에 전달</p>
                </div>
              </div>
              <div className="workflow-step">
                <span className="icon">✅</span>
                <div>
                  <p className="label">액션 실행</p>
                  <p className="desc">필요 시 리마인더, 티켓 생성 등 후속 작업 실행</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card calendar-card">
            <div className="calendar-header">
              <div>
                <h3>캘린더</h3>
                <p className="calendar-subtitle">
                  Google Calendar API와 연동하여 최신 배포 일정을 자동으로 받아옵니다.
                </p>
              </div>
              <button type="button" className="primary ghost">
                Google Calendar 동기화
              </button>
            </div>
            <div className="calendar-meta">
              <span className="month-label">{calendar.label}</span>
              <span className="timezone">기준: Asia/Seoul</span>
            </div>

            <div className="weekday-grid">
              {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
                <span key={weekday} className="weekday">
                  {weekday}
                </span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendar.cells.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="calendar-cell empty" />
                }

                const dailyEvents = calendarEvents.filter((event) => event.date === cell.key)

                return (
                  <div
                    key={cell.key}
                    className={`calendar-cell ${cell.isToday ? 'today' : ''} ${
                      dailyEvents.length ? 'has-event' : ''
                    }`}
                  >
                    <span className="day-number">{cell.label}</span>
                    {dailyEvents.length > 0 && <span className="event-dot" />}
                  </div>
                )
              })}
            </div>

            <div className="event-list">
              <h4>다가오는 일정</h4>
              <ul>
                {calendarEvents.map((event) => (
                  <li key={event.id}>
                    <div className="event-date">
                      {event.date.slice(5)} <span>{event.time}</span>
                    </div>
                    <div className="event-detail">
                      <p className="event-title">{event.title}</p>
                      <p className="event-location">{event.location}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="api-note">
                연결 후에는 Google Calendar에서 승인한 이벤트만 표시되며, 오늘 날짜는 보라색으로 강조됩니다.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
