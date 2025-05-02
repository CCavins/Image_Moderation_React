const express = require('express');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { exec } = require('child_process');
const chokidar = require('chokidar');
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// === Config ===
const CONFIG_FILE = path.join(__dirname, 'server-config.json');
const METADATA_FILE = path.join(__dirname, 'image-metadata.json');

let config = {
  useJsonMode: true,
  autoAdd: true,
  sortOrder: 'newest',
  jsonImages: './Images',
  new: './New Images',
  approved: './Approved Images',
  denied: './Denied Images'
};

// Load config and resolve paths
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    console.log('📄 Loaded config:', loaded);
    config = { ...config, ...loaded };
  } catch (err) {
    console.error('❌ Error loading config:', err);
  }
} else {
  console.log('📄 Creating default config');
  saveConfig();
}

const resolvePath = (p) => path.resolve(__dirname, p);
config.jsonImages = resolvePath(config.jsonImages);
config.new = resolvePath(config.new);
config.approved = resolvePath(config.approved);
config.denied = resolvePath(config.denied);

console.log('🔧 Using config:', {
  useJsonMode: config.useJsonMode,
  autoAdd: config.autoAdd,
  sortOrder: config.sortOrder,
  jsonImages: config.jsonImages,
  new: config.new,
  approved: config.approved,
  denied: config.denied
});

// === Helpers ===
let imageMetadata = {};

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log('✅ Saved config to', CONFIG_FILE);
  } catch (err) {
    console.error('❌ Error saving config:', err);
  }
}
function saveMetadata() {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(imageMetadata, null, 2));
}
function ensureFolders() {
  [config.jsonImages, config.new, config.approved, config.denied].forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`📁 Created folder: ${folder}`);
    } else {
      console.log(`✅ Found folder: ${folder}`);
    }
  });
}
function getTimestamp(filePath) {
  const stats = fs.statSync(filePath);
  return stats.birthtimeMs || stats.mtimeMs;
}

ensureFolders();

// === Mode Conversion on Startup ===
if (config.useJsonMode) {
  if (fs.existsSync(METADATA_FILE)) {
    imageMetadata = JSON.parse(fs.readFileSync(METADATA_FILE));
    console.log(`📄 Loaded existing metadata (${Object.keys(imageMetadata).length} entries)`);
  }

  const mergeIntoImages = (folder, status) => {
    fs.readdirSync(folder).forEach(file => {
      if (!/\.(jpg|jpeg|png|gif)$/i.test(file)) return;
      const src = path.join(folder, file);
      const dest = path.join(config.jsonImages, file);

      if (!fs.existsSync(dest)) {
        fs.renameSync(src, dest);
        console.log(`➡️ Moved ${file} to Images/`);
      }

      if (!imageMetadata[file]) {
        imageMetadata[file] = { status, timestamp: Date.now() };
        console.log(`➕ Added ${file} to metadata as '${status}'`);
      } else {
        console.log(`⏭️ Skipped tagging ${file}, already marked as '${imageMetadata[file].status}'`);
      }
    });
  };

  mergeIntoImages(config.new, 'new');
  mergeIntoImages(config.approved, 'approved');
  mergeIntoImages(config.denied, 'denied');

  // ✅ Final metadata sync before saving
  const allImages = fs.readdirSync(config.jsonImages).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
  const trackedSet = new Set(Object.keys(imageMetadata));
  allImages.forEach(file => {
    if (!trackedSet.has(file)) {
      imageMetadata[file] = { status: 'new', timestamp: Date.now() };
      console.log(`➕ Added ${file} to metadata as 'new'`);
    }
  });

  Object.keys(imageMetadata).forEach(file => {
    if (!fs.existsSync(path.join(config.jsonImages, file))) {
      delete imageMetadata[file];
      console.log(`🗑️ Removed ${file} from metadata (file missing)`);
    }
  });

  saveMetadata();
  console.log(`📦 Finished converting to JSON mode.`);
} else {
  // 🡒 Convert JSON data back into folders
  if (fs.existsSync(METADATA_FILE)) {
    imageMetadata = JSON.parse(fs.readFileSync(METADATA_FILE));
    Object.entries(imageMetadata).forEach(([filename, data]) => {
      const src = path.join(config.jsonImages, filename);
      let dest;
      if (data.status === 'new') dest = path.join(config.new, filename);
      else if (data.status === 'approved') dest = path.join(config.approved, filename);
      else if (data.status === 'denied') dest = path.join(config.denied, filename);
      else return;

      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        fs.renameSync(src, dest);
        console.log(`⬅️ Moved ${filename} to folder: ${data.status}`);
      }
    });
  }
  imageMetadata = {}; // Reset for folder mode
}

// === CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// === Static
app.use('/', express.static(path.join(__dirname)));
app.use('/images/all', express.static(config.jsonImages));
app.use('/images/new', express.static(config.new));
app.use('/images/approved', express.static(config.approved));
app.use('/images/denied', express.static(config.denied));

// === API Routes
app.get('/api/config', (req, res) => {
  res.json({ useJsonMode: config.useJsonMode });
});

app.get('/api/settings', (req, res) => {
  res.json({
    useJsonMode: config.useJsonMode,
    autoAdd: config.autoAdd,
    sortOrder: config.sortOrder,
    jsonImages: config.jsonImages,
    new: config.new,
    approved: config.approved,
    denied: config.denied
  });
});

app.post('/api/settings', (req, res) => {
  const { useJsonMode, autoAdd, sortOrder } = req.body;
  if (typeof useJsonMode === 'boolean') config.useJsonMode = useJsonMode;
  if (typeof autoAdd === 'boolean') config.autoAdd = autoAdd;
  if (['newest', 'oldest'].includes(sortOrder)) config.sortOrder = sortOrder;
  saveConfig();
  res.json({ success: true });
});

app.get('/api/list-new', (req, res) => {
  const list = Object.entries(imageMetadata)
    .filter(([, data]) => data.status === 'new')
    .map(([filename, data]) => ({ filename, ...data }));
  res.json(list);
});

app.get('/api/list-approved', (req, res) => {
  const list = Object.entries(imageMetadata)
    .filter(([, data]) => data.status === 'approved')
    .map(([filename, data]) => ({ filename, ...data }));
  res.json(list);
});

app.get('/api/list-denied', (req, res) => {
  const list = Object.entries(imageMetadata)
    .filter(([, data]) => data.status === 'denied')
    .map(([filename, data]) => ({ filename, ...data }));
  res.json(list);
});

app.get('/api/list-all', (req, res) => {
  const list = Object.entries(imageMetadata).map(([filename, data]) => ({
    filename,
    ...data
  }));
  res.json(list);
});

app.post('/api/move-image', (req, res) => {
  const { filename, status } = req.body;
  console.log('Moving image:', filename, 'to status:', status);
  
  if (!imageMetadata[filename] || !['approved', 'denied', 'new'].includes(status)) {
    console.error('Invalid image or status:', filename, status);
    return res.status(400).json({ error: 'Invalid image or status' });
  }

  const oldStatus = imageMetadata[filename].status;
  imageMetadata[filename].status = status;
  imageMetadata[filename].timestamp = Date.now();

  if (config.useJsonMode) {
    // In JSON mode, just update the metadata
    saveMetadata();
    console.log('Updated metadata for:', filename);
  } else {
    // Move file between folders in non-JSON mode
    const oldPath = path.join(config[oldStatus], filename);
    const newPath = path.join(config[status], filename);
    if (fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log('Moved file from', oldPath, 'to', newPath);
      } catch (err) {
        console.error('Failed to move file:', err);
        return res.status(500).json({ error: 'Failed to move file' });
      }
    }
  }

  // Notify all clients of the change
  wss.clients.forEach(client => {
    client.send('folderChanged');
  });
  res.json({ success: true });
});

app.post('/api/sync-json-to-folders', (req, res) => {
  if (config.useJsonMode) {
    return res.status(400).json({ error: 'Cannot sync folders in JSON mode' });
  }

  Object.entries(imageMetadata).forEach(([filename, data]) => {
    const sourcePath = path.join(config.jsonImages, filename);
    const targetPath = path.join(config[data.status], filename);
    
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      // Move file instead of copying
      fs.renameSync(sourcePath, targetPath);
    }
  });

  wss.clients.forEach(client => client.send('folderChanged'));
  res.json({ success: true });
});

app.post('/api/sync-folders-to-json', (req, res) => {
  if (!config.useJsonMode) {
    return res.status(400).json({ error: 'Cannot sync JSON in folder mode' });
  }

  ['new', 'approved', 'denied'].forEach(status => {
    const folderPath = config[status];
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      files.forEach(file => {
        if (!/\.(jpg|jpeg|png|gif)$/i.test(file)) return;
        const sourcePath = path.join(folderPath, file);
        const targetPath = path.join(config.jsonImages, file);
        
        if (!fs.existsSync(targetPath)) {
          // Move file instead of copying
          fs.renameSync(sourcePath, targetPath);
        }
      });
    }
  });

  wss.clients.forEach(client => client.send('folderChanged'));
  res.json({ success: true });
});

