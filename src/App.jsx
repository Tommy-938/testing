import { useState } from 'react'
import './App.css'

const winOptions = [6, 7, 8, 9, 10, 11]

function PlayerCard({ name, points, onWinSelect }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="player-card">
      <h2>{name}</h2>
      <p className="points">{points}</p>
      <span className="label">points gained</span>

      <div className="win-actions">
        <button className="win-btn" onClick={() => setOpen((prev) => !prev)}>
          {open ? 'Close wins' : 'Declare win'}
        </button>
        {open && (
          <div className="win-list">
            {winOptions.map((option) => (
              <button
                key={option}
                className="win-option"
                onClick={() => {
                  onWinSelect(option)
                  setOpen(false)
                }}
              >
                {option} 番
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  // Replace these with your own point-gaining logic.
  const [playerOnePoints, setPlayerOnePoints] = useState(0)
  const [playerTwoPoints, setPlayerTwoPoints] = useState(0)
  const [playerThreePoints, setPlayerThreePoints] = useState(0)
  const [pointBase, setPointBase] = useState(6)

  const handlePlayerOneWin = (option) => {
    // TODO: implement how Player 1 gains points based on the selected option.
    // Example: setPlayerOnePoints((prev) => prev + computePoints(option))
    console.log('Player 1 win with', option)
  }

  const handlePlayerTwoWin = (option) => {
    // TODO: implement how Player 2 gains points based on the selected option.
    console.log('Player 2 win with', option)
  }

  const handlePlayerThreeWin = (option) => {
    // TODO: implement how Player 3 gains points based on the selected option.
    console.log('Player 3 win with', option)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>三人麻將點數計算器</h1>
      </header>
      <section className="players">
        <PlayerCard
          name="玩家 1"
          points={playerOnePoints}
          onWinSelect={handlePlayerOneWin}
        />
        <PlayerCard
          name="玩家 2"
          points={playerTwoPoints}
          onWinSelect={handlePlayerTwoWin}
        />
        <PlayerCard
          name="玩家 3"
          points={playerThreePoints}
          onWinSelect={handlePlayerThreeWin}
        />
      </section>
    </div>
  )
}

export default App
