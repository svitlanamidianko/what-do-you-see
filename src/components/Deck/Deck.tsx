import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import styles from './styles.module.css'

// Move interfaces to the top
interface Card {
  id: string;
  image_path: string;
  name: string;
}

interface DeckProps {
  onCardChange?: (cardId: string) => void;
  onSwipeComplete?: () => void;
}

// Export this interface
export interface DeckHandle {
  triggerSwipe: (direction?: number) => void;
  getCardCount: () => number;
}

function Deck({ onCardChange, onSwipeComplete }: DeckProps, ref: React.Ref<DeckHandle>) {
  const CARDS_TO_SHOW = 5
  const [cards, setCards] = useState<Card[]>([])
  const [gone] = useState(() => new Set())
  const [isAnimating, setIsAnimating] = useState(false)

  const getRandomCards = (array: Card[], count: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  useEffect(() => {
    console.log('Fetching cards...')
    fetch('https://whatdoyousee-api-weatherered-grass-2856.fly.dev/api/cards')
      .then(response => response.json())
      .then(cardsData => {
        const cardsArray = Array.isArray(cardsData) ? cardsData : Object.values(cardsData);
        const randomCards = getRandomCards(cardsArray, CARDS_TO_SHOW);
        const processedCards = randomCards.map((card: Card) => ({
          ...card,
          image_path: `https://whatdoyousee-api-weatherered-grass-2856.fly.dev/api/cards/${encodeURI(card.image_path.split('/').pop() || '')}`
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
    if (isAnimating) return
    
    const trigger = Math.abs(mx) > 100 || velocity > 0.2
    const dir = xDir < 0 ? -1 : 1
    
    if (!active && trigger) {
      setIsAnimating(true)
      gone.add(index)
      
      // Trigger submission immediately when swipe threshold is met
      if (onSwipeComplete) {
        onSwipeComplete()
      }
      
      // Update current card ID for the next card
      if (onCardChange && cards[index - 1]) {
        onCardChange(cards[index - 1].id);
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
          onRest: () => {
            setIsAnimating(false)  // Only reset animation flag after animation completes
          }
        }
      })
    } else {
      // Handle active dragging
      api.start(i => {
        if (index !== i) return
        const x = active ? mx : 0
        const rot = active ? mx / 100 : 0
        const scale = active ? 1.1 : 1
        
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: active ? 800 : 500 },
        }
      })
    }

    if (!active && gone.size === cards.length) {
      setTimeout(() => {
        gone.clear()
        api.start(i => to(i))
      }, 600)
    }
  })

  // Expose the swipe trigger function
  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction = 1) => {
      if (isAnimating) return
      
      const nextIndex = cards.length - gone.size - 1
      if (nextIndex >= 0) {
        setIsAnimating(true)
        gone.add(nextIndex)
        
        // Trigger submission immediately
        if (onSwipeComplete) {
          onSwipeComplete()
        }
        
        if (onCardChange && cards[nextIndex - 1]) {
          onCardChange(cards[nextIndex - 1].id)
        }

        api.start(i => {
          if (i !== nextIndex) return
          return {
            x: (200 + window.innerWidth) * direction,
            rot: direction * 10,
            scale: 0,
            delay: undefined,
            config: { friction: 50, tension: 200 },
            onRest: () => {
              setIsAnimating(false)
            }
          }
        })
      }
    },
    getCardCount: () => {
      return cards.length - gone.size;
    }
  }))

  if (cards.length === 0) return null

  return (
    <div className={styles.container} style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'visible'
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
            overflow: 'visible'
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
              width: '600px',
              height: '900px',
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

export default forwardRef(Deck);