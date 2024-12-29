import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import backgroundImage from '../assets/japanese gradients/O.png';

const CollectiveView = () => {
    const [cardsData, setCardsData] = useState([]);
    const { gameId } = useParams();

    useEffect(() => {
        const fetchCollectiveData = async () => {
            try {
                const response = await fetch(`http://localhost:7777/api/collective-view/${gameId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received data:', data); // Debug log
                setCardsData(data.cards);
            } catch (error) {
                console.error('Error fetching collective view:', error);
            }
        };

        fetchCollectiveData();
    }, [gameId]);

    useEffect(() => {
        const positionEntries = () => {
            const entries = document.querySelectorAll('.entry-item');
            entries.forEach((entry, index) => {
                // Position entries to the right of the card
                // Stagger them vertically
                const y = 20 + (index * 10); // Start at 20% from top, increment by 10%
                const x = 65; // Fixed position at 65% from left
                
                entry.style.left = `${x}%`;
                entry.style.top = `${y}%`;
            });
        };

        positionEntries();
    }, [cardsData]);

    return (
        <div 
            className="collective-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {cardsData.map((cardData, index) => (
                <section 
                    key={cardData.card_id} 
                    className="card-section"
                >
                    <div className="card-content">
                        <div className="card-image">
                            <img src={cardData.image_url} alt="Card" />
                        </div>
                        
                        <div className="entries-list">
                            {cardData.entries.map((entry, entryIndex) => (
                                <div key={entryIndex} className="entry-item">
                                    <p className="entry-text">{entry.entry_text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            <style>
                {`
                    .collective-container {
                        width: 100vw;  /* Full viewport width */
                        min-height: 100vh;
                        background-size: cover;
                        background-position: center;
                        background-attachment: fixed;
                        overflow-y: scroll;
                        scroll-snap-type: y mandatory;
                        position: fixed;  /* Fix the container to viewport */
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                    }

                    .card-section {
                        width: 100%;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        scroll-snap-align: start;
                    }

                    .card-content {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .card-image {
                        width: 400px;
                        height: auto;
                        position: relative;
                        z-index: 2;
                        margin-right: 20%; /* Push card to the left */
                        transform: translateX(-50%); /* Center relative to its new position */
                    }

                    .card-image img {
                        width: 100%;
                        height: auto;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    }

                    .entries-list {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 1;
                    }

                    .entry-item {
                        position: absolute;
                        transform: translate(-50%, -50%);
                        transition: opacity 0.3s ease;
                    }

                    .entry-text {
                        font-family: 'Papyrus', sans-serif;
                        font-size: 4.8rem; /* 4x larger than before (1.2rem * 4) */
                        color: #666666;
                        white-space: nowrap;
                    }

                    /* Add smooth scrolling to container */
                    .collective-container {
                        height: 100vh;
                        overflow-y: scroll;
                        scroll-snap-type: y mandatory;
                    }

                    /* Hide scrollbar but keep functionality */
                    .collective-container {
                        scrollbar-width: none;  /* Firefox */
                        -ms-overflow-style: none;  /* IE and Edge */
                    }
                    .collective-container::-webkit-scrollbar {
                        display: none;  /* Chrome, Safari, Opera */
                    }
                `}
            </style>
        </div>
    );
};

export default CollectiveView; 