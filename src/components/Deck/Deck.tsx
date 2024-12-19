import React, { useEffect, useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import styles from './styles.module.css'

function Deck() {
  const CARDS_TO_SHOW = 5  // Constant for number of cards to show
  const [cards, setCards] = useState<string[]>([])
  const [gone] = useState(() => new Set())

  const getRandomCards = (array: string[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  useEffect(() => {
    console.log('Fetching cards...')
    fetch('http://localhost:7777/api/cards')
      .then(response => response.json())
      .then(cardUrls => {
        // Debug what we're receiving from the backend
        console.log('Raw response from server:', cardUrls);
        console.log('Type of cardUrls:', typeof cardUrls);
        
        // Make sure cardUrls is an array
        const urlsArray = Array.isArray(cardUrls) ? cardUrls : Object.values(cardUrls);
        console.log('Processed array:', urlsArray);
        
        const randomCardUrls = getRandomCards(urlsArray, CARDS_TO_SHOW);
        const fullUrls = randomCardUrls.map((url: string) => {
          const cleanUrl = url.replace('/api', '');
          return `http://localhost:7777/api/${cleanUrl}`;
        });
        console.log('Final URLs:', fullUrls);
        setCards(fullUrls);
      })
      .catch(error => console.error('Error fetching cards:', error));
  }, []);

  // Only create springs for the number of cards we have
  const [props, api] = useSprings(Math.min(cards.length, CARDS_TO_SHOW), i => ({
    ...to(i),
    from: from(i),
  }))

  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity }) => {
    const trigger = Math.abs(mx) > 100 || velocity > 0.2
    const dir = xDir < 0 ? -1 : 1
    
    if (!active && trigger) {
      gone.add(index)
    }
    
    api.start(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : active ? mx : 0
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

    if (!active && gone.size === CARDS_TO_SHOW) {
      setTimeout(() => {
        gone.clear()
        api.start(i => to(i))
      }, 600)
    }
  })

  if (cards.length === 0) return null

  // Only render 5 cards
  return (
    <>
      {props.map(({ x, y, rot, scale }, i) => (
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
}

const to = (i: number) => ({
  x: 0,
  y: i * -8,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
})

const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })

const trans = (r: number, s: number) =>
  `perspective(1000px) rotateX(5deg) rotateY(${r / 20}deg) rotateZ(${r}deg) scale(${s})`

export default Deck