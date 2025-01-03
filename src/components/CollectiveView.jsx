import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Matter from 'matter-js';
import MatterAttractors from 'matter-attractors';
import { motion, AnimatePresence } from 'framer-motion';
import './CollectiveView.css';

Matter.use(MatterAttractors);

const Entry = ({ text, position, dimensions, index, cycleCount }) => {
  const entryRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(24);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fitText = () => {
      if (!textRef.current) return;
      
      const container = textRef.current;
      const maxWidth = dimensions.width - 40;
      const maxHeight = dimensions.height - 40;
      
      let size = 32;
      container.style.fontSize = `${size}px`;
      
      while (size > 12) {
        if (container.scrollHeight <= maxHeight && container.scrollWidth <= maxWidth) {
          break;
        }
        size = Math.floor(size * 0.9);
        container.style.fontSize = `${size}px`;
      }
      
      const lineHeight = Math.max(1.1, Math.min(1.4, 1.25 + (24 - size) * 0.01));
      const letterSpacing = Math.max(-0.02, Math.min(0.05, (24 - size) * 0.002));
      
      setFontSize(size);
      container.style.lineHeight = lineHeight.toString();
      container.style.letterSpacing = `${letterSpacing}em`;
    };

    fitText();
  }, [dimensions, text]);

  useEffect(() => {
    const baseDelay = 8000;
    const indexDelay = index * 1000;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, baseDelay + indexDelay);

    return () => clearTimeout(timer);
  }, [index, cycleCount]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          ref={entryRef}
          className="absolute flex items-start p-6 backdrop-blur-xs rounded-xl"
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            delay: index * 0.2,
            type: "spring",
            stiffness: 10,
            damping: 6
          }}
          style={{
            left: position.x - dimensions.width / 2,
            top: position.y - dimensions.height / 2,
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            cursor: 'move',
            fontFamily: 'Papyrus',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div 
            ref={textRef}
            className="flex-1 overflow-hidden text-left pb-8 pr-4 select-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, fontSize }}
            transition={{ duration: 1.5, delay: index * 0.3 }}
            style={{
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {text}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CentralCard = ({ position, dimensions, image }) => {
  return (
    <motion.div
      className="absolute"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        const rotateX = (mouseY / rect.height) * -30;
        const rotateY = (mouseX / rect.width) * 30;
        e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      }}
      style={{
        left: position.x - dimensions.width / 2,
        top: position.y - dimensions.height / 2,
        width: dimensions.width,
        height: dimensions.height,
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out',
        pointerEvents: 'auto'
      }}
    >
      <motion.img 
        src={image} 
        alt="Tarot card"
        className="w-full h-full rounded-3xl object-contain"
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        animate={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        whileHover={{ boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
        transition={{ boxShadow: { duration: 0.2 } }}
      />
    </motion.div>
  );
};

const CollectiveView = () => {
  const { gameId } = useParams();
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const cardImageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [cardsData, setCardsData] = useState([]);
  const [rectangleStates, setRectangleStates] = useState([]);
  const rectanglesRef = useRef([]);
  const [centralAttractorState, setCentralAttractorState] = useState(null);
  const [cycleCount, setCycleCount] = useState(0);
  const cycleTimerRef = useRef(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 1. Fetch data
  useEffect(() => {
    const fetchCollectiveData = async () => {
      try {
        const response = await fetch(`http://localhost:7777/api/collective-view/${gameId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        setCardsData(data.cards);
      } catch (error) {
        console.error('Error fetching collective view:', error);
      }
    };

    fetchCollectiveData();
  }, [gameId]);

  // 2. Load image when we have data
  useEffect(() => {
    if (cardsData.length > 0) {
      console.log('Loading image:', cardsData[0].image_url);
      cardImageRef.current = new Image();
      cardImageRef.current.onload = () => {
        console.log('Image loaded:', cardImageRef.current.width, cardImageRef.current.height);
        setImageLoaded(true);
      };
      cardImageRef.current.src = cardsData[0].image_url;
    }
  }, [cardsData]);

  // 3. Setup Matter.js when image is loaded
  useEffect(() => {
    if (!imageLoaded || !cardsData.length) return;
    console.log('Setting up Matter.js');

    const setupMatterJs = () => {
      const { Engine, Render, World, Bodies, Body, Mouse, MouseConstraint, Composite, Runner } = Matter;

      // Create engine
      engineRef.current = Engine.create({
        enableSleeping: false,
        constraintIterations: 4
      });

      // Create renderer
      const render = Render.create({
        element: sceneRef.current,
        engine: engineRef.current,
        options: {
          width: window.innerWidth,
          height: window.innerHeight,
          wireframes: false,
          background: 'transparent'
        }
      });

      // Physics parameters
      const params = {
        attraction: {
          baseForce: 0.015,
          distanceScale: 300
        },
        friction: {
          air: 0.131,
          surface: 0.373,
          restitution: 0.57,
          density: 0.02456
        },
        mouse: {
          stiffness: 0.01,
          damping: 0
        }
      };

      // Calculate card dimensions
      const targetWidth = 300;
      const scale = targetWidth / cardImageRef.current.width;
      const cardWidth = cardImageRef.current.width * scale;
      const cardHeight = cardImageRef.current.height * scale;

      console.log('Card dimensions:', { cardWidth, cardHeight });

      // Create central attractor
      const centralAttractor = Bodies.rectangle(
        window.innerWidth / 2,
        window.innerHeight / 2,
        cardWidth,
        cardHeight,
        {
          isStatic: true,
          plugin: {
            attractors: [
              (bodyA, bodyB) => {
                const dx = bodyA.position.x - bodyB.position.x;
                const dy = bodyA.position.y - bodyB.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = params.attraction.baseForce * 
                  (1 + params.attraction.distanceScale / distance);
                return { x: dx * force, y: dy * force };
              }
            ]
          },
          render: { visible: false }
        }
      );

      // Create rectangles for entries
      const entries = cardsData[0].entries;
      console.log('Creating rectangles for entries:', entries);

      rectanglesRef.current = entries.map((entry, i) => {
        const width = 280 + Math.random() * 40;
        const height = 160 + Math.random() * 40;
        return Bodies.rectangle(
          window.innerWidth * Math.random(),
          window.innerHeight * Math.random(),
          width,
          height,
          {
            frictionAir: params.friction.air,
            friction: params.friction.surface,
            restitution: params.friction.restitution,
            inertia: Infinity,
            density: params.friction.density,
            entry: { text: entry.entry_text },
            chamfer: { radius: 12 },
            render: { fillStyle: 'transparent', lineWidth: 0 }
          }
        );
      });

      // Mouse control
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engineRef.current, {
        mouse,
        constraint: {
          stiffness: params.mouse.stiffness,
          damping: params.mouse.damping,
          render: { visible: false }
        }
      });

      // Add all bodies to world
      World.add(engineRef.current.world, [
        centralAttractor,
        ...rectanglesRef.current,
        mouseConstraint
      ]);

      // Start engine and renderer
      const runner = Runner.create();
      Runner.run(runner, engineRef.current);
      Render.run(render);

      // Update states
      Matter.Events.on(engineRef.current, 'afterUpdate', () => {
        setRectangleStates(
          rectanglesRef.current.map(rect => ({
            position: rect.position,
            dimensions: {
              width: rect.bounds.max.x - rect.bounds.min.x - 20,
              height: rect.bounds.max.y - rect.bounds.min.y - 20
            },
            entry: rect.entry
          }))
        );

        setCentralAttractorState({
          position: centralAttractor.position,
          dimensions: { width: cardWidth, height: cardHeight }
        });
      });

      // Cleanup
      return () => {
        Runner.stop(runner);
        Render.stop(render);
        World.clear(engineRef.current.world);
        Engine.clear(engineRef.current);
        render.canvas.remove();
      };
    };

    setupMatterJs();
  }, [imageLoaded, cardsData]);

  // Reset cycle timer
  const resetCycleTimer = () => {
    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
    }
    cycleTimerRef.current = setInterval(() => {
      setCycleCount(c => c + 1);
    }, 15000);
  };

  useEffect(() => {
    resetCycleTimer();
    return () => {
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current);
      }
    };
  }, []);

  // Add debug logs for render states
  console.log('Render states:', {
    centralAttractorState,
    rectangleStates,
    cardsDataLength: cardsData.length
  });

  // Add scroll handler
  useEffect(() => {
    const handleScroll = (e) => {
      if (isTransitioning || !cardsData.length) return;

      // Determine scroll direction
      const scrollDown = e.deltaY > 0;
      
      if (scrollDown) {
        setIsTransitioning(true);
        setCurrentCardIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % cardsData.length;
          
          // Update Matter.js bodies with new entries
          if (rectanglesRef.current) {
            const newEntries = cardsData[nextIndex].entries;
            rectanglesRef.current.forEach((rect, i) => {
              if (newEntries[i]) {
                rect.entry.text = newEntries[i].entry_text;
              }
            });
          }
          
          return nextIndex;
        });

        // Reset transition lock after animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }
    };

    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [cardsData.length, isTransitioning]);

  // Modify the central card render to show the stack
  const renderCardStack = () => {
    if (!centralAttractorState || !cardsData.length) return null;

    return (
      <div className="absolute inset-0 z-20 pointer-events-none">
        {cardsData.map((card, index) => {
          const isCurrentCard = index === currentCardIndex;
          const position = isCurrentCard ? centralAttractorState.position : {
            x: centralAttractorState.position.x,
            y: centralAttractorState.position.y + (index - currentCardIndex) * 2
          };

          return (
            <motion.div
              key={card.card_id}
              className="absolute"
              initial={false}
              animate={{
                scale: isCurrentCard ? 1 : 0.95,
                opacity: isCurrentCard ? 1 : 0.5,
                zIndex: cardsData.length - Math.abs(index - currentCardIndex),
                x: position.x - centralAttractorState.dimensions.width / 2,
                y: position.y - centralAttractorState.dimensions.height / 2,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              style={{
                width: centralAttractorState.dimensions.width,
                height: centralAttractorState.dimensions.height,
                willChange: 'transform',
                transformStyle: 'preserve-3d',
              }}
            >
              <motion.img
                src={card.image_url}
                alt={card.name}
                className="w-full h-full rounded-3xl object-contain"
                style={{
                  filter: isCurrentCard ? 'none' : 'brightness(0.7)',
                  transition: 'filter 0.3s ease-out'
                }}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      <div ref={sceneRef} className="w-full h-full absolute inset-0 z-10" />
      
      {/* Replace the CentralCard with our new stack */}
      {renderCardStack()}

      <div className="absolute inset-0 z-20 pointer-events-none">
        {rectangleStates.map((rect, index) => (
          <Entry
            key={`entry-${index}-${cycleCount}-${currentCardIndex}`}
            text={rect.entry.text}
            position={rect.position}
            dimensions={rect.dimensions}
            index={index}
            cycleCount={cycleCount}
          />
        ))}
      </div>
    </div>
  );
};

export default CollectiveView; 