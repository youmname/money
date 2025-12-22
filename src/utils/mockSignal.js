// ==========================
// mockSignal：使用 localStorage 模拟简单的消息广播
// 作用：模拟老师端和学生端之间的实时通信
// ==========================

const SIGNAL_KEY = 'classroom_signal'
const SIGNAL_TIMESTAMP_KEY = 'classroom_signal_timestamp'

/**
 * 发送信号
 * @param {string} signalType 信号类型（如 'PUSH_QUESTION'）
 * @param {object} data 附加数据（可选）
 */
export function send(signalType, data = {}) {
  const signal = {
    type: signalType,
    data,
    timestamp: Date.now(),
  }
  
  // 存储到 localStorage
  localStorage.setItem(SIGNAL_KEY, JSON.stringify(signal))
  localStorage.setItem(SIGNAL_TIMESTAMP_KEY, String(signal.timestamp))
  
  // 触发 storage 事件（用于同源的其他窗口接收）
  window.dispatchEvent(new StorageEvent('storage', {
    key: SIGNAL_KEY,
    newValue: JSON.stringify(signal),
  }))
  
  console.log('[mockSignal] 发送信号:', signalType, data)
}

/**
 * 监听信号
 * @param {function} callback 回调函数，接收 (signalType, data) 参数
 * @returns {function} 取消监听的函数
 */
export function listen(callback) {
  let lastTimestamp = localStorage.getItem(SIGNAL_TIMESTAMP_KEY) || '0'
  
  // 处理 storage 事件（来自其他窗口）
  function handleStorage(e) {
    if (e.key === SIGNAL_KEY && e.newValue) {
      try {
        const signal = JSON.parse(e.newValue)
        if (signal.timestamp > lastTimestamp) {
          lastTimestamp = signal.timestamp
          callback(signal.type, signal.data)
        }
      } catch (err) {
        console.error('[mockSignal] 解析信号失败', err)
      }
    }
  }
  
  // 处理当前窗口的信号（通过轮询检查）
  function checkSignal() {
    const currentTimestamp = localStorage.getItem(SIGNAL_TIMESTAMP_KEY) || '0'
    if (currentTimestamp !== lastTimestamp) {
      const signalStr = localStorage.getItem(SIGNAL_KEY)
      if (signalStr) {
        try {
          const signal = JSON.parse(signalStr)
          lastTimestamp = currentTimestamp
          callback(signal.type, signal.data)
        } catch (err) {
          console.error('[mockSignal] 解析信号失败', err)
        }
      }
    }
  }
  
  // 监听 storage 事件（跨窗口通信）
  window.addEventListener('storage', handleStorage)
  
  // 轮询检查（用于同窗口内的信号，因为 storage 事件不会在同窗口触发）
  const intervalId = setInterval(checkSignal, 500)
  
  // 返回取消监听的函数
  return () => {
    window.removeEventListener('storage', handleStorage)
    clearInterval(intervalId)
  }
}

