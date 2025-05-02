import React from 'react';
import { SERVER_URL } from '../api';

export default function ImageCard({ image, type, onSelect, onApprove, onDeny }) {
  return (
    <div className="image-card" onClick={onSelect}>
      <img src={`${SERVER_URL}/images/all/${encodeURIComponent(image.filename)}`} />
      {type === 'new' && (
        <div className="buttons">
          <button onClick={(e) => { e.stopPropagation(); onDeny(); }}>❌</button>
          <button onClick={(e) => { e.stopPropagation(); onApprove(); }}>✅</button>
        </div>
      )}
    </div>
  );
}