app.get('/api/check-json-mode', (req, res) => {
  res.json({ isJsonMode: config.useJsonMode });
});

app.post('/api/rescan', (req, res) => {
  try {
    let count = 0;
    let removed = 0;
    
    if (config.useJsonMode) {
      // First, clean up metadata for files that no longer exist
      Object.keys(imageMetadata).forEach(filename => {
        const filePath = path.join(config.jsonImages, filename);
        if (!fs.existsSync(filePath)) {
          delete imageMetadata[filename];
          removed++;
        }
      });

      // Then scan JSON images folder and update metadata
      const files = fs.readdirSync(config.jsonImages);
      files.forEach(file => {
        if (!/\.(jpg|jpeg|png|gif)$/i.test(file)) return;
        if (!imageMetadata[file]) {
          imageMetadata[file] = {
            status: 'new',
            timestamp: Date.now()
          };
          count++;
        }
      });
    } else {
      // First, scan all folders and update metadata based on actual locations
      ['new', 'approved', 'denied'].forEach(status => {
        const folderPath = config[status];
        if (fs.existsSync(folderPath)) {
          const files = fs.readdirSync(folderPath);
          files.forEach(file => {
            if (!/\.(jpg|jpeg|png|gif)$/i.test(file)) return;
            
            // Always update metadata to match the folder it's in
            imageMetadata[file] = {
              status,
              timestamp: Date.now()
            };
            count++;
          });
        }
      });

      // Remove metadata for files that no longer exist
      Object.keys(imageMetadata).forEach(filename => {
        let exists = false;
        ['new', 'approved', 'denied'].forEach(status => {
          const filePath = path.join(config[status], filename);
          if (fs.existsSync(filePath)) {
            exists = true;
          }
        });
        if (!exists) {
          delete imageMetadata[filename];
          removed++;
        }
      });
    }

    saveMetadata();
    wss.clients.forEach(client => client.send('folderChanged'));
    res.json({ added: count, removed });
  } catch (err) {
    console.error('Rescan failed:', err);
    res.status(500).json({ error: 'Failed to rescan folders' });
  }
});

