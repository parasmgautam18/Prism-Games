import { useState, useEffect } from 'react'

const symbols = ['🍎', '🍌', '🍇', '🍓', '🍑', '🍒', '🥝', '🍍', '🥭', '🍊']

function App() {
    const [level, setLevel] = useState(1)
    const [cards, setCards] = useState([])
    const [flippedCards, setFlippedCards] = useState([])
    const [matchedCards, setMatchedCards] = useState([])
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)

    const generateCards = (level) => {
        const numPairs = level
        const selectedSymbols = symbols.slice(0, numPairs)
        const cardPairs = selectedSymbols.flatMap(symbol => [
            { id: `${symbol}-1`, symbol, isFlipped: false, isMatched: false },
            { id: `${symbol}-2`, symbol, isFlipped: false, isMatched: false }
        ])
        return cardPairs.sort(() => Math.random() - 0.5)
    }

    useEffect(() => {
        setCards(generateCards(level))
        setFlippedCards([])
        setMatchedCards([])
        setGameOver(false)
    }, [level])

    const handleCardClick = (id) => {
        if (flippedCards.length === 2 || flippedCards.includes(id) || matchedCards.includes(id)) return

        const newFlipped = [...flippedCards, id]
        setFlippedCards(newFlipped)

        setCards(prev => prev.map(card =>
            card.id === id ? { ...card, isFlipped: true } : card
        ))

        if (newFlipped.length === 2) {
            const [first, second] = newFlipped
            const firstCard = cards.find(card => card.id === first)
            const secondCard = cards.find(card => card.id === second)

            if (firstCard.symbol === secondCard.symbol) {
                setMatchedCards(prev => [...prev, first, second])
                setScore(prev => prev + 10)
                setFlippedCards([])
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(card =>
                        newFlipped.includes(card.id) ? { ...card, isFlipped: false } : card
                    ))
                    setFlippedCards([])
                }, 1000)
            }
        }
    }

    useEffect(() => {
        if (matchedCards.length === cards.length && cards.length > 0) {
            setTimeout(() => {
                setLevel(prev => prev + 1)
            }, 1000)
        }
    }, [matchedCards, cards])

    const resetGame = () => {
        setLevel(1)
        setScore(0)
        setMatchedCards([])
        setFlippedCards([])
    }

    const gridCols = level === 1 ? 'grid-cols-2' : level === 2 ? 'grid-cols-3' : 'grid-cols-4'

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-400 to-purple-600 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold text-white mb-4">Memory Card Game</h1>
            <div className="text-white mb-4">
                <p>Level: {level}</p>
                <p>Score: {score}</p>
            </div>
            <div className={`grid ${gridCols} gap-4 mb-4`}>
                {cards.map(card => (
                    <div
                        key={card.id}
                        className={`w-20 h-20 bg-white rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-transform duration-300 ${card.isFlipped || matchedCards.includes(card.id) ? 'bg-green-200' : 'hover:scale-105'
                            } ${matchedCards.includes(card.id) ? 'opacity-0' : ''}`}
                        onClick={() => handleCardClick(card.id)}
                    >
                        {card.isFlipped || matchedCards.includes(card.id) ? card.symbol : '?'}
                    </div>
                ))}
            </div>
            <button
                onClick={resetGame}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Reset Game
            </button>
        </div>
    )
}

export default App