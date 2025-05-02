# Image Moderation Application

A powerful image moderation tool that allows you to review, approve, and deny images with a modern, user-friendly interface.

## Features

- **Multiple View Modes**
  - New Images: View and moderate unprocessed images
  - Approved Images: Browse through approved content
  - Denied Images: Review previously denied content

- **Intuitive Interface**
  - Grid view for quick image browsing
  - Full-screen viewer for detailed inspection
  - Swipe gestures for quick moderation (left to deny, right to approve)
  - Keyboard shortcuts for efficient workflow

- **Smart Organization**
  - Automatic image categorization
  - Status tracking (new, approved, denied)
  - Persistent storage of moderation decisions
  - Real-time count of images to moderate

## Workflow Modes

The application supports two different workflow modes:

### Folder Mode
- **Description**: Images are physically moved between directories based on their status
- **Directory Structure**:
  - `/images/new/`: Contains unmoderated images
  - `/images/approved/`: Contains approved images
  - `/images/denied/`: Contains denied images
  - `/images/all/`: Fallback directory for all images
- **Usage**: Best for direct file system management and when you need physical separation of images
- **Switching**: Use the sidebar toggle to switch to folder mode

### JSON Mode
- **Description**: Images remain in their original location, with status tracked in a JSON file
- **File Structure**:
  - `images.json`: Contains metadata about all images including their status
  - Original images remain in their source directory
- **Usage**: Best for maintaining original file structure and when you need to track image metadata
- **Switching**: Use the sidebar toggle to switch to JSON mode

### Switching Between Modes
1. Open the sidebar
2. Locate the "Workflow Mode" section
3. Toggle between "Folder Mode" and "JSON Mode"
4. The application will automatically handle the transition

## File Structure

```
Moderation_app/
├── my-vue-app/                 # Frontend React application
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
│   ├── config.js             # Configuration settings
│   └── package.json          # Backend dependencies
│
├── images/                    # Image storage (in folder mode)
│   ├── new/                  # Unmoderated images
│   ├── approved/             # Approved images
│   ├── denied/               # Denied images
│   └── all/                  # All images (fallback)
│
└── images.json               # Image metadata (in JSON mode)
```

## Setup Instructions

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
cd ../my-vue-app
npm install
```

3. Configure the application:
   - Create a `.env` file in the `moderation-server` directory with your configuration
   - Update the `BACKEND_URL` in frontend components if needed
   - Choose your preferred workflow mode (folder or JSON)

### Running the Application

1. Start the backend server:
```bash
cd moderation-server
npm start
```

2. Start the frontend development server:
```bash
cd my-vue-app
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
   - In Folder Mode:
     - Approved images are moved to the approved directory
     - Denied images are moved to the denied directory
   - In JSON Mode:
     - Image status is updated in the JSON file
     - Original files remain in place
   - The new images count is automatically updated

### Tips & Tricks

1. **Efficient Moderation**
   - Use the viewer mode for detailed inspection
   - Take advantage of swipe gestures for quick decisions
   - Use keyboard shortcuts to speed up your workflow

2. **Image Loading**
   - In Folder Mode: Images are served from status-specific directories
   - In JSON Mode: Images are served from their original location
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
- **Storage**: 
  - Folder Mode: File-based system with separate directories
  - JSON Mode: JSON-based metadata tracking with original file locations

### Key Components

1. **ImageGrid**
   - Displays images in a responsive grid
   - Handles image loading and error states
   - Provides moderation controls
   - Adapts to current workflow mode

2. **ViewerModal**
   - Full-screen image viewer
   - Gesture-based controls
   - Status display and moderation tools
   - Works seamlessly in both modes

3. **Header**
   - View mode selection
   - Image count display
   - Refresh functionality
   - Workflow mode toggle

## Troubleshooting

### Common Issues

1. **Images Not Loading**
   - Check if the backend server is running
   - Verify image paths in the configuration
   - Ensure proper file permissions
   - Confirm correct workflow mode is selected

2. **Moderation Actions Not Working**
   - Check backend logs for errors
   - Verify file system permissions (in folder mode)
   - Check JSON file permissions (in JSON mode)
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