import React, { useEffect, useState } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import styles from './styles.module.css'

// Add interface for card structure
interface Card {
  id: string;
  image_path: string;
  name: string;
}

function Deck({ onCardChange }: { onCardChange?: (cardId: string) => void }) {
  const CARDS_TO_SHOW = 5
  const [cards, setCards] = useState<Card[]>([])
  const [gone] = useState(() => new Set())

  const getRandomCards = (array: Card[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  useEffect(() => {
    console.log('Fetching cards...')
    fetch('http://localhost:7777/api/cards')
      .then(response => response.json())
      .then(cardsData => {
        const cardsArray = Array.isArray(cardsData) ? cardsData : Object.values(cardsData);
        const randomCards = getRandomCards(cardsArray, CARDS_TO_SHOW);
        const processedCards = randomCards.map((card: Card) => ({
          ...card,
          image_path: `http://localhost:7777/api/cards/${encodeURI(card.image_path.split('/').pop() || '')}`
        }));
        
        console.log('Final processed cards:', processedCards);
        setCards(processedCards);
        
        if (onCardChange && processedCards.length > 0) {
          onCardChange(processedCards[processedCards.length - 1].id);
        }
      })
      .catch(error => console.error('Error fetching cards:', error));
  }, [onCardChange]);

  // Create springs AFTER we have cards
  const [props, api] = useSprings(cards.length, i => ({
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

  return (
    <div className={styles.container} style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    }}>
      {props.map(({ x, y, rot, scale }, i) => (
        <animated.div 
          className={styles.deck} 
          key={i} 
          style={{ 
            x, 
            y,
            position: 'absolute',
            width: '100%',
            height: '100%',
            willChange: 'transform',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <animated.div
            {...bind(i)}
            style={{
              transform: interpolate([rot, scale], trans),
              backgroundImage: `url(${cards[i].image_path})`,
              backgroundColor: 'white',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: '300px',
              height: '450px',
              borderRadius: '10px',
              boxShadow: '0 12.5px 100px -10px rgba(50, 50, 73, 0.4), 0 10px 10px -10px rgba(50, 50, 73, 0.3)',
            }}
          />
        </animated.div>
      ))}
    </div>
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