app.post('/api/open-folder', (req, res) => {
  const { path: folderPath } = req.body;
  if (!folderPath) {
    return res.status(400).json({ error: 'No path provided' });
  }

  const absolutePath = path.resolve(folderPath);
  if (!fs.existsSync(absolutePath)) {
    return res.status(400).json({ error: 'Folder does not exist' });
  }

  let command;
  if (process.platform === 'win32') {
    // For Windows, use explorer
    command = `explorer "${absolutePath}"`;
  } else if (process.platform === 'darwin') {
    // For macOS, use open
    command = `open "${absolutePath}"`;
  } else {
    // For Linux, use xdg-open
    command = `xdg-open "${absolutePath}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.error('Failed to open folder:', error);
      return res.status(500).json({ error: 'Failed to open folder' });
    }
    res.json({ success: true });
  });
});

app.get('/api/check-pending-images', (req, res) => {
  try {
    let count = 0;
    if (config.useJsonMode) {
      // Get all files in the JSON images folder
      const files = fs.readdirSync(config.jsonImages);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      
      // Count files that aren't in metadata yet
      count = imageFiles.filter(file => !imageMetadata[file]).length;
    } else {
      // Get all files in the new images folder
      const files = fs.readdirSync(config.new);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      
      // Count files that aren't in metadata yet
      count = imageFiles.filter(file => !imageMetadata[file]).length;
    }
    
    res.json({ count });
  } catch (err) {
    console.error('Failed to check pending images:', err);
    res.status(500).json({ error: 'Failed to check pending images' });
  }
});

// === File System Watcher ===
function setupFileWatchers() {
  if (config.useJsonMode) {
    // Watch the JSON images folder
    const jsonWatcher = chokidar.watch(config.jsonImages, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    jsonWatcher
      .on('add', filePath => {
        const filename = path.basename(filePath);
        if (!/\.(jpg|jpeg|png|gif)$/i.test(filename)) return;
        
        if (config.autoAdd) {
          // Auto-add is enabled, add to metadata immediately
          if (!imageMetadata[filename]) {
            imageMetadata[filename] = {
              status: 'new',
              timestamp: Date.now()
            };
            saveMetadata();
            // Notify clients of both changes
            wss.clients.forEach(client => {
              client.send('folderChanged');
              client.send('pendingCountChanged');
            });
          }
        } else {
          // Auto-add is disabled, just notify of pending count change
          wss.clients.forEach(client => client.send('pendingCountChanged'));
        }
      })
      .on('unlink', filePath => {
        const filename = path.basename(filePath);
        if (imageMetadata[filename]) {
          delete imageMetadata[filename];
          saveMetadata();
          // Notify clients of both changes
          wss.clients.forEach(client => {
            client.send('folderChanged');
            client.send('pendingCountChanged');
          });
        } else {
          // Notify of pending count change even if file wasn't in metadata
          wss.clients.forEach(client => client.send('pendingCountChanged'));
        }
      });
  } else {
    // Watch all status folders
    ['new', 'approved', 'denied'].forEach(status => {
      const folderPath = config[status];
      const watcher = chokidar.watch(folderPath, {
        ignored: /(^|[\/\\])\../,
        persistent: true
      });

      watcher
        .on('add', filePath => {
          const filename = path.basename(filePath);
          if (!/\.(jpg|jpeg|png|gif)$/i.test(filename)) return;
          
          if (status === 'new') {
            if (config.autoAdd) {
              // Auto-add is enabled, add to metadata immediately
              if (!imageMetadata[filename] || imageMetadata[filename].status !== status) {
                imageMetadata[filename] = {
                  status,
                  timestamp: Date.now()
                };
                saveMetadata();
                // Notify clients of both changes
                wss.clients.forEach(client => {
                  client.send('folderChanged');
                  client.send('pendingCountChanged');
                });
              }
            } else {
              // Auto-add is disabled, just notify of pending count change
              wss.clients.forEach(client => client.send('pendingCountChanged'));
            }
          } else {
            // For approved/denied folders, always update metadata
            if (!imageMetadata[filename] || imageMetadata[filename].status !== status) {
              imageMetadata[filename] = {
                status,
                timestamp: Date.now()
              };
              saveMetadata();
              // Notify clients of both changes
              wss.clients.forEach(client => {
                client.send('folderChanged');
                client.send('pendingCountChanged');
              });
            }
          }
        })
        .on('unlink', filePath => {
          const filename = path.basename(filePath);
          if (imageMetadata[filename] && imageMetadata[filename].status === status) {
            delete imageMetadata[filename];
            saveMetadata();
            // Notify clients of both changes
            wss.clients.forEach(client => {
              client.send('folderChanged');
              client.send('pendingCountChanged');
            });
          } else {
            // Notify of pending count change even if file wasn't in metadata
            wss.clients.forEach(client => client.send('pendingCountChanged'));
          }
        });
    });
  }
}

// === Start Server with initial rescan ===
server.listen(3000, () => {
  console.log(`🚀 Moderation server running at http://localhost:3000`);
  console.log(`Auto-add to queue: ${config.autoAdd ? 'enabled' : 'disabled'}`);
  setupFileWatchers();
  
  // Perform initial rescan
  fetch('http://localhost:3000/api/rescan', {
    method: 'POST'
  }).catch(err => {
    console.error('Initial rescan failed:', err);
  });
});

app.post('/api/add-pending-images', (req, res) => {
  try {
    let count = 0;
    
    if (config.useJsonMode) {
      // Get all files in the JSON images folder
      const files = fs.readdirSync(config.jsonImages);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      
      // Add files that aren't in metadata yet
      imageFiles.forEach(file => {
        if (!imageMetadata[file]) {
          imageMetadata[file] = {
            status: 'new',
            timestamp: Date.now()
          };
          count++;
        }
      });
    } else {
      // Get all files in the new images folder
      const files = fs.readdirSync(config.new);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      
      // Add files that aren't in metadata yet
      imageFiles.forEach(file => {
        if (!imageMetadata[file]) {
          imageMetadata[file] = {
            status: 'new',
            timestamp: Date.now()
          };
          count++;
        }
      });
    }
    
    if (count > 0) {
      saveMetadata();
      // Notify clients of both folder change and pending count change
      wss.clients.forEach(client => {
        client.send('folderChanged');
        client.send('pendingCountChanged');
      });
    }
    
    res.json({ added: count });
  } catch (err) {
    console.error('Failed to add pending images:', err);
    res.status(500).json({ error: 'Failed to add pending images' });
  }
});
