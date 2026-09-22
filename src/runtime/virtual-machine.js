// Virtual Machine Module
// Executes Scratch blocks in a virtual environment

class VirtualMachine {
    constructor() {
        this.running = false;
        this.paused = false;
        this.debugMode = false;
        this.breakpoints = new Set();
        this.watchExpressions = new Map();
        this.callStack = [];
        this.currentThread = null;
        this.threads = [];
        this.globals = new Map();
        this.broadcasts = new Map();
        this.eventListeners = new Map();
        this.clock = 0;
        this.fps = 60;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.totalTime = 0;
        this.yieldFlag = false;
        this.yieldTimer = null;
        this.activeScripts = new Set();
        this.waitingScripts = new Map();
        this.clones = new Map();
    }

    // Initialize the virtual machine
    init() {
        this.running = false;
        this.paused = false;
        this.debugMode = false;
        this.breakpoints.clear();
        this.watchExpressions.clear();
        this.callStack = [];
        this.currentThread = null;
        this.threads = [];
        this.globals.clear();
        this.broadcasts.clear();
        this.eventListeners.clear();
        this.clock = 0;
        this.frameCount = 0;
        this.totalTime = 0;
        this.activeScripts.clear();
        this.waitingScripts.clear();
        this.clones.clear();
    }

    // Start the virtual machine
    start() {
        if (this.running) return;
        
        this.running = true;
        this.paused = false;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.totalTime = 0;
        
        // Start the main loop
        this.mainLoop();
    }

    // Stop the virtual machine
    stop() {
        this.running = false;
        this.paused = false;
        
        // Clear all timers
        if (this.yieldTimer) {
            clearTimeout(this.yieldTimer);
            this.yieldTimer = null;
        }
        
        // Clear all threads
        this.threads = [];
        this.currentThread = null;
        this.activeScripts.clear();
        this.waitingScripts.clear();
        this.callStack = [];
    }

    // Pause the virtual machine
    pause() {
        this.paused = true;
    }

    // Resume the virtual machine
    resume() {
        this.paused = false;
    }

    // Toggle pause
    togglePause() {
        this.paused = !this.paused;
    }

    // Check if running
    isRunning() {
        return this.running && !this.paused;
    }

    // Main execution loop
    async mainLoop() {
        if (!this.running) return;
        
        if (this.paused) {
            // Wait and retry
            setTimeout(() => this.mainLoop(), 100);
            return;
        }

        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.totalTime += deltaTime;
        this.frameCount++;
        
        // Calculate FPS
        if (this.frameCount % 10 === 0) {
            const elapsed = (now - this.lastFrameTime) / 1000;
            this.fps = 10 / elapsed;
        }

        // Update clock
        this.clock += deltaTime / 1000;

        try {
            // Execute all ready threads
            this.executeThreads();
            
            // Process broadcasts
            this.processBroadcasts();
            
            // Check for events
            this.checkEvents();
            
            // Continue the loop
            if (this.running) {
                const frameTime = 1000 / this.fps;
                const timeLeft = frameTime - deltaTime;
                
                if (timeLeft > 0) {
                    setTimeout(() => this.mainLoop(), timeLeft);
                } else {
                    // Frame took too long, yield immediately
                    setTimeout(() => this.mainLoop(), 0);
                }
            }
        } catch (error) {
            console.error('VM Error:', error);
            this.handleError(error);
        }
    }

    // Execute all ready threads
    executeThreads() {
        const threadsToExecute = this.threads.filter(t => t.ready);
        
        for (const thread of threadsToExecute) {
            if (!this.running || this.paused) break;
            
            this.currentThread = thread;
            this.callStack.push(thread);
            
            try {
                this.executeThread(thread);
            } catch (error) {
                this.handleThreadError(thread, error);
            }
            
            this.callStack.pop();
        }
        
        this.currentThread = null;
    }

    // Execute a single thread
    executeThread(thread) {
        if (!thread.ready) return;
        
        const script = thread.script;
        const block = script.blocks[thread.pc];
        
        if (!block) {
            // End of script
            this.endThread(thread);
            return;
        }

        // Check for breakpoints
        if (this.debugMode && this.breakpoints.has(block.id)) {
            this.pause();
            this.debugBreak(block);
            return;
        }

        // Execute the block
        const result = this.executeBlock(block, thread);
        
        // Check if we should yield
        if (this.yieldFlag) {
            this.yieldFlag = false;
            thread.ready = false;
            
            // Schedule continuation
            setTimeout(() => {
                thread.ready = true;
            }, 0);
            return;
        }
        
        // Move to next block
        thread.pc++;
        
        // If there's a next block, continue
        if (thread.pc < script.blocks.length) {
            thread.ready = true;
        } else {
            this.endThread(thread);
        }
    }

    // Execute a block
    executeBlock(block, thread) {
        const opcode = block.opcode;
        const handler = this.blockHandlers[opcode];
        
        if (handler) {
            return handler.call(this, block, thread);
        } else {
            console.warn(`Unknown opcode: ${opcode}`);
            return null;
        }
    }

    // End a thread
    endThread(thread) {
        const index = this.threads.indexOf(thread);
        if (index > -1) {
            this.threads.splice(index, 1);
        }
        
        this.activeScripts.delete(thread.script);
    }

