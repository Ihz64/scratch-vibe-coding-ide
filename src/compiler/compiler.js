/**
 * Scratch Vibe Coding IDE - Compiler
 * Compiles Vibe Code to Scratch Project Format
 */

// ============================================
// Compiler Configuration
// ============================================

const CompilerConfig = {
    strictMode: true,
    optimizationLevel: 'basic',
    targetFormat: 'scratch3'
};

// ============================================
// Compiler State
// ============================================

const CompilerState = {
    project: null,
    currentSprite: null,
    currentScene: null,
    variables: new Map(),
    broadcasts: new Set(),
    functions: new Map(),
    errors: [],
    warnings: [],
    line: 1,
    column: 1
};

// ============================================
// Compiler Class
// ============================================

class Compiler {
    constructor(project) {
        this.project = project;
        this.initState();
    }
    
    initState() {
        CompilerState.project = this.project;
        CompilerState.currentSprite = null;
        CompilerState.currentScene = null;
        CompilerState.variables = new Map();
        CompilerState.broadcasts = new Set();
        CompilerState.functions = new Map();
        CompilerState.errors = [];
        CompilerState.warnings = [];
        CompilerState.line = 1;
        CompilerState.column = 1;
    }
    
    // ============================================
    // Main Compile Method
    // ============================================
    
    static compile(project) {
        const compiler = new Compiler(project);
        return compiler.compile();
    }
    
    compile() {
        console.log('Compiling project:', this.project.name);
        
        // Parse all files
        const asts = this.parseAllFiles();
        
        // Validate
        this.validate(asts);
        
        // If there are errors, return early
        if (CompilerState.errors.length > 0) {
            return {
                success: false,
                project: null,
                errors: CompilerState.errors,
                warnings: CompilerState.warnings
            };
        }
        
        // Generate Scratch project
        const scratchProject = this.generateScratchProject(asts);
        
        return {
            success: true,
            project: scratchProject,
            errors: CompilerState.errors,
            warnings: CompilerState.warnings
        };
    }
    
    // ============================================
    // Parsing
    // ============================================
    
    parseAllFiles() {
        const asts = [];
        
        if (!this.project.files) {
            return asts;
        }
        
        for (const file of this.project.files) {
            try {
                const ast = parse(file.content);
                ast.fileId = file.id;
                ast.fileName = file.name;
                ast.fileType = file.type;
                asts.push(ast);
            } catch (error) {
                this.addError(error.message, file.name, 0, 0);
            }
        }
        
        return asts;
    }
    
    // ============================================
    // Validation
    // ============================================
    
    validate(asts) {
        // Validate each AST
        for (const ast of asts) {
            this.validateAST(ast);
        }
        
        // Check for undefined references
        this.checkReferences(asts);
    }
    
    validateAST(ast) {
        this.traverseAST(ast, (node) => {
            switch (node.type) {
                case NodeType.SPRITE_DECLARATION:
                    this.validateSprite(node);
                    break;
                case NodeType.SCENE_DECLARATION:
                    this.validateScene(node);
                    break;
                case NodeType.VARIABLE_DECLARATION:
                    this.validateVariableDeclaration(node);
                    break;
                case NodeType.FUNCTION_DECLARATION:
                    this.validateFunctionDeclaration(node);
                    break;
                case NodeType.EVENT_DECLARATION:
                    this.validateEventDeclaration(node);
                    break;
                case NodeType.IDENTIFIER:
                    this.validateIdentifier(node);
                    break;
                case NodeType.CALL_EXPRESSION:
                    this.validateCallExpression(node);
                    break;
                default:
                    // Other node types don't need validation
                    break;
            }
        });
    }
    
    validateSprite(node) {
        // Check for duplicate sprite names
        if (this.getSprite(node.name)) {
            this.addError(`Sprite "${node.name}" ist bereits definiert`, node.name, node.loc.start.line, node.loc.start.column);
        }
    }
    
    validateScene(node) {
        // Check for duplicate scene names
        if (this.getScene(node.name)) {
            this.addError(`Szene "${node.name}" ist bereits definiert`, node.name, node.loc.start.line, node.loc.start.column);
        }
    }
    
