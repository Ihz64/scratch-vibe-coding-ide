/**
 * CodeMirror Configuration for Scratch Vibe Coding IDE
 * Sets up the code editor with custom language mode and plugins
 */

// Custom Vibe Coding language mode for CodeMirror
CodeMirror.defineMode('vibe', function(config, parserConfig) {
    const vibeOverlays = {};
    const vibeMode = CodeMirror.getMode(config, parserConfig.backdrop || 'text/plain');

    // Keywords for Vibe Coding language
    const vibeKeywords = {
        // Sprite and Stage
        'sprite': 'keyword',
        'stage': 'keyword',
        'scene': 'keyword',
        
        // Events
        'on': 'keyword',
        'when': 'keyword',
        'green_flag': 'keyword',
        'clicked': 'keyword',
        'cloned': 'keyword',
        'broadcast': 'keyword',
        'broadcast_and_wait': 'keyword',
        
        // Control
        'forever': 'keyword',
        'repeat': 'keyword',
        'times': 'keyword',
        'if': 'keyword',
        'else': 'keyword',
        'then': 'keyword',
        'wait': 'keyword',
        'until': 'keyword',
        'stop': 'keyword',
        'this': 'keyword',
        'all': 'keyword',
        'other': 'keyword',
        
        // Motion
        'go_to': 'keyword',
        'x': 'keyword',
        'y': 'keyword',
        'change': 'keyword',
        'by': 'keyword',
        'to': 'keyword',
        'point': 'keyword',
        'towards': 'keyword',
        'in_direction': 'keyword',
        'turn': 'keyword',
        'left': 'keyword',
        'right': 'keyword',
        'degrees': 'keyword',
        'direction': 'keyword',
        'glide': 'keyword',
        'secs': 'keyword',
        'to': 'keyword',
        
        // Looks
        'say': 'keyword',
        'think': 'keyword',
        'show': 'keyword',
        'hide': 'keyword',
        'switch': 'keyword',
        'costume': 'keyword',
        'next': 'keyword',
        'backdrop': 'keyword',
        'effect': 'keyword',
        'clear': 'keyword',
        'graphics': 'keyword',
        'size': 'keyword',
        'set': 'keyword',
        'percent': 'keyword',
        
        // Sound
        'play': 'keyword',
        'sound': 'keyword',
        'until': 'keyword',
        'done': 'keyword',
        'stop': 'keyword',
        'all': 'keyword',
        'volume': 'keyword',
        
        // Sensing
        'touching': 'keyword',
        'color': 'keyword',
        'edge': 'keyword',
        'key': 'keyword',
        'pressed': 'keyword',
        'mouse': 'keyword',
        'down': 'keyword',
        'distance': 'keyword',
        'to': 'keyword',
        'ask': 'keyword',
        'and': 'keyword',
        'wait': 'keyword',
        'answer': 'keyword',
        
        // Operators
        'add': 'operator',
        'subtract': 'operator',
        'multiply': 'operator',
        'divide': 'operator',
        'random': 'operator',
        'from': 'operator',
        'length': 'operator',
        'join': 'operator',
        'letter': 'operator',
        'of': 'operator',
        'contains': 'operator',
        'mod': 'operator',
        'round': 'operator',
        'abs': 'operator',
        'floor': 'operator',
        'ceil': 'operator',
        'sqrt': 'operator',
        
        // Variables
        'var': 'keyword',
        'let': 'keyword',
        'const': 'keyword',
        'global': 'keyword',
        'local': 'keyword',
        'cloud': 'keyword',
        
        // Lists
        'list': 'keyword',
        'add': 'keyword',
        'remove': 'keyword',
        'delete': 'keyword',
        'insert': 'keyword',
        'replace': 'keyword',
        'item': 'keyword',
        'at': 'keyword',
        'index': 'keyword',
        
        // Functions
        'function': 'keyword',
        'return': 'keyword',
        'call': 'keyword',
        
        // Game Development
        'health': 'keyword',
        'damage': 'keyword',
        'score': 'keyword',
        'coins': 'keyword',
        'lives': 'keyword',
        'xp': 'keyword',
        'level': 'keyword',
        'timer': 'keyword',
        'checkpoint': 'keyword',
        'respawn': 'keyword',
        'game_over': 'keyword',
        'pause': 'keyword',
        'menu': 'keyword',
        'dialog': 'keyword',
        'inventory': 'keyword',
        'enemy': 'keyword',
        'boss': 'keyword',
        'power_up': 'keyword',
        'highscore': 'keyword',
        
        // Animation
        'animate': 'keyword',
        'scale': 'keyword',
        'duration': 'keyword',
        'easing': 'keyword',
        'ease_in': 'keyword',
        'ease_out': 'keyword',
        'ease_in_out': 'keyword',
        'linear': 'keyword',
        'tween': 'keyword',
        'shake': 'keyword',
        
        // Particles
        'particle': 'keyword',
        'explosion': 'keyword',
        'spark': 'keyword',
        'smoke': 'keyword',
        'fire': 'keyword',
        'hit': 'keyword',
        'coin': 'keyword',
        
        // Physics
        'gravity': 'keyword',
        'jump': 'keyword',
        'velocity': 'keyword',
        'acceleration': 'keyword',
        'collision': 'keyword',
        'hitbox': 'keyword',
        'pivot': 'keyword',
        
        // Camera
        'camera': 'keyword',
        'follow': 'keyword',
        'zoom': 'keyword',
        'shake': 'keyword',
        'boundaries': 'keyword',
        
        // Costumes and Sounds
        'costume': 'keyword',
        'sound': 'keyword',
        'upload': 'keyword',
        'rename': 'keyword',
        'delete': 'keyword',
        'duplicate': 'keyword',
        
        // Scratch-specific
        'broadcast': 'keyword',
        'when_received': 'keyword',
        'backdrop': 'keyword',
        'switch_to': 'keyword',
        'next_backdrop': 'keyword',
        
        // Boolean values
        'true': 'atom',
        'false': 'atom',
        
        // Null
        'null': 'atom'
    };

    // Built-in functions
    const vibeBuiltins = {
        'random': 'builtin',
        'length': 'builtin',
        'join': 'builtin',
        'letter': 'builtin',
        'contains': 'builtin',
        'round': 'builtin',
        'abs': 'builtin',
        'floor': 'builtin',
        'ceil': 'builtin',
        'sqrt': 'builtin',
        'sin': 'builtin',
        'cos': 'builtin',
        'tan': 'builtin',
        'asin': 'builtin',
        'acos': 'builtin',
        'atan': 'builtin',
        'ln': 'builtin',
        'log': 'builtin',
        'pow': 'builtin'
    };

    // Special characters
    const vibeSpecialChars = {
        '->': 'operator',
        '=>': 'operator',
        '<=': 'operator',
        '>=': 'operator',
        '==': 'operator',
        '!=': 'operator',
        '&&': 'operator',
        '||': 'operator'
    };

    // Tokenizer
    function tokenBase(stream, state) {
        // Check for comments
        if (stream.peek() === '/' && stream.peek(1) === '/') {
            stream.skipToEnd();
            return 'comment';
        }

        if (stream.peek() === '/' && stream.peek(1) === '*') {
            stream.next();
            stream.next();
            while (!stream.eol()) {
                if (stream.peek() === '*' && stream.peek(1) === '/') {
                    stream.next();
                    stream.next();
                    break;
                }
                stream.next();
            }
            return 'comment';
        }

        // Check for special characters
        for (const [chars, type] of Object.entries(vibeSpecialChars)) {
            if (stream.match(chars)) {
                return type;
            }
        }

        // Check for numbers
        if (stream.match(/^[0-9]+\.?[0-9]*/)) {
            return 'number';
        }

        // Check for strings
        if (stream.peek() === '"' || stream.peek() === "'") {
            const quote = stream.next();
            while (!stream.eol()) {
                if (stream.peek() === quote) {
                    stream.next();
                    break;
                }
                stream.next();
            }
            return 'string';
        }

        // Check for keywords
        if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*\b/)) {
            const word = stream.current();
            
            // Check if it's a keyword
            if (vibeKeywords[word]) {
                return vibeKeywords[word];
            }
            
            // Check if it's a builtin
            if (vibeBuiltins[word]) {
                return vibeBuiltins[word];
            }
            
            // Check if it's a Scratch-specific keyword
            if (word.startsWith('when_') || word.startsWith('on_')) {
                return 'keyword';
            }
            
            // It's a variable or function name
            return 'variable';
        }

        // Check for operators
        if (stream.match(/^[+\-*/%^=<>!&|~]/)) {
            return 'operator';
        }

        // Check for punctuation
        if (stream.match(/^[(),.:;{}\[\]]/)) {
            return null;
        }

        // Advance to next character
        stream.next();
        return null;
    }

    // Overlay for Scratch-specific syntax
    function vibeOverlay(token) {
        // Sprite declarations
        if (token.string === 'sprite') {
            return 'scratch-sprite';
        }

        // Event declarations
        if (token.string === 'on' || token.string === 'when') {
            return 'scratch-event';
        }

        // Block types
        if (token.string === 'forever' || token.string === 'repeat' || 
            token.string === 'if' || token.string === 'wait') {
            return 'scratch-block';
        }

        // Variables
        if (token.string === 'var' || token.string === 'let' || token.string === 'const') {
            return 'scratch-variable';
        }

        // Broadcasts
        if (token.string === 'broadcast') {
            return 'scratch-broadcast';
        }

        return null;
    }

    // Define the mode
    return {
        startState: function() {
            return {
                tokenize: tokenBase,
                vibeOverlay: vibeOverlay
            };
        },
        
        token: function(stream, state) {
            const style = state.tokenize(stream, state);
            const overlay = state.vibeOverlay({ string: stream.current() });
            return overlay || style;
        },
        
        copyState: function(state) {
            return {
                tokenize: state.tokenize,
                vibeOverlay: state.vibeOverlay
            };
        },
        
        lineComment: '//',
        blockCommentStart: '/*',
        blockCommentEnd: '*/',
        
        electricChars: '{}[]():"\'',
        
        fold: 'brace'
    };
});

