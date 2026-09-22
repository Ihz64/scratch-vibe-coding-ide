# Scratch Vibe Coding IDE

A complete **Vibe-Coding IDE** for Scratch projects that allows users to create complex, animated Scratch games and interactive projects exclusively through code.

## Features

### Core Features
- **Full IDE Environment**: Modern, professional coding environment with dark theme
- **Vibe Coding Language**: Custom text-based syntax designed to map 1:1 to Scratch blocks
- **Complete Compiler Pipeline**: Vibe Code → Lexer → Parser → AST → Semantic Validation → Scratch Intermediate Representation → project.json → .sb3
- **Live Preview**: Direct execution of compiled Scratch projects with start/pause/stop/restart/debug/fullscreen
- **Project Management**: New/load/save/export/import projects, version history, autosave

### Editor Features
- **Syntax Highlighting**: Custom syntax highlighting for Vibe Coding language
- **Autocomplete**: Intelligent code completion with Scratch-specific suggestions
- **Code Folding**: Collapse/expand code blocks
- **Auto-Indentation**: Automatic indentation for better readability
- **Bracket Matching**: Visual indication of matching brackets
- **Multi-Cursor**: Multiple cursors for efficient editing
- **Find & Replace**: Powerful search and replace functionality
- **Code Formatting**: Automatic code formatting
- **Fehlermarkierungen**: Visual error indicators
- **Warnings**: Warning highlights
- **Hover-Informationen**: Tooltip information on hover
- **Code Snippets**: Predefined code templates
- **Minimap**: Code overview minimap
- **Zeilennummern**: Line numbers
- **Tabs**: Multiple file tabs
- **Command Palette**: VS Code-style command palette (Ctrl+P)

### Project Explorer
- **File Tree**: Complete project structure with sprites, scripts, scenes, backdrops, assets, sounds, variables, lists, functions
- **File Operations**: Create, rename, delete, duplicate files and folders
- **Drag & Drop**: Rearrange files via drag and drop
- **Search**: Search within files
- **Context Menu**: Right-click context menu for file operations
- **Multiple Files**: Open and edit multiple files simultaneously
- **Version History**: Restore previous project states

### Game Development Features
- **Movement**: Position, velocity, direction, rotation, acceleration
- **Physics**: Gravity, jumping, collisions (sprite, color, edge)
- **Animations**: Costume animations, frame animations, loops, tweening, easing, screen shake
- **Particles**: Explosions, sparks, smoke, fire, hit effects, coin effects
- **Camera System**: Camera follow, zoom, shake, boundaries, scene transitions
- **Game Systems**: Health, damage, score, coins, lives, XP, level, timer, checkpoints, respawn, game over, pause, menus, dialogs, inventory, enemies, bosses, power-ups, highscores
- **Scenes/Levels**: Multiple scenes with transitions, spawn points, checkpoints

### Debugging System
- **Debug Console**: Full debugging console with errors, warnings, logs, events, broadcasts, variable changes
- **Breakpoints**: Set breakpoints in code
- **Watch Expressions**: Monitor variable values
- **Visual Debug**: Hitboxes, collision boxes, sprite boundaries, positions, directions, layers
- **FPS Display**: Real-time FPS counter
- **Performance Monitoring**: Performance metrics

### Asset Management
- **Supported Formats**: PNG, JPG, SVG, WAV, MP3
- **Operations**: Upload, drag/drop, preview, delete, rename, duplicate, search
- **Costumes & Backdrops**: Full costume and backdrop management
- **Sounds**: Sound file management
- **Asset Import/Export**: Import and export assets

### .sb3 Support
- **Complete Project Structure**: project.json with sprites, stage, blocks, variables, lists, broadcasts, costumes, sounds, metadata
- **Export**: Generate valid .sb3 files (ZIP archives)
- **Import**: Import existing .sb3 files
- **Validation**: Validate .sb3 file structure

