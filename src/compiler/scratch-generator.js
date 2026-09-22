// Scratch Generator Module
// Converts AST to Scratch block format (project.json)

class ScratchGenerator {
    constructor() {
        this.project = null;
        this.currentSprite = null;
        this.currentScript = null;
        this.blockIdCounter = 0;
        this.variableIdCounter = 0;
        this.listIdCounter = 0;
        this.broadcastIdCounter = 0;
        this.blocks = {};
        this.variables = {};
        this.lists = {};
        this.broadcasts = {};
        this.scripts = {};
    }

    // Generate a Scratch project from AST
    generate(ast) {
        this.reset();
        
        if (!ast || !ast.type) {
            throw new Error('Invalid AST: No root node');
        }

        // Create project structure
        this.project = {
            target: [],
            monitor: [],
            broadcast: [],
            comment: [],
            extension: [],
            meta: {
                semver: '3.0.0',
                vm: '0.2.0',
                agent: ''
            }
        };

        // Process the AST
        this.processNode(ast);

        // Sort and format the output
        this.formatProject();

        return this.project;
    }

    // Reset the generator
    reset() {
        this.project = null;
        this.currentSprite = null;
        this.currentScript = null;
        this.blockIdCounter = 0;
        this.variableIdCounter = 0;
        this.listIdCounter = 0;
        this.broadcastIdCounter = 0;
        this.blocks = {};
        this.variables = {};
        this.lists = {};
        this.broadcasts = {};
        this.scripts = {};
    }

    // Process a node
    processNode(node) {
        if (!node) return;

        switch (node.type) {
            case 'Program':
                this.processProgram(node);
                break;
            case 'SpriteDeclaration':
                this.processSprite(node);
                break;
            case 'StageDeclaration':
                this.processStage(node);
                break;
            case 'SceneDeclaration':
                this.processScene(node);
                break;
            case 'Script':
                this.processScript(node);
                break;
            case 'Event':
                this.processEvent(node);
                break;
            case 'Block':
                this.processBlock(node);
                break;
            case 'VariableDeclaration':
                this.processVariableDeclaration(node);
                break;
            case 'ListDeclaration':
                this.processListDeclaration(node);
                break;
            case 'BroadcastStatement':
                this.processBroadcast(node);
                break;
            case 'FunctionDeclaration':
                this.processFunction(node);
                break;
            default:
                console.warn(`Unknown node type: ${node.type}`);
                break;
        }

        // Process children
        if (node.children) {
            node.children.forEach(child => this.processNode(child));
        }
    }

    // Process program node
    processProgram(program) {
        // Process all declarations
        if (program.declarations) {
            program.declarations.forEach(declaration => {
                this.processNode(declaration);
            });
        }

        // Process imports
        if (program.imports) {
            program.imports.forEach(importNode => {
                // Imports are handled separately
            });
        }
    }