    validateVariableDeclaration(node) {
        // Check for duplicate variable names in current scope
        const currentScope = CompilerState.currentSprite || CompilerState.currentScene || 'global';
        const varKey = `${currentScope}:${node.name}`;
        
        if (CompilerState.variables.has(varKey)) {
            this.addError(`Variable "${node.name}" ist bereits in diesem Bereich definiert`, 
                node.name, node.loc.start.line, node.loc.start.column);
        }
        
        // Add to variables map
        CompilerState.variables.set(varKey, node);
    }
    
    validateFunctionDeclaration(node) {
        // Check for duplicate function names
        if (CompilerState.functions.has(node.name)) {
            this.addError(`Funktion "${node.name}" ist bereits definiert`, 
                node.name, node.loc.start.line, node.loc.start.column);
        }
        
        // Add to functions map
        CompilerState.functions.set(node.name, node);
    }
    
    validateEventDeclaration(node) {
        // Add broadcast to set
        if (node.type === 'broadcast') {
            CompilerState.broadcasts.add(node.condition.value);
        }
    }
    
    validateIdentifier(node) {
        // Check if identifier is defined
        const currentScope = CompilerState.currentSprite || CompilerState.currentScene || 'global';
        const varKey = `${currentScope}:${node.name}`;
        
        if (!CompilerState.variables.has(varKey) && 
            !CompilerState.functions.has(node.name) &&
            !this.isBuiltIn(node.name)) {
            this.addWarning(`Unbekannter Bezeichner: "${node.name}"`, 
                node.name, node.loc.start.line, node.loc.start.column);
        }
    }
    
    validateCallExpression(node) {
        // Check if function exists
        if (!CompilerState.functions.has(node.callee) && 
            !this.isBuiltIn(node.callee)) {
            this.addWarning(`Unbekannte Funktion: "${node.callee}"`, 
                node.callee, node.loc.start.line, node.loc.start.column);
        }
    }
    
    isBuiltIn(name) {
        // Check if this is a built-in function or variable
        const builtIns = [
            // Sprite properties
            'x', 'y', 'size', 'direction', 'rotation', 'visibility', 'costume',
            // Stage properties
            'width', 'height',
            // Math functions
            'abs', 'floor', 'ceil', 'round', 'sqrt', 'random',
            // String functions
            'length', 'concat', 'substring',
            // List functions
            'add', 'remove', 'contains', 'index', 'length',
            // Scratch-specific
            'green_flag', 'key_pressed', 'mouse_down', 'mouse_up', 'edge',
            'touches', 'touching', 'distance_to', 'point_towards',
            'go_to', 'glide_to', 'change_x', 'change_y', 'set_x', 'set_y',
            'change_size', 'set_size', 'show', 'hide', 'say', 'think',
            'play_sound', 'stop_sound', 'next_costume', 'switch_costume',
            'broadcast', 'wait', 'repeat', 'forever', 'if', 'else',
            // Game-specific
            'score', 'lives', 'health', 'damage', 'heal', 'game_over'
        ];
        
        return builtIns.includes(name);
    }
    