### Authentication & Storage
- **Mandatory Login**: User authentication required
- **Session Management**: Persistent user sessions
- **IndexedDB Storage**: Offline storage for projects, files, assets, history, preferences
- **Autosave**: Prevent data loss from browser refresh or connection issues

### Settings
- **Editor Settings**: Font, size, tab size, minimap, word wrap, autocomplete, autoformat
- **Display Settings**: Dark mode, light mode, various themes, accent color, UI scale
- **Project Settings**: Autosave, auto compile, export settings, preview settings
- **Keyboard Shortcuts**: Customizable keyboard shortcuts

### UI/UX
- **Dark IDE Design**: Modern dark theme with accent colors
- **Responsive Layout**: Adapts to different screen sizes
- **Toast Notifications**: Non-intrusive notifications
- **Loading States**: Visual feedback during operations
- **Fluid Animations**: Smooth transitions and animations
- **Professional Look**: Combines IDE, game engine, and Scratch Studio aesthetics

## Project Structure

```
workspace/
├── index.html                    # Redirect to main IDE
├── scratch_ai_generator.html     # Original AI generator tool
├── scratch_ai_generator.js       # Original AI generator library
├── README.md                     # This file
└── src/
    ├── index.html                # Main application shell
    ├── styles/
    │   ├── reset.css             # CSS reset
    │   ├── variables.css          # CSS custom properties
    │   ├── main.css              # Main stylesheet
    │   ├── codemirror-theme.css  # CodeMirror theme
    │   └── theme.js              # Theme management
    ├── app/
    │   └── main.js               # Core application logic
    ├── components/
    │   ├── project-explorer.js  # Project tree view
    │   ├── editor.js             # Code editor management
    │   ├── preview.js            # Live preview component
    │   ├── statusbar.js          # Status bar management
    │   ├── modals.js             # Modal dialogs
    │   ├── notifications.js      # Toast notifications
    │   └── context-menu.js       # Right-click context menu
    ├── parser/
    │   ├── lexer.js              # Tokenizer
    │   ├── parser.js             # AST generator
    │   └── ast.js                # AST node definitions
    ├── compiler/
    │   ├── compiler.js           # Main compiler
    │   ├── scratch-generator.js  # Scratch block generation
    │   └── sb3-export.js         # .sb3 file creation
    ├── runtime/
    │   ├── runtime.js            # Execution engine
    │   └── virtual-machine.js     # Block execution
    ├── game/
    │   ├── sprite.js             # Sprite class
    │   ├── scene.js              # Scene management
    │   ├── animation.js          # Animation system
    │   └── collision.js          # Collision detection
    ├── debugger/
    │   └── debugger.js           # Debugging system
    ├── auth/
    │   └── auth.js               # Authentication
    ├── database/
    │   └── database.js           # IndexedDB storage
    ├── settings/
    │   └── settings.js           # Settings management
    ├── history/
    │   └── history.js            # Undo/redo history
    ├── editor/
    │   └── codemirror-config.js  # CodeMirror configuration
    ├── utils/
    │   ├── file.js               # File utilities
    │   ├── uuid.js               # UUID generation
    │   └── helpers.js            # Helper functions
    └── lib/
        ├── jszip.min.js           # JSZip library
        └── localforage.min.js     # localforage library
```

## Vibe Coding Language

### Basic Syntax

```vibe
// Define a sprite
sprite Player

// Event handler
on green_flag:
    go_to x: 0 y: -120
    
    forever:
        if key("right") pressed:
            change x by 5
        
        if key("left") pressed:
            change x by -5
        
        if touching("Enemy"):
            broadcast("playerHit")
```

### Game Development Example

