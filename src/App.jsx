import React, { useEffect, useState } from "react";
import "./App.css";

const EMOJIS = ["😃", "😊", "😎", "🤩", "😍"];
const LS_KEY = "emoji-votes-v1";

function App() {
    // 1) Початковий стан з localStorage (одноразово)
    const [votes, setVotes] = useState(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                const valid =
                    Array.isArray(saved) &&
                    saved.length === EMOJIS.length &&
                    saved.every(
                        (it, i) =>
                            it &&
                            typeof it.emoji === "string" &&
                            it.emoji === EMOJIS[i] &&
                            Number.isFinite(it.count) &&
                            it.count >= 0
                    );
                if (valid) return saved;
            }
        } catch { }
        return EMOJIS.map((e) => ({ emoji: e, count: 0 }));
    });

    // 2) winnerIdx показуємо лише після кліку на кнопку
    const [winnerIdx, setWinnerIdx] = useState(null);

    // 3) Синхронізація у localStorage
    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(votes));
        } catch { }
    }, [votes]);

    // 4) Голос
    const handleVote = (idx) => {
        setVotes((prev) =>
            prev.map((v, i) => (i === idx ? { ...v, count: v.count + 1 } : v))
        );
    };

    // 5) Порахувати результат тільки за запитом
    const showResults = () => {
        const total = votes.reduce((s, v) => s + v.count, 0);
        if (total === 0) {
            setWinnerIdx(null);
            return;
        }
        const max = Math.max(...votes.map((v) => v.count));
        const idx = votes.findIndex((v) => v.count === max);
        setWinnerIdx(idx);
    };

    // 6) Скидання
    const clearResults = () => {
        setVotes(EMOJIS.map((e) => ({ emoji: e, count: 0 })));
        setWinnerIdx(null);
        try {
            localStorage.removeItem(LS_KEY);
        } catch { }
    };

    const total = votes.reduce((s, v) => s + v.count, 0);
    const winner = winnerIdx !== null ? votes[winnerIdx] : null;

    return (
        <div className="page">
            <h1 className="title">Голосування за найкращий смайлик</h1>

            <div className="row">
                {votes.map((item, i) => (
                    <div key={item.emoji} className="emojiCol">
                        <button
                            type="button"
                            onClick={() => handleVote(i)}
                            className="emojiBtn"
                            aria-label={`Голосувати за ${item.emoji}`}
                            title="Натисни, щоб проголосувати"
                        >
                            <span className="emoji">{item.emoji}</span>
                        </button>
                        <div className="count">{item.count}</div>
                    </div>
                ))}
            </div>

            <div className="actions">
                <button type="button" onClick={showResults} className="primary">
                    Show Results
                </button>
                <button type="button" onClick={clearResults} className="danger">
                    Очистити результати
                </button>
            </div>

            <div className="results">
                <h2 className="subtitle">Результати голосування:</h2>
                {winner ? (
                    <div className="resultsInner">
                        <div className="label">Переможець:</div>
                        <div className="winnerEmoji">{winner.emoji}</div>
                        <div className="smallNote">Кількість голосів: {winner.count}</div>
                        <div className="smallNote">Всього голосів: {total}</div>
                    </div>
                ) : (
                    <div className="smallNote">Натисніть «Show Results»</div>
                )}
            </div>
        </div>
    );
}

export default App;
