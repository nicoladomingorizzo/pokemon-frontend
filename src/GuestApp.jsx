import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GuestApp.css';

const GuestApp = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    const navigate = useNavigate();
    const { name: urlSlug } = useParams();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const getSlug = useCallback((card) => {
        if (!card) return '';
        const name = card.name.toLowerCase().replace(/[^\w]/g, '-');
        return `${card.id}-${name}`;
    }, []);

    const filteredCards = useMemo(() => {
        const query = search.toLowerCase().trim();
        return cards.filter(c => query ? c.name.toLowerCase().startsWith(query) : true);
    }, [cards, search]);

    const currentIndex = useMemo(() => {
        return filteredCards.findIndex(c => getSlug(c) === urlSlug);
    }, [urlSlug, filteredCards, getSlug]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedCard(null);
            setIsClosing(false);
            navigate('/gallery');
        }, 300);
    }, [navigate]);

    const goToNext = useCallback((e) => {
        if (e) e.stopPropagation();
        if (currentIndex < filteredCards.length - 1) {
            navigate(`/gallery/${getSlug(filteredCards[currentIndex + 1])}`);
        }
    }, [currentIndex, filteredCards, navigate, getSlug]);

    const goToPrev = useCallback((e) => {
        if (e) e.stopPropagation();
        if (currentIndex > 0) {
            navigate(`/gallery/${getSlug(filteredCards[currentIndex - 1])}`);
        }
    }, [currentIndex, filteredCards, navigate, getSlug]);

    const nextImg = (e) => {
        e.stopPropagation();
        if (selectedCard?.images) setCurrentImgIndex(prev => (prev + 1) % selectedCard.images.length);
    };

    const prevImg = (e) => {
        e.stopPropagation();
        if (selectedCard?.images) setCurrentImgIndex(prev => (prev === 0 ? selectedCard.images.length - 1 : prev - 1));
    };

    const getTypeStyle = (type) => {
        const types = { 'Fuoco': '#F08030', 'Acqua': '#6890F0', 'Erba': '#78C850', 'Elettro': '#F8D030', 'Psico': '#F85888', 'Lotta': '#C03028', 'Oscurità': '#705848', 'Metallo': '#B8B8D0', 'Folletto': '#EE99AC', 'Drago': '#7038F8', 'Normale': '#A8A878', 'Allenatore': '#4a90e2' };
        return { backgroundColor: types[type] || '#555', color: '#fff' };
    };

    useEffect(() => {
        fetch(`${baseUrl}/api/cards`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCards(data.results);
                setLoading(false);
            });
    }, [baseUrl]);

    useEffect(() => {
        if (urlSlug && cards.length > 0) {
            const card = cards.find(c => getSlug(c) === urlSlug);
            if (card) { setSelectedCard(card); setCurrentImgIndex(0); }
        } else { setSelectedCard(null); }
    }, [urlSlug, cards, getSlug]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!selectedCard) return;
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedCard, goToNext, goToPrev, handleClose]);

    if (loading) return <div className="vh-100 bg-dark d-flex align-items-center justify-content-center text-warning fw-bold">CARICAMENTO POKÉDEX...</div>;

    return (
        <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff', paddingBottom: '50px' }}>
            <div className="container py-5">
                <header className="text-center mb-5">
                    <h1 className="fw-bold text-warning display-4" style={{ textShadow: '2px 2px #000' }}>POKÉMON GALLERY</h1>
                    <input type="text" className="form-control bg-dark text-white border-warning rounded-pill w-50 mx-auto mt-4 shadow" placeholder="Cerca per iniziale (es. 'P')..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </header>

                <div className="row g-4">
                    {filteredCards.map(card => (
                        <div key={card.id} className="col-md-4">
                            <div className="p-4 h-100 shadow text-start" onClick={() => navigate(`/gallery/${getSlug(card)}`)}
                                style={{ background: 'linear-gradient(145deg, #ffd700, #e0c020)', borderRadius: '18px', border: '4px solid #333', cursor: 'pointer' }}>
                                <div className="p-3 rounded mb-2" style={{ backgroundColor: '#1a1a1a' }}>
                                    <div className="d-flex justify-content-center text-white mb-2 px-1">
                                        <h5 className="fw-bold mb-0 text-truncate">{card.name}</h5>
                                    </div>
                                    <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={`${baseUrl}/storage/${card.images[0]?.path}`} alt={card.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                </div>
                                <div className="d-flex gap-1 mt-3">
                                    <span className="badge flex-grow-1 bg-dark text-white-50 border border-secondary">{card.rarity || 'Comune'}</span>
                                    <span className="badge rounded-pill px-3 shadow-sm" style={getTypeStyle(card.type)}>{card.type}</span>
                                </div>
                                <div className="mt-3 fw-bold text-dark fs-4 bg-white bg-opacity-25 rounded text-center py-1">€ {card.price}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedCard && (
                    <div className={`modal d-block ${isClosing ? 'fade-out' : 'fade-in'}`} style={{ background: 'rgba(0,0,0,0.95)', zIndex: 1050 }} onClick={handleClose}>
                        <div className="modal-dialog modal-lg modal-dialog-centered px-2" onClick={e => e.stopPropagation()}>
                            <div className="modal-content bg-dark text-white border-warning" style={{ borderRadius: '25px', border: '2px solid' }}>
                                <div className="row g-0">
                                    <div className="col-md-6 bg-black d-flex align-items-center justify-content-center position-relative p-4 rounded-start" style={{ minHeight: '450px' }}>
                                        <button className="btn text-warning position-absolute start-0 fs-1 z-3 px-3 h-100" onClick={goToPrev} style={{ visibility: currentIndex > 0 ? 'visible' : 'hidden' }}>‹</button>
                                        <button className="btn text-warning position-absolute end-0 fs-1 z-3 px-3 h-100" onClick={goToNext} style={{ visibility: currentIndex < filteredCards.length - 1 ? 'visible' : 'hidden' }}>›</button>
                                        {selectedCard.images.length > 1 && (
                                            <>
                                                <div className="position-absolute d-flex justify-content-between w-75 z-3" style={{ bottom: '15%' }}>
                                                    <button className="btn btn-sm btn-light opacity-75 rounded-circle shadow" onClick={prevImg}>←</button>
                                                    <button className="btn btn-sm btn-light opacity-75 rounded-circle shadow" onClick={nextImg}>→</button>
                                                </div>
                                                <div className="position-absolute bottom-0 mb-3 d-flex gap-2">
                                                    {selectedCard.images.map((_, i) => (
                                                        <div key={i} onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(i); }}
                                                            style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentImgIndex === i ? '#ffd700' : '#555', cursor: 'pointer' }} />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        <img src={`${baseUrl}/storage/${selectedCard.images[currentImgIndex]?.path}`} className="img-fluid" style={{ maxHeight: '380px', filter: 'drop-shadow(0 0 12px gold)' }} alt="" />
                                    </div>
                                    <div className="col-md-6 p-4 p-md-5 position-relative text-start">
                                        <h2 className="text-warning fw-bold mb-1">{selectedCard.name}</h2>
                                        {selectedCard.hp && <h5 className="text-danger fw-bold mb-3">HP {selectedCard.hp}</h5>}
                                        <div className="mb-4 d-flex gap-2"><span className="badge bg-secondary">{selectedCard.rarity}</span><span className="badge rounded-pill" style={getTypeStyle(selectedCard.type)}>{selectedCard.type}</span></div>
                                        <div className="mb-3"><p className="mb-1 text-secondary small text-uppercase">Espansione</p><p className="fw-bold text-white">{selectedCard.expansion?.name || 'Set Base'}</p></div>
                                        <div className="p-3 bg-white bg-opacity-10 rounded my-4 shadow-sm" style={{ fontSize: '0.9rem', borderLeft: '4px solid #ffd700', maxHeight: '120px', overflowY: 'auto' }}>
                                            <em>"{selectedCard.description || 'Nessuna descrizione disponibile.'}"</em>
                                        </div>
                                        <div className="h2 text-success fw-bold">€ {selectedCard.price}</div>
                                        <button className="btn-close btn-close-white position-absolute top-0 end-0 m-4 shadow-none" onClick={handleClose}></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuestApp;