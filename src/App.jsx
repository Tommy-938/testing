import { useState, useEffect } from 'react'
import './App.css'

// localStorage 工具函數
const STORAGE_KEY = 'mahjong-scores'

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('讀取 localStorage 失敗:', error)
  }
  return {
    playerOneName: '玩家 1',
    playerTwoName: '玩家 2',
    playerThreeName: '玩家 3',
    playerOnePoints: 0,
    playerTwoPoints: 0,
    playerThreePoints: 0,
    jackPot: 0
  }
}

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('保存到 localStorage 失敗:', error)
  }
}

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
  onDrawSelect,
  onRename
}) {
  const [open, setOpen] = useState(false)
  const [winType, setWinType] = useState(null) // '出銃' or '自摸' or '和'
  const [selectedPlayer, setSelectedPlayer] = useState(null) // 出銃時選擇的玩家

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(name)

  useEffect(() => {
    setNameInput(name)
  }, [name])

  const handleNameSave = () => {
    const trimmed = nameInput.trim()
    if (trimmed && onRename) {
      onRename(trimmed)
    }
    setIsEditingName(false)
  }

  const handleNameCancel = () => {
    setNameInput(name)
    setIsEditingName(false)
  }

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
      <div className="player-header">
        {!isEditingName ? (
          <>
            <h2>{name}</h2>
            <button className="edit-name-btn" onClick={() => setIsEditingName(true)}>改名</button>
          </>
        ) : (
          <div className="name-edit">
            <input
              className="name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave()
                if (e.key === 'Escape') handleNameCancel()
              }}
            />
            <button className="save-name-btn" onClick={handleNameSave}>儲存</button>
            <button className="cancel-name-btn" onClick={handleNameCancel}>取消</button>
          </div>
        )}
      </div>
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
  // 從 localStorage 讀取初始數據
  const savedData = loadFromStorage()
  const [playerOneName, setPlayerOneName] = useState(savedData.playerOneName || '玩家 1')
  const [playerTwoName, setPlayerTwoName] = useState(savedData.playerTwoName || '玩家 2')
  const [playerThreeName, setPlayerThreeName] = useState(savedData.playerThreeName || '玩家 3')

  const [playerOnePoints, setPlayerOnePoints] = useState(savedData.playerOnePoints)
  const [playerTwoPoints, setPlayerTwoPoints] = useState(savedData.playerTwoPoints)
  const [playerThreePoints, setPlayerThreePoints] = useState(savedData.playerThreePoints)
  const [jackPot, setJackPot] = useState(savedData.jackPot)

  // 當任何分數變化時，保存到 localStorage
  useEffect(() => {
    saveToStorage({
      playerOneName,
      playerTwoName,
      playerThreeName,
      playerOnePoints,
      playerTwoPoints,
      playerThreePoints,
      jackPot
    })
  }, [playerOneName, playerTwoName, playerThreeName, playerOnePoints, playerTwoPoints, playerThreePoints, jackPot])

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

  const handleReset = () => {
    if (window.confirm('確定要重置所有分數嗎？')) {
      setPlayerOneName('玩家 1')
      setPlayerTwoName('玩家 2')
      setPlayerThreeName('玩家 3')
      setPlayerOnePoints(0)
      setPlayerTwoPoints(0)
      setPlayerThreePoints(0)
      setJackPot(0)
      localStorage.removeItem(STORAGE_KEY)
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
        <button className="reset-all-btn" onClick={handleReset}>
          重置所有分數
        </button>
      </header>
      <section className="players">
        <PlayerCard
          name={playerOneName}
          points={playerOnePoints}
          playerId={1}
          otherPlayers={[
            { id: 2, name: playerTwoName },
            { id: 3, name: playerThreeName }
          ]}
          onWinSelect={handlePlayerOneWin}
          onDrawSelect={handlePlayerOneDraw}
          onRename={(newName) => setPlayerOneName(newName)}
        />
        <PlayerCard
          name={playerTwoName}
          points={playerTwoPoints}
          playerId={2}
          otherPlayers={[
            { id: 1, name: playerOneName },
            { id: 3, name: playerThreeName }
          ]}
          onWinSelect={handlePlayerTwoWin}
          onDrawSelect={handlePlayerTwoDraw}
          onRename={(newName) => setPlayerTwoName(newName)}
        />
        <PlayerCard
          name={playerThreeName}
          points={playerThreePoints}
          playerId={3}
          otherPlayers={[
            { id: 1, name: playerOneName },
            { id: 2, name: playerTwoName }
          ]}
          onWinSelect={handlePlayerThreeWin}
          onDrawSelect={handlePlayerThreeDraw}
          onRename={(newName) => setPlayerThreeName(newName)}
        />
      </section>
    </div>
  )
}

export default App
