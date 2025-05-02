import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

const BACKEND_URL = 'http://localhost:3000';

const ViewerModal = ({ image, onClose, onApprove, onDeny, newImageCount }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImagePath, setCurrentImagePath] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setImageLoaded(false);
    if (image) {
      setCurrentImagePath(getImagePath());
    }
  }, [image]);

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

  const handlers = useSwipeable({
    onSwipedLeft: () => onDeny(),
    onSwipedRight: () => onApprove(),
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
              className={`viewer-image ${imageLoaded ? 'fade-in' : ''}`}
            />
          )}
        </div>
        <div className="viewer-controls">
          <button className="deny-btn" onClick={onDeny}>
            <span className="icon">❌</span>
            <span className="label">Deny</span>
          </button>
          <button className="approve-btn" onClick={onApprove}>
            <span className="icon">✅</span>
            <span className="label">Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewerModal;
