import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ImageGrid from './components/ImageGrid';
import ViewerModal from './components/ViewerModal';
import Header from './components/Header';
import Toast from './components/Toast';
import {
  fetchImages,
  moveImage,
  syncJsonToFolders,
  syncFoldersToJson,
  triggerRescan,
  fetchSettings,
  updateSettings
} from './utils/api';

const App = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('new');
  const [toastMessage, setToastMessage] = useState('');
  const [useJsonMode, setUseJsonMode] = useState(false);
  const [autoAdd, setAutoAdd] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');
  const [pendingImageCount, setPendingImageCount] = useState(0);
  const [newImageCount, setNewImageCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load settings first
        const settings = await fetchSettings();
        setAutoAdd(settings.autoAdd);
        setUseJsonMode(settings.useJsonMode);
        setSortOrder(settings.sortOrder || 'newest');
        
        // Then check JSON mode and refresh images
        await checkJsonMode();
        await refreshImages();
        await checkPendingImages();
        
        // Setup WebSocket
        const ws = new WebSocket('ws://localhost:3000');
        
        ws.onmessage = async (event) => {
          if (event.data === 'folderChanged') {
            await refreshImages();
            await checkPendingImages();
          } else if (event.data === 'pendingCountChanged') {
            await checkPendingImages();
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
        
        return () => {
          ws.close();
        };
      } catch (err) {
        console.error('Initialization failed:', err);
        setToastMessage('❌ Failed to initialize application');
      }
    };

    initialize();
  }, [sortOrder]);

  useEffect(() => {
    refreshImages();
    checkPendingImages();
  }, [viewMode]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const settings = await response.json();
      setAutoAdd(settings.autoAdd);
      setUseJsonMode(settings.useJsonMode);
      setSortOrder(settings.sortOrder || 'newest');
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleAutoAddChange = async (value) => {
    try {
      setAutoAdd(value);
      await updateSettings({ autoAdd: value });
      console.log('✅ Auto-add setting updated:', value);
    } catch (err) {
      console.error('Failed to update auto-add setting', err);
      setToastMessage('❌ Failed to update auto-add setting');
    }
  };

  const checkJsonMode = async () => {
    try {
      const response = await fetch('/api/check-json-mode');
      const { isJsonMode } = await response.json();
      setUseJsonMode(isJsonMode);
    } catch (err) {
      console.error('Failed to check JSON mode', err);
    }
  };

  const refreshImages = async () => {
    try {
      const data = await fetchImages(viewMode);
      // Sort images based on sortOrder
      const sortedImages = [...data].sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
      setImages(sortedImages);

      // Always fetch new images count regardless of view mode
      const newImages = await fetchImages('new');
      setNewImageCount(newImages.length);
    } catch (err) {
      console.error('Image load failed', err);
    }
  };

  const checkPendingImages = async () => {
    try {
      const response = await fetch('/api/check-pending-images');
      const { count } = await response.json();
      setPendingImageCount(count);
    } catch (err) {
      console.error('Failed to check pending images', err);
    }
  };

  const handleImageClick = (image) => {
    if (image.status === 'new') {
      setSelectedImage(image);
      setShowViewer(true);
    }
  };

  const handleApprove = async (image) => {
    try {
      if (!image) return;
      
      // Move the file and update metadata
      await moveImage(image.filename, 'approved');
      
      // Get the current list of images based on view mode
      const currentImages = await fetchImages(viewMode);
      setImages(currentImages);
      
      // If in viewer, find next new image
      if (showViewer) {
        const newImages = await fetchImages('new');
        const nextNewImage = newImages.find(img => img.filename !== image.filename);
        if (nextNewImage) {
          setSelectedImage(nextNewImage);
        } else {
          setShowViewer(false);
          setSelectedImage(null);
        }
      }
      
      setToastMessage('✅ Image approved');
    } catch (error) {
      console.error('Failed to approve image:', error);
      setToastMessage('❌ Failed to approve image');
    }
  };

  const handleDeny = async (image) => {
    try {
      if (!image) return;
      
      // Move the file and update metadata
      await moveImage(image.filename, 'denied');
      
      // Get the current list of images based on view mode
      const currentImages = await fetchImages(viewMode);
      setImages(currentImages);
      
      // If in viewer, find next new image
      if (showViewer) {
        const newImages = await fetchImages('new');
        const nextNewImage = newImages.find(img => img.filename !== image.filename);
        if (nextNewImage) {
          setSelectedImage(nextNewImage);
        } else {
          setShowViewer(false);
          setSelectedImage(null);
        }
      }
      
      setToastMessage('✅ Image denied');
    } catch (error) {
      console.error('Failed to deny image:', error);
      setToastMessage('❌ Failed to deny image');
    }
  };

  const handleRescan = async () => {
    try {
      await triggerRescan();
      if (useJsonMode) {
        await syncFoldersToJson();
      } else {
        await syncJsonToFolders();
      }
      setToastMessage('🔄 Rescanning images...');
      refreshImages();
    } catch (err) {
      console.error('Failed to rescan', err);
      setToastMessage('❌ Failed to rescan images');
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/add-pending-images', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.added > 0) {
        // Force a refresh of both the images and pending count
        const newImages = await fetchImages(viewMode);
        setImages(newImages);
        await checkPendingImages();
      }
    } catch (err) {
      console.error('Failed to add pending images:', err);
    }
  };

  const handleSortOrderChange = async (newSortOrder) => {
    setSortOrder(newSortOrder);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: newSortOrder })
      });
    } catch (err) {
      console.error('Failed to save sort order:', err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        viewMode={viewMode}
        setViewMode={setViewMode}
        useJsonMode={useJsonMode}
        rescanImages={handleRescan}
        autoAdd={autoAdd}
        onAutoAddChange={handleAutoAddChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
      />
      <div className="main-content">
        <Header 
          autoAdd={autoAdd}
          onRefresh={handleRefresh}
          newImageCount={pendingImageCount}
          moderationCount={newImageCount}
        />
        <div className="image-grid">
          <ImageGrid
            images={images}
            onImageClick={handleImageClick}
            onApprove={handleApprove}
            onDeny={handleDeny}
            viewMode={viewMode}
          />
        </div>
        {showViewer && selectedImage && (
          <ViewerModal
            image={selectedImage}
            onClose={() => {
              setSelectedImage(null);
              setShowViewer(false);
            }}
            onApprove={handleApprove}
            onDeny={handleDeny}
            newImageCount={newImageCount}
          />
        )}
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      </div>
    </div>
  );
};

export default App;
