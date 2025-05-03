# Image Moderation App

A React-based application for moderating images with a focus on user experience and efficient workflow.

## Features

- **Three View Modes**:
  - New: Shows unmoderated images that need review
  - Approved: Shows images that have been approved
  - Denied: Shows images that have been denied

- **Image Viewer**:
  - Full-screen image viewing
  - Smooth animations for image transitions
  - Keyboard shortcuts for quick moderation
  - Swipe gestures for mobile-friendly interaction

- **Smart Organization**
  - Automatic image categorization
  - Status tracking (new, approved, denied)
  - Persistent storage of moderation decisions
  - Real-time count of images to moderate

## Workflow Modes

The application supports two different workflow modes that can be switched at any time:

### Folder Mode
- **Description**: Images are physically moved between directories based on their status
- **Directory Structure**:
  - `./New Images/`: Contains unmoderated images
  - `./Approved Images/`: Contains approved images
  - `./Denied Images/`: Contains denied images

### JSON Mode
- **Description**: Images remain in their original location, with status tracked in a JSON file
- **File Structure**:
  - `./Images/`: Contains all images (only used in JSON mode)
  - `images-metadata.json`: Contains metadata about all images including their status
  - Original files remain in the Images directory

### Switching Between Modes

1. Navigate to server-config.json
   - "useJsonMode": true, JSON Mode is active
   - "useJsonMode": false, Folder Mode is active
2. The application will automatically handle the transition between modes

Note: When switching modes, the application will:
- In Folder Mode: Move images to their respective directories (New Images, Approved Images, Denied Images)
- In JSON Mode: Update the JSON file while keeping images in the Images directory
- Maintain all moderation decisions during the transition

## Keyboard Shortcuts

- `→` or `d`: Approve current image
- `←` or `a`: Deny current image
- `ESC`: Close viewer

## File Structure

```
Moderation_app/
├── my-image-moderation-app/    # Frontend React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ImageGrid.jsx  # Grid view component
│   │   │   ├── ViewerModal.jsx # Full-screen viewer
│   │   │   └── Header.jsx     # Header component
│   │   ├── App.jsx           # Main application component
│   │   └── App.css           # Global styles
│   └── package.json          # Frontend dependencies
│
├── moderation-server/         # Backend Express server
│   ├── server.js             # Main server file
│   ├── server-config.js      # Configuration settings
│   ├── package.json          # Backend dependencies
│   ├── Images/               # All images (only used in JSON mode)
│   ├── New Images/          # Unmoderated images (only used in Folder mode)
│   ├── Approved Images/     # Approved images (only used in Folder mode)
│   ├── Denied Images/      # Denied images (only used in Folder mode)
│   └── images-metadata.json # Image metadata (only used in JSON mode)
```

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd Moderation_app
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd moderation-server
npm install

# Install frontend dependencies
cd ../my-image-moderation-app
npm install
```

3. Configure the application:
   - Create a `.env` file in the `moderation-server` directory with your configuration
   - Update the `BACKEND_URL` in frontend components if needed

### Running the Application

1. Start the backend server:
```bash
cd moderation-server
npm start
```

2. Start the frontend development server:
```bash
cd my-image-moderation-app
npm run dev
```

3. Access the application at `http://localhost:5173`

## Usage Guide

### Basic Workflow

1. **Viewing Images**
   - Use the sidebar to switch between different view modes
   - Click on any image to open it in the full-screen viewer
   - Use the grid view for quick browsing

2. **Moderating Images**
   - In grid view: Use the approve/deny buttons on each image
   - In viewer mode: 
     - Click the approve/deny buttons
     - Use swipe gestures (left to deny, right to approve)
     - Use keyboard shortcuts (A for approve, D for deny)

3. **Managing Images**
   - Approved images are moved to the Approved Images directory
   - Denied images are moved to the Denied Images directory
   - The new images count is automatically updated

### Tips & Tricks

1. **Efficient Moderation**
   - Use the viewer mode for detailed inspection
   - Take advantage of swipe gestures for quick decisions
   - Use keyboard shortcuts to speed up your workflow

2. **Image Loading**
   - Images are served from their respective directories
   - If an image fails to load, the system automatically tries the fallback path
   - Failed images are clearly marked in the interface

3. **Performance**
   - The application uses lazy loading for images
   - Grid view paginates images for better performance
   - Viewer mode preloads adjacent images

## Technical Details

### Architecture

- **Frontend**: React with modern hooks and functional components
- **Backend**: Express.js server with file system management
- **Storage**: File-based system with separate directories for each status

### Key Components

1. **ImageGrid**
   - Displays images in a responsive grid
   - Handles image loading and error states
   - Provides moderation controls

2. **ViewerModal**
   - Full-screen image viewer
   - Gesture-based controls
   - Status display and moderation tools

3. **Header**
   - View mode selection
   - Image count display
   - Refresh functionality

## Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Check if the backend server is running
   - Verify image paths in the configuration
   - Ensure proper file permissions

2. **Moderation Actions Not Working**
   - Check backend logs for errors
   - Verify file system permissions
   - Ensure proper configuration of directories

3. **Performance Issues**
   - Clear browser cache
   - Reduce the number of images loaded at once
   - Check for large image files
   - Consider switching workflow modes if performance is an issue

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your chosen license]

## Support

For support, please [create an issue](your-issues-url) in the repository. 
