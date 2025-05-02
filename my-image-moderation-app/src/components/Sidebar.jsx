import React, { useState, useEffect } from 'react';
import { fetchSettings } from '../utils/api';

const Sidebar = ({ 
  viewMode, 
  setViewMode, 
  useJsonMode, 
  rescanImages, 
  autoAdd, 
  onAutoAddChange,
  sortOrder,
  onSortOrderChange
}) => {
  const [folderPaths, setFolderPaths] = useState({
    jsonImages: '',
    new: '',
    approved: '',
    denied: ''
  });

  useEffect(() => {
    const loadFolderPaths = async () => {
      try {
        const settings = await fetchSettings();
        setFolderPaths({
          jsonImages: settings.jsonImages || './Images',
          new: settings.new || './New Images',
          approved: settings.approved || './Approved Images',
          denied: settings.denied || './Denied Images'
        });
      } catch (err) {
        console.error('Failed to load folder paths', err);
      }
    };
    loadFolderPaths();
  }, []);

  const openFolder = async (path) => {
    try {
      const response = await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (!response.ok) {
        throw new Error('Failed to open folder');
      }
    } catch (err) {
      console.error('Failed to open folder', err);
    }
  };

  return (
    <div className="sidebar">
      <div className="view-mode-section">
        <h2>View Mode</h2>
        <div className="view-mode-buttons">
          <button
            className={viewMode === 'new' ? 'active' : ''}
            onClick={() => setViewMode('new')}
          >
            <span className="icon">🆕</span>
            <span className="label">New</span>
          </button>
          <button
            className={viewMode === 'approved' ? 'active' : ''}
            onClick={() => setViewMode('approved')}
          >
            <span className="icon">✅</span>
            <span className="label">Approved</span>
          </button>
          <button
            className={viewMode === 'denied' ? 'active' : ''}
            onClick={() => setViewMode('denied')}
          >
            <span className="icon">❌</span>
            <span className="label">Denied</span>
          </button>
        </div>
        {useJsonMode && (
          <>
            <button className="rescan-button" onClick={rescanImages}>
              <span className="icon">🔄</span>
              <span className="label">Rescan Images</span>
            </button>
            <div className="auto-add-section">
              <label>
                <input
                  type="checkbox"
                  checked={autoAdd}
                  onChange={(e) => onAutoAddChange(e.target.checked)}
                />
                Auto-add to queue
              </label>
            </div>
          </>
        )}
      </div>

      <div className="folder-paths-section">
        <h2>Folder Paths</h2>
        <div className="folder-paths">
          {useJsonMode ? (
            <div className="folder-path">
              <span className="folder-label">JSON Images:</span>
              <button 
                className="folder-value"
                onClick={() => openFolder(folderPaths.jsonImages)}
                title="Click to open folder"
              >
                {folderPaths.jsonImages}
              </button>
            </div>
          ) : (
            <>
              <div className="folder-path">
                <span className="folder-label">New Images:</span>
                <button 
                  className="folder-value"
                  onClick={() => openFolder(folderPaths.new)}
                  title="Click to open folder"
                >
                  {folderPaths.new}
                </button>
              </div>
              <div className="folder-path">
                <span className="folder-label">Approved:</span>
                <button 
                  className="folder-value"
                  onClick={() => openFolder(folderPaths.approved)}
                  title="Click to open folder"
                >
                  {folderPaths.approved}
                </button>
              </div>
              <div className="folder-path">
                <span className="folder-label">Denied:</span>
                <button 
                  className="folder-value"
                  onClick={() => openFolder(folderPaths.denied)}
                  title="Click to open folder"
                >
                  {folderPaths.denied}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="auto-add-section">
        <h2>Settings</h2>
        <div className="sort-order-section">
          <label htmlFor="sortOrder">Sort Order</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