    checkReferences(asts) {
        // Check for references to undefined sprites, scenes, etc.
        for (const ast of asts) {
            this.traverseAST(ast, (node) => {
                if (node.type === NodeType.CALL_EXPRESSION) {
                    // Check for sprite references
                    if (node.callee === 'touches' || node.callee === 'touching' || node.callee === 'distance_to') {
                        if (node.arguments && node.arguments.length > 0) {
                            const arg = node.arguments[0];
                            if (arg.type === NodeType.IDENTIFIER) {
                                if (!this.getSprite(arg.name) && !this.getScene(arg.name)) {
                                    this.addWarning(`Unbekanntes Sprite oder Szene: "${arg.name}"`, 
                                        arg.name, arg.loc.start.line, arg.loc.start.column);
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    // ============================================
    // Scratch Project Generation
    // ============================================
    
    generateScratchProject(asts) {
        const scratchProject = {
            objName: this.project.name || 'Unbenanntes Projekt',
            editorData: {
                stage: {
                    costumes: [],
                    sounds: [],
                    code: []
                },
                sprites: [],
                variables: [],
                lists: [],
                broadcasts: []
            },
            meta: {
                semver: '3.0.0',
                vm: '0.2.0-prerelease.20210419103757',
                agent: 'Scratch Vibe Coding IDE'
            }
        };
        
        // Process each AST
        for (const ast of asts) {
            this.processAST(ast, scratchProject);
        }
        
        // Add default stage costume if none exists
        if (scratchProject.editorData.stage.costumes.length === 0) {
            scratchProject.editorData.stage.costumes.push({
                name: 'backdrop1',
                data: this.createEmptyCostume()
            });
        }
        
        // Convert broadcasts set to array
        scratchProject.editorData.broadcasts = Array.from(CompilerState.broadcasts).map(name => ({
            name: name,
            id: this.generateId()
        }));
        
        return scratchProject;
    }
    
    processAST(ast, scratchProject) {
        for (const node of ast.body) {
            switch (node.type) {
                case NodeType.SPRITE_DECLARATION:
                    this.processSprite(node, scratchProject);
                    break;
                case NodeType.SCENE_DECLARATION:
                    this.processScene(node, scratchProject);
                    break;
                case NodeType.VARIABLE_DECLARATION:
                    this.processVariableDeclaration(node, scratchProject);
                    break;
                case NodeType.EVENT_DECLARATION:
                    this.processEventDeclaration(node, scratchProject);
                    break;
                case NodeType.EXPRESSION_STATEMENT:
                    // Global expressions (like variable assignments)
                    this.processExpressionStatement(node, scratchProject);
                    break;
                default:
                    this.addWarning(`Unbekannter Node-Typ: ${node.type}`, 
                        node.type, node.loc.start.line, node.loc.start.column);
            }
        }
    }
    
    processSprite(node, scratchProject) {
        // Create Scratch sprite
        const sprite = {
            name: node.name,
            id: this.generateId(),
            costumes: [],
            sounds: [],
            code: [],
            visible: true,
            x: 0,
            y: 0,
            size: 100,
            direction: 90,
            rotation: 0
        };
        
        // Add costumes
        if (node.costumes && node.costumes.length > 0) {
            node.costumes.forEach(costumeName => {
                sprite.costumes.push({
                    name: costumeName,
                    data: this.createEmptyCostume()
                });
            });
        } else {
            // Default costume
            sprite.costumes.push({
                name: `${node.name}_costume1`,
                data: this.createEmptyCostume()
            });
        }
        
        // Process sprite body
        this.processSpriteBody(node, sprite);
        
        // Add to project
        scratchProject.editorData.sprites.push(sprite);
        
        // Remember current sprite
        const previousSprite = CompilerState.currentSprite;
        CompilerState.currentSprite = node.name;
        
        // Process events
        for (const event of node.events || []) {
            this.processEventDeclaration(event, scratchProject, sprite);
        }
        
        // Process methods
        for (const method of node.methods || []) {
            this.processFunctionDeclaration(method, scratchProject, sprite);
        }
        
        // Restore previous sprite
        CompilerState.currentSprite = previousSprite;
    }
    
    processSpriteBody(node, sprite) {
        // Process statements in sprite body
        for (const statement of node.body || []) {
            switch (statement.type) {
                case NodeType.VARIABLE_DECLARATION:
                    this.processVariableDeclaration(statement, null, sprite);
                    break;
                case NodeType.EXPRESSION_STATEMENT:
                    this.processExpressionStatement(statement, null, sprite);
                    break;
                default:
                    this.addWarning(`Unbekannte Anweisung im Sprite: ${statement.type}`, 
                        statement.type, statement.loc.start.line, statement.loc.start.column);
            }
        }
    }
    
    processScene(node, scratchProject) {
        // In Scratch, scenes are implemented as backdrops
        // For now, we'll create a backdrop for each scene
        
        const backdrop = {
            name: node.name,
            data: this.createEmptyCostume()
        };
        
        scratchProject.editorData.stage.costumes.push(backdrop);
        
        // Process scene code
        for (const statement of node.code || []) {
            switch (statement.type) {
                case NodeType.VARIABLE_DECLARATION:
                    this.processVariableDeclaration(statement, scratchProject);
                    break;
                case NodeType.EXPRESSION_STATEMENT:
                    this.processExpressionStatement(statement, scratchProject);
                    break;
                default:
                    this.addWarning(`Unbekannte Anweisung in Szene: ${statement.type}`, 
                        statement.type, statement.loc.start.line, statement.loc.start.column);
            }
        }
    }
    
    processVariableDeclaration(node, scratchProject, sprite = null) {
        const isGlobal = !sprite && !CompilerState.currentScene;
        const scope = sprite ? sprite.name : (CompilerState.currentScene || 'global');
        
        // In Scratch, variables are either global or sprite-specific
        const variable = {
            name: node.name,
            id: this.generateId(),
            value: this.evaluateExpression(node.value),
            isCloud: false,
            isPersistent: false
        };
        
        if (isGlobal) {
            // Check if already exists
            const existing = scratchProject.editorData.variables.find(v => v.name === node.name);
            if (!existing) {
                scratchProject.editorData.variables.push(variable);
            }
        } else if (sprite) {
            // Sprite-specific variable
            const spriteObj = scratchProject.editorData.sprites.find(s => s.name === sprite.name);
            if (spriteObj) {
                if (!spriteObj.variables) {
                    spriteObj.variables = [];
                }
                spriteObj.variables.push(variable);
            }
        }
    }
    
    processEventDeclaration(node, scratchProject, sprite = null) {
        // Create Scratch event blocks
        const blocks = [];
        
        // Handle different event types
        switch (node.type) {
            case 'green_flag':
                blocks.push(this.createWhenGreenFlagBlock(node, sprite));
                break;
            case 'clicked':
                if (sprite) {
                    blocks.push(this.createWhenClickedBlock(node, sprite));
                } else {
                    blocks.push(this.createWhenStageClickedBlock(node));
                }
                break;
            case 'key_pressed':
                blocks.push(this.createWhenKeyPressedBlock(node, sprite));
                break;
            case 'broadcast':
                blocks.push(this.createWhenReceiveBlock(node, sprite));
                break;
            default:
                this.addWarning(`Unbekannter Event-Typ: ${node.type}`, 
                    node.type, node.loc.start.line, node.loc.start.column);
        }
        
        // Add blocks to the appropriate place
        if (sprite) {
            sprite.code.push(...blocks);
        } else {
            scratchProject.editorData.stage.code.push(...blocks);
        }
        
        // Process event body
        for (const statement of node.body || []) {
            this.processStatementInBlock(statement, blocks[0]);
        }
    }
    
    processFunctionDeclaration(node, scratchProject, sprite = null) {
        // In Scratch, functions are implemented as custom blocks
        // For now, we'll convert them to regular code
        
        // Create a custom block definition
        const customBlock = {
            opcode: `custom_${node.name}`,
            blockType: 'command',
            text: `define ${node.name}`,
            arguments: node.parameters.map(param => ({
                name: param.name,
                type: 'string'
            }))
        };
        
        // For simplicity, we'll just process the function body as regular code
        // In a real implementation, this would create a proper custom block
        if (sprite) {
            sprite.code.push(customBlock);
        } else {
            scratchProject.editorData.stage.code.push(customBlock);
        }
    }
    
    processStatementInBlock(statement, block) {
        // Convert statement to Scratch blocks
        const scratchBlocks = this.statementToScratch(statement);
        
        if (block) {
            if (!block.next) {
                block.next = scratchBlocks[0];
            }
            
            // Chain blocks
            for (let i = 0; i < scratchBlocks.length - 1; i++) {
                scratchBlocks[i].next = scratchBlocks[i + 1];
            }
        }
    }
    
    processExpressionStatement(node, scratchProject, sprite = null) {
        // Handle global variable assignments, etc.
        if (node.expression.type === NodeType.ASSIGNMENT) {
            // Process as variable assignment
            const target = node.expression.left;
            const value = node.expression.right;
            
            if (target.type === NodeType.IDENTIFIER) {
                // Find the variable and update it
                const isGlobal = !sprite && !CompilerState.currentScene;
                
                if (isGlobal) {
                    const variable = scratchProject.editorData.variables.find(v => v.name === target.name);
                    if (variable) {
                        variable.value = this.evaluateExpression(value);
                    }
                } else if (sprite) {
                    const spriteObj = scratchProject.editorData.sprites.find(s => s.name === sprite.name);
                    if (spriteObj && spriteObj.variables) {
                        const variable = spriteObj.variables.find(v => v.name === target.name);
                        if (variable) {
                            variable.value = this.evaluateExpression(value);
                        }
                    }
                }
            }
        }
    }
    
    // ============================================
    // Statement to Scratch Block Conversion
    // ============================================
    
    statementToScratch(statement) {
        const blocks = [];
        
        switch (statement.type) {
            case NodeType.EXPRESSION_STATEMENT:
                blocks.push(...this.expressionToScratch(statement.expression));
                break;
            case NodeType.IF_STATEMENT:
                blocks.push(...this.ifToScratch(statement));
                break;
            case NodeType.WHILE_STATEMENT:
                blocks.push(...this.whileToScratch(statement));
                break;
            case NodeType.FOREVER_STATEMENT:
                blocks.push(...this.foreverToScratch(statement));
                break;
            case NodeType.REPEAT_STATEMENT:
                blocks.push(...this.repeatToScratch(statement));
                break;
            case NodeType.UNTIL_STATEMENT:
                blocks.push(...this.untilToScratch(statement));
                break;
            case NodeType.BROADCAST_STATEMENT:
                blocks.push(this.broadcastToScratch(statement));
                break;
            case NodeType.VARIABLE_DECLARATION:
                blocks.push(...this.variableDeclarationToScratch(statement));
                break;
            case NodeType.RETURN_STATEMENT:
                blocks.push(...this.returnToScratch(statement));
                break;
            case NodeType.BREAK_STATEMENT:
                blocks.push(this.breakToScratch(statement));
                break;
            case NodeType.CONTINUE_STATEMENT:
                blocks.push(this.continueToScratch(statement));
                break;
            default:
                this.addWarning(`Unbekannte Anweisung: ${statement.type}`, 
                    statement.type, statement.loc.start.line, statement.loc.start.column);
        }
        
        return blocks;
    }
    
    expressionToScratch(expression) {
        const blocks = [];
        
        switch (expression.type) {
            case NodeType.CALL_EXPRESSION:
                blocks.push(...this.callToScratch(expression));
                break;
            case NodeType.BINARY_EXPRESSION:
                blocks.push(...this.binaryToScratch(expression));
                break;
            case NodeType.UNARY_EXPRESSION:
                blocks.push(...this.unaryToScratch(expression));
                break;
            case NodeType.IDENTIFIER:
                blocks.push(this.identifierToScratch(expression));
                break;
            case NodeType.LITERAL:
                blocks.push(this.literalToScratch(expression));
                break;
            case NodeType.MEMBER_EXPRESSION:
                blocks.push(...this.memberToScratch(expression));
                break;
            case NodeType.CONDITIONAL_EXPRESSION:
                blocks.push(...this.conditionalToScratch(expression));
                break;
            default:
                this.addWarning(`Unbekannter Ausdruck: ${expression.type}`, 
                    expression.type, expression.loc.start.line, expression.loc.start.column);
        }
        
        return blocks;
    }
    
    // ============================================
    // Block Creation Methods
    // ============================================
    
    createWhenGreenFlagBlock(node, sprite) {
        return {
            opcode: 'event_whenflagclicked',
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true
        };
    }
    
    createWhenClickedBlock(node, sprite) {
        return {
            opcode: 'event_whenthisspriteclicked',
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true
        };
    }
    
    createWhenStageClickedBlock(node) {
        return {
            opcode: 'event_whenstageclicked',
            next: null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true
        };
    }
    
    createWhenKeyPressedBlock(node, sprite) {
        return {
            opcode: 'event_whenkeypressed',
            next: null,
            parent: null,
            inputs: {},
            fields: {
                KEY_OPTION: {
                    name: 'KEY_OPTION',
                    value: node.condition ? node.condition.value : 'space'
                }
            },
            shadow: false,
            topLevel: true
        };
    }
    
    createWhenReceiveBlock(node, sprite) {
        return {
            opcode: 'event_whenbroadcastreceived',
            next: null,
            parent: null,
            inputs: {},
            fields: {
                BROADCAST_OPTION: {
                    name: 'BROADCAST_OPTION',
                    value: node.condition ? node.condition.value : ''
                }
            },
            shadow: false,
            topLevel: true
        };
    }
    
    ifToScratch(node) {
        const testBlock = this.expressionToScratch(node.test)[0];
        const thenBlocks = this.statementToScratch(node.consequent);
        const elseBlocks = node.alternate ? this.statementToScratch(node.alternate) : [];
        
        return [{
            opcode: 'control_if',
            next: thenBlocks.length > 0 ? thenBlocks[0] : null,
            parent: null,
            inputs: {
                CONDITION: {
                    name: 'CONDITION',
                    block: testBlock,
                    shadow: false
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        }, ...thenBlocks];
    }
    
    whileToScratch(node) {
        const testBlock = this.expressionToScratch(node.test)[0];
        const bodyBlocks = this.statementToScratch(node.body);
        
        return [{
            opcode: 'control_repeat_until',
            next: null,
            parent: null,
            inputs: {
                CONDITION: {
                    name: 'CONDITION',
                    block: testBlock,
                    shadow: false
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        }, ...bodyBlocks];
    }
    
    foreverToScratch(node) {
        const bodyBlocks = this.statementToScratch(node.body);
        
        return [{
            opcode: 'control_forever',
            next: bodyBlocks.length > 0 ? bodyBlocks[0] : null,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: false
        }, ...bodyBlocks];
    }
    
    repeatToScratch(node) {
        const countBlock = this.expressionToScratch(node.count)[0];
        const bodyBlocks = this.statementToScratch(node.body);
        
        return [{
            opcode: 'control_repeat',
            next: bodyBlocks.length > 0 ? bodyBlocks[0] : null,
            parent: null,
            inputs: {
                TIMES: {
                    name: 'TIMES',
                    block: countBlock,
                    shadow: false
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        }, ...bodyBlocks];
    }
    
    untilToScratch(node) {
        const testBlock = this.expressionToScratch(node.test)[0];
        const bodyBlocks = this.statementToScratch(node.body);
        
        return [{
            opcode: 'control_repeat_until',
            next: bodyBlocks.length > 0 ? bodyBlocks[0] : null,
            parent: null,
            inputs: {
                CONDITION: {
                    name: 'CONDITION',
                    block: testBlock,
                    shadow: false
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        }, ...bodyBlocks];
    }
    
    broadcastToScratch(node) {
        return {
            opcode: 'event_broadcast',
            next: null,
            parent: null,
            inputs: {
                BROADCAST_OPTION: {
                    name: 'BROADCAST_OPTION',
                    value: node.name
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        };
    }
    
    callToScratch(node) {
        const blocks = [];
        
        // Handle built-in functions
        switch (node.callee) {
            case 'go_to':
                blocks.push({
                    opcode: 'motion_goto',
                    next: null,
                    parent: null,
                    inputs: {
                        TO: {
                            name: 'TO',
                            value: node.arguments && node.arguments.length > 0 ? 
                                this.evaluateExpression(node.arguments[0]) : 'random'
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'change_x':
                blocks.push({
                    opcode: 'motion_changexby',
                    next: null,
                    parent: null,
                    inputs: {
                        DX: {
                            name: 'DX',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'number', value: 10 })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'change_y':
                blocks.push({
                    opcode: 'motion_changeyby',
                    next: null,
                    parent: null,
                    inputs: {
                        DY: {
                            name: 'DY',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'number', value: 10 })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'set_x':
                blocks.push({
                    opcode: 'motion_setx',
                    next: null,
                    parent: null,
                    inputs: {
                        X: {
                            name: 'X',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'number', value: 0 })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'set_y':
                blocks.push({
                    opcode: 'motion_sety',
                    next: null,
                    parent: null,
                    inputs: {
                        Y: {
                            name: 'Y',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'number', value: 0 })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'say':
                blocks.push({
                    opcode: 'looks_say',
                    next: null,
                    parent: null,
                    inputs: {
                        MESSAGE: {
                            name: 'MESSAGE',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'string', value: 'Hello!' })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'wait':
                blocks.push({
                    opcode: 'control_wait',
                    next: null,
                    parent: null,
                    inputs: {
                        DURATION: {
                            name: 'DURATION',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'number', value: 1 })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'random':
                blocks.push({
                    opcode: 'operator_random',
                    next: null,
                    parent: null,
                    inputs: {
                        FROM: {
                            name: 'FROM',
                            block: node.arguments && node.arguments.length > 0 ? 
                                this.expressionToScratch(node.arguments[0])[0] : this.literalToScratch({ type: 'number', value: 1 })
                        },
                        TO: {
                            name: 'TO',
                            block: node.arguments && node.arguments.length > 1 ? 
                                this.expressionToScratch(node.arguments[1])[0] : this.literalToScratch({ type: 'number', value: 10 })
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'touching':
                blocks.push({
                    opcode: 'sensing_touchingobject',
                    next: null,
                    parent: null,
                    inputs: {
                        TOUCHINGOBJECTMENU: {
                            name: 'TOUCHINGOBJECTMENU',
                            value: node.arguments && node.arguments.length > 0 ? 
                                node.arguments[0].value : ''
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'key':
                // This is handled specially in event declarations
                break;
            default:
                // Generic function call
                blocks.push({
                    opcode: 'custom_call',
                    next: null,
                    parent: null,
                    inputs: {
                        FUNCTION: {
                            name: 'FUNCTION',
                            value: node.callee
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
        }
        
        return blocks;
    }
    
    binaryToScratch(node) {
        const blocks = [];
        
        // Handle different operators
        switch (node.operator) {
            case '+':
                blocks.push({
                    opcode: 'operator_add',
                    next: null,
                    parent: null,
                    inputs: {
                        NUM1: {
                            name: 'NUM1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        NUM2: {
                            name: 'NUM2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '-':
                blocks.push({
                    opcode: 'operator_subtract',
                    next: null,
                    parent: null,
                    inputs: {
                        NUM1: {
                            name: 'NUM1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        NUM2: {
                            name: 'NUM2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '*':
                blocks.push({
                    opcode: 'operator_multiply',
                    next: null,
                    parent: null,
                    inputs: {
                        NUM1: {
                            name: 'NUM1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        NUM2: {
                            name: 'NUM2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '/':
                blocks.push({
                    opcode: 'operator_divide',
                    next: null,
                    parent: null,
                    inputs: {
                        NUM1: {
                            name: 'NUM1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        NUM2: {
                            name: 'NUM2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '=':
            case '==':
                blocks.push({
                    opcode: 'operator_equals',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '!=':
                blocks.push({
                    opcode: 'operator_not_equals',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '<':
                blocks.push({
                    opcode: 'operator_lt',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '>':
                blocks.push({
                    opcode: 'operator_gt',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'and':
            case '&&':
                blocks.push({
                    opcode: 'operator_and',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case 'or':
            case '||':
                blocks.push({
                    opcode: 'operator_or',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            block: this.expressionToScratch(node.left)[0]
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            block: this.expressionToScratch(node.right)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            default:
                this.addWarning(`Unbekannter Operator: ${node.operator}`, 
                    node.operator, node.loc.start.line, node.loc.start.column);
        }
        
        return blocks;
    }
    
    unaryToScratch(node) {
        const blocks = [];
        
        switch (node.operator) {
            case 'not':
            case '!':
                blocks.push({
                    opcode: 'operator_not',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND: {
                            name: 'OPERAND',
                            block: this.expressionToScratch(node.argument)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            case '-':
                blocks.push({
                    opcode: 'operator_negate',
                    next: null,
                    parent: null,
                    inputs: {
                        NUM: {
                            name: 'NUM',
                            block: this.expressionToScratch(node.argument)[0]
                        }
                    },
                    fields: {},
                    shadow: false,
                    topLevel: false
                });
                break;
            default:
                this.addWarning(`Unbekannter unärer Operator: ${node.operator}`, 
                    node.operator, node.loc.start.line, node.loc.start.column);
        }
        
        return blocks;
    }
    
    identifierToScratch(node) {
        return {
            opcode: 'data_variable',
            next: null,
            parent: null,
            inputs: {},
            fields: {
                VARIABLE: {
                    name: 'VARIABLE',
                    value: node.name
                }
            },
            shadow: false,
            topLevel: false
        };
    }
    
    literalToScratch(node) {
        switch (node.type) {
            case 'number':
                return {
                    opcode: 'operator_mathop',
                    next: null,
                    parent: null,
                    inputs: {
                        OPERAND1: {
                            name: 'OPERAND1',
                            value: node.value
                        },
                        OPERAND2: {
                            name: 'OPERAND2',
                            value: ''
                        }
                    },
                    fields: {
                        OPERATOR: {
                            name: 'OPERATOR',
                            value: ''
                        }
                    },
                    shadow: true,
                    topLevel: false
                };
            case 'string':
                return {
                    opcode: 'operator_join',
                    next: null,
                    parent: null,
                    inputs: {
                        STRING1: {
                            name: 'STRING1',
                            value: node.value
                        },
                        STRING2: {
                            name: 'STRING2',
                            value: ''
                        }
                    },
                    fields: {},
                    shadow: true,
                    topLevel: false
                };
            case 'boolean':
                return {
                    opcode: 'operator_boolean',
                    next: null,
                    parent: null,
                    inputs: {},
                    fields: {
                        BOOL: {
                            name: 'BOOL',
                            value: node.value ? 'true' : 'false'
                        }
                    },
                    shadow: true,
                    topLevel: false
                };
            default:
                return {
                    opcode: 'operator_mathop',
                    next: null,
                    parent: null,
                    inputs: {},
                    fields: {},
                    shadow: true,
                    topLevel: false
                };
        }
    }
    
    memberToScratch(node) {
        // Handle sprite properties
        if (node.object.type === NodeType.IDENTIFIER && node.object.name === 'this') {
            const propertyMap = {
                'x': 'motion_xposition',
                'y': 'motion_yposition',
                'direction': 'motion_direction',
                'size': 'looks_size',
                'costume': 'looks_costumenumbername',
                'visibility': 'looks_visible'
            };
            
            const opcode = propertyMap[node.property] || 'data_variable';
            
            return [{
                opcode: opcode,
                next: null,
                parent: null,
                inputs: {},
                fields: {},
                shadow: false,
                topLevel: false
            }];
        }
        
        // Handle other member expressions
        return [this.identifierToScratch(node.object)];
    }
    
    conditionalToScratch(node) {
        return [{
            opcode: 'operator_ternary',
            next: null,
            parent: null,
            inputs: {
                CONDITION: {
                    name: 'CONDITION',
                    block: this.expressionToScratch(node.test)[0]
                },
                THEN: {
                    name: 'THEN',
                    block: this.expressionToScratch(node.consequent)[0]
                },
                ELSE: {
                    name: 'ELSE',
                    block: this.expressionToScratch(node.alternate)[0]
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        }];
    }
    
    variableDeclarationToScratch(node) {
        // In Scratch, variable declarations are implicit
        // We just need to create the variable if it doesn't exist
        return [];
    }
    
    returnToScratch(node) {
        // Scratch doesn't have a return statement in the traditional sense
        // This would be handled differently in custom blocks
        return [];
    }
    
    breakToScratch(node) {
        return [{
            opcode: 'control_stop',
            next: null,
            parent: null,
            inputs: {
                STOP_OPTION: {
                    name: 'STOP_OPTION',
                    value: 'this script'
                }
            },
            fields: {},
            shadow: false,
            topLevel: false
        }];
    }
    
    continueToScratch(node) {
        // Scratch doesn't have a continue statement
        // This would need to be implemented with custom logic
        return [];
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    getSprite(name) {
        if (!CompilerState.project || !CompilerState.project.files) {
            return null;
        }
        
        for (const file of CompilerState.project.files) {
            if (file.type === 'sprite' && file.name === name) {
                return file;
            }
        }
        
        return null;
    }
    
    getScene(name) {
        if (!CompilerState.project || !CompilerState.project.files) {
            return null;
        }
        
        for (const file of CompilerState.project.files) {
            if ((file.type === 'scene' || file.type === 'level') && file.name === name) {
                return file;
            }
        }
        
        return null;
    }
    
    evaluateExpression(expression) {
        // Simple evaluation for constant expressions
        if (!expression) return null;
        
        switch (expression.type) {
            case NodeType.LITERAL:
                return expression.value;
            case NodeType.IDENTIFIER:
                return expression.name;
            case NodeType.BINARY_EXPRESSION:
                const left = this.evaluateExpression(expression.left);
                const right = this.evaluateExpression(expression.right);
                
                switch (expression.operator) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '%': return left % right;
                    default: return null;
                }
            default:
                return null;
        }
    }
    
    addError(message, file, line, column) {
        CompilerState.errors.push({
            message: message,
            file: file,
            line: line,
            column: column,
            severity: 'error'
        });
    }
    
    addWarning(message, file, line, column) {
        CompilerState.warnings.push({
            message: message,
            file: file,
            line: line,
            column: column,
            severity: 'warning'
        });
    }
    
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    createEmptyCostume() {
        // Return a base64 encoded empty image
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
    
    traverseAST(node, visitor) {
        if (!node) return;
        
        // Visit current node
        visitor(node);
        
        // Traverse children
        for (const key in node) {
            if (key === 'type' || key === 'loc' || key === 'fileId' || key === 'fileName' || key === 'fileType') {
                continue;
            }
            
            const value = node[key];
            if (Array.isArray(value)) {
                value.forEach(item => this.traverseAST(item, visitor));
            } else if (typeof value === 'object' && value !== null) {
                this.traverseAST(value, visitor);
            }
        }
    }
}

// ============================================
// Export
// ============================================

window.Compiler = Compiler;
window.CompilerConfig = CompilerConfig;
window.CompilerState = CompilerState;
