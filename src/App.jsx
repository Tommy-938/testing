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
    jackPot: 0,
    history: []
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
              // 第一步：選擇出銃或自摸
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

  // 歷史紀錄：陣列，最近事件放前面
  const [history, setHistory] = useState(savedData.history || [])
  const [showHistory, setShowHistory] = useState(false)

  const addHistoryEvent = (event) => {
    setHistory((prev) => [{ ...event }, ...prev])
  }

  // 全域確認 modal 設定：{ title, message(JSX or string), onConfirm }
  const [confirmConfig, setConfirmConfig] = useState(null)

  const closeConfirm = () => setConfirmConfig(null)

  const openConfirm = ({ title, message, onConfirm }) => {
    setConfirmConfig({ title, message, onConfirm })
  }

  // 當任何分數變化時，保存到 localStorage
  useEffect(() => {
    saveToStorage({
      playerOneName,
      playerTwoName,
      playerThreeName,
      playerOnePoints,
      playerTwoPoints,
      playerThreePoints,
      jackPot,
      history
    })
  }, [playerOneName, playerTwoName, playerThreeName, playerOnePoints, playerTwoPoints, playerThreePoints, jackPot, history])

  const doGlobalDraw = () => {
    setJackPot((prev) => prev + 30)
    setPlayerOnePoints((prev) => prev - 10)
    setPlayerTwoPoints((prev) => prev - 10)
    setPlayerThreePoints((prev) => prev - 10)

    addHistoryEvent({
      timestamp: new Date().toISOString(),
      action: 'draw',
      actorId: null,
      actorName: '和牌',
      details: '和',
      changes: [
        { playerId: 1, name: playerOneName, delta: -10 },
        { playerId: 2, name: playerTwoName, delta: -10 },
        { playerId: 3, name: playerThreeName, delta: -10 }
      ],
      jackPotChange: 30
    })
  }

  const handleGlobalDraw = () => {
    openConfirm({
      title: '確認宣告和牌',
      message: (
        <div>
          <p>此操作會：</p>
          <ul style = {{listStyleType: "none"}}>
            <li>Jack Pot +30</li>
            <li>所有玩家各 -10</li>
          </ul>
        </div>
      ),
      onConfirm: () => {
        doGlobalDraw()
        closeConfirm()
      }
    })
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

      addHistoryEvent({
        timestamp: new Date().toISOString(),
        action: 'win',
        actorId: 1,
        actorName: playerOneName,
        winType,
        fan,
        changes: [
          { playerId: 1, name: playerOneName, delta: points + jackPotBonus },
          { playerId: selectedPlayerId, name: selectedPlayerId === 2 ? playerTwoName : playerThreeName, delta: -points }
        ],
        jackPotBonus
      })
    } else if (winType === '自摸') {
      // 自摸：玩家1加分，其他2個玩家各扣分/2
      setPlayerOnePoints((prev) => prev + points + jackPotBonus)
      const pointsToDeduct = points / 2
      setPlayerTwoPoints((prev) => prev - pointsToDeduct)
      setPlayerThreePoints((prev) => prev - pointsToDeduct)

      addHistoryEvent({
        timestamp: new Date().toISOString(),
        action: 'win',
        actorId: 1,
        actorName: playerOneName,
        winType,
        fan,
        changes: [
          { playerId: 1, name: playerOneName, delta: points + jackPotBonus },
          { playerId: 2, name: playerTwoName, delta: -points / 2 },
          { playerId: 3, name: playerThreeName, delta: -points / 2 }
        ],
        jackPotBonus
      })
    }
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

      addHistoryEvent({
        timestamp: new Date().toISOString(),
        action: 'win',
        actorId: 2,
        actorName: playerTwoName,
        winType,
        fan,
        changes: [
          { playerId: 2, name: playerTwoName, delta: points + jackPotBonus },
          { playerId: selectedPlayerId, name: selectedPlayerId === 1 ? playerOneName : playerThreeName, delta: -points }
        ],
        jackPotBonus
      })
    } else if (winType === '自摸') {
      // 自摸：玩家2加分，其他2個玩家各扣分/2
      setPlayerTwoPoints((prev) => prev + points + jackPotBonus)
      const pointsToDeduct = points / 2
      setPlayerOnePoints((prev) => prev - pointsToDeduct)
      setPlayerThreePoints((prev) => prev - pointsToDeduct)

      addHistoryEvent({
        timestamp: new Date().toISOString(),
        action: 'win',
        actorId: 2,
        actorName: playerTwoName,
        winType,
        fan,
        changes: [
          { playerId: 2, name: playerTwoName, delta: points + jackPotBonus },
          { playerId: 1, name: playerOneName, delta: -points / 2 },
          { playerId: 3, name: playerThreeName, delta: -points / 2 }
        ],
        jackPotBonus
      })
    }
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

      addHistoryEvent({
        timestamp: new Date().toISOString(),
        action: 'win',
        actorId: 3,
        actorName: playerThreeName,
        winType,
        fan,
        changes: [
          { playerId: 3, name: playerThreeName, delta: points + jackPotBonus },
          { playerId: selectedPlayerId, name: selectedPlayerId === 1 ? playerOneName : playerTwoName, delta: -points }
        ],
        jackPotBonus
      })
    } else if (winType === '自摸') {
      // 自摸：玩家3加分，其他2個玩家各扣分/2
      setPlayerThreePoints((prev) => prev + points + jackPotBonus)
      const pointsToDeduct = points / 2
      setPlayerOnePoints((prev) => prev - pointsToDeduct)
      setPlayerTwoPoints((prev) => prev - pointsToDeduct)

      addHistoryEvent({
        timestamp: new Date().toISOString(),
        action: 'win',
        actorId: 3,
        actorName: playerThreeName,
        winType,
        fan,
        changes: [
          { playerId: 3, name: playerThreeName, delta: points + jackPotBonus },
          { playerId: 1, name: playerOneName, delta: -points / 2 },
          { playerId: 2, name: playerTwoName, delta: -points / 2 }
        ],
        jackPotBonus
      })
    }
  }

  const doReset = () => {
    setPlayerOneName('玩家 1')
    setPlayerTwoName('玩家 2')
    setPlayerThreeName('玩家 3')
    setPlayerOnePoints(0)
    setPlayerTwoPoints(0)
    setPlayerThreePoints(0)
    setJackPot(0)
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
    closeConfirm()
  }

  const handleReset = () => {
    openConfirm({
      title: '確認重置',
      message: '確定要重置所有分數嗎？ 此操作會清除所有分數與歷史紀錄。',
      onConfirm: () => doReset()
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>三人麻將點數計算器</h1>
        <div className="jack-pot">
          <span className="jack-pot-label">Jack Pot</span>
          <span className="jack-pot-value">{jackPot}</span>
        </div>
        <div className="header-actions">
          <button className="history-btn action-btn" onClick={() => setShowHistory(true)}>歷史紀錄</button>
          <button className="draw-btn header-draw-btn action-btn" onClick={handleGlobalDraw}>和</button>
          <button className="reset-all-btn action-btn" onClick={handleReset}>
            重置所有分數
          </button>
        </div>
      </header>

      {confirmConfig && (
        <div className="confirm-overlay" onClick={closeConfirm}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-title">{confirmConfig.title}</div>
            <div className="confirm-message">{confirmConfig.message}</div>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-cancel" onClick={closeConfirm}>取消</button>
              <button
                className="confirm-btn confirm-confirm"
                onClick={() => {
                  if (confirmConfig && typeof confirmConfig.onConfirm === 'function') {
                    confirmConfig.onConfirm()
                  }
                }}
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="history-modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="history-modal" onClick={(e) => e.stopPropagation()}>
            <h3>歷史紀錄</h3>
            <div className="history-controls">
              <button className="history-clear-btn action-btn" onClick={() => openConfirm({ title: '確認清除歷史', message: '確定要清除所有歷史紀錄嗎？此操作無法回復。', onConfirm: () => { setHistory([]); closeConfirm(); } })}>清除歷史</button>
              <button className="history-close-btn action-btn" onClick={() => setShowHistory(false)}>關閉</button>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p>目前沒有紀錄</p>
              ) : (
                history.map((ev, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-time">{new Date(ev.timestamp).toLocaleString()}</div>
                    <div className="history-body">
                      {ev.action === 'draw' ? (
                        <div>
                          <strong>和牌</strong>
                          <ul style = {{listStyleType: "none"}}>
                            {ev.changes.map((c) => (
                              <li key={c.playerId}>{c.name}: {c.delta > 0 ? '+' : ''}{c.delta}</li>
                            ))}
                          </ul>
                        </div>
                      ) : ev.action === 'win' ? (
                        <div>
                          <strong>{ev.actorName}</strong> {ev.winType} {ev.fan} 番
                          <ul style = {{listStyleType: "none"}}>
                            {ev.changes.map((c) => (
                              <li key={c.playerId}>{c.name}: {c.delta > 0 ? '+' : ''}{c.delta}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <pre>{JSON.stringify(ev)}</pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

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
          onRename={(newName) => setPlayerThreeName(newName)}
        />
      </section>
    </div>
  )
}

export default App