    // Process sprite declaration
    processSprite(spriteNode) {
        const sprite = {
            isStage: false,
            name: spriteNode.name,
            variables: {},
            lists: {},
            broadcasts: {},
            blocks: {},
            comments: {},
            currentCostume: 0,
            costumes: [],
            sounds: [],
            volume: 100,
            layerOrder: 0,
            visible: true,
            x: 0,
            y: 0,
            size: 100,
            direction: 90,
            draggable: false,
            rotationStyle: 'all around'
        };

        // Generate ID
        sprite.id = UUID.generate();

        // Process costumes
        if (spriteNode.costumes && spriteNode.costumes.length > 0) {
            sprite.costumes = spriteNode.costumes.map((costume, index) => {
                return {
                    name: costume.name,
                    bitmapResolution: 2,
                    dataFormat: 'png',
                    assetId: UUID.generate(),
                    md5ext: UUID.generateShort(),
                    rotationCenterX: costume.properties?.rotationCenterX || 0,
                    rotationCenterY: costume.properties?.rotationCenterY || 0
                };
            });
        } else {
            // Default costume
            sprite.costumes = [{
                name: `${spriteNode.name}-costume1`,
                bitmapResolution: 2,
                dataFormat: 'svg',
                assetId: UUID.generate(),
                md5ext: UUID.generateShort(),
                rotationCenterX: 48,
                rotationCenterY: 50
            }];
        }

        // Process sounds
        if (spriteNode.sounds && spriteNode.sounds.length > 0) {
            sprite.sounds = spriteNode.sounds.map(sound => {
                return {
                    name: sound.name,
                    dataFormat: 'wav',
                    assetId: UUID.generate(),
                    md5ext: UUID.generateShort(),
                    rate: 44100,
                    sampleCount: 0
                };
            });
        }

        // Process variables
        if (spriteNode.variables && spriteNode.variables.length > 0) {
            spriteNode.variables.forEach(varNode => {
                this.processVariableDeclaration(varNode, sprite);
            });
        }

        // Process lists
        if (spriteNode.lists && spriteNode.lists.length > 0) {
            spriteNode.lists.forEach(listNode => {
                this.processListDeclaration(listNode, sprite);
            });
        }

        // Process scripts
        if (spriteNode.scripts && spriteNode.scripts.length > 0) {
            this.currentSprite = sprite;
            spriteNode.scripts.forEach(scriptNode => {
                this.processScript(scriptNode, sprite);
            });
            this.currentSprite = null;
        }

        // Add to project
        this.project.target.push(sprite);
    }

    // Process stage declaration
    processStage(stageNode) {
        const stage = {
            isStage: true,
            name: 'Stage',
            variables: {},
            lists: {},
            broadcasts: {},
            blocks: {},
            comments: {},
            currentCostume: 0,
            costumes: [],
            sounds: [],
            volume: 100,
            layerOrder: -1,
            tempo: 60,
            videoAlpha: 0.5
        };

        // Generate ID
        stage.id = UUID.generate();

        // Process backdrops (costumes for stage)
        if (stageNode.backdrops && stageNode.backdrops.length > 0) {
            stage.costumes = stageNode.backdrops.map((backdrop, index) => {
                return {
                    name: backdrop.name,
                    bitmapResolution: 2,
                    dataFormat: 'png',
                    assetId: UUID.generate(),
                    md5ext: UUID.generateShort(),
                    rotationCenterX: backdrop.properties?.rotationCenterX || 240,
                    rotationCenterY: backdrop.properties?.rotationCenterY || 180
                };
            });
        } else {
            // Default backdrop
            stage.costumes = [{
                name: 'backdrop1',
                bitmapResolution: 2,
                dataFormat: 'svg',
                assetId: UUID.generate(),
                md5ext: UUID.generateShort(),
                rotationCenterX: 240,
                rotationCenterY: 180
            }];
        }

        // Process sounds
        if (stageNode.sounds && stageNode.sounds.length > 0) {
            stage.sounds = stageNode.sounds.map(sound => {
                return {
                    name: sound.name,
                    dataFormat: 'wav',
                    assetId: UUID.generate(),
                    md5ext: UUID.generateShort(),
                    rate: 44100,
                    sampleCount: 0
                };
            });
        }

        // Process variables
        if (stageNode.variables && stageNode.variables.length > 0) {
            stageNode.variables.forEach(varNode => {
                this.processVariableDeclaration(varNode, stage);
            });
        }

        // Process lists
        if (stageNode.lists && stageNode.lists.length > 0) {
            stageNode.lists.forEach(listNode => {
                this.processListDeclaration(listNode, stage);
            });
        }

        // Process scripts
        if (stageNode.scripts && stageNode.scripts.length > 0) {
            this.currentSprite = stage;
            stageNode.scripts.forEach(scriptNode => {
                this.processScript(scriptNode, stage);
            });
            this.currentSprite = null;
        }

        // Add to project (stage should be first)
        this.project.target.unshift(stage);
    }

