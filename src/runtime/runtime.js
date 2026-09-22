/**
 * Scratch Vibe Coding IDE - Runtime
 * Handles execution of compiled Scratch projects
 */

// ============================================
// Runtime State
// ============================================

const RuntimeState = {
    isRunning: false,
    isPaused: false,
    isStopping: false,
    frameCount: 0,
    lastFrameTime: 0,
    currentTime: 0,
    deltaTime: 0,
    fps: 0,
    lastFpsTime: 0,
    frameCounter: 0,
    
    // Project state
    project: null,
    compiledProject: null,
    sprites: new Map(),
    variables: new Map(),
    lists: new Map(),
    broadcasts: new Map(),
    
    // Execution state
    activeScripts: [],
    pausedScripts: [],
    stoppedScripts: new Set(),
    
    // Input state
    keysPressed: new Set(),
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    
    // Rendering
    canvas: null,
    context: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    
    // Debug
    debugMode: false,
    debugInfo: []
};

// ============================================
// Runtime Class
// ============================================

class Runtime {
    constructor() {
        this.init();
    }
    
    // ============================================
    // Initialization
    // ============================================
    
    static init() {
        console.log('Initializing Scratch Runtime...');
        
        // Get canvas
        const canvas = document.getElementById('scratchCanvas');
        if (canvas) {
            RuntimeState.canvas = canvas;
            RuntimeState.context = canvas.getContext('2d');
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize sprite manager
        SpriteManager.init();
        
        // Initialize collision system
        CollisionSystem.init();
        
        // Initialize animation system
        AnimationSystem.init();
        
        console.log('Scratch Runtime initialized');
    }
    
    static setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            RuntimeState.keysPressed.add(e.key);
            
            // Handle special keys
            if (e.key === ' ') {
                RuntimeState.keysPressed.add('space');
            }
            if (e.key === 'ArrowUp') {
                RuntimeState.keysPressed.add('up arrow');
            }
            if (e.key === 'ArrowDown') {
                RuntimeState.keysPressed.add('down arrow');
            }
            if (e.key === 'ArrowLeft') {
                RuntimeState.keysPressed.add('left arrow');
            }
            if (e.key === 'ArrowRight') {
                RuntimeState.keysPressed.add('right arrow');
            }
        });
        
        document.addEventListener('keyup', (e) => {
            RuntimeState.keysPressed.delete(e.key);
            
            // Handle special keys
            if (e.key === ' ') {
                RuntimeState.keysPressed.delete('space');
            }
            if (e.key === 'ArrowUp') {
                RuntimeState.keysPressed.delete('up arrow');
            }
            if (e.key === 'ArrowDown') {
                RuntimeState.keysPressed.delete('down arrow');
            }
            if (e.key === 'ArrowLeft') {
                RuntimeState.keysPressed.delete('left arrow');
            }
            if (e.key === 'ArrowRight') {
                RuntimeState.keysPressed.delete('right arrow');
            }
        });
        
        // Mouse events
        const canvas = RuntimeState.canvas;
        if (canvas) {
            canvas.addEventListener('mousedown', (e) => {
                RuntimeState.mouseDown = true;
                this.updateMousePosition(e);
            });
            
            canvas.addEventListener('mouseup', (e) => {
                RuntimeState.mouseDown = false;
                this.updateMousePosition(e);
            });
            
            canvas.addEventListener('mousemove', (e) => {
                this.updateMousePosition(e);
            });
            
            canvas.addEventListener('click', (e) => {
                this.updateMousePosition(e);
            });
        }
    }
    
    static updateMousePosition(e) {
        const canvas = RuntimeState.canvas;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            RuntimeState.mouseX = (e.clientX - rect.left) * scaleX;
            RuntimeState.mouseY = (e.clientY - rect.top) * scaleY;
        }
    }
    
    // ============================================
    // Project Loading
    // ============================================
    
    static async loadProject(compiledProject) {
        console.log('Loading project...');
        
        // Stop any running project
        this.stop();
        
        // Reset state
        this.reset();
        
        // Store compiled project
        RuntimeState.compiledProject = compiledProject;
        RuntimeState.project = compiledProject;
        
        // Initialize project
        await this.initializeProject();
        
        console.log('Project loaded successfully');
        
        return true;
    }
    
    static reset() {
        RuntimeState.isRunning = false;
        RuntimeState.isPaused = false;
        RuntimeState.isStopping = false;
        RuntimeState.frameCount = 0;
        RuntimeState.lastFrameTime = 0;
        RuntimeState.currentTime = 0;
        RuntimeState.deltaTime = 0;
        RuntimeState.fps = 0;
        RuntimeState.lastFpsTime = 0;
        RuntimeState.frameCounter = 0;
        
        RuntimeState.sprites.clear();
        RuntimeState.variables.clear();
        RuntimeState.lists.clear();
        RuntimeState.broadcasts.clear();
        RuntimeState.activeScripts = [];
        RuntimeState.pausedScripts = [];
        RuntimeState.stoppedScripts.clear();
        
        RuntimeState.debugInfo = [];
    }
    
    static async initializeProject() {
        const project = RuntimeState.compiledProject;
        
        if (!project || !project.editorData) {
            console.error('Invalid project');
            return;
        }
        
        // Initialize stage
        this.initializeStage(project.editorData.stage);
        
        // Initialize sprites
        for (const spriteData of project.editorData.sprites) {
            await this.initializeSprite(spriteData);
        }
        
        // Initialize variables
        for (const variable of project.editorData.variables) {
            this.initializeVariable(variable);
        }
        
        // Initialize broadcasts
        for (const broadcast of project.editorData.broadcasts) {
            RuntimeState.broadcasts.set(broadcast.name, broadcast);
        }
    }
    
    static initializeStage(stageData) {
        // Set canvas size to stage size
        const canvas = RuntimeState.canvas;
        if (canvas && stageData) {
            canvas.width = stageData.costumes && stageData.costumes.length > 0 ? 
                stageData.costumes[0].data.width || SB3Config.stageWidth : SB3Config.stageWidth;
            canvas.height = stageData.costumes && stageData.costumes.length > 0 ? 
                stageData.costumes[0].data.height || SB3Config.stageHeight : SB3Config.stageHeight;
        }
    }
    
    static async initializeSprite(spriteData) {
        // Create sprite instance
        const sprite = new Sprite(spriteData);
        
        // Store sprite
        RuntimeState.sprites.set(spriteData.name, sprite);
        RuntimeState.sprites.set(sprite.id, sprite);
        
        // Initialize sprite variables
        if (spriteData.variables) {
            for (const variable of spriteData.variables) {
                this.initializeVariable(variable, spriteData.name);
            }
        }
        
        // Initialize sprite costumes
        await sprite.initializeCostumes();
        
        // Initialize sprite sounds
        await sprite.initializeSounds();
        
        // Parse sprite code
        await sprite.parseCode();
        
        return sprite;
    }
    
    static initializeVariable(variable, spriteName = null) {
        const key = spriteName ? `${spriteName}:${variable.name}` : variable.name;
        RuntimeState.variables.set(key, {
            name: variable.name,
            value: variable.value || 0,
            isCloud: variable.isCloud || false,
            sprite: spriteName
        });
    }
    
    // ============================================
    // Execution Control
    // ============================================
    
    static run() {
        if (RuntimeState.isRunning) {
            console.log('Project is already running');
            return;
        }
        
        console.log('Starting project execution...');
        
        RuntimeState.isRunning = true;
        RuntimeState.isStopping = false;
        RuntimeState.lastFrameTime = performance.now();
        RuntimeState.lastFpsTime = performance.now();
        RuntimeState.frameCounter = 0;
        
        // Start all sprite scripts
        for (const sprite of RuntimeState.sprites.values()) {
            sprite.startScripts();
        }
        
        // Start stage scripts
        this.startStageScripts();
        
        // Start animation loop
        this.startAnimationLoop();
        
        // Trigger green flag event
        this.broadcast('green_flag');
        
        console.log('Project is running');
    }
    
    static startStageScripts() {
        const project = RuntimeState.compiledProject;
        if (!project || !project.editorData || !project.editorData.stage) {
            return;
        }
        
        const stage = project.editorData.stage;
        if (stage.code && stage.code.length > 0) {
            for (const block of stage.code) {
                this.executeBlock(block, null, 'stage');
            }
        }
    }
    
    static pause() {
        if (!RuntimeState.isRunning) {
            console.log('Project is not running');
            return;
        }
        
        console.log('Pausing project...');
        RuntimeState.isPaused = true;
        
        // Pause all active scripts
        RuntimeState.pausedScripts = [...RuntimeState.activeScripts];
        RuntimeState.activeScripts = [];
        
        console.log('Project paused');
    }
    
    static resume() {
        if (!RuntimeState.isPaused) {
            console.log('Project is not paused');
            return;
        }
        
        console.log('Resuming project...');
        RuntimeState.isPaused = false;
        
        // Resume all paused scripts
        RuntimeState.activeScripts = [...RuntimeState.pausedScripts];
        RuntimeState.pausedScripts = [];
        
        console.log('Project resumed');
    }
    
    static stop() {
        if (!RuntimeState.isRunning && !RuntimeState.isPaused) {
            console.log('Project is not running');
            return;
        }
        
        console.log('Stopping project...');
        RuntimeState.isStopping = true;
        RuntimeState.isRunning = false;
        RuntimeState.isPaused = false;
        
        // Stop all scripts
        RuntimeState.activeScripts = [];
        RuntimeState.pausedScripts = [];
        RuntimeState.stoppedScripts.clear();
        
        // Reset sprites
        for (const sprite of RuntimeState.sprites.values()) {
            sprite.stop();
        }
        
        RuntimeState.isStopping = false;
        
        console.log('Project stopped');
    }
    
    static restart() {
        this.stop();
        this.run();
    }
    
    // ============================================
    // Animation Loop
    // ============================================
    
    static startAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        const animate = (timestamp) => {
            if (!RuntimeState.isRunning) {
                return;
            }
            
            // Calculate time deltas
            RuntimeState.currentTime = timestamp;
            RuntimeState.deltaTime = timestamp - RuntimeState.lastFrameTime;
            RuntimeState.lastFrameTime = timestamp;
            
            // Update FPS
            RuntimeState.frameCounter++;
            if (timestamp - RuntimeState.lastFpsTime >= 1000) {
                RuntimeState.fps = RuntimeState.frameCounter;
                RuntimeState.frameCounter = 0;
                RuntimeState.lastFpsTime = timestamp;
            }
            
            // Update frame count
            RuntimeState.frameCount++;
            
            // Update all sprites
            for (const sprite of RuntimeState.sprites.values()) {
                if (sprite.visible) {
                    sprite.update(RuntimeState.deltaTime);
                }
            }
            
            // Execute scripts
            this.executeActiveScripts();
            
            // Render
            this.render();
            
            // Continue animation
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }
    
    static executeActiveScripts() {
        if (RuntimeState.isPaused) return;
        
        const scriptsToExecute = [...RuntimeState.activeScripts];
        RuntimeState.activeScripts = [];
        
        for (const script of scriptsToExecute) {
            if (!RuntimeState.stoppedScripts.has(script)) {
                this.executeScript(script);
            }
        }
    }
    
    static executeScript(script) {
        if (script.type === 'block') {
            this.executeBlock(script.block, script.sprite, script.context);
        } else if (script.type === 'event') {
            this.executeEvent(script);
        }
    }
    
    static executeBlock(block, sprite, context) {
        if (!block || !block.opcode) {
            return;
        }
        
        // Handle different opcodes
        switch (block.opcode) {
            case 'event_whenflagclicked':
                // This should have been triggered by broadcast
                this.executeBlockChain(block.next, sprite, context);
                break;
                
            case 'event_whenkeypressed':
                // Check if key is pressed
                const key = block.fields?.KEY_OPTION?.value;
                if (key && RuntimeState.keysPressed.has(key)) {
                    this.executeBlockChain(block.next, sprite, context);
                }
                break;
                
            case 'event_whenthisspriteclicked':
                // Check if sprite was clicked
                if (sprite && this.isSpriteClicked(sprite)) {
                    this.executeBlockChain(block.next, sprite, context);
                }
                break;
                
            case 'event_whenstageclicked':
                // Check if stage was clicked
                if (RuntimeState.mouseDown) {
                    this.executeBlockChain(block.next, sprite, context);
                }
                break;
                
            case 'event_whenbroadcastreceived':
                // This should have been triggered by broadcast
                this.executeBlockChain(block.next, sprite, context);
                break;
                
            case 'control_forever':
                // Execute the loop body and re-add to active scripts
                this.executeBlockChain(block.next, sprite, context);
                RuntimeState.activeScripts.push({
                    type: 'block',
                    block: block,
                    sprite: sprite,
                    context: context
                });
                break;
                
            case 'control_repeat':
                // Execute repeat
                this.executeRepeat(block, sprite, context);
                break;
                
            case 'control_repeat_until':
                // Execute repeat until
                this.executeRepeatUntil(block, sprite, context);
                break;
                
            case 'control_if':
                // Execute if
                this.executeIf(block, sprite, context);
                break;
                
            case 'control_if_else':
                // Execute if-else
                this.executeIfElse(block, sprite, context);
                break;
                
            case 'motion_goto':
                this.executeGoto(block, sprite);
                break;
                
            case 'motion_glideto':
                this.executeGlideTo(block, sprite);
                break;
                
            case 'motion_changexby':
                this.executeChangeXBy(block, sprite);
                break;
                
            case 'motion_changeyby':
                this.executeChangeYBy(block, sprite);
                break;
                
            case 'motion_setx':
                this.executeSetX(block, sprite);
                break;
                
            case 'motion_sety':
                this.executeSetY(block, sprite);
                break;
                
            case 'motion_ifonedgebounce':
                this.executeIfOnEdgeBounce(block, sprite);
                break;
                
            case 'motion_pointindirection':
                this.executePointInDirection(block, sprite);
                break;
                
            case 'motion_pointtowards':
                this.executePointTowards(block, sprite);
                break;
                
            case 'looks_switchcostumeto':
                this.executeSwitchCostumeTo(block, sprite);
                break;
                
            case 'looks_nextcostume':
                this.executeNextCostume(block, sprite);
                break;
                
            case 'looks_say':
                this.executeSay(block, sprite);
                break;
                
            case 'looks_sayfor':
                this.executeSayFor(block, sprite);
                break;
                
            case 'looks_show':
                this.executeShow(block, sprite);
                break;
                
            case 'looks_hide':
                this.executeHide(block, sprite);
                break;
                
            case 'looks_changeeffectby':
                this.executeChangeEffectBy(block, sprite);
                break;
                
            case 'looks_seteffectto':
                this.executeSetEffectTo(block, sprite);
                break;
                
            case 'looks_cleargraphiceffects':
                this.executeClearGraphicEffects(block, sprite);
                break;
                
            case 'looks_changesizeby':
                this.executeChangeSizeBy(block, sprite);
                break;
                
            case 'looks_setsizeto':
                this.executeSetSizeTo(block, sprite);
                break;
                
            case 'sound_play':
                this.executePlaySound(block, sprite);
                break;
                
            case 'sound_stopallsounds':
                this.executeStopAllSounds(block, sprite);
                break;
                
            case 'sound_changevolumeby':
                this.executeChangeVolumeBy(block, sprite);
                break;
                
            case 'sound_setvolumeto':
                this.executeSetVolumeTo(block, sprite);
                break;
                
            case 'sensing_touchingobject':
                this.executeTouchingObject(block, sprite);
                break;
                
            case 'sensing_touchingcolor':
                this.executeTouchingColor(block, sprite);
                break;
                
            case 'sensing_coloristouchingcolor':
                this.executeColorIsTouchingColor(block, sprite);
                break;
                
            case 'sensing_distanceto':
                this.executeDistanceTo(block, sprite);
                break;
                
            case 'sensing_askandwait':
                this.executeAskAndWait(block, sprite);
                break;
                
            case 'sensing_mousedown':
                this.executeMouseDown(block, sprite);
                break;
                
            case 'sensing_mousex':
                this.executeMouseX(block, sprite);
                break;
                
            case 'sensing_mousey':
                this.executeMouseY(block, sprite);
                break;
                
            case 'operator_add':
                this.executeAdd(block, sprite);
                break;
                
            case 'operator_subtract':
                this.executeSubtract(block, sprite);
                break;
                
            case 'operator_multiply':
                this.executeMultiply(block, sprite);
                break;
                
            case 'operator_divide':
                this.executeDivide(block, sprite);
                break;
                
            case 'operator_equals':
                this.executeEquals(block, sprite);
                break;
                
            case 'operator_lt':
                this.executeLessThan(block, sprite);
                break;
                
            case 'operator_gt':
                this.executeGreaterThan(block, sprite);
                break;
                
            case 'operator_and':
                this.executeAnd(block, sprite);
                break;
                
            case 'operator_or':
                this.executeOr(block, sprite);
                break;
                
            case 'operator_not':
                this.executeNot(block, sprite);
                break;
                
            case 'operator_random':
                this.executeRandom(block, sprite);
                break;
                
            case 'data_setvariableto':
                this.executeSetVariableTo(block, sprite);
                break;
                
            case 'data_changevariableby':
                this.executeChangeVariableBy(block, sprite);
                break;
                
            case 'data_showvariable':
                this.executeShowVariable(block, sprite);
                break;
                
            case 'data_hidevariable':
                this.executeHideVariable(block, sprite);
                break;
                
            case 'data_addtolist':
                this.executeAddToList(block, sprite);
                break;
                
            case 'data_deleteoflist':
                this.executeDeleteOfList(block, sprite);
                break;
                
            case 'data_deletealloflist':
                this.executeDeleteAllOfList(block, sprite);
                break;
                
            case 'data_insertatlist':
                this.executeInsertAtList(block, sprite);
                break;
                
            case 'data_replaceitemoflist':
                this.executeReplaceItemOfList(block, sprite);
                break;
                
            case 'data_itemoflist':
                this.executeItemOfList(block, sprite);
                break;
                
            case 'data_itemnumoflist':
                this.executeItemNumOfList(block, sprite);
                break;
                
            case 'data_lengthoflist':
                this.executeLengthOfList(block, sprite);
                break;
                
            case 'data_listcontainsitem':
                this.executeListContainsItem(block, sprite);
                break;
                
            case 'event_broadcast':
                this.executeBroadcast(block, sprite);
                break;
                
            case 'event_broadcastandwait':
                this.executeBroadcastAndWait(block, sprite);
                break;
                
            case 'control_wait':
                this.executeWait(block, sprite, context);
                break;
                
            case 'control_stop':
                this.executeStop(block, sprite, context);
                break;
                
            case 'control_createclone':
                this.executeCreateClone(block, sprite);
                break;
                
            case 'control_deletethisclone':
                this.executeDeleteThisClone(block, sprite);
                break;
                
            default:
                console.warn(`Unknown opcode: ${block.opcode}`);
                this.executeBlockChain(block.next, sprite, context);
        }
    }
    
    static executeBlockChain(block, sprite, context) {
        let current = block;
        while (current) {
            this.executeBlock(current, sprite, context);
            current = current.next;
        }
    }
    
    // ============================================
    // Block Execution Methods
    // ============================================
    
    static executeEvent(event) {
        // Events are triggered by broadcasts
        // The actual execution happens in the block handler
    }
    
    static executeRepeat(block, sprite, context) {
        const times = this.getInputValue(block.inputs?.TIMES, sprite);
        
        for (let i = 0; i < times; i++) {
            this.executeBlockChain(block.next, sprite, context);
        }
    }
    
    static executeRepeatUntil(block, sprite, context) {
        const condition = this.getInputValue(block.inputs?.CONDITION, sprite);
        
        while (!condition) {
            this.executeBlockChain(block.next, sprite, context);
        }
    }
    
    static executeIf(block, sprite, context) {
        const condition = this.getInputValue(block.inputs?.CONDITION, sprite);
        
        if (condition) {
            this.executeBlockChain(block.next, sprite, context);
        }
    }
    
    static executeIfElse(block, sprite, context) {
        const condition = this.getInputValue(block.inputs?.CONDITION, sprite);
        
        if (condition) {
            this.executeBlockChain(block.next, sprite, context);
        } else {
            // Find else block
            let current = block.next;
            while (current && current.opcode !== 'control_else') {
                current = current.next;
            }
            
            if (current) {
                this.executeBlockChain(current.next, sprite, context);
            }
        }
    }
    
    static executeGoto(block, sprite) {
        const to = block.inputs?.TO?.value;
        
        if (to === 'random') {
            // Go to random position
            if (sprite) {
                sprite.x = Math.random() * (RuntimeState.canvas?.width || 480) - (RuntimeState.canvas?.width || 480) / 2;
                sprite.y = Math.random() * (RuntimeState.canvas?.height || 360) - (RuntimeState.canvas?.height || 360) / 2;
            }
        } else if (to === 'mouse-pointer') {
            // Go to mouse pointer
            if (sprite) {
                sprite.x = RuntimeState.mouseX;
                sprite.y = RuntimeState.mouseY;
            }
        } else {
            // Go to another sprite
            const targetSprite = RuntimeState.sprites.get(to);
            if (targetSprite && sprite) {
                sprite.x = targetSprite.x;
                sprite.y = targetSprite.y;
            }
        }
    }
    
    static executeGlideTo(block, sprite) {
        // Similar to goto but with animation
        this.executeGoto(block, sprite);
    }
    
    static executeChangeXBy(block, sprite) {
        if (sprite) {
            const dx = this.getInputValue(block.inputs?.DX, sprite);
            sprite.x += dx;
        }
    }
    
    static executeChangeYBy(block, sprite) {
        if (sprite) {
            const dy = this.getInputValue(block.inputs?.DY, sprite);
            sprite.y += dy;
        }
    }
    
    static executeSetX(block, sprite) {
        if (sprite) {
            const x = this.getInputValue(block.inputs?.X, sprite);
            sprite.x = x;
        }
    }
    
    static executeSetY(block, sprite) {
        if (sprite) {
            const y = this.getInputValue(block.inputs?.Y, sprite);
            sprite.y = y;
        }
    }
    
    static executeIfOnEdgeBounce(block, sprite) {
        if (sprite) {
            const canvas = RuntimeState.canvas;
            if (canvas) {
                if (sprite.x < -canvas.width / 2 || sprite.x > canvas.width / 2) {
                    sprite.direction = 180 - sprite.direction;
                }
                if (sprite.y < -canvas.height / 2 || sprite.y > canvas.height / 2) {
                    sprite.direction = -sprite.direction;
                }
            }
        }
    }
    
    static executePointInDirection(block, sprite) {
        if (sprite) {
            const direction = this.getInputValue(block.inputs?.DIRECTION, sprite);
            sprite.direction = direction;
        }
    }
    
    static executePointTowards(block, sprite) {
        // Similar to point in direction but towards another sprite
        this.executePointInDirection(block, sprite);
    }
    
    static executeSwitchCostumeTo(block, sprite) {
        if (sprite) {
            const costume = block.inputs?.COSTUME?.value;
            sprite.switchCostume(costume);
        }
    }
    
    static executeNextCostume(block, sprite) {
        if (sprite) {
            sprite.nextCostume();
        }
    }
    
    static executeSay(block, sprite) {
        if (sprite) {
            const message = this.getInputValue(block.inputs?.MESSAGE, sprite);
            sprite.say(message);
        }
    }
    
    static executeSayFor(block, sprite) {
        if (sprite) {
            const message = this.getInputValue(block.inputs?.MESSAGE, sprite);
            const seconds = this.getInputValue(block.inputs?.SECS, sprite);
            sprite.say(message, seconds * 1000);
        }
    }
    
    static executeShow(block, sprite) {
        if (sprite) {
            sprite.visible = true;
        }
    }
    
    static executeHide(block, sprite) {
        if (sprite) {
            sprite.visible = false;
        }
    }
    
    static executeChangeEffectBy(block, sprite) {
        // Placeholder for graphic effects
    }
    
    static executeSetEffectTo(block, sprite) {
        // Placeholder for graphic effects
    }
    
    static executeClearGraphicEffects(block, sprite) {
        // Placeholder for graphic effects
    }
    
    static executeChangeSizeBy(block, sprite) {
        if (sprite) {
            const change = this.getInputValue(block.inputs?.CHANGE, sprite);
            sprite.size += change;
        }
    }
    
    static executeSetSizeTo(block, sprite) {
        if (sprite) {
            const size = this.getInputValue(block.inputs?.SIZE, sprite);
            sprite.size = size;
        }
    }
    
    static executePlaySound(block, sprite) {
        if (sprite) {
            const sound = block.inputs?.SOUND_MENU?.value;
            sprite.playSound(sound);
        }
    }
    
    static executeStopAllSounds(block, sprite) {
        // Stop all sounds
        for (const s of RuntimeState.sprites.values()) {
            s.stopAllSounds();
        }
    }
    
    static executeChangeVolumeBy(block, sprite) {
        // Change volume
    }
    
    static executeSetVolumeTo(block, sprite) {
        // Set volume
    }
    
    static executeTouchingObject(block, sprite) {
        const target = block.inputs?.TOUCHINGOBJECTMENU?.value;
        if (sprite) {
            return sprite.isTouching(target);
        }
        return false;
    }
    
    static executeTouchingColor(block, sprite) {
        // Placeholder for touching color
        return false;
    }
    
    static executeColorIsTouchingColor(block, sprite) {
        // Placeholder for color touching color
        return false;
    }
    
    static executeDistanceTo(block, sprite) {
        const target = block.inputs?.DISTANCETOMENU?.value;
        if (sprite) {
            const targetSprite = RuntimeState.sprites.get(target);
            if (targetSprite) {
                return Math.sqrt(
                    Math.pow(sprite.x - targetSprite.x, 2) +
                    Math.pow(sprite.y - targetSprite.y, 2)
                );
            }
        }
        return 0;
    }
    
    static executeAskAndWait(block, sprite) {
        // Placeholder for ask and wait
    }
    
    static executeMouseDown(block, sprite) {
        return RuntimeState.mouseDown;
    }
    
    static executeMouseX(block, sprite) {
        return RuntimeState.mouseX;
    }
    
    static executeMouseY(block, sprite) {
        return RuntimeState.mouseY;
    }
    
    static executeAdd(block, sprite) {
        const num1 = this.getInputValue(block.inputs?.NUM1, sprite);
        const num2 = this.getInputValue(block.inputs?.NUM2, sprite);
        return num1 + num2;
    }
    
    static executeSubtract(block, sprite) {
        const num1 = this.getInputValue(block.inputs?.NUM1, sprite);
        const num2 = this.getInputValue(block.inputs?.NUM2, sprite);
        return num1 - num2;
    }
    
    static executeMultiply(block, sprite) {
        const num1 = this.getInputValue(block.inputs?.NUM1, sprite);
        const num2 = this.getInputValue(block.inputs?.NUM2, sprite);
        return num1 * num2;
    }
    
    static executeDivide(block, sprite) {
        const num1 = this.getInputValue(block.inputs?.NUM1, sprite);
        const num2 = this.getInputValue(block.inputs?.NUM2, sprite);
        return num2 !== 0 ? num1 / num2 : 0;
    }
    
    static executeEquals(block, sprite) {
        const operand1 = this.getInputValue(block.inputs?.OPERAND1, sprite);
        const operand2 = this.getInputValue(block.inputs?.OPERAND2, sprite);
        return operand1 === operand2;
    }
    
    static executeLessThan(block, sprite) {
        const operand1 = this.getInputValue(block.inputs?.OPERAND1, sprite);
        const operand2 = this.getInputValue(block.inputs?.OPERAND2, sprite);
        return operand1 < operand2;
    }
    
    static executeGreaterThan(block, sprite) {
        const operand1 = this.getInputValue(block.inputs?.OPERAND1, sprite);
        const operand2 = this.getInputValue(block.inputs?.OPERAND2, sprite);
        return operand1 > operand2;
    }
    
    static executeAnd(block, sprite) {
        const operand1 = this.getInputValue(block.inputs?.OPERAND1, sprite);
        const operand2 = this.getInputValue(block.inputs?.OPERAND2, sprite);
        return operand1 && operand2;
    }
    
    static executeOr(block, sprite) {
        const operand1 = this.getInputValue(block.inputs?.OPERAND1, sprite);
        const operand2 = this.getInputValue(block.inputs?.OPERAND2, sprite);
        return operand1 || operand2;
    }
    
    static executeNot(block, sprite) {
        const operand = this.getInputValue(block.inputs?.OPERAND, sprite);
        return !operand;
    }
    
    static executeRandom(block, sprite) {
        const from = this.getInputValue(block.inputs?.FROM, sprite);
        const to = this.getInputValue(block.inputs?.TO, sprite);
        return Math.floor(Math.random() * (to - from + 1)) + from;
    }
    
    static executeSetVariableTo(block, sprite) {
        const variable = block.fields?.VARIABLE?.value;
        const value = this.getInputValue(block.inputs?.VALUE, sprite);
        
        if (variable) {
            const key = sprite ? `${sprite.name}:${variable}` : variable;
            RuntimeState.variables.set(key, {
                name: variable,
                value: value,
                sprite: sprite?.name
            });
        }
    }
    
    static executeChangeVariableBy(block, sprite) {
        const variable = block.fields?.VARIABLE?.value;
        const change = this.getInputValue(block.inputs?.VALUE, sprite);
        
        if (variable) {
            const key = sprite ? `${sprite.name}:${variable}` : variable;
            const varData = RuntimeState.variables.get(key);
            if (varData) {
                varData.value += change;
            }
        }
    }
    
    static executeShowVariable(block, sprite) {
        // Placeholder for showing variable
    }
    
    static executeHideVariable(block, sprite) {
        // Placeholder for hiding variable
    }
    
    static executeAddToList(block, sprite) {
        // Placeholder for adding to list
    }
    
    static executeDeleteOfList(block, sprite) {
        // Placeholder for deleting from list
    }
    
    static executeDeleteAllOfList(block, sprite) {
        // Placeholder for deleting all from list
    }
    
    static executeInsertAtList(block, sprite) {
        // Placeholder for inserting at list
    }
    
    static executeReplaceItemOfList(block, sprite) {
        // Placeholder for replacing item in list
    }
    
    static executeItemOfList(block, sprite) {
        // Placeholder for getting item from list
    }
    
    static executeItemNumOfList(block, sprite) {
        // Placeholder for getting item number from list
    }
    
    static executeLengthOfList(block, sprite) {
        // Placeholder for getting list length
    }
    
    static executeListContainsItem(block, sprite) {
        // Placeholder for checking if list contains item
    }
    
    static executeBroadcast(block, sprite) {
        const message = block.inputs?.BROADCAST_OPTION?.value;
        if (message) {
            this.broadcast(message);
        }
    }
    
    static executeBroadcastAndWait(block, sprite) {
        const message = block.inputs?.BROADCAST_OPTION?.value;
        if (message) {
            this.broadcast(message);
        }
    }
    
    static executeWait(block, sprite, context) {
        const seconds = this.getInputValue(block.inputs?.DURATION, sprite);
        
        // Pause execution for this script
        if (context) {
            context.waitTime = seconds * 1000;
            context.waitStart = performance.now();
            context.paused = true;
            
            // Re-add to active scripts after wait
            setTimeout(() => {
                context.paused = false;
                RuntimeState.activeScripts.push(context);
            }, seconds * 1000);
        }
    }
    
    static executeStop(block, sprite, context) {
        const stopOption = block.inputs?.STOP_OPTION?.value;
        
        switch (stopOption) {
            case 'all':
                this.stop();
                break;
            case 'this script':
                if (context) {
                    RuntimeState.stoppedScripts.add(context);
                }
                break;
            case 'other scripts in sprite':
                if (sprite) {
                    for (const script of RuntimeState.activeScripts) {
                        if (script.sprite === sprite && script !== context) {
                            RuntimeState.stoppedScripts.add(script);
                        }
                    }
                }
                break;
            default:
                if (context) {
                    RuntimeState.stoppedScripts.add(context);
                }
        }
    }
    
    static executeCreateClone(block, sprite) {
        if (sprite) {
            const clone = sprite.clone();
            RuntimeState.sprites.set(clone.id, clone);
            
            // Start clone scripts
            clone.startScripts();
        }
    }
    
    static executeDeleteThisClone(block, sprite) {
        if (sprite && sprite.isClone) {
            RuntimeState.sprites.delete(sprite.id);
        }
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    static getInputValue(input, sprite) {
        if (!input) return 0;
        
        if (input.block) {
            // Execute the block and return the result
            const result = this.executeBlock(input.block, sprite, null);
            return result;
        }
        
        if (input.value !== undefined) {
            return input.value;
        }
        
        return 0;
    }
    
    static isSpriteClicked(sprite) {
        // Check if mouse is over sprite
        const distance = Math.sqrt(
            Math.pow(RuntimeState.mouseX - sprite.x, 2) +
            Math.pow(RuntimeState.mouseY - sprite.y, 2)
        );
        
        // Simple circle collision
        const spriteSize = sprite.size / 100;
        return distance < 24 * spriteSize; // 24 is half of default sprite size
    }
    
    static broadcast(message) {
        console.log(`Broadcast: ${message}`);
        
        // Add to debug info
        RuntimeState.debugInfo.push({
            type: 'broadcast',
            message: message,
            time: RuntimeState.currentTime
        });
        
        // Trigger all scripts listening for this broadcast
        for (const sprite of RuntimeState.sprites.values()) {
            for (const script of sprite.scripts) {
                if (script.type === 'event' && script.event === message) {
                    RuntimeState.activeScripts.push({
                        type: 'event',
                        sprite: sprite,
                        context: script,
                        event: message
                    });
                }
            }
        }
        
        // Trigger stage scripts
        const project = RuntimeState.compiledProject;
        if (project && project.editorData && project.editorData.stage) {
            for (const block of project.editorData.stage.code) {
                if (block.opcode === 'event_whenbroadcastreceived' && 
                    block.fields?.BROADCAST_OPTION?.value === message) {
                    RuntimeState.activeScripts.push({
                        type: 'block',
                        block: block.next,
                        sprite: null,
                        context: 'stage'
                    });
                }
            }
        }
    }
    
    // ============================================
    // Rendering
    // ============================================
    
    static render() {
        const canvas = RuntimeState.canvas;
        const context = RuntimeState.context;
        
        if (!canvas || !context) return;
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw stage backdrop
        const project = RuntimeState.compiledProject;
        if (project && project.editorData && project.editorData.stage) {
            const stage = project.editorData.stage;
            if (stage.costumes && stage.costumes.length > 0) {
                this.drawCostume(stage.costumes[0], 0, 0, canvas.width, canvas.height);
            }
        }
        
        // Draw sprites in order
        const sprites = Array.from(RuntimeState.sprites.values());
        sprites.sort((a, b) => a.zIndex - b.zIndex);
        
        for (const sprite of sprites) {
            if (sprite.visible) {
                this.drawSprite(sprite);
            }
        }
        
        // Draw debug info if enabled
        if (RuntimeState.debugMode) {
            this.drawDebugInfo();
        }
    }
    
    static drawCostume(costume, x, y, width, height) {
        const canvas = RuntimeState.canvas;
        const context = RuntimeState.context;
        
        if (!canvas || !context) return;
        
        // For now, just draw a colored rectangle
        // In a real implementation, we would draw the actual costume image
        context.fillStyle = this.getCostumeColor(costume.name);
        context.fillRect(x, y, width, height);
    }
    
    static drawSprite(sprite) {
        const canvas = RuntimeState.canvas;
        const context = RuntimeState.context;
        
        if (!canvas || !context) return;
        
        // Save context
        context.save();
        
        // Apply transformations
        context.translate(sprite.x, sprite.y);
        context.rotate(sprite.direction * Math.PI / 180);
        context.scale(sprite.size / 100, sprite.size / 100);
        
        // Draw sprite costume
        if (sprite.currentCostume) {
            this.drawCostume(sprite.currentCostume, -24, -24, 48, 48);
        } else if (sprite.costumes && sprite.costumes.length > 0) {
            this.drawCostume(sprite.costumes[0], -24, -24, 48, 48);
        }
        
        // Draw sprite name (for debugging)
        if (RuntimeState.debugMode) {
            context.fillStyle = '#ffffff';
            context.font = '10px Arial';
            context.fillText(sprite.name, -20, -30);
        }
        
        // Restore context
        context.restore();
    }
    
    static getCostumeColor(costumeName) {
        // Simple hash to get consistent colors
        let hash = 0;
        for (let i = 0; i < costumeName.length; i++) {
            hash = costumeName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
            '#00FFFF', '#FFA500', '#800080', '#008000', '#800000'
        ];
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    static drawDebugInfo() {
        const canvas = RuntimeState.canvas;
        const context = RuntimeState.context;
        
        if (!canvas || !context) return;
        
        // Draw FPS
        context.fillStyle = '#ffffff';
        context.font = '12px Arial';
        context.fillText(`FPS: ${RuntimeState.fps}`, 10, 20);
        
        // Draw mouse position
        context.fillText(`Mouse: ${Math.round(RuntimeState.mouseX)}, ${Math.round(RuntimeState.mouseY)}`, 10, 35);
        
        // Draw sprite count
        context.fillText(`Sprites: ${RuntimeState.sprites.size}`, 10, 50);
        
        // Draw active scripts count
        context.fillText(`Scripts: ${RuntimeState.activeScripts.length}`, 10, 65);
    }
    
    // ============================================
    // Public API
    // ============================================
    
    static toggleDebug() {
        RuntimeState.debugMode = !RuntimeState.debugMode;
    }
    
    static getFPS() {
        return RuntimeState.fps;
    }
    
    static getFrameCount() {
        return RuntimeState.frameCount;
    }
    
    static getCurrentTime() {
        return RuntimeState.currentTime;
    }
    
    static getDeltaTime() {
        return RuntimeState.deltaTime;
    }
    
    static getVariable(spriteName, variableName) {
        const key = spriteName ? `${spriteName}:${variableName}` : variableName;
        const varData = RuntimeState.variables.get(key);
        return varData ? varData.value : null;
    }
    
    static setVariable(spriteName, variableName, value) {
        const key = spriteName ? `${spriteName}:${variableName}` : variableName;
        RuntimeState.variables.set(key, {
            name: variableName,
            value: value,
            sprite: spriteName
        });
    }
}

// ============================================
// Initialize Runtime
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Runtime.init();
    });
} else {
    Runtime.init();
}

// Export
window.Runtime = Runtime;
window.RuntimeState = RuntimeState;