```vibe
// Player sprite with health and movement
sprite Player
    health = 100
    lives = 3
    score = 0

on green_flag:
    go_to x: 0 y: -120
    set size to 100%
    show

forever:
    // Movement
    if key("right") pressed:
        change x by 5
        point in direction 90
    
    if key("left") pressed:
        change x by -5
        point in direction -90
    
    if key("up") pressed:
        change y by 5
    
    if key("down") pressed:
        change y by -5
    
    // Jumping
    if key("space") pressed and touching("ground"):
        change y by 15
        play sound "jump"

// Enemy collision
when touching("Enemy"):
    damage Player by 10
    play sound "hurt"
    
    if health < 1:
        hide
        broadcast("playerDied")
        wait 2 secs
        go_to x: 0 y: -120
        set health to 100
        show

// Coin collection
when touching("Coin"):
    change score by 10
    broadcast("coinCollected")
    play sound "coin"

// Animation
when broadcast("playerHit"):
    repeat 5 times:
        change effect "color" by 25
        wait 0.1 secs
    clear graphic effects
```

### Scene and Level System

```vibe
// Main menu scene
scene MainMenu
    backdrop = "title-screen"

    sprite Title
        go_to x: 0 y: 50
        say "Scratch Game" for 5 secs

    sprite PlayButton
        go_to x: 0 y: -50
        
        when clicked:
            broadcast("startGame")

// Game level 1
scene Level1
    backdrop = "level-1-bg"

    sprite Player
        // Player code...

    sprite Enemy
        // Enemy code...

// Game over scene
scene GameOver
    backdrop = "game-over"

    sprite GameOverText
        go_to x: 0 y: 50
        say "Game Over!"

    sprite RetryButton
        go_to x: 0 y: -50
        
        when clicked:
            broadcast("restartGame")
```

### Advanced Features

```vibe
// Camera system
camera.follow(Player)
camera.zoom(1.2)
camera.shake(0.2)

// Animation
animate Player:
    scale -> 1.2
    duration -> 0.15
    easing -> ease_out

// Particles
particle explosion at x: 100 y: 50
particle spark at Player direction: 45 speed: 10

// Physics
gravity = 0.5
velocity_y = 0

forever:
    change y by velocity_y
    velocity_y = velocity_y - gravity
    
    if touching("ground"):
        velocity_y = 0
        change y by 1  // Bounce slightly

// Lists
list inventory = ["sword", "shield", "potion"]

when key("1") pressed:
    add to inventory: "health potion"

when key("2") pressed:
    remove from inventory: 1  // Remove first item

// Functions
function calculateDamage(base, multiplier):
    return base * multiplier + random(1, 5)

when touching("Enemy"):
    damage = calculateDamage(10, 1.5)
    change health by -damage
```

## Installation

### Development

1. Clone the repository
2. Open `src/index.html` in a modern browser
3. The IDE should load automatically

### Production

1. Deploy all files to a web server
2. Ensure all dependencies are included:
   - CodeMirror (from CDN or local)
   - Font Awesome (from CDN)
   - JSZip (included in `/src/lib/`)
   - localforage (included in `/src/lib/`)

3. Access the IDE via the server URL

## Usage

### Workflow

1. **Login**: Users must log in to use the IDE
2. **Create Project**: Start a new project or open an existing one
3. **Write Vibe Code**: Code in the editor using Vibe Coding language
4. **Syntax Check**: The editor automatically highlights syntax errors
5. **Compile**: The compiler converts Vibe Code to Scratch blocks
6. **Live Preview**: Test the project directly in the preview panel
7. **Debug**: Use the debugging tools to find and fix issues
8. **Save**: Save the project to IndexedDB
9. **Export**: Export the project as a .sb3 file

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save project |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+F | Find |
| Ctrl+P | Command palette |
| Ctrl+Shift+F | Format code |
| F5 | Run project |
| F6 | Stop project |
| F7 | Debug |
| Ctrl+N | New file |
| Ctrl+O | Open project |
| Ctrl+I | Import .sb3 |

### Command Palette

Press `Ctrl+P` or `Ctrl+Shift+P` to open the command palette. Type to search for commands:

- `Create Sprite` - Create a new sprite
- `Create Scene` - Create a new scene
- `Run Project` - Execute the project
- `Stop Project` - Stop execution
- `Build Project` - Compile the project
- `Export SB3` - Export as .sb3 file
- `Format Code` - Format the current file
- `Open Settings` - Open settings dialog
- `Toggle Debug Mode` - Enable/disable debug mode
- `Search Files` - Search in project files
- `New Project` - Create a new project

## API Reference

### AppState

Global application state object containing:
- `user` - Current user information
- `isAuthenticated` - Authentication status
- `currentProject` - Current project object
- `currentProjectId` - Current project ID
- `currentFile` - Current file object
- `currentFileId` - Current file ID
- `editor` - CodeMirror editor instance
- `openFiles` - Array of open files
- `activeTab` - Currently active tab
- `isRunning` - Project execution status
- `isPaused` - Pause status
- `isDebugging` - Debug mode status
- `settings` - User settings
- `history` - Undo/redo history
- `historyIndex` - Current history position

### App

Main application class with methods:
- `init()` - Initialize the application
- `loadSettings()` - Load user settings
- `initComponents()` - Initialize all UI components
- `initEditor()` - Initialize the code editor
- `initRuntime()` - Initialize the runtime engine
- `initEvents()` - Set up event handlers
- `checkAuth()` - Check authentication status
- `loadInitialProject()` - Load or create initial project
- `startAutosave()` - Start autosave timer
- `updateUI()` - Update UI based on state
- `login(username, password)` - User login
- `logout()` - User logout
- `register(username, email, password)` - User registration
- `createProject(name, template)` - Create a new project
- `loadProject(id)` - Load a project by ID
- `saveProject()` - Save the current project
- `exportProject()` - Export project as .sb3
- `importProject(file)` - Import .sb3 file
- `runProject()` - Run the current project
- `stopProject()` - Stop the current project
- `pauseProject()` - Pause the current project
- `debugProject()` - Start debugging
- `formatCode()` - Format the current code
- `searchFiles(query)` - Search in project files

### Parser

Vibe Coding language parser:
- `parse(code)` - Parse Vibe Code to AST
- `lint(code)` - Lint Vibe Code and return errors/warnings
- `tokenize(code)` - Tokenize Vibe Code
- `validate(ast)` - Validate AST

### Compiler

Compiler pipeline:
- `compile(ast)` - Compile AST to Scratch blocks
- `generateProject(ast)` - Generate complete Scratch project
- `validateProject(project)` - Validate Scratch project
- `exportSB3(project)` - Export as .sb3 file

### Runtime

Execution engine:
- `start()` - Start the runtime
- `stop()` - Stop the runtime
- `pause()` - Pause execution
- `resume()` - Resume execution
- `loadProject(project)` - Load a project into runtime
- `executeScript(script)` - Execute a script
- `broadcast(message)` - Broadcast a message

### Database

IndexedDB storage:
- `saveProject(project)` - Save project to database
- `loadProject(id)` - Load project from database
- `deleteProject(id)` - Delete project from database
- `listProjects()` - List all projects
- `saveFile(file)` - Save file to database
- `loadFile(id)` - Load file from database
- `deleteFile(id)` - Delete file from database
- `listFiles(projectId)` - List files in a project

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

The IDE uses modern JavaScript features (ES6+) and requires a browser with support for:
- IndexedDB
- File API
- Blob API
- Promise
- async/await
- CSS Grid
- CSS Custom Properties (Variables)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- **CodeMirror**: Code editor component
- **Font Awesome**: Icons
- **JSZip**: ZIP file creation
- **localforage**: IndexedDB wrapper
- **Scratch**: Inspiration and block structure

## Contact

For questions or support, please open an issue on GitHub.

---

**Scratch Vibe Coding IDE** - Develop Scratch projects through code!