    // Process scene declaration
    processScene(sceneNode) {
        // Scenes are converted to backdrops in Scratch
        // We'll process the scene as a backdrop change
        if (sceneNode.backdrop) {
            // Add the backdrop to the stage
            const stage = this.project.target.find(t => t.isStage);
            if (stage) {
                const backdrop = {
                    name: sceneNode.name,
                    bitmapResolution: 2,
                    dataFormat: 'png',
                    assetId: UUID.generate(),
                    md5ext: UUID.generateShort(),
                    rotationCenterX: 240,
                    rotationCenterY: 180
                };
                stage.costumes.push(backdrop);
            }
        }

        // Process sprites in the scene
        if (sceneNode.sprites && sceneNode.sprites.length > 0) {
            sceneNode.sprites.forEach(spriteNode => {
                this.processNode(spriteNode);
            });
        }

        // Process scripts in the scene
        if (sceneNode.scripts && sceneNode.scripts.length > 0) {
            sceneNode.scripts.forEach(scriptNode => {
                // Scene scripts are added to the stage
                const stage = this.project.target.find(t => t.isStage);
                if (stage) {
                    this.currentSprite = stage;
                    this.processScript(scriptNode, stage);
                    this.currentSprite = null;
                }
            });
        }
    }

    // Process script
    processScript(scriptNode, target) {
        if (!target) {
            target = this.currentSprite;
        }

        if (!target) {
            console.warn('No target for script');
            return;
        }

        // Create script object
        const script = {
            id: UUID.generate(),
            opcode: 'event_whenflagclicked',
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: {},
            topLevel: true,
            x: 0,
            y: 0
        };

        // Process event
        if (scriptNode.event) {
            this.processEvent(scriptNode.event, script);
        }

        // Process blocks
        if (scriptNode.blocks && scriptNode.blocks.length > 0) {
            this.currentScript = script;
            const firstBlock = scriptNode.blocks[0];
            this.processBlock(firstBlock, target, script);
            this.currentScript = null;
        }

        // Add to target
        target.blocks[script.id] = script;
    }

    // Process event
    processEvent(eventNode, script) {
        if (!script) return;

        switch (eventNode.type) {
            case 'green_flag':
                script.opcode = 'event_whenflagclicked';
                break;
            case 'key_pressed':
                script.opcode = 'event_whenkeypressed';
                script.fields.KEY_OPTION = eventNode.value || 'space';
                break;
            case 'mouse_clicked':
                script.opcode = 'event_whenclicked';
                break;
            case 'broadcast':
                script.opcode = 'event_whenbroadcastreceived';
                script.fields.BROADCAST_OPTION = eventNode.value || '';
                break;
            case 'when_clicked':
                script.opcode = 'event_whenthisspriteclicked';
                break;
            case 'when_cloned':
                script.opcode = 'event_whencloned';
                break;
            case 'when_backdrop_switches':
                script.opcode = 'event_whenbackdropswitchesto';
                script.fields.BACKDROP = eventNode.value || '';
                break;
            case 'when_loudness_gt':
                script.opcode = 'event_whenloudnessgreaterthan';
                script.fields.LOUDNESS = eventNode.value || 0;
                break;
            case 'when_timer_gt':
                script.opcode = 'event_whentimergreaterthan';
                script.fields.TIMER = eventNode.value || 0;
                break;
            default:
                script.opcode = 'event_whenflagclicked';
                break;
        }
    }

