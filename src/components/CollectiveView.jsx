import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import backgroundImage from '../assets/japanese gradients/O.png';
import './CollectiveView.css';

const CollectiveView = () => {
    const [cardsData, setCardsData] = useState([]);
    const [visibleCardIndex, setVisibleCardIndex] = useState(0);
    const { gameId } = useParams();
    const observerRef = useRef();

    useEffect(() => {
        const fetchCollectiveData = async () => {
            try {
                const response = await fetch(`http://localhost:7777/api/collective-view/${gameId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCardsData(data.cards);
            } catch (error) {
                console.error('Error fetching collective view:', error);
            }
        };

        fetchCollectiveData();
    }, [gameId]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.dataset.index);
                        setVisibleCardIndex(index);
                    }
                });
            },
            {
                threshold: 0.5
            }
        );

        observerRef.current = observer;

        document.querySelectorAll('.card-section').forEach(card => {
            observer.observe(card);
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [cardsData]);

    const splitLongEntry = (text) => {
        const maxCharsPerLine = 20;
        const words = text.split(' ');
        const lines = [];
        let currentLine = [];
        let currentLength = 0;
        
        words.forEach(word => {
            if (currentLength + word.length > maxCharsPerLine) {
                lines.push(currentLine.join(' '));
                currentLine = [word];
                currentLength = word.length;
            } else {
                currentLine.push(word);
                currentLength += word.length + 1;
            }
        });
        
        if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
        }
        
        return lines;
    };

    const getRandomPosition = () => {
        // Leave 1cm (≈38px) padding from edges
        const padding = 38;
        return {
            x: padding + Math.random() * (window.innerWidth - 2 * padding),
            y: padding + Math.random() * (window.innerHeight - 2 * padding)
        };
    };

    const renderVisibleEntries = () => {
        if (!cardsData[visibleCardIndex]) return null;
        
        return (
            <div className="floating-entries">
                {cardsData[visibleCardIndex].entries.map((entry, entryIndex) => {
                    const lines = splitLongEntry(entry.entry_text);
                    const position = getRandomPosition();
                    
                    return (
                        <div 
                            key={entryIndex} 
                            className="entry-item"
                            style={{
                                left: `${position.x}px`,
                                top: `${position.y}px`,
                            }}
                        >
                            {lines.map((line, lineIndex) => (
                                <p key={lineIndex} className="entry-text">{line}</p>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div 
            className="collective-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {cardsData.map((cardData, index) => (
                <section 
                    key={cardData.card_id} 
                    className="card-section"
                    data-index={index}
                >
                    <div className="card-content">
                        <div className="card-image">
                            <img src={cardData.image_url} alt="Card" />
                        </div>
                        
                        <div className="floating-entries">
                            {cardData.entries.map((entry, entryIndex) => {
                                const lines = splitLongEntry(entry.entry_text);
                                return (
                                    <div key={entryIndex} className="entry-item">
                                        {lines.map((line, lineIndex) => (
                                            <p key={lineIndex} className="entry-text">{line}</p>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default CollectiveView; 