    // Process broadcasts
    processBroadcasts() {
        for (const [message, handlers] of this.broadcasts) {
            if (handlers.length > 0) {
                // Trigger all handlers
                handlers.forEach(handler => {
                    this.triggerBroadcastHandler(message, handler);
                });
                
                // Clear the broadcast
                this.broadcasts.delete(message);
            }
        }
    }

    // Trigger broadcast handler
    triggerBroadcastHandler(message, handler) {
        const thread = this.createThread(handler.script, handler.sprite);
        this.threads.push(thread);
        this.activeScripts.add(handler.script);
    }

    // Check for events
    checkEvents() {
        // Check for green flag
        if (this.eventListeners.has('green_flag')) {
            const handlers = this.eventListeners.get('green_flag');
            handlers.forEach(handler => {
                const thread = this.createThread(handler.script, handler.sprite);
                this.threads.push(thread);
                this.activeScripts.add(handler.script);
            });
            this.eventListeners.delete('green_flag');
        }
        
        // Check for key presses
        for (const [key, handlers] of this.eventListeners) {
            if (key.startsWith('key_') && this.isKeyPressed(key.substring(4))) {
                handlers.forEach(handler => {
                    const thread = this.createThread(handler.script, handler.sprite);
                    this.threads.push(thread);
                    this.activeScripts.add(handler.script);
                });
            }
        }
        
        // Check for mouse events
        if (this.eventListeners.has('mouse_clicked') && this.isMouseClicked()) {
            const handlers = this.eventListeners.get('mouse_clicked');
            handlers.forEach(handler => {
                const thread = this.createThread(handler.script, handler.sprite);
                this.threads.push(thread);
                this.activeScripts.add(handler.script);
            });
        }
    }

    // Create a new thread
    createThread(script, sprite) {
        return {
            id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            script: script,
            sprite: sprite,
            pc: 0, // Program counter
            ready: true,
            stack: [],
            locals: new Map(),
            context: {
                sprite: sprite,
                target: sprite,
                self: sprite
            }
        };
    }

    // Yield execution
    yield() {
        this.yieldFlag = true;
    }

    // Wait for specified time
    wait(seconds, thread) {
        this.yieldFlag = true;
        
        setTimeout(() => {
            thread.ready = true;
        }, seconds * 1000);
    }

    // Wait until condition
    waitUntil(condition, thread) {
        this.yieldFlag = true;
        
        const check = () => {
            if (this.evaluate(condition, thread.context)) {
                thread.ready = true;
            } else {
                setTimeout(check, 100);
            }
        };
        
        setTimeout(check, 100);
    }

    // Broadcast a message
    broadcast(message) {
        if (!this.broadcasts.has(message)) {
            this.broadcasts.set(message, []);
        }
        this.broadcasts.get(message).push({ message, timestamp: Date.now() });
    }

    // Broadcast and wait
    broadcastAndWait(message, thread) {
        this.broadcast(message);
        
        // Wait for all handlers to complete
        const handlers = this.broadcasts.get(message) || [];
        const handlerCount = handlers.length;
        
        if (handlerCount === 0) {
            // No handlers, continue immediately
            return;
        }
        
        let completed = 0;
        const checkComplete = () => {
            completed++;
            if (completed >= handlerCount) {
                thread.ready = true;
            }
        };
        
        // This is simplified - in reality, we'd need to track when each handler completes
        this.yieldFlag = true;
        setTimeout(() => {
            thread.ready = true;
        }, 100);
    }