    // Process block
    processBlock(blockNode, target, parentBlock) {
        if (!target) {
            target = this.currentSprite;
        }

        if (!target) {
            console.warn('No target for block');
            return null;
        }

        // Create block object
        const block = {
            id: UUID.generate(),
            opcode: this.getScratchOpcode(blockNode.opcode || blockNode.type),
            next: null,
            parent: parentBlock ? parentBlock.id : null,
            inputs: {},
            fields: {},
            shadow: {},
            topLevel: false,
            x: 0,
            y: 0
        };

        // Store block for reference
        this.blocks[block.id] = block;

        // Process arguments
        if (blockNode.arguments && blockNode.arguments.length > 0) {
            blockNode.arguments.forEach((arg, index) => {
                const inputName = `ARG${index}`;
                if (arg.type === 'Literal') {
                    // Create shadow block for literals
                    const shadowId = UUID.generate();
                    const shadowBlock = {
                        id: shadowId,
                        opcode: this.getLiteralOpcode(arg.value),
                        next: null,
                        parent: null,
                        inputs: {},
                        fields: {},
                        shadow: true,
                        topLevel: false
                    };
                    
                    // Set value based on type
                    if (typeof arg.value === 'number') {
                        shadowBlock.fields.NUM = arg.value;
                    } else if (typeof arg.value === 'string') {
                        shadowBlock.fields.STRING = arg.value;
                    } else if (typeof arg.value === 'boolean') {
                        shadowBlock.fields.BOOL = arg.value;
                    }
                    
                    block.inputs[inputName] = {
                        name: inputName,
                        block: shadowId,
                        shadow: shadowId
                    };
                    
                    block.shadow[shadowId] = shadowBlock;
                } else {
                    // Process as nested block
                    const argBlock = this.processBlock(arg, target, block);
                    if (argBlock) {
                        block.inputs[inputName] = {
                            name: inputName,
                            block: argBlock.id,
                            shadow: argBlock.id
                        };
                    }
                }
            });
        }

        // Process fields
        if (blockNode.fields) {
            for (const [name, value] of Object.entries(blockNode.fields)) {
                block.fields[name] = value;
            }
        }

        // Add to target
        target.blocks[block.id] = block;

        // Link to parent
        if (parentBlock) {
            parentBlock.next = block.id;
        }

        // Process children (for control blocks)
        if (blockNode.children && blockNode.children.length > 0) {
            let previousChild = null;
            blockNode.children.forEach(child => {
                const childBlock = this.processBlock(child, target, block);
                if (childBlock) {
                    if (previousChild) {
                        previousChild.next = childBlock.id;
                    }
                    previousChild = childBlock;
                }
            });

            // Set the first child as the next block
            if (blockNode.children.length > 0) {
                block.next = blockNode.children[0].id;
            }
        }

        return block;
    }

    // Process variable declaration
    processVariableDeclaration(varNode, target) {
        if (!target) {
            target = this.currentSprite;
        }

        if (!target) {
            console.warn('No target for variable declaration');
            return;
        }

        const varId = UUID.generate();
        const variable = {
            id: varId,
            name: varNode.name,
            type: 'scalar',
            value: varNode.value || 0
        };

        // Add to target
        target.variables[varNode.name] = variable;

        // Track globally
        this.variables[varNode.name] = variable;

        // Add to project monitors if it's a global variable
        if (varNode.scope === 'global' || !target.isStage) {
            this.project.monitor.push({
                id: varId,
                target: target.id,
                variable: varNode.name,
                opcode: 'data_variable',
                fields: {
                    VARIABLE: varNode.name
                },
                sprite: target.name,
                width: 100,
                height: 30,
                x: 0,
                y: 0,
                visible: true
            });
        }
    }

    // Process list declaration
    processListDeclaration(listNode, target) {
        if (!target) {
            target = this.currentSprite;
        }

        if (!target) {
            console.warn('No target for list declaration');
            return;
        }

        const listId = UUID.generate();
        const list = {
            id: listId,
            name: listNode.name,
            type: 'list',
            value: listNode.items || []
        };

        // Add to target
        target.lists[listNode.name] = list;

        // Track globally
        this.lists[listNode.name] = list;
    }

