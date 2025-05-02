import React, { useState } from 'react';
import ViewerModal from './ViewerModal';

const BACKEND_URL = 'http://localhost:3000'; // Match your backend host/port

const ImageGrid = ({ images, onApprove, onDeny, viewMode }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
  };

  const handleImageError = (e, image) => {
    // If we haven't tried the fallback path yet, try it
    if (e.target.src.includes('/images/') && !e.target.src.includes('/images/all/')) {
      const fallbackPath = `${BACKEND_URL}/images/all/${encodeURIComponent(image.filename)}`;
      e.target.src = fallbackPath;
    } else {
      setImageErrors(prev => ({ ...prev, [image.filename]: true }));
    }
  };

  const shouldShowApproveButton = (image) => {
    // Show approve button for new images or denied images
    return image.status === 'new' || image.status === 'denied';
  };

  const shouldShowDenyButton = (image) => {
    // Show deny button for new images or approved images
    return image.status === 'new' || image.status === 'approved';
  };

  const getImagePath = (image) => {
    if (!image) return '';
    return `${BACKEND_URL}/images/${image.status}/${encodeURIComponent(image.filename)}`;
  };

  return (
    <div className="image-grid">
      {images.map((image) => (
        <div
          key={image.filename}
          className={`image-card ${image.status}`}
          onClick={() => handleImageClick(image)}
        >
          {!imageErrors[image.filename] && (
            <img
              src={getImagePath(image)}
              alt={image.filename}
              onError={(e) => handleImageError(e, image)}
            />
          )}
          {imageErrors[image.filename] && (
            <div className="error-message">Failed to load image</div>
          )}
          <div className="thumbnail-buttons">
            {shouldShowDenyButton(image) && (
              <button
                className="deny-btn"
                onClick={(e) => { e.stopPropagation(); onDeny(image); }}
              >
                <span className="icon">❌</span>
                <span className="label">Deny</span>
              </button>
            )}
            {shouldShowApproveButton(image) && (
              <button
                className="approve-btn"
                onClick={(e) => { e.stopPropagation(); onApprove(image); }}
              >
                <span className="icon">✅</span>
                <span className="label">Approve</span>
              </button>
            )}
          </div>
        </div>
      ))}
      {selectedImage && (
        <ViewerModal
          image={selectedImage}
          onClose={handleCloseViewer}
          onApprove={() => {
            onApprove(selectedImage);
            handleCloseViewer();
          }}
          onDeny={() => {
            onDeny(selectedImage);
            handleCloseViewer();
          }}
          newImageCount={images.filter(img => img.status === 'new').length}
        />
      )}
    </div>
  );
};

export default ImageGrid;
