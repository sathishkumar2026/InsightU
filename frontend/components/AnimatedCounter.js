"use client"

import { useEffect, useState } from "react"

export default function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1200
    const step = (timestamp) => {
      start = start || timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setDisplay(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return <span>{display}</span>
}