    // Process broadcast
    processBroadcast(broadcastNode) {
        const broadcastId = UUID.generate();
        const broadcast = {
            id: broadcastId,
            name: broadcastNode.message ? broadcastNode.message.value : 'message1',
            opcode: 'event_broadcast'
        };

        // Add to project
        this.project.broadcast.push(broadcast);

        // Track globally
        this.broadcasts[broadcast.name] = broadcast;
    }

    // Process function
    processFunction(funcNode) {
        // Scratch doesn't have traditional functions, but we can implement
        // them as custom blocks or broadcasts
        
        // For now, we'll create a broadcast for the function
        const broadcast = new AST.BroadcastStatementNode(funcNode.name);
        this.processBroadcast(broadcast);

        // The function body will be processed as a script
        if (funcNode.body) {
            const script = new AST.ScriptNode();
            script.event = new AST.EventNode('broadcast', funcNode.start, funcNode.end);
            script.event.setValue(funcNode.name);
            
            // Add all blocks from the function body
            if (funcNode.body.blocks) {
                funcNode.body.blocks.forEach(block => {
                    script.addBlock(block);
                });
            }
            
            // Add to current sprite
            if (this.currentSprite) {
                this.processScript(script, this.currentSprite);
            }
        }
    }

    // Get Scratch opcode from Vibe opcode
    getScratchOpcode(vibeOpcode) {
        const opcodeMap = {
            // Motion
            'go_to': 'motion_goto',
            'go_to_object': 'motion_goto_object',
            'glide': 'motion_glide',
            'glide_to': 'motion_glide_to',
            'point_towards': 'motion_point_towards',
            'point_in_direction': 'motion_point_in_direction',
            'turn_right': 'motion_turn_right',
            'turn_left': 'motion_turn_left',
            'change_x': 'motion_change_x',
            'change_y': 'motion_change_y',
            'set_x': 'motion_set_x',
            'set_y': 'motion_set_y',
            'change_x_by': 'motion_change_x',
            'set_direction': 'motion_set_direction',
            'change_direction': 'motion_change_x', // Simplified
            
            // Looks
            'say': 'looks_say',
            'say_for': 'looks_say_for',
            'think': 'looks_think',
            'think_for': 'looks_think_for',
            'show': 'looks_show',
            'hide': 'looks_hide',
            'switch_costume': 'looks_switchcostumeto',
            'next_costume': 'looks_nextcostume',
            'change_effect': 'looks_change_effect',
            'set_effect': 'looks_set_effect',
            'clear_effects': 'looks_clear_effects',
            'change_size': 'looks_change_size',
            'set_size': 'looks_set_size',
            
            // Sound
            'play_sound': 'sound_play',
            'play_sound_until_done': 'sound_playuntildone',
            'stop_all_sounds': 'sound_stopallsounds',
            'stop_sound': 'sound_stop',
            'change_volume': 'sound_change_volume',
            'set_volume': 'sound_set_volume',
            
            // Control
            'wait': 'control_wait',
            'repeat': 'control_repeat',
            'forever': 'control_forever',
            'if': 'control_if',
            'if_else': 'control_if_else',
            'wait_until': 'control_wait_until',
            'repeat_until': 'control_repeat_until',
            'stop': 'control_stop',
            'broadcast': 'event_broadcast',
            'broadcast_and_wait': 'event_broadcastandwait',
            
            // Sensing
            'touching': 'sensing_touching_object',
            'touching_color': 'sensing_touching_color',
            'color_touching_color': 'sensing_color_touching_color',
            'key_pressed': 'sensing_keypressed',
            'mouse_down': 'sensing_mousedown',
            'mouse_x': 'sensing_mousex',
            'mouse_y': 'sensing_mousey',
            'distance_to': 'sensing_distance_to',
            
            // Operators
            'add': 'operator_add',
            'subtract': 'operator_subtract',
            'multiply': 'operator_multiply',
            'divide': 'operator_divide',
            'random': 'operator_random',
            'less_than': 'operator_lt',
            'greater_than': 'operator_gt',
            'equals': 'operator_equals',
            'and': 'operator_and',
            'or': 'operator_or',
            'not': 'operator_not',
            
            // Variables
            'set_variable': 'data_setvariableto',
            'change_variable': 'data_changevariableby',
            'variable': 'data_variable',
            
            // Lists
            'add_to_list': 'data_addtolist',
            'delete_of_list': 'data_deleteoflist',
            'delete_all_of_list': 'data_deletealloflist',
            'insert_at_list': 'data_insertatlist',
            'replace_item_of_list': 'data_replaceitemoflist',
            'item_of_list': 'data_itemoflist',
            'list_length': 'data_lengthoflist',
            'list_contains': 'data_listcontainsitem'
        };

        return opcodeMap[vibeOpcode] || vibeOpcode || 'control_noop';
    }

