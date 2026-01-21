import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const GuestApp = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    const navigate = useNavigate();
    const { name: nameParam } = useParams();

    const createSlug = (text) => {
        if (!text) return '';
        return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const filteredCards = useMemo(() => {
        return cards.filter(card =>
            card.name.toLowerCase().startsWith(search.toLowerCase())
        );
    }, [cards, search]);

    const currentIndex = useMemo(() => {
        return selectedCard ? filteredCards.findIndex(c => c.id === selectedCard.id) : -1;
    }, [selectedCard, filteredCards]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cards`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCards(data.results);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (nameParam && cards.length > 0) {
            const cardFound = cards.find(c => createSlug(c.name) === nameParam);
            if (cardFound) {
                setSelectedCard(cardFound);
                setCurrentImgIndex(0);
                setIsClosing(false);
            } else {
                navigate('/gallery');
            }
        } else if (!nameParam && selectedCard) {
            handleClose();
        }
    }, [nameParam, cards]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedCard(null);
            setIsClosing(false);
            navigate('/gallery');
        }, 300);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedCard) return;
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowRight' && currentIndex < filteredCards.length - 1) {
                navigate(`/gallery/${createSlug(filteredCards[currentIndex + 1].name)}`);
            }
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                navigate(`/gallery/${createSlug(filteredCards[currentIndex - 1].name)}`);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCard, currentIndex, filteredCards]);

    const nextImg = (e) => { e.stopPropagation(); setCurrentImgIndex(prev => (prev + 1 === selectedCard.images.length ? 0 : prev + 1)); };
    const prevImg = (e) => { e.stopPropagation(); setCurrentImgIndex(prev => (prev === 0 ? selectedCard.images.length - 1 : prev - 1)); };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-warning fw-bold">ACCESSO AL POKÉDEX...</div>;

    return (
        <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh', color: '#fff', paddingBottom: '50px' }}>
            <div className="container py-4 py-md-5">
                <header className="text-center mb-4 mb-md-5 px-3">
                    <h1 className="fw-bold display-5 display-md-4 text-warning" style={{ textShadow: '2px 2px #000' }}>POKÉMON GALLERY</h1>
                    <div className="position-relative w-100 w-md-50 mx-auto mt-4">
                        <input
                            type="text" className="form-control bg-dark text-white border-warning rounded-pill py-3 px-4 shadow"
                            placeholder="Inizia a scrivere il nome..." value={search} onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button className="btn btn-sm btn-link text-warning position-absolute end-0 top-50 translate-middle-y me-3" onClick={() => setSearch('')} style={{ textDecoration: 'none' }}>✕</button>
                        )}
                    </div>
                </header>

                {/* GRIGLIA: col-12 per mobile e col-md-4 per desktop */}
                <div className="row g-4 px-3 px-md-0">
                    {filteredCards.length > 0 ? (
                        filteredCards.map(card => (
                            <div key={card.id} className="col-12 col-md-6 col-lg-3">
                                <div className="h-100 p-4 card-hover-effect shadow" onClick={() => navigate(`/gallery/${createSlug(card.name)}`)}
                                    style={{ background: 'linear-gradient(145deg, #ffd700, #e0c020)', borderRadius: '18px', border: '4px solid #333', cursor: 'pointer' }}>
                                    <div className="bg-white p-3 rounded mb-2 border text-center shadow-sm position-relative">
                                        <div className="d-flex justify-content-between px-1 mb-2">
                                            <h5 className="fw-bold text-dark text-truncate mb-0" style={{ maxWidth: '75%' }}>{card.name}</h5>
                                            <span className="text-danger fw-bold">HP {card.hp}</span>
                                        </div>
                                        <img
                                            src={card.images[0] ? `http://127.0.0.1:8000/storage/${card.images[0].path}` : ''}
                                            className="img-fluid w-100"
                                            style={{ height: '200px', objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div className="text-center mt-3">
                                        <div className="d-flex gap-1 mb-2">
                                            <span className="badge flex-grow-1" style={{ backgroundColor: card.rarity_color, color: card.rarity_text_color }}>{card.rarity}</span>
                                            <span className="badge rounded-pill px-3" style={{ backgroundColor: card.type_bg_color, color: card.type_text_color }}>{card.type}</span>
                                        </div>
                                        <div className="fw-bold text-dark fs-4 bg-white bg-opacity-25 rounded py-1">€ {card.price}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center mt-5 w-100">
                            <h4 className="text-secondary">Nessun Pokémon trovato con iniziali "{search}"</h4>
                        </div>
                    )}
                </div>

                {/* MODALE RESPONSIVE */}
                {selectedCard && (
                    <div className={`modal d-block transition-fade ${isClosing ? 'fade-out' : 'fade-in'}`} style={{ background: 'rgba(0,0,0,0.95)', zIndex: 1050 }} onClick={handleClose}>
                        <div className="modal-dialog modal-lg modal-dialog-centered px-2" onClick={e => e.stopPropagation()}>
                            <div className="modal-content border-0 shadow-lg bg-dark text-white" style={{ borderRadius: '25px', overflow: 'hidden' }}>
                                <div className="row g-0 flex-column flex-md-row">
                                    {/* IMMAGINE (Alto su mobile, sinistra su desktop) */}
                                    <div className="col-md-6 bg-black d-flex align-items-center justify-content-center position-relative p-3" style={{ minHeight: '320px' }}>
                                        {selectedCard.images.length > 1 && (
                                            <>
                                                <button className="btn btn-link text-warning position-absolute start-0 fs-1 px-3" onClick={prevImg} style={{ textDecoration: 'none', zIndex: 10 }}>‹</button>
                                                <button className="btn btn-link text-warning position-absolute end-0 fs-1 px-3" onClick={nextImg} style={{ textDecoration: 'none', zIndex: 10 }}>›</button>
                                            </>
                                        )}
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/storage/${selectedCard.images[currentImgIndex]?.path}`}
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '350px', objectFit: 'contain' }}
                                        />
                                        <div className="position-absolute bottom-0 mb-3 badge bg-warning text-dark px-3 py-1 rounded-pill">{currentImgIndex + 1} / {selectedCard.images.length}</div>
                                    </div>

                                    {/* INFO (Basso su mobile, destra su desktop) */}
                                    <div className="col-md-6 p-4 p-md-5 d-flex flex-column justify-content-center">
                                        <div className="d-flex justify-content-between mb-4">
                                            <button className="btn btn-sm btn-outline-warning rounded-pill px-3" onClick={() => navigate(`/gallery/${createSlug(filteredCards[currentIndex - 1].name)}`)} disabled={currentIndex === 0}>←</button>
                                            <button className="btn btn-sm btn-warning d-md-none rounded-pill px-4 fw-bold" onClick={handleClose}>CHIUDI</button>
                                            <button className="btn btn-sm btn-outline-warning rounded-pill px-3" onClick={() => navigate(`/gallery/${createSlug(filteredCards[currentIndex + 1].name)}`)} disabled={currentIndex === filteredCards.length - 1}>→</button>
                                        </div>

                                        <h2 className="fw-bold text-warning mb-0 fs-2">{selectedCard.name}</h2>
                                        <h5 className="text-danger fw-bold mb-3">HP {selectedCard.hp}</h5>

                                        <div className="mb-4 d-flex gap-2">
                                            <span className="badge px-3 py-2 shadow-sm" style={{ backgroundColor: selectedCard.rarity_color, color: selectedCard.rarity_text_color }}>{selectedCard.rarity}</span>
                                            <span className="badge px-3 py-2 rounded-pill shadow-sm" style={{ backgroundColor: selectedCard.type_bg_color, color: selectedCard.type_text_color }}>{selectedCard.type}</span>
                                        </div>
                                        <hr className="border-secondary opacity-25" />
                                        <p className="small mb-2"><strong>Espansione:</strong> <span className="text-warning">{selectedCard.expansion?.name}</span></p>
                                        <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary border-opacity-25 italic mb-4" style={{ fontSize: '0.9rem' }}>
                                            "{selectedCard.description || "Descrizione Pokédex non disponibile."}"
                                        </div>
                                        <div className="h2 fw-bold text-success mb-0">€ {selectedCard.price}</div>
                                        <button className="btn-close btn-close-white position-absolute top-0 end-0 m-4 d-none d-md-block" onClick={handleClose}></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .card-hover-effect { transition: all 0.3s ease; }
                @media (min-width: 768px) {
                    .card-hover-effect:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.4) !important; }
                }
                .transition-fade { transition: opacity 0.3s ease, transform 0.3s ease; }
                .fade-in { opacity: 1; transform: scale(1); }
                .fade-out { opacity: 0; transform: scale(0.9); }
            `}} />
        </div>
    );
};

export default GuestApp;
