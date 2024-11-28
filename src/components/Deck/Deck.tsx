import React, { forwardRef, useState, useImperativeHandle } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { animate } from 'motion'
import styles from './styles.module.css'

const cards = [
  'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/690px-RWS_Tarot_02_High_Priestess.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
]

const to = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })

const trans = (r: number, s: number) =>
  `perspective(1000px) rotateX(5deg) rotateY(${r / 20}deg) rotateZ(${r}deg) scale(${s})`


const Deck = forwardRef((props, ref) => {
  const [gone] = useState(() => new Set())
  const [springs, api] = useSprings(cards.length, i => ({
    ...to(i),
    from: from(i),
  }))

  // Expose animation trigger to parent
  useImperativeHandle(ref, () => ({
    triggerNextCardAnimation: () => {
      const topCardIndex = springs.length - gone.size - 1;
      if (topCardIndex >= 0) {
        gone.add(topCardIndex)
        
        api.start(i => {
          if (i !== topCardIndex) return
          return {
            x: 0,
            y: 350,
            scale: 0.3,
            rot: 0,
            // Add zIndex to ensure newer cards appear on top
            zIndex: -topCardIndex, // Negative because topCardIndex counts down
            config: {
              duration: 1000,
              tension: 200,
              friction: 20
            }
          }
        })
      }
    }
  }))

  // For the drag animation, let's also keep cards within bounds
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = Math.abs(mx) > 100 || velocity > 0.2
    const dir = xDir < 0 ? -1 : 1
    
    if (!active && trigger) {
      gone.add(index)
    }
    
    api.start(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      
      // Keep swiped cards within a reasonable range
      const x = isGone ? 
        (dir < 0 ? -1000 : 1000) : // Limit the swipe distance
        active ? mx : 0
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0)
      const scale = active ? 1.1 : 1
      
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: active ? 800 : isGone ? 200 : 500 },
      }
    })

    if (!active && gone.size === cards.length) {
      setTimeout(() => {
        gone.clear()
        api.start(i => to(i))
      }, 600)
    }
  })

  return (
    <>
      {springs.map(({ x, y, rot, scale }, i) => (
        <animated.div className={styles.deck} key={i} style={{ x, y }}>
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cards[i]})`,
            }}
          />
        </animated.div>
      ))}
    </>
  )
})

export default Deck