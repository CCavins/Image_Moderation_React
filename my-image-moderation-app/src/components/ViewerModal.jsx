import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const BACKEND_URL = 'http://localhost:3000';

const ViewerModal = ({ image, onClose, onApprove, onDeny, newImageCount }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setImageLoaded(false);
    setIsTransitioning(true);
    setTransitionDirection('');
    
    if (image) {
      setCurrentImagePath(getImagePath());
    }

    // Reset transition state after animation
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection('');
    }, 300);

    return () => clearTimeout(timer);
  }, [image]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default behavior for our shortcuts
      if (['ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
          handleDeny();
          break;
        case 'ArrowRight':
          handleApprove();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onApprove, onDeny, onClose]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageLoaded(true);
    setError(null);
  };

  const handleImageError = (e) => {
    // If we haven't tried the fallback path yet, try it
    if (e.target.src.includes('/images/') && !e.target.src.includes('/images/all/')) {
      const fallbackPath = `${BACKEND_URL}/images/all/${encodeURIComponent(image.filename)}`;
      setCurrentImagePath(fallbackPath);
      e.target.src = fallbackPath;
    } else {
      setIsLoading(false);
      setError('Failed to load image');
    }
  };

  const handleApprove = () => {
    setTransitionDirection('right');
    setIsTransitioning(true);
    // Wait for animation to complete before approving
    setTimeout(() => {
      onApprove(image);
    }, 300);
  };

  const handleDeny = () => {
    setTransitionDirection('left');
    setIsTransitioning(true);
    // Wait for animation to complete before denying
    setTimeout(() => {
      onDeny(image);
    }, 300);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleDeny,
    onSwipedRight: handleApprove,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const getImagePath = () => {
    if (!image) return '';
    return `${BACKEND_URL}/images/${image.status}/${encodeURIComponent(image.filename)}`;
  };

  return (
    <div className="viewer-modal" onClick={onClose}>
      <div className="viewer-content" onClick={e => e.stopPropagation()}>
        <div className="viewer-header">
          <span className="image-count">New Images to Moderate: {newImageCount}</span>
          <div className="keyboard-shortcuts">
            <span className="shortcut">←: Deny</span>
            <span className="shortcut">→: Approve</span>
            <span className="shortcut">ESC: Close</span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="viewer-image-container" {...handlers}>
          {isLoading && !imageLoaded && (
            <div className="loading-spinner">Loading...</div>
          )}
          {error && <div className="error">{error}</div>}
          {currentImagePath && (
            <img
              src={currentImagePath}
              alt={image?.filename || ''}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`viewer-image ${imageLoaded ? 'fade-in' : ''} ${isTransitioning ? 'transitioning' : ''} ${transitionDirection}`}
            />
          )}
        </div>
        <div className="viewer-controls">
          <button className="deny-btn" onClick={handleDeny}>
            <span className="icon">❌</span>
            <span className="label">Deny (←)</span>
          </button>
          <button className="approve-btn" onClick={handleApprove}>
            <span className="icon">✅</span>
            <span className="label">Approve (→)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewerModal;