// CodeMirror Vibe mode
CodeMirror.defineMIME('text/x-vibe', 'vibe');

// CodeMirror configuration
function configureCodeMirror(editorElement, options) {
    const defaultOptions = {
        mode: 'vibe',
        theme: 'vibe-dark',
        lineNumbers: true,
        lineWrapping: false,
        tabSize: 4,
        indentUnit: 4,
        indentWithTabs: false,
        smartIndent: true,
        autoIndent: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        autoCloseTags: false,
        extraKeys: {
            'Ctrl-S': function(cm) {
                // Save
                if (typeof App !== 'undefined' && App.save) {
                    App.save();
                }
            },
            'Ctrl-Z': function(cm) {
                // Undo
                cm.undo();
                if (typeof History !== 'undefined') {
                    History.push(cm.getValue(), { type: 'edit', action: 'undo' });
                }
            },
            'Ctrl-Y': function(cm) {
                // Redo
                cm.redo();
                if (typeof History !== 'undefined') {
                    History.push(cm.getValue(), { type: 'edit', action: 'redo' });
                }
            },
            'Ctrl-F': function(cm) {
                // Find
                cm.execCommand('find');
            },
            'Ctrl-H': function(cm) {
                // Replace
                cm.execCommand('replace');
            },
            'Ctrl-A': function(cm) {
                // Select all
                cm.execCommand('selectAll');
            },
            'Ctrl-/': function(cm) {
                // Toggle comment
                cm.execCommand('toggleComment');
            },
            'Ctrl-[': function(cm) {
                // Outdent
                cm.execCommand('outdentMore');
            },
            'Ctrl-]': function(cm) {
                // Indent
                cm.execCommand('indentMore');
            },
            'Ctrl-Enter': function(cm) {
                // Insert line after
                cm.execCommand('insertLineAfter');
            },
            'Ctrl-Shift-Enter': function(cm) {
                // Insert line before
                cm.execCommand('insertLineBefore');
            },
            'Ctrl-D': function(cm) {
                // Delete line
                cm.execCommand('deleteLine');
            },
            'Ctrl-Shift-D': function(cm) {
                // Duplicate line
                cm.execCommand('duplicateLine');
            },
            'Alt-Up': function(cm) {
                // Move line up
                cm.execCommand('moveLineUp');
            },
            'Alt-Down': function(cm) {
                // Move line down
                cm.execCommand('moveLineDown');
            },
            'Ctrl-Shift-K': function(cm) {
                // Delete to end of line
                cm.execCommand('deleteLineEnd');
            },
            'Ctrl-Shift-Backspace': function(cm) {
                // Delete to start of line
                cm.execCommand('deleteLineStart');
            },
            'Tab': function(cm) {
                // Tab key
                if (cm.somethingSelected()) {
                    cm.execCommand('indentMore');
                } else {
                    cm.execCommand('insertTab');
                }
            },
            'Shift-Tab': function(cm) {
                // Shift+Tab
                cm.execCommand('outdentMore');
            },
            'Enter': function(cm) {
                // Enter key - auto-indent
                cm.execCommand('newlineAndIndent');
            }
        },
        
        // Enable linting (will be configured separately)
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
        foldGutter: {
            rangeFinder: CodeMirror.fold.combine(
                CodeMirror.fold.brace,
                CodeMirror.fold.comment
            )
        },
        lint: false, // Will be enabled when parser is ready
        
        // Enable autocomplete (will be configured separately)
        hintOptions: {
            completeSingle: false,
            extraKeys: { Tab: false, Enter: false }
        },
        
        // Styling
        styleActiveLine: true,
        highlightSelectionMatches: { showToken: true, annotateScrollbar: true },
        
        // Read-only mode for non-editable files
        readOnly: false
    };

    const mergedOptions = Object.assign({}, defaultOptions, options);
    
    // Create editor
    const editor = CodeMirror.fromTextArea(editorElement, mergedOptions);
    
    // Configure additional features
    configureCodeMirrorPlugins(editor);
    
    return editor;
}

