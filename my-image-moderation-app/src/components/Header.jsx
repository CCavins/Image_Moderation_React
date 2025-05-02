import React from 'react';

export default function Header({ onRefresh, newImageCount, moderationCount, autoAdd }) {
  return (
    <div className="header">
      <div className="counters">
        {!autoAdd && (
          <button className="refresh-btn" onClick={onRefresh}>
            <span className="icon">🔄</span>
            <span className="label">Refresh</span>
            <span className="count">({newImageCount})</span>
          </button>
        )}
        <span className="moderation-count">
          <span className="icon">📋</span>
          <span className="count">{moderationCount}</span>
          <span className="label">to moderate</span>
        </span>
      </div>
    </div>
  );
}