    // Get literal opcode
    getLiteralOpcode(value) {
        if (typeof value === 'number') {
            return 'math_number';
        } else if (typeof value === 'string') {
            return 'text';
        } else if (typeof value === 'boolean') {
            return 'boolean';
        }
        return 'text';
    }

    // Format the project
    formatProject() {
        if (!this.project) return;

        // Sort targets (stage first, then sprites)
        this.project.target.sort((a, b) => {
            if (a.isStage) return -1;
            if (b.isStage) return 1;
            return a.name.localeCompare(b.name);
        });

        // Add monitors for global variables
        for (const target of this.project.target) {
            if (target.isStage) {
                for (const [name, variable] of Object.entries(target.variables)) {
                    if (!this.project.monitor.some(m => m.variable === name)) {
                        this.project.monitor.push({
                            id: variable.id,
                            target: target.id,
                            variable: name,
                            opcode: 'data_variable',
                            fields: {
                                VARIABLE: name
                            },
                            sprite: target.name,
                            width: 100,
                            height: 30,
                            x: 0,
                            y: 0,
                            visible: true
                        });
                    }
                }
            }
        }
    }

    // Generate project.json string
    toJSON() {
        return JSON.stringify(this.project, null, 2);
    }

    // Generate project object
    toProject() {
        return this.project;
    }

    // Get block by ID
    getBlock(id) {
        for (const target of this.project.target) {
            if (target.blocks[id]) {
                return target.blocks[id];
            }
        }
        return null;
    }

    // Get variable by name
    getVariable(name) {
        return this.variables[name];
    }

    // Get list by name
    getList(name) {
        return this.lists[name];
    }

    // Get broadcast by name
    getBroadcast(name) {
        return this.broadcasts[name];
    }

    // Get all blocks
    getAllBlocks() {
        const allBlocks = [];
        for (const target of this.project.target) {
            for (const [id, block] of Object.entries(target.blocks)) {
                allBlocks.push(block);
            }
        }
        return allBlocks;
    }

    // Get all variables
    getAllVariables() {
        return Object.values(this.variables);
    }

    // Get all lists
    getAllLists() {
        return Object.values(this.lists);
    }

    // Get all broadcasts
    getAllBroadcasts() {
        return Object.values(this.broadcasts);
    }

    // Validate the project
    validate() {
        const errors = [];
        const warnings = [];

        if (!this.project) {
            errors.push('No project generated');
            return { valid: false, errors, warnings };
        }

        // Check for stage
        const stage = this.project.target.find(t => t.isStage);
        if (!stage) {
            warnings.push('No stage found in project');
        }

        // Check each target
        for (const target of this.project.target) {
            // Check name
            if (!target.name) {
                errors.push(`Target has no name`);
            }

            // Check costumes
            if (!target.costumes || target.costumes.length === 0) {
                warnings.push(`Target "${target.name}" has no costumes`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Create Scratch generator instance
const scratchGenerator = new ScratchGenerator();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ScratchGenerator = scratchGenerator;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = scratchGenerator;
}