// Configure CodeMirror plugins
function configureCodeMirrorPlugins(editor) {
    // Configure linting
    if (typeof CodeMirror !== 'undefined' && CodeMirror.lint) {
        editor.setOption('lint', {
            getAnnotations: function(content, callback, options) {
                // Use our parser to lint the code
                if (typeof Parser !== 'undefined' && Parser.lint) {
                    Parser.lint(content).then(annotations => {
                        callback(annotations);
                    }).catch(() => {
                        callback([]);
                    });
                } else {
                    callback([]);
                }
            },
            lintOnChange: false
        });
    }

    // Configure autocomplete
    if (typeof CodeMirror !== 'undefined' && CodeMirror.showHint) {
        editor.on('inputRead', function(cm, change) {
            // Trigger autocomplete on certain characters
            const cursor = cm.getCursor();
            const line = cm.getLine(cursor.line);
            const charBefore = line.charAt(cursor.ch - 1);
            
            if (/[a-zA-Z_0-9]/.test(charBefore)) {
                // Check if we should show hint
                const token = cm.getTokenAt(cursor);
                if (token.string && token.string.length > 1) {
                    CodeMirror.showHint(cm, {
                        completeSingle: false
                    });
                }
            }
        });
    }

    // Configure search
    if (typeof CodeMirror !== 'undefined' && CodeMirror.commands) {
        // Search is already configured via extraKeys
    }

    // Configure fold
    if (typeof CodeMirror !== 'undefined' && CodeMirror.fold) {
        // Fold is already configured in the options
    }

    // Update status bar on cursor change
    editor.on('cursorActivity', function(cm) {
        if (typeof StatusBar !== 'undefined') {
            const cursor = cm.getCursor();
            StatusBar.updateCursor(cursor.line, cursor.ch);
        }
    });

    // Update status bar on change
    editor.on('change', function(cm) {
        if (typeof StatusBar !== 'undefined') {
            // Update autosave status
            StatusBar.updateAutosave(true);
        }
    });

    // Handle key events for status bar
    editor.on('keyHandled', function(cm, key, event) {
        if (typeof StatusBar !== 'undefined') {
            // Update compile status
            StatusBar.updateCompile('Modified');
        }
    });
}