    // Register event listener
    on(event, handler, sprite) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push({ handler, sprite });
    }

    // Remove event listener
    off(event, handler, sprite) {
        if (this.eventListeners.has(event)) {
            const handlers = this.eventListeners.get(event);
            const index = handlers.findIndex(h => 
                h.handler === handler && h.sprite === sprite
            );
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Evaluate an expression
    evaluate(expression, context) {
        if (expression === null || expression === undefined) {
            return null;
        }
        
        if (typeof expression === 'number') {
            return expression;
        }
        
        if (typeof expression === 'string') {
            return expression;
        }
        
        if (typeof expression === 'boolean') {
            return expression;
        }
        
        if (Array.isArray(expression)) {
            return expression.map(e => this.evaluate(e, context));
        }
        
        if (expression.type === 'Literal') {
            return expression.value;
        }
        
        if (expression.type === 'Identifier') {
            return this.getVariable(expression.name, context);
        }
        
        if (expression.type === 'BinaryExpression') {
            const left = this.evaluate(expression.left, context);
            const right = this.evaluate(expression.right, context);
            return this.applyOperator(expression.operator, left, right);
        }
        
        if (expression.type === 'UnaryExpression') {
            const argument = this.evaluate(expression.argument, context);
            return this.applyUnaryOperator(expression.operator, argument);
        }
        
        if (expression.type === 'CallExpression') {
            return this.evaluateCall(expression, context);
        }
        
        if (expression.type === 'MemberExpression') {
            return this.evaluateMember(expression, context);
        }
        
        if (expression.type === 'ConditionalExpression') {
            const test = this.evaluate(expression.test, context);
            return test ? this.evaluate(expression.consequent, context) : 
                         this.evaluate(expression.alternate, context);
        }
        
        // Handle block expressions
        if (expression.opcode) {
            return this.executeBlockExpression(expression, context);
        }
        
        return null;
    }

    // Apply binary operator
    applyOperator(operator, left, right) {
        switch (operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%': return left % right;
            case '^': return Math.pow(left, right);
            case '==': return left === right;
            case '!=': return left !== right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '&&': return left && right;
            case '||': return left || right;
            default: return null;
        }
    }

    // Apply unary operator
    applyUnaryOperator(operator, argument) {
        switch (operator) {
            case '!': return !argument;
            case '-': return -argument;
            case '+': return +argument;
            default: return argument;
        }
    }

    // Evaluate function call
    evaluateCall(call, context) {
        const callee = call.callee;
        
        if (callee.type === 'Identifier') {
            const funcName = callee.name;
            const handler = this.functionHandlers[funcName];
            
            if (handler) {
                const args = call.arguments.map(arg => this.evaluate(arg, context));
                return handler.apply(this, [context, ...args]);
            }
        }
        
        return null;
    }

    // Evaluate member expression
    evaluateMember(member, context) {
        const object = this.evaluate(member.object, context);
        const property = member.property.name || member.property.value;
        
        if (object && typeof object === 'object') {
            return object[property];
        }
        
        return null;
    }

    // Execute block expression
    executeBlockExpression(block, context) {
        const opcode = block.opcode;
        const handler = this.expressionHandlers[opcode];
        
        if (handler) {
            return handler.call(this, block, context);
        }
        
        return null;
    }

    // Get variable value
    getVariable(name, context) {
        // Check locals first
        if (context && context.locals && context.locals.has(name)) {
            return context.locals.get(name);
        }
        
        // Check sprite variables
        if (context && context.sprite && context.sprite.variables) {
            const varDecl = context.sprite.variables.find(v => v.name === name);
            if (varDecl) {
                return varDecl.value;
            }
        }
        
        // Check global variables
        if (this.globals.has(name)) {
            return this.globals.get(name);
        }
        
        // Check stage variables
        if (context && context.stage) {
            const varDecl = context.stage.variables.find(v => v.name === name);
            if (varDecl) {
                return varDecl.value;
            }
        }
        
        return null;
    }

    // Set variable value
    setVariable(name, value, context) {
        // Check locals first
        if (context && context.locals) {
            context.locals.set(name, value);
            return;
        }
        
        // Check sprite variables
        if (context && context.sprite && context.sprite.variables) {
            const varDecl = context.sprite.variables.find(v => v.name === name);
            if (varDecl) {
                varDecl.value = value;
                return;
            }
        }
        
        // Check global variables
        if (this.globals.has(name)) {
            this.globals.set(name, value);
            return;
        }
        
        // Check stage variables
        if (context && context.stage) {
            const varDecl = context.stage.variables.find(v => v.name === name);
            if (varDecl) {
                varDecl.value = value;
                return;
            }
        }
        
        // Create new global variable
        this.globals.set(name, value);
    }

    // Handle errors
    handleError(error) {
        console.error('VM Error:', error);
        
        if (this.debugMode) {
            this.debugError(error);
        }
        
        // In a real implementation, we'd show the error in the UI
        // and possibly pause execution
    }

    // Handle thread error
    handleThreadError(thread, error) {
        this.handleError(error);
        this.endThread(thread);
    }

    // Debug breakpoint
    debugBreak(block) {
        console.log(`Breakpoint at block: ${block.opcode}`);
        // In a real implementation, we'd notify the debugger
    }

    // Debug error
    debugError(error) {
        console.error('Debug Error:', error);
        // In a real implementation, we'd notify the debugger
    }

    // Add breakpoint
    addBreakpoint(blockId) {
        this.breakpoints.add(blockId);
    }

    // Remove breakpoint
    removeBreakpoint(blockId) {
        this.breakpoints.delete(blockId);
    }

    // Add watch expression
    addWatchExpression(expression, callback) {
        this.watchExpressions.set(expression, callback);
    }

    // Remove watch expression
    removeWatchExpression(expression) {
        this.watchExpressions.delete(expression);
    }

    // Evaluate watch expressions
    evaluateWatchExpressions(context) {
        for (const [expression, callback] of this.watchExpressions) {
            const value = this.evaluate(expression, context);
            callback(value);
        }
    }

    // Block handlers for Scratch opcodes
    blockHandlers = {
        // Motion blocks
        motion_goto: (block, thread) => {
            const x = block.inputs.x ? this.evaluate(block.inputs.x, thread.context) : 0;
            const y = block.inputs.y ? this.evaluate(block.inputs.y, thread.context) : 0;
            if (thread.context.sprite) {
                thread.context.sprite.x = x;
                thread.context.sprite.y = y;
            }
        },
        
        motion_goto_object: (block, thread) => {
            const target = block.inputs.TO_OBJECT ? this.evaluate(block.inputs.TO_OBJECT, thread.context) : null;
            if (target && thread.context.sprite) {
                // Find the target sprite
                const targetSprite = this.findSprite(target);
                if (targetSprite) {
                    thread.context.sprite.x = targetSprite.x;
                    thread.context.sprite.y = targetSprite.y;
                }
            }
        },
        
        motion_glide: (block, thread) => {
            const secs = block.inputs.SECS ? this.evaluate(block.inputs.SECS, thread.context) : 1;
            const x = block.inputs.X ? this.evaluate(block.inputs.X, thread.context) : 0;
            const y = block.inputs.Y ? this.evaluate(block.inputs.Y, thread.context) : 0;
            if (thread.context.sprite) {
                const startX = thread.context.sprite.x;
                const startY = thread.context.sprite.y;
                const startTime = Date.now();
                
                const glide = () => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const t = Math.min(elapsed / secs, 1);
                    
                    thread.context.sprite.x = startX + (x - startX) * t;
                    thread.context.sprite.y = startY + (y - startY) * t;
                    
                    if (t < 1) {
                        setTimeout(glide, 16);
                    } else {
                        thread.ready = true;
                    }
                };
                
                this.yield();
                setTimeout(glide, 16);
            }
        },
        
        motion_glide_to: (block, thread) => {
            const secs = block.inputs.SECS ? this.evaluate(block.inputs.SECS, thread.context) : 1;
            const target = block.inputs.TO_OBJECT ? this.evaluate(block.inputs.TO_OBJECT, thread.context) : null;
            if (target && thread.context.sprite) {
                const targetSprite = this.findSprite(target);
                if (targetSprite) {
                    const startX = thread.context.sprite.x;
                    const startY = thread.context.sprite.y;
                    const startTime = Date.now();
                    
                    const glide = () => {
                        const elapsed = (Date.now() - startTime) / 1000;
                        const t = Math.min(elapsed / secs, 1);
                        
                        thread.context.sprite.x = startX + (targetSprite.x - startX) * t;
                        thread.context.sprite.y = startY + (targetSprite.y - startY) * t;
                        
                        if (t < 1) {
                            setTimeout(glide, 16);
                        } else {
                            thread.ready = true;
                        }
                    };
                    
                    this.yield();
                    setTimeout(glide, 16);
                }
            }
        },
        
        motion_point_towards: (block, thread) => {
            const target = block.inputs.TOWARDS_OBJECT ? this.evaluate(block.inputs.TOWARDS_OBJECT, thread.context) : null;
            if (target && thread.context.sprite) {
                const targetSprite = this.findSprite(target);
                if (targetSprite) {
                    const dx = targetSprite.x - thread.context.sprite.x;
                    const dy = targetSprite.y - thread.context.sprite.y;
                    thread.context.sprite.direction = Math.atan2(dy, dx) * 180 / Math.PI;
                }
            }
        },
        
        motion_point_in_direction: (block, thread) => {
            const direction = block.inputs.DIRECTION ? this.evaluate(block.inputs.DIRECTION, thread.context) : 90;
            if (thread.context.sprite) {
                thread.context.sprite.direction = direction;
            }
        },
        
        motion_turn_right: (block, thread) => {
            const degrees = block.inputs.DEGREES ? this.evaluate(block.inputs.DEGREES, thread.context) : 15;
            if (thread.context.sprite) {
                thread.context.sprite.direction += degrees;
            }
        },
        
        motion_turn_left: (block, thread) => {
            const degrees = block.inputs.DEGREES ? this.evaluate(block.inputs.DEGREES, thread.context) : 15;
            if (thread.context.sprite) {
                thread.context.sprite.direction -= degrees;
            }
        },
        
        motion_change_x: (block, thread) => {
            const dx = block.inputs.DX ? this.evaluate(block.inputs.DX, thread.context) : 10;
            if (thread.context.sprite) {
                thread.context.sprite.x += dx;
            }
        },
        
        motion_change_y: (block, thread) => {
            const dy = block.inputs.DY ? this.evaluate(block.inputs.DY, thread.context) : 10;
            if (thread.context.sprite) {
                thread.context.sprite.y += dy;
            }
        },
        
        motion_set_x: (block, thread) => {
            const x = block.inputs.X ? this.evaluate(block.inputs.X, thread.context) : 0;
            if (thread.context.sprite) {
                thread.context.sprite.x = x;
            }
        },
        
        motion_set_y: (block, thread) => {
            const y = block.inputs.Y ? this.evaluate(block.inputs.Y, thread.context) : 0;
            if (thread.context.sprite) {
                thread.context.sprite.y = y;
            }
        },
        
        motion_change_x_by: (block, thread) => {
            const dx = block.inputs.DX ? this.evaluate(block.inputs.DX, thread.context) : 10;
            if (thread.context.sprite) {
                thread.context.sprite.x += dx;
            }
        },
        
        motion_set_direction: (block, thread) => {
            const direction = block.inputs.DIRECTION ? this.evaluate(block.inputs.DIRECTION, thread.context) : 90;
            if (thread.context.sprite) {
                thread.context.sprite.direction = direction;
            }
        },
        
        // Looks blocks
        looks_say: (block, thread) => {
            const message = block.inputs.MESSAGE ? this.evaluate(block.inputs.MESSAGE, thread.context) : '';
            if (thread.context.sprite) {
                thread.context.sprite.say(message);
            }
        },
        
        looks_say_for: (block, thread) => {
            const message = block.inputs.MESSAGE ? this.evaluate(block.inputs.MESSAGE, thread.context) : '';
            const secs = block.inputs.SECS ? this.evaluate(block.inputs.SECS, thread.context) : 2;
            if (thread.context.sprite) {
                thread.context.sprite.say(message, secs);
                this.yield();
                setTimeout(() => {
                    thread.context.sprite.stopSaying();
                    thread.ready = true;
                }, secs * 1000);
            }
        },
        
        looks_think: (block, thread) => {
            const message = block.inputs.MESSAGE ? this.evaluate(block.inputs.MESSAGE, thread.context) : '';
            if (thread.context.sprite) {
                thread.context.sprite.think(message);
            }
        },
        
        looks_think_for: (block, thread) => {
            const message = block.inputs.MESSAGE ? this.evaluate(block.inputs.MESSAGE, thread.context) : '';
            const secs = block.inputs.SECS ? this.evaluate(block.inputs.SECS, thread.context) : 2;
            if (thread.context.sprite) {
                thread.context.sprite.think(message, secs);
                this.yield();
                setTimeout(() => {
                    thread.context.sprite.stopThinking();
                    thread.ready = true;
                }, secs * 1000);
            }
        },
        
        looks_show: (block, thread) => {
            if (thread.context.sprite) {
                thread.context.sprite.visible = true;
            }
        },
        
        looks_hide: (block, thread) => {
            if (thread.context.sprite) {
                thread.context.sprite.visible = false;
            }
        },
        
        looks_switch_costume: (block, thread) => {
            const costume = block.inputs.COSTUME ? this.evaluate(block.inputs.COSTUME, thread.context) : null;
            if (thread.context.sprite) {
                thread.context.sprite.switchCostume(costume);
            }
        },
        
        looks_next_costume: (block, thread) => {
            if (thread.context.sprite) {
                thread.context.sprite.nextCostume();
            }
        },
        
        looks_change_effect: (block, thread) => {
            const effect = block.inputs.EFFECT ? this.evaluate(block.inputs.EFFECT, thread.context) : 'color';
            const change = block.inputs.CHANGE ? this.evaluate(block.inputs.CHANGE, thread.context) : 25;
            if (thread.context.sprite) {
                thread.context.sprite.changeEffect(effect, change);
            }
        },
        
        looks_set_effect: (block, thread) => {
            const effect = block.inputs.EFFECT ? this.evaluate(block.inputs.EFFECT, thread.context) : 'color';
            const value = block.inputs.VALUE ? this.evaluate(block.inputs.VALUE, thread.context) : 0;
            if (thread.context.sprite) {
                thread.context.sprite.setEffect(effect, value);
            }
        },
        
        looks_clear_effects: (block, thread) => {
            if (thread.context.sprite) {
                thread.context.sprite.clearEffects();
            }
        },
        
        // Sound blocks
        sound_play: (block, thread) => {
            const sound = block.inputs.SOUND_MENU ? this.evaluate(block.inputs.SOUND_MENU, thread.context) : null;
            if (thread.context.sprite) {
                thread.context.sprite.playSound(sound);
            }
        },
        
        sound_play_until_done: (block, thread) => {
            const sound = block.inputs.SOUND_MENU ? this.evaluate(block.inputs.SOUND_MENU, thread.context) : null;
            if (thread.context.sprite) {
                thread.context.sprite.playSoundUntilDone(sound);
                this.yield();
                // In a real implementation, we'd wait for the sound to finish
                setTimeout(() => { thread.ready = true; }, 100);
            }
        },
        
        sound_stop_all: (block, thread) => {
            if (thread.context.sprite) {
                thread.context.sprite.stopAllSounds();
            }
        },
        
        sound_change_volume: (block, thread) => {
            const volume = block.inputs.VOLUME ? this.evaluate(block.inputs.VOLUME, thread.context) : -10;
            if (thread.context.sprite) {
                thread.context.sprite.changeVolume(volume);
            }
        },
        
        sound_set_volume: (block, thread) => {
            const volume = block.inputs.VOLUME ? this.evaluate(block.inputs.VOLUME, thread.context) : 100;
            if (thread.context.sprite) {
                thread.context.sprite.setVolume(volume);
            }
        },
        
        // Control blocks
        control_wait: (block, thread) => {
            const secs = block.inputs.DURATION ? this.evaluate(block.inputs.DURATION, thread.context) : 1;
            this.wait(secs, thread);
        },
        
        control_repeat: (block, thread) => {
            const count = block.inputs.TIMES ? this.evaluate(block.inputs.TIMES, thread.context) : 10;
            const substack = block.inputs.SUBSTACK;
            
            // Save current state
            thread.stack.push({ pc: thread.pc, count: count });
            thread.pc = 0; // Reset to start of substack
            
            // Execute substack
            if (substack && substack.blocks) {
                thread.pc = 0;
                // In a real implementation, we'd execute the substack
            }
        },
        
        control_forever: (block, thread) => {
            const substack = block.inputs.SUBSTACK;
            
            // Save current position
            thread.stack.push({ pc: thread.pc, type: 'forever' });
            
            // Execute substack
            if (substack && substack.blocks) {
                thread.pc = 0;
                // In a real implementation, we'd execute the substack
            }
        },
        
        control_if: (block, thread) => {
            const condition = block.inputs.CONDITION ? this.evaluate(block.inputs.CONDITION, thread.context) : false;
            const substack = block.inputs.SUBSTACK;
            
            if (condition && substack && substack.blocks) {
                // Execute substack
                thread.stack.push({ pc: thread.pc });
                thread.pc = 0;
                // In a real implementation, we'd execute the substack
            } else {
                // Skip substack
                thread.pc++;
            }
        },
        
        control_if_else: (block, thread) => {
            const condition = block.inputs.CONDITION ? this.evaluate(block.inputs.CONDITION, thread.context) : false;
            const substack1 = block.inputs.SUBSTACK1;
            const substack2 = block.inputs.SUBSTACK2;
            
            if (condition && substack1 && substack1.blocks) {
                thread.stack.push({ pc: thread.pc });
                thread.pc = 0;
                // Execute first substack
            } else if (!condition && substack2 && substack2.blocks) {
                thread.stack.push({ pc: thread.pc });
                thread.pc = 0;
                // Execute second substack
            } else {
                thread.pc++;
            }
        },
        
        control_wait_until: (block, thread) => {
            const condition = block.inputs.CONDITION;
            this.waitUntil(condition, thread);
        },
        
        control_repeat_until: (block, thread) => {
            const condition = block.inputs.CONDITION;
            const substack = block.inputs.SUBSTACK;
            
            // Check condition
            const shouldRepeat = !this.evaluate(condition, thread.context);
            
            if (shouldRepeat && substack && substack.blocks) {
                thread.stack.push({ pc: thread.pc, type: 'repeat_until' });
                thread.pc = 0;
                // Execute substack
            } else {
                thread.pc++;
            }
        },
        
        control_stop: (block, thread) => {
            const stopOption = block.inputs.STOP_OPTION ? this.evaluate(block.inputs.STOP_OPTION, thread.context) : 'this';
            
            switch (stopOption) {
                case 'all':
                    this.stop();
                    break;
                case 'this':
                    this.endThread(thread);
                    break;
                case 'other':
                    // Stop all other scripts
                    this.threads.forEach(t => {
                        if (t !== thread) {
                            this.endThread(t);
                        }
                    });
                    break;
            }
        },
        
        control_broadcast: (block, thread) => {
            const message = block.inputs.BROADCAST_OPTION ? this.evaluate(block.inputs.BROADCAST_OPTION, thread.context) : '';
            this.broadcast(message);
        },
        
        control_broadcast_and_wait: (block, thread) => {
            const message = block.inputs.BROADCAST_OPTION ? this.evaluate(block.inputs.BROADCAST_OPTION, thread.context) : '';
            this.broadcastAndWait(message, thread);
        },
        
        // Sensing blocks
        sensing_touching_object: (block, thread) => {
            const target = block.inputs.TOUCHINGOBJECTMENU ? this.evaluate(block.inputs.TOUCHINGOBJECTMENU, thread.context) : null;
            if (thread.context.sprite && target) {
                const targetSprite = this.findSprite(target);
                if (targetSprite) {
                    return this.checkCollision(thread.context.sprite, targetSprite);
                }
            }
            return false;
        },
        
        sensing_touching_color: (block, thread) => {
            const color = block.inputs.COLOR ? this.evaluate(block.inputs.COLOR, thread.context) : '#000000';
            if (thread.context.sprite) {
                return this.checkColorCollision(thread.context.sprite, color);
            }
            return false;
        },
        
        sensing_color_touching_color: (block, thread) => {
            const color1 = block.inputs.COLOR ? this.evaluate(block.inputs.COLOR, thread.context) : '#000000';
            const color2 = block.inputs.COLOR2 ? this.evaluate(block.inputs.COLOR2, thread.context) : '#FFFFFF';
            // In a real implementation, we'd check if color1 is touching color2
            return false;
        },
        
        sensing_key_pressed: (block, thread) => {
            const key = block.inputs.KEY_OPTION ? this.evaluate(block.inputs.KEY_OPTION, thread.context) : '';
            return this.isKeyPressed(key);
        },
        
        sensing_mouse_down: (block, thread) => {
            return this.isMouseClicked();
        },
        
        sensing_mouse_x: (block, thread) => {
            return this.mouseX;
        },
        
        sensing_mouse_y: (block, thread) => {
            return this.mouseY;
        },
        
        sensing_distance_to: (block, thread) => {
            const target = block.inputs.DISTANCETOMENU ? this.evaluate(block.inputs.DISTANCETOMENU, thread.context) : null;
            if (thread.context.sprite && target) {
                const targetSprite = this.findSprite(target);
                if (targetSprite) {
                    const dx = targetSprite.x - thread.context.sprite.x;
                    const dy = targetSprite.y - thread.context.sprite.y;
                    return Math.sqrt(dx * dx + dy * dy);
                }
            }
            return 0;
        },
        
        // Operators blocks
        operator_add: (block, thread) => {
            const num1 = block.inputs.NUM1 ? this.evaluate(block.inputs.NUM1, thread.context) : 0;
            const num2 = block.inputs.NUM2 ? this.evaluate(block.inputs.NUM2, thread.context) : 0;
            return num1 + num2;
        },
        
        operator_subtract: (block, thread) => {
            const num1 = block.inputs.NUM1 ? this.evaluate(block.inputs.NUM1, thread.context) : 0;
            const num2 = block.inputs.NUM2 ? this.evaluate(block.inputs.NUM2, thread.context) : 0;
            return num1 - num2;
        },
        
        operator_multiply: (block, thread) => {
            const num1 = block.inputs.NUM1 ? this.evaluate(block.inputs.NUM1, thread.context) : 1;
            const num2 = block.inputs.NUM2 ? this.evaluate(block.inputs.NUM2, thread.context) : 1;
            return num1 * num2;
        },
        
        operator_divide: (block, thread) => {
            const num1 = block.inputs.NUM1 ? this.evaluate(block.inputs.NUM1, thread.context) : 1;
            const num2 = block.inputs.NUM2 ? this.evaluate(block.inputs.NUM2, thread.context) : 1;
            return num1 / num2;
        },
        
        operator_random: (block, thread) => {
            const from = block.inputs.FROM ? this.evaluate(block.inputs.FROM, thread.context) : 1;
            const to = block.inputs.TO ? this.evaluate(block.inputs.TO, thread.context) : 10;
            return Math.floor(Math.random() * (to - from + 1)) + from;
        },
        
        operator_lt: (block, thread) => {
            const operand1 = block.inputs.OPERAND1 ? this.evaluate(block.inputs.OPERAND1, thread.context) : 0;
            const operand2 = block.inputs.OPERAND2 ? this.evaluate(block.inputs.OPERAND2, thread.context) : 0;
            return operand1 < operand2;
        },
        
        operator_gt: (block, thread) => {
            const operand1 = block.inputs.OPERAND1 ? this.evaluate(block.inputs.OPERAND1, thread.context) : 0;
            const operand2 = block.inputs.OPERAND2 ? this.evaluate(block.inputs.OPERAND2, thread.context) : 0;
            return operand1 > operand2;
        },
        
        operator_equals: (block, thread) => {
            const operand1 = block.inputs.OPERAND1 ? this.evaluate(block.inputs.OPERAND1, thread.context) : null;
            const operand2 = block.inputs.OPERAND2 ? this.evaluate(block.inputs.OPERAND2, thread.context) : null;
            return operand1 === operand2;
        },
        
        operator_and: (block, thread) => {
            const operand1 = block.inputs.OPERAND1 ? this.evaluate(block.inputs.OPERAND1, thread.context) : false;
            const operand2 = block.inputs.OPERAND2 ? this.evaluate(block.inputs.OPERAND2, thread.context) : false;
            return operand1 && operand2;
        },
        
        operator_or: (block, thread) => {
            const operand1 = block.inputs.OPERAND1 ? this.evaluate(block.inputs.OPERAND1, thread.context) : false;
            const operand2 = block.inputs.OPERAND2 ? this.evaluate(block.inputs.OPERAND2, thread.context) : false;
            return operand1 || operand2;
        },
        
        operator_not: (block, thread) => {
            const operand = block.inputs.OPERAND ? this.evaluate(block.inputs.OPERAND, thread.context) : false;
            return !operand;
        },
        
        // Variables blocks
        data_variable: (block, thread) => {
            const variable = block.fields.VARIABLE ? this.evaluate(block.fields.VARIABLE, thread.context) : '';
            return this.getVariable(variable, thread.context);
        },
        
        data_setvariableto: (block, thread) => {
            const variable = block.fields.VARIABLE ? this.evaluate(block.fields.VARIABLE, thread.context) : '';
            const value = block.inputs.VALUE ? this.evaluate(block.inputs.VALUE, thread.context) : 0;
            this.setVariable(variable, value, thread.context);
        },
        
        data_changevariableby: (block, thread) => {
            const variable = block.fields.VARIABLE ? this.evaluate(block.fields.VARIABLE, thread.context) : '';
            const value = block.inputs.VALUE ? this.evaluate(block.inputs.VALUE, thread.context) : 0;
            const current = this.getVariable(variable, thread.context) || 0;
            this.setVariable(variable, current + value, thread.context);
        },
        
        // Lists blocks
        data_listcontents: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            return this.getList(list, thread.context);
        },
        
        data_addtolist: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            const item = block.inputs.ITEM ? this.evaluate(block.inputs.ITEM, thread.context) : '';
            this.addToList(list, item, thread.context);
        },
        
        data_deleteoflist: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            const index = block.inputs.INDEX ? this.evaluate(block.inputs.INDEX, thread.context) : 1;
            this.deleteFromList(list, index, thread.context);
        },
        
        data_deletealloflist: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            this.clearList(list, thread.context);
        },
        
        data_insertatlist: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            const index = block.inputs.INDEX ? this.evaluate(block.inputs.INDEX, thread.context) : 1;
            const item = block.inputs.ITEM ? this.evaluate(block.inputs.ITEM, thread.context) : '';
            this.insertIntoList(list, index, item, thread.context);
        },
        
        data_replaceitemoflist: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            const index = block.inputs.INDEX ? this.evaluate(block.inputs.INDEX, thread.context) : 1;
            const item = block.inputs.ITEM ? this.evaluate(block.inputs.ITEM, thread.context) : '';
            this.replaceInList(list, index, item, thread.context);
        },
        
        data_itemoflist: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            const index = block.inputs.INDEX ? this.evaluate(block.inputs.INDEX, thread.context) : 1;
            return this.getListItem(list, index, thread.context);
        },
        
        data_listindexall: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            return this.getListLength(list, thread.context);
        },
        
        data_listcontainsitem: (block, thread) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, thread.context) : '';
            const item = block.inputs.ITEM ? this.evaluate(block.inputs.ITEM, thread.context) : '';
            return this.listContains(list, item, thread.context);
        }
    };

    // Expression handlers for reporter blocks
    expressionHandlers = {
        // Motion
        motion_xposition: (block, context) => {
            return context.sprite ? context.sprite.x : 0;
        },
        
        motion_yposition: (block, context) => {
            return context.sprite ? context.sprite.y : 0;
        },
        
        motion_direction: (block, context) => {
            return context.sprite ? context.sprite.direction : 90;
        },
        
        // Looks
        looks_costumenumbername: (block, context) => {
            return context.sprite ? context.sprite.costumeIndex : 1;
        },
        
        looks_costumename: (block, context) => {
            return context.sprite ? context.sprite.costumeName : '';
        },
        
        looks_size: (block, context) => {
            return context.sprite ? context.sprite.size : 100;
        },
        
        // Sound
        sound_volume: (block, context) => {
            return context.sprite ? context.sprite.volume : 100;
        },
        
        // Sensing
        sensing_timer: (block, context) => {
            return this.clock;
        },
        
        sensing_current: (block, context) => {
            const currentMenu = block.fields.CURRENTMENU ? this.evaluate(block.fields.CURRENTMENU, context) : '';
            switch (currentMenu) {
                case 'YEAR': return new Date().getFullYear();
                case 'MONTH': return new Date().getMonth() + 1;
                case 'DATE': return new Date().getDate();
                case 'DAYOFWEEK': return new Date().getDay();
                case 'HOUR': return new Date().getHours();
                case 'MINUTE': return new Date().getMinutes();
                case 'SECOND': return new Date().getSeconds();
                default: return '';
            }
        },
        
        sensing_dayssince2000: (block, context) => {
            const now = new Date();
            const start = new Date(2000, 0, 1);
            return Math.floor((now - start) / (1000 * 60 * 60 * 24));
        },
        
        sensing_username: (block, context) => {
            return this.username || '';
        },
        
        // Variables
        data_variable: (block, context) => {
            const variable = block.fields.VARIABLE ? this.evaluate(block.fields.VARIABLE, context) : '';
            return this.getVariable(variable, context);
        },
        
        // Lists
        data_listcontents: (block, context) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, context) : '';
            return this.getList(list, context);
        },
        
        data_listindexall: (block, context) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, context) : '';
            return this.getListLength(list, context);
        },
        
        data_itemoflist: (block, context) => {
            const list = block.fields.LIST ? this.evaluate(block.fields.LIST, context) : '';
            const index = block.inputs.INDEX ? this.evaluate(block.inputs.INDEX, context) : 1;
            return this.getListItem(list, index, context);
        }
    };

    // Function handlers for Vibe Code functions
    functionHandlers = {
        // Math functions
        abs: (context, x) => Math.abs(x),
        floor: (context, x) => Math.floor(x),
        ceil: (context, x) => Math.ceil(x),
        sqrt: (context, x) => Math.sqrt(x),
        sin: (context, x) => Math.sin(x * Math.PI / 180),
        cos: (context, x) => Math.cos(x * Math.PI / 180),
        tan: (context, x) => Math.tan(x * Math.PI / 180),
        asin: (context, x) => Math.asin(x) * 180 / Math.PI,
        acos: (context, x) => Math.acos(x) * 180 / Math.PI,
        atan: (context, x) => Math.atan(x) * 180 / Math.PI,
        ln: (context, x) => Math.log(x),
        log: (context, x) => Math.log10(x),
        pow: (context, base, exponent) => Math.pow(base, exponent),
        
        // String functions
        length: (context, str) => str ? str.length : 0,
        join: (context, ...parts) => parts.join(''),
        letter: (context, index, str) => str ? str.charAt(index - 1) : '',
        contains: (context, str, substr) => str ? str.includes(substr) : false,
        
        // Random
        random: (context, min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        
        // Trigonometry
        degreesToRadians: (context, degrees) => degrees * Math.PI / 180,
        radiansToDegrees: (context, radians) => radians * 180 / Math.PI
    };

    // Helper methods
    findSprite(name) {
        // In a real implementation, we'd search through all sprites
        return null;
    }

    checkCollision(sprite1, sprite2) {
        // In a real implementation, we'd check if the sprites are touching
        return false;
    }

    checkColorCollision(sprite, color) {
        // In a real implementation, we'd check if the sprite is touching the color
        return false;
    }

    isKeyPressed(key) {
        // In a real implementation, we'd check the keyboard state
        return false;
    }

    isMouseClicked() {
        // In a real implementation, we'd check the mouse state
        return false;
    }

    get mouseX() {
        // In a real implementation, we'd return the mouse X position
        return 0;
    }

    get mouseY() {
        // In a real implementation, we'd return the mouse Y position
        return 0;
    }

    // List operations
    getList(name, context) {
        // In a real implementation, we'd get the list from the context
        return [];
    }

    addToList(name, item, context) {
        // In a real implementation, we'd add to the list
    }

    deleteFromList(name, index, context) {
        // In a real implementation, we'd delete from the list
    }

    clearList(name, context) {
        // In a real implementation, we'd clear the list
    }

    insertIntoList(name, index, item, context) {
        // In a real implementation, we'd insert into the list
    }

    replaceInList(name, index, item, context) {
        // In a real implementation, we'd replace in the list
    }

    getListItem(name, index, context) {
        // In a real implementation, we'd get the list item
        return null;
    }

    getListLength(name, context) {
        // In a real implementation, we'd get the list length
        return 0;
    }

    listContains(name, item, context) {
        // In a real implementation, we'd check if the list contains the item
        return false;
    }

    // Get statistics
    getStats() {
        return {
            running: this.running,
            paused: this.paused,
            debugMode: this.debugMode,
            threads: this.threads.length,
            activeScripts: this.activeScripts.size,
            fps: this.fps,
            clock: this.clock,
            frameCount: this.frameCount
        };
    }
}

// Create virtual machine instance
const virtualMachine = new VirtualMachine();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.VirtualMachine = virtualMachine;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = virtualMachine;
}
