import { useState } from 'react'
import './App.css'

const winOptions = [6, 7, 8, 9, 10, 11]

// 番數對應的點數：6番→8點, 7番→16點, 8番→24點, 9番→32點, 10番→64點, 11番→128點
const getPointsFromFan = (fan) => {
  const pointMap = {
    6: 8,
    7: 16,
    8: 24,
    9: 32,
    10: 64,
    11: 128
  }
  return pointMap[fan] || 0
}

function PlayerCard({ 
  name, 
  points, 
  playerId,
  otherPlayers,
  onWinSelect,
  onDrawSelect
}) {
  const [open, setOpen] = useState(false)
  const [winType, setWinType] = useState(null) // '出銃' or '自摸' or '和'
  const [selectedPlayer, setSelectedPlayer] = useState(null) // 出銃時選擇的玩家

  const handleWinTypeSelect = (type) => {
    if (type === '和') {
      // 和：直接處理，不需要選擇番數
      onDrawSelect()
      setOpen(false)
      setWinType(null)
      setSelectedPlayer(null)
      return
    }
    setWinType(type)
    if (type === '自摸') {
      // 自摸不需要選擇玩家，直接進入番數選擇
      setSelectedPlayer(null)
    }
  }

  const handleFanSelect = (fan) => {
    onWinSelect(fan, winType, selectedPlayer)
    // 重置狀態
    setOpen(false)
    setWinType(null)
    setSelectedPlayer(null)
  }

  const handleBack = () => {
    if (selectedPlayer !== null) {
      // 如果已選擇玩家，返回選擇玩家階段
      setSelectedPlayer(null)
    } else if (winType) {
      // 如果已選擇類型，返回選擇類型階段
      setWinType(null)
    } else {
      // 否則關閉
      setOpen(false)
    }
  }

  return (
    <div className="player-card">
      <h2>{name}</h2>
      <p className="points">{points}</p>
      <span className="label">points gained</span>

      <div className="win-actions">
        <button className="win-btn" onClick={() => setOpen((prev) => !prev)}>
          {open ? '關閉' : '食糊'}
        </button>
        {open && (
          <div className="win-list">
            {!winType ? (
              // 第一步：選擇出銃、自摸或和
              <>
                <button
                  className="win-option win-type-btn"
                  onClick={() => handleWinTypeSelect('出銃')}
                >
                  出銃
                </button>
                <button
                  className="win-option win-type-btn"
                  onClick={() => handleWinTypeSelect('自摸')}
                >
                  自摸
                </button>
                <button
                  className="win-option win-type-btn"
                  onClick={() => handleWinTypeSelect('和')}
                >
                  和
                </button>
              </>
            ) : winType === '出銃' && selectedPlayer === null ? (
              // 第二步（出銃）：選擇被出銃的玩家
              <>
                {otherPlayers.map((player) => (
                  <button
                    key={player.id}
                    className="win-option"
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    {player.name}
                  </button>
                ))}
              </>
            ) : (
              // 第三步：選擇番數
              <>
                {winOptions.map((option) => (
                  <button
                    key={option}
                    className="win-option"
                    onClick={() => handleFanSelect(option)}
                  >
                    {option} 番
                  </button>
                ))}
              </>
            )}
            {(winType || selectedPlayer !== null) && (
              <button className="win-option back-btn" onClick={handleBack}>
                返回
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [playerOnePoints, setPlayerOnePoints] = useState(0)
  const [playerTwoPoints, setPlayerTwoPoints] = useState(0)
  const [playerThreePoints, setPlayerThreePoints] = useState(0)
  const [jackPot, setJackPot] = useState(0)

  const handlePlayerOneDraw = () => {
    // 和：JackPot加30，每位玩家減10
    setJackPot((prev) => prev + 30)
    setPlayerOnePoints((prev) => prev - 10)
    setPlayerTwoPoints((prev) => prev - 10)
    setPlayerThreePoints((prev) => prev - 10)
  }

  const handlePlayerOneWin = (fan, winType, selectedPlayerId) => {
    const points = getPointsFromFan(fan)
    let jackPotBonus = 0
    
    // 如果食糊11番，JackPot的分数加到该玩家然后清零
    if (fan === 11 && jackPot > 0) {
      jackPotBonus = jackPot
      setJackPot(0)
    }
    
    if (winType === '出銃') {
      // 出銃：玩家1加分，被選擇的玩家扣分
      setPlayerOnePoints((prev) => prev + points + jackPotBonus)
      if (selectedPlayerId === 2) {
        setPlayerTwoPoints((prev) => prev - points)
      } else if (selectedPlayerId === 3) {
        setPlayerThreePoints((prev) => prev - points)
      }
    } else if (winType === '自摸') {
      // 自摸：玩家1加分，其他2個玩家各扣分/2
      setPlayerOnePoints((prev) => prev + points + jackPotBonus)
      const pointsToDeduct = points / 2
      setPlayerTwoPoints((prev) => prev - pointsToDeduct)
      setPlayerThreePoints((prev) => prev - pointsToDeduct)
    }
  }

  const handlePlayerTwoDraw = () => {
    // 和：JackPot加30，每位玩家減10
    setJackPot((prev) => prev + 30)
    setPlayerOnePoints((prev) => prev - 10)
    setPlayerTwoPoints((prev) => prev - 10)
    setPlayerThreePoints((prev) => prev - 10)
  }

  const handlePlayerTwoWin = (fan, winType, selectedPlayerId) => {
    const points = getPointsFromFan(fan)
    let jackPotBonus = 0
    
    // 如果食糊11番，JackPot的分数加到该玩家然后清零
    if (fan === 11 && jackPot > 0) {
      jackPotBonus = jackPot
      setJackPot(0)
    }
    
    if (winType === '出銃') {
      // 出銃：玩家2加分，被選擇的玩家扣分
      setPlayerTwoPoints((prev) => prev + points + jackPotBonus)
      if (selectedPlayerId === 1) {
        setPlayerOnePoints((prev) => prev - points)
      } else if (selectedPlayerId === 3) {
        setPlayerThreePoints((prev) => prev - points)
      }
    } else if (winType === '自摸') {
      // 自摸：玩家2加分，其他2個玩家各扣分/2
      setPlayerTwoPoints((prev) => prev + points + jackPotBonus)
      const pointsToDeduct = points / 2
      setPlayerOnePoints((prev) => prev - pointsToDeduct)
      setPlayerThreePoints((prev) => prev - pointsToDeduct)
    }
  }

  const handlePlayerThreeDraw = () => {
    // 和：JackPot加30，每位玩家減10
    setJackPot((prev) => prev + 30)
    setPlayerOnePoints((prev) => prev - 10)
    setPlayerTwoPoints((prev) => prev - 10)
    setPlayerThreePoints((prev) => prev - 10)
  }

  const handlePlayerThreeWin = (fan, winType, selectedPlayerId) => {
    const points = getPointsFromFan(fan)
    let jackPotBonus = 0
    
    // 如果食糊11番，JackPot的分数加到该玩家然后清零
    if (fan === 11 && jackPot > 0) {
      jackPotBonus = jackPot
      setJackPot(0)
    }
    
    if (winType === '出銃') {
      // 出銃：玩家3加分，被選擇的玩家扣分
      setPlayerThreePoints((prev) => prev + points + jackPotBonus)
      if (selectedPlayerId === 1) {
        setPlayerOnePoints((prev) => prev - points)
      } else if (selectedPlayerId === 2) {
        setPlayerTwoPoints((prev) => prev - points)
      }
    } else if (winType === '自摸') {
      // 自摸：玩家3加分，其他2個玩家各扣分/2
      setPlayerThreePoints((prev) => prev + points + jackPotBonus)
      const pointsToDeduct = points / 2
      setPlayerOnePoints((prev) => prev - pointsToDeduct)
      setPlayerTwoPoints((prev) => prev - pointsToDeduct)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>三人麻將點數計算器</h1>
        <div className="jack-pot">
          <span className="jack-pot-label">Jack Pot</span>
          <span className="jack-pot-value">{jackPot}</span>
        </div>
      </header>
      <section className="players">
        <PlayerCard
          name="玩家 1"
          points={playerOnePoints}
          playerId={1}
          otherPlayers={[
            { id: 2, name: '玩家 2' },
            { id: 3, name: '玩家 3' }
          ]}
          onWinSelect={handlePlayerOneWin}
          onDrawSelect={handlePlayerOneDraw}
        />
        <PlayerCard
          name="玩家 2"
          points={playerTwoPoints}
          playerId={2}
          otherPlayers={[
            { id: 1, name: '玩家 1' },
            { id: 3, name: '玩家 3' }
          ]}
          onWinSelect={handlePlayerTwoWin}
          onDrawSelect={handlePlayerTwoDraw}
        />
        <PlayerCard
          name="玩家 3"
          points={playerThreePoints}
          playerId={3}
          otherPlayers={[
            { id: 1, name: '玩家 1' },
            { id: 2, name: '玩家 2' }
          ]}
          onWinSelect={handlePlayerThreeWin}
          onDrawSelect={handlePlayerThreeDraw}
        />
      </section>
    </div>
  )
}

export default App