// Vibe Code autocomplete hints
function getVibeCodeHints(editor) {
    const hints = [
        // Sprite and Stage
        { text: 'sprite', displayText: 'sprite - Define a sprite', className: 'vibe-keyword' },
        { text: 'stage', displayText: 'stage - Define the stage', className: 'vibe-keyword' },
        { text: 'scene', displayText: 'scene - Define a scene', className: 'vibe-keyword' },
        
        // Events
        { text: 'on green_flag:', displayText: 'on green_flag: - When green flag clicked', className: 'vibe-event' },
        { text: 'on key', displayText: 'on key - When key pressed', className: 'vibe-event' },
        { text: 'on mouse_clicked:', displayText: 'on mouse_clicked: - When mouse clicked', className: 'vibe-event' },
        { text: 'on broadcast', displayText: 'on broadcast - When broadcast received', className: 'vibe-event' },
        { text: 'when clicked:', displayText: 'when clicked: - When sprite clicked', className: 'vibe-event' },
        { text: 'when cloned:', displayText: 'when cloned: - When sprite cloned', className: 'vibe-event' },
        
        // Motion
        { text: 'go_to x:', displayText: 'go_to x: - Move to x position', className: 'vibe-block' },
        { text: 'go_to y:', displayText: 'go_to y: - Move to y position', className: 'vibe-block' },
        { text: 'change x by', displayText: 'change x by - Change x position', className: 'vibe-block' },
        { text: 'change y by', displayText: 'change y by - Change y position', className: 'vibe-block' },
        { text: 'point in direction', displayText: 'point in direction - Set direction', className: 'vibe-block' },
        { text: 'turn left', displayText: 'turn left - Turn counter-clockwise', className: 'vibe-block' },
        { text: 'turn right', displayText: 'turn right - Turn clockwise', className: 'vibe-block' },
        { text: 'glide', displayText: 'glide - Smooth movement', className: 'vibe-block' },
        
        // Looks
        { text: 'say', displayText: 'say - Display speech bubble', className: 'vibe-block' },
        { text: 'think', displayText: 'think - Display thought bubble', className: 'vibe-block' },
        { text: 'show', displayText: 'show - Show sprite', className: 'vibe-block' },
        { text: 'hide', displayText: 'hide - Hide sprite', className: 'vibe-block' },
        { text: 'switch costume to', displayText: 'switch costume to - Change costume', className: 'vibe-block' },
        { text: 'next costume', displayText: 'next costume - Go to next costume', className: 'vibe-block' },
        { text: 'change size by', displayText: 'change size by - Scale sprite', className: 'vibe-block' },
        { text: 'set size to', displayText: 'set size to - Set scale', className: 'vibe-block' },
        
        // Sound
        { text: 'play sound', displayText: 'play sound - Play a sound', className: 'vibe-block' },
        { text: 'stop sound', displayText: 'stop sound - Stop a sound', className: 'vibe-block' },
        { text: 'play sound until done', displayText: 'play sound until done - Play sound completely', className: 'vibe-block' },
        { text: 'stop all sounds', displayText: 'stop all sounds - Stop all sounds', className: 'vibe-block' },
        { text: 'change volume by', displayText: 'change volume by - Adjust volume', className: 'vibe-block' },
        { text: 'set volume to', displayText: 'set volume to - Set volume level', className: 'vibe-block' },
        
        // Control
        { text: 'forever:', displayText: 'forever: - Repeat forever', className: 'vibe-block' },
        { text: 'repeat', displayText: 'repeat - Repeat specified times', className: 'vibe-block' },
        { text: 'if', displayText: 'if - Conditional statement', className: 'vibe-block' },
        { text: 'else', displayText: 'else - Else clause', className: 'vibe-block' },
        { text: 'wait', displayText: 'wait - Pause execution', className: 'vibe-block' },
        { text: 'wait until', displayText: 'wait until - Wait for condition', className: 'vibe-block' },
        { text: 'repeat until', displayText: 'repeat until - Repeat until condition', className: 'vibe-block' },
        { text: 'stop', displayText: 'stop - Stop script', className: 'vibe-block' },
        { text: 'broadcast', displayText: 'broadcast - Send message', className: 'vibe-block' },
        { text: 'broadcast and wait', displayText: 'broadcast and wait - Send message and wait', className: 'vibe-block' },
        
        // Sensing
        { text: 'touching', displayText: 'touching - Check collision', className: 'vibe-block' },
        { text: 'touching color', displayText: 'touching color - Check color collision', className: 'vibe-block' },
        { text: 'key pressed', displayText: 'key pressed - Check key state', className: 'vibe-block' },
        { text: 'mouse down', displayText: 'mouse down - Check mouse button', className: 'vibe-block' },
        { text: 'distance to', displayText: 'distance to - Calculate distance', className: 'vibe-block' },
        { text: 'ask', displayText: 'ask - Prompt for input', className: 'vibe-block' },
        { text: 'answer', displayText: 'answer - Get user input', className: 'vibe-variable' },
        
        // Operators
        { text: 'add', displayText: 'add - Addition', className: 'vibe-operator' },
        { text: 'subtract', displayText: 'subtract - Subtraction', className: 'vibe-operator' },
        { text: 'multiply', displayText: 'multiply - Multiplication', className: 'vibe-operator' },
        { text: 'divide', displayText: 'divide - Division', className: 'vibe-operator' },
        { text: 'random', displayText: 'random - Random number', className: 'vibe-operator' },
        { text: 'length', displayText: 'length - String/list length', className: 'vibe-operator' },
        { text: 'join', displayText: 'join - String concatenation', className: 'vibe-operator' },
        { text: 'letter', displayText: 'letter - Character at index', className: 'vibe-operator' },
        { text: 'contains', displayText: 'contains - Check if contains', className: 'vibe-operator' },
        { text: 'mod', displayText: 'mod - Modulo', className: 'vibe-operator' },
        { text: 'round', displayText: 'round - Round number', className: 'vibe-operator' },
        
        // Variables
        { text: 'var', displayText: 'var - Declare variable', className: 'vibe-keyword' },
        { text: 'let', displayText: 'let - Declare block-scoped variable', className: 'vibe-keyword' },
        { text: 'const', displayText: 'const - Declare constant', className: 'vibe-keyword' },
        { text: 'global', displayText: 'global - Global variable', className: 'vibe-keyword' },
        { text: 'local', displayText: 'local - Local variable', className: 'vibe-keyword' },
        
        // Lists
        { text: 'list', displayText: 'list - Declare list', className: 'vibe-keyword' },
        { text: 'add to', displayText: 'add to - Add to list', className: 'vibe-block' },
        { text: 'remove from', displayText: 'remove from - Remove from list', className: 'vibe-block' },
        { text: 'delete all of', displayText: 'delete all of - Clear list', className: 'vibe-block' },
        { text: 'insert at', displayText: 'insert at - Insert into list', className: 'vibe-block' },
        { text: 'replace item', displayText: 'replace item - Replace list item', className: 'vibe-block' },
        { text: 'item of', displayText: 'item of - Get list item', className: 'vibe-block' },
        { text: 'length of', displayText: 'length of - Get list length', className: 'vibe-block' },
        
        // Game Development
        { text: 'health', displayText: 'health - Character health', className: 'vibe-variable' },
        { text: 'damage', displayText: 'damage - Deal damage', className: 'vibe-block' },
        { text: 'score', displayText: 'score - Game score', className: 'vibe-variable' },
        { text: 'coins', displayText: 'coins - Collected coins', className: 'vibe-variable' },
        { text: 'lives', displayText: 'lives - Player lives', className: 'vibe-variable' },
        { text: 'level', displayText: 'level - Current level', className: 'vibe-variable' },
        { text: 'timer', displayText: 'timer - Game timer', className: 'vibe-variable' },
        
        // Animation
        { text: 'animate', displayText: 'animate - Create animation', className: 'vibe-block' },
        { text: 'scale', displayText: 'scale - Scale property', className: 'vibe-property' },
        { text: 'duration', displayText: 'duration - Animation duration', className: 'vibe-property' },
        { text: 'easing', displayText: 'easing - Animation easing', className: 'vibe-property' },
        
        // Camera
        { text: 'camera', displayText: 'camera - Camera object', className: 'vibe-variable' },
        { text: 'follow', displayText: 'follow - Camera follow', className: 'vibe-block' },
        { text: 'zoom', displayText: 'zoom - Camera zoom', className: 'vibe-block' },
        { text: 'shake', displayText: 'shake - Camera shake', className: 'vibe-block' },
        
        // Particles
        { text: 'particle', displayText: 'particle - Particle system', className: 'vibe-variable' },
        { text: 'explosion', displayText: 'explosion - Explosion effect', className: 'vibe-block' },
        { text: 'spark', displayText: 'spark - Spark effect', className: 'vibe-block' },
        { text: 'smoke', displayText: 'smoke - Smoke effect', className: 'vibe-block' },
        
        // Boolean values
        { text: 'true', displayText: 'true - Boolean true', className: 'vibe-atom' },
        { text: 'false', displayText: 'false - Boolean false', className: 'vibe-atom' },
        { text: 'null', displayText: 'null - Null value', className: 'vibe-atom' },
        
        // Direction constants
        { text: 'left', displayText: 'left - Left direction', className: 'vibe-atom' },
        { text: 'right', displayText: 'right - Right direction', className: 'vibe-atom' },
        { text: 'up', displayText: 'up - Up direction', className: 'vibe-atom' },
        { text: 'down', displayText: 'down - Down direction', className: 'vibe-atom' },
        
        // Easing types
        { text: 'ease_in', displayText: 'ease_in - Ease in', className: 'vibe-atom' },
        { text: 'ease_out', displayText: 'ease_out - Ease out', className: 'vibe-atom' },
        { text: 'ease_in_out', displayText: 'ease_in_out - Ease in out', className: 'vibe-atom' },
        { text: 'linear', displayText: 'linear - Linear easing', className: 'vibe-atom' },
        
        // Scratch-specific
        { text: 'green_flag', displayText: 'green_flag - Green flag event', className: 'vibe-event' },
        { text: 'backdrop', displayText: 'backdrop - Stage backdrop', className: 'vibe-variable' },
        { text: 'switch_to', displayText: 'switch_to - Switch backdrop', className: 'vibe-block' },
        { text: 'next_backdrop', displayText: 'next_backdrop - Next backdrop', className: 'vibe-block' },
        
        // Math functions
        { text: 'abs', displayText: 'abs - Absolute value', className: 'vibe-builtin' },
        { text: 'floor', displayText: 'floor - Floor value', className: 'vibe-builtin' },
        { text: 'ceil', displayText: 'ceil - Ceiling value', className: 'vibe-builtin' },
        { text: 'sqrt', displayText: 'sqrt - Square root', className: 'vibe-builtin' },
        { text: 'sin', displayText: 'sin - Sine', className: 'vibe-builtin' },
        { text: 'cos', displayText: 'cos - Cosine', className: 'vibe-builtin' },
        { text: 'tan', displayText: 'tan - Tangent', className: 'vibe-builtin' },
        { text: 'asin', displayText: 'asin - Arc sine', className: 'vibe-builtin' },
        { text: 'acos', displayText: 'acos - Arc cosine', className: 'vibe-builtin' },
        { text: 'atan', displayText: 'atan - Arc tangent', className: 'vibe-builtin' },
        { text: 'ln', displayText: 'ln - Natural logarithm', className: 'vibe-builtin' },
        { text: 'log', displayText: 'log - Base-10 logarithm', className: 'vibe-builtin' },
        { text: 'pow', displayText: 'pow - Power', className: 'vibe-builtin' }
    ];

    return hints;
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.configureCodeMirror = configureCodeMirror;
    window.getVibeCodeHints = getVibeCodeHints;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { configureCodeMirror, getVibeCodeHints };
}
