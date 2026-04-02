import { useState, useEffect, useRef } from 'react'

export function useTimer(durationMinutes = 60) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function start() { setRunning(true) }
  function stop() { setRunning(false) }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const percent = (secondsLeft / (durationMinutes * 60)) * 100
  const isWarning = secondsLeft < 600  // under 10 min
  const isDanger = secondsLeft < 300   // under 5 min

  return { secondsLeft, minutes, seconds, percent, isWarning, isDanger, running, start, stop }
}
