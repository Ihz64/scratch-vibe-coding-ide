/**
 * Scratch Vibe Coding IDE - Parser
 * Parses tokens into an Abstract Syntax Tree (AST)
 */

// ============================================
// AST Node Types
// ============================================

const NodeType = {
    // Program
    PROGRAM: 'Program',
    
    // Statements
    STATEMENT: 'Statement',
    BLOCK: 'Block',
    EXPRESSION_STATEMENT: 'ExpressionStatement',
    RETURN_STATEMENT: 'ReturnStatement',
    IF_STATEMENT: 'IfStatement',
    WHILE_STATEMENT: 'WhileStatement',
    FOR_STATEMENT: 'ForStatement',
    FOREVER_STATEMENT: 'ForeverStatement',
    REPEAT_STATEMENT: 'RepeatStatement',
    UNTIL_STATEMENT: 'UntilStatement',
    BREAK_STATEMENT: 'BreakStatement',
    CONTINUE_STATEMENT: 'ContinueStatement',
    
    // Declarations
    SPRITE_DECLARATION: 'SpriteDeclaration',
    SCENE_DECLARATION: 'SceneDeclaration',
    VARIABLE_DECLARATION: 'VariableDeclaration',
    FUNCTION_DECLARATION: 'FunctionDeclaration',
    
    // Events
    EVENT_DECLARATION: 'EventDeclaration',
    BROADCAST_STATEMENT: 'BroadcastStatement',
    
    // Expressions
    EXPRESSION: 'Expression',
    IDENTIFIER: 'Identifier',
    LITERAL: 'Literal',
    BINARY_EXPRESSION: 'BinaryExpression',
    UNARY_EXPRESSION: 'UnaryExpression',
    CALL_EXPRESSION: 'CallExpression',
    MEMBER_EXPRESSION: 'MemberExpression',
    CONDITIONAL_EXPRESSION: 'ConditionalExpression',
    
    // Patterns
    PATTERN: 'Pattern',
    
    // Comments
    COMMENT: 'Comment'
};

// ============================================
// Parser Class
// ============================================

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
        this.length = tokens.length;
        this.current = tokens[0];
        this.lookahead = tokens[1];
        
        // Context
        this.scope = new Scope();
        this.currentSprite = null;
        this.currentScene = null;
        this.currentFunction = null;
    }
    
    // ============================================
    // Main Methods
    // ============================================
    
    parse() {
        const program = new ASTNode(NodeType.PROGRAM, {
            body: []
        });
        
        // Parse until EOF
        while (!this.isEOF()) {
            const statement = this.parseStatement();
            if (statement) {
                program.body.push(statement);
            } else {
                this.advance();
            }
        }
        
        return program;
    }
    
    parseStatement() {
        const token = this.current;
        
        // Skip comments
        if (token.type === TokenType.COMMENT) {
            this.advance();
            return null;
        }
        
        // Skip newlines
        if (token.type === TokenType.NEWLINE) {
            this.advance();
            return null;
        }
        
        // Handle different statement types
        switch (token.type) {
            case TokenType.SPRITE:
                return this.parseSpriteDeclaration();
            case TokenType.KEYWORD:
                if (token.value === 'scene' || token.value === 'level') {
                    return this.parseSceneDeclaration();
                }
                if (token.value === 'var' || token.value === 'let' || token.value === 'const') {
                    return this.parseVariableDeclaration();
                }
                if (token.value === 'function' || token.value === 'def') {
                    return this.parseFunctionDeclaration();
                }
                if (token.value === 'if') {
                    return this.parseIfStatement();
                }
                if (token.value === 'while') {
                    return this.parseWhileStatement();
                }
                if (token.value === 'for') {
                    return this.parseForStatement();
                }
                if (token.value === 'forever') {
                    return this.parseForeverStatement();
                }
                if (token.value === 'repeat') {
                    return this.parseRepeatStatement();
                }
                if (token.value === 'until') {
                    return this.parseUntilStatement();
                }
                if (token.value === 'break') {
                    return this.parseBreakStatement();
                }
                if (token.value === 'continue') {
                    return this.parseContinueStatement();
                }
                if (token.value === 'return') {
                    return this.parseReturnStatement();
                }
                break;
            
            case TokenType.EVENT:
                if (token.value === 'on' || token.value === 'when') {
                    return this.parseEventDeclaration();
                }
                if (token.value === 'broadcast') {
                    return this.parseBroadcastStatement();
                }
                break;
            
            case TokenType.IDENTIFIER:
                // Could be a function call or expression statement
                return this.parseExpressionStatement();
            
            case TokenType.BOOLEAN:
            case TokenType.NUMBER:
            case TokenType.STRING:
            case TokenType.NULL:
                return this.parseExpressionStatement();
            
            default:
                // Try to parse as expression statement
                return this.parseExpressionStatement();
        }
        
        return null;
    }
    
    // ============================================
    // Declaration Parsers
    // ============================================
    
    parseSpriteDeclaration() {
        this.advance(); // Consume 'sprite'
        
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected sprite name');
        const name = nameToken.value;
        
        // Create sprite node
        const sprite = new ASTNode(NodeType.SPRITE_DECLARATION, {
            name: name,
            costumes: [],
            sounds: [],
            variables: [],
            events: [],
            methods: []
        });
        
        // Parse sprite body
        this.parseSpriteBody(sprite);
        
        return sprite;
    }
    
    parseSpriteBody(sprite) {
        // Save current sprite context
        const previousSprite = this.currentSprite;
        this.currentSprite = sprite.name;
        
        // Expect colon or newline
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after sprite declaration');
        }
        
        // Parse indented block
        this.parseIndentedBlock(() => {
            while (!this.isEOF() && !this.isEndOfBlock()) {
                const token = this.current;
                
                // Parse sprite properties
                if (token.type === TokenType.KEYWORD && token.value === 'costumes') {
                    this.parseSpriteCostumes(sprite);
                }
                // Parse events
                else if (token.type === TokenType.EVENT && (token.value === 'on' || token.value === 'when')) {
                    const event = this.parseEventDeclaration();
                    sprite.events.push(event);
                }
                // Parse methods
                else if (token.type === TokenType.KEYWORD && (token.value === 'function' || token.value === 'def')) {
                    const method = this.parseFunctionDeclaration();
                    sprite.methods.push(method);
                }
                // Parse statements
                else {
                    const statement = this.parseStatement();
                    if (statement) {
                        sprite.body.push(statement);
                    }
                }
            }
        });
        
        // Restore previous sprite context
        this.currentSprite = previousSprite;
    }
    
    parseSpriteCostumes(sprite) {
        this.advance(); // Consume 'costumes'
        this.expect(TokenType.COLON, 'Expected colon after costumes');
        
        const costumes = [];
        
        if (this.current.type === TokenType.LBRACKET) {
            this.advance(); // Consume '['
            
            while (this.current.type !== TokenType.RBRACKET && !this.isEOF()) {
                if (this.current.type === TokenType.STRING) {
                    costumes.push(this.current.value);
                    this.advance();
                } else {
                    this.advance();
                }
                
                if (this.current.type === TokenType.COMMA) {
                    this.advance();
                }
            }
            
            this.expect(TokenType.RBRACKET, 'Expected closing bracket');
        } else if (this.current.type === TokenType.STRING) {
            costumes.push(this.current.value);
            this.advance();
        }
        
        sprite.costumes = costumes;
    }
    
    parseSceneDeclaration() {
        const isLevel = this.current.value === 'level';
        this.advance(); // Consume 'scene' or 'level'
        
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected scene name');
        const name = nameToken.value;
        
        const scene = new ASTNode(NodeType.SCENE_DECLARATION, {
            name: name,
            type: isLevel ? 'level' : 'scene',
            backdrops: [],
            sprites: [],
            code: []
        });
        
        // Parse scene body
        this.parseSceneBody(scene);
        
        return scene;
    }
    
    parseSceneBody(scene) {
        // Save current scene context
        const previousScene = this.currentScene;
        this.currentScene = scene.name;
        
        // Expect colon or newline
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after scene declaration');
        }
        
        // Parse indented block
        this.parseIndentedBlock(() => {
            while (!this.isEOF() && !this.isEndOfBlock()) {
                const token = this.current;
                
                // Parse scene properties
                if (token.type === TokenType.KEYWORD && token.value === 'backdrops') {
                    this.parseSceneBackdrops(scene);
                }
                // Parse code
                else {
                    const statement = this.parseStatement();
                    if (statement) {
                        scene.code.push(statement);
                    }
                }
            }
        });
        
        // Restore previous scene context
        this.currentScene = previousScene;
    }
    
    parseSceneBackdrops(scene) {
        this.advance(); // Consume 'backdrops'
        this.expect(TokenType.COLON, 'Expected colon after backdrops');
        
        const backdrops = [];
        
        if (this.current.type === TokenType.LBRACKET) {
            this.advance(); // Consume '['
            
            while (this.current.type !== TokenType.RBRACKET && !this.isEOF()) {
                if (this.current.type === TokenType.STRING) {
                    backdrops.push(this.current.value);
                    this.advance();
                } else {
                    this.advance();
                }
                
                if (this.current.type === TokenType.COMMA) {
                    this.advance();
                }
            }
            
            this.expect(TokenType.RBRACKET, 'Expected closing bracket');
        } else if (this.current.type === TokenType.STRING) {
            backdrops.push(this.current.value);
            this.advance();
        }
        
        scene.backdrops = backdrops;
    }
    
    parseVariableDeclaration() {
        const isConst = this.current.value === 'const';
        const isLet = this.current.value === 'let';
        this.advance(); // Consume 'var', 'let', or 'const'
        
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected variable name');
        const name = nameToken.value;
        
        let value = null;
        let type = null;
        
        // Parse optional type annotation
        if (this.current.type === TokenType.COLON) {
            this.advance(); // Consume ':'
            const typeToken = this.expect(TokenType.TYPE, 'Expected type');
            type = typeToken.value;
        }
        
        // Parse optional assignment
        if (this.current.type === TokenType.ASSIGNMENT) {
            this.advance(); // Consume '='
            value = this.parseExpression();
        }
        
        const declaration = new ASTNode(NodeType.VARIABLE_DECLARATION, {
            name: name,
            value: value,
            type: type,
            isConst: isConst,
            isLet: isLet
        });
        
        // Add to current scope
        this.scope.addVariable(name, declaration);
        
        return declaration;
    }
    
    parseFunctionDeclaration() {
        const isDef = this.current.value === 'def';
        this.advance(); // Consume 'function' or 'def'
        
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected function name');
        const name = nameToken.value;
        
        const func = new ASTNode(NodeType.FUNCTION_DECLARATION, {
            name: name,
            parameters: [],
            body: [],
            returnType: null
        });
        
        // Save current function context
        const previousFunction = this.currentFunction;
        this.currentFunction = name;
        
        // Parse parameters
        this.expect(TokenType.LPAREN, 'Expected opening parenthesis');
        
        while (this.current.type !== TokenType.RPAREN && !this.isEOF()) {
            const param = this.parseParameter();
            if (param) {
                func.parameters.push(param);
            }
            
            if (this.current.type === TokenType.COMMA) {
                this.advance();
            }
        }
        
        this.expect(TokenType.RPAREN, 'Expected closing parenthesis');
        
        // Parse optional return type
        if (this.current.type === TokenType.COLON) {
            this.advance();
            const typeToken = this.expect(TokenType.TYPE, 'Expected return type');
            func.returnType = typeToken.value;
        }
        
        // Parse function body
        this.parseFunctionBody(func);
        
        // Restore previous function context
        this.currentFunction = previousFunction;
        
        return func;
    }
    
    parseParameter() {
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected parameter name');
        const name = nameToken.value;
        
        let type = null;
        
        // Parse optional type annotation
        if (this.current.type === TokenType.COLON) {
            this.advance();
            const typeToken = this.expect(TokenType.TYPE, 'Expected parameter type');
            type = typeToken.value;
        }
        
        return {
            name: name,
            type: type
        };
    }
    
    parseFunctionBody(func) {
        // Expect colon or newline
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after function declaration');
        }
        
        // Parse indented block
        this.parseIndentedBlock(() => {
            while (!this.isEOF() && !this.isEndOfBlock()) {
                const statement = this.parseStatement();
                if (statement) {
                    func.body.push(statement);
                }
            }
        });
    }
    
    // ============================================
    // Event Parsers
    // ============================================
    
    parseEventDeclaration() {
        const isWhen = this.current.value === 'when';
        this.advance(); // Consume 'on' or 'when'
        
        const eventType = this.current.value;
        this.advance(); // Consume event type
        
        const event = new ASTNode(NodeType.EVENT_DECLARATION, {
            type: eventType,
            condition: null,
            body: []
        });
        
        // Parse event condition
        if (this.current.type === TokenType.LPAREN) {
            this.advance(); // Consume '('
            event.condition = this.parseExpression();
            this.expect(TokenType.RPAREN, 'Expected closing parenthesis');
        }
        
        // Parse event body
        this.parseEventBody(event);
        
        return event;
    }
    
    parseEventBody(event) {
        // Expect colon or newline
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after event declaration');
        }
        
        // Parse indented block
        this.parseIndentedBlock(() => {
            while (!this.isEOF() && !this.isEndOfBlock()) {
                const statement = this.parseStatement();
                if (statement) {
                    event.body.push(statement);
                }
            }
        });
    }
    
    parseBroadcastStatement() {
        this.advance(); // Consume 'broadcast'
        
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected broadcast name');
        const name = nameToken.value;
        
        return new ASTNode(NodeType.BROADCAST_STATEMENT, {
            name: name
        });
    }
    
    // ============================================
    // Control Flow Parsers
    // ============================================
    
    parseIfStatement() {
        this.advance(); // Consume 'if'
        
        const test = this.parseExpression();
        
        // Parse then block
        let consequent;
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after if condition');
            consequent = this.parseBlock();
        } else {
            consequent = this.parseStatement();
        }
        
        // Parse else block
        let alternate = null;
        if (this.current.type === TokenType.KEYWORD && this.current.value === 'else') {
            this.advance(); // Consume 'else'
            
            if (this.current.type === TokenType.KEYWORD && this.current.value === 'if') {
                alternate = this.parseIfStatement();
            } else if (this.current.type === TokenType.COLON) {
                this.advance();
                this.expect(TokenType.NEWLINE, 'Expected newline after else');
                alternate = this.parseBlock();
            } else {
                alternate = this.parseStatement();
            }
        }
        
        return new ASTNode(NodeType.IF_STATEMENT, {
            test: test,
            consequent: consequent,
            alternate: alternate
        });
    }
    
    parseWhileStatement() {
        this.advance(); // Consume 'while'
        
        const test = this.parseExpression();
        
        let body;
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after while condition');
            body = this.parseBlock();
        } else {
            body = this.parseStatement();
        }
        
        return new ASTNode(NodeType.WHILE_STATEMENT, {
            test: test,
            body: body
        });
    }
    
    parseForStatement() {
        this.advance(); // Consume 'for'
        
        const init = this.parseExpression();
        
        this.expect(TokenType.KEYWORD, 'Expected "in"', 'in');
        this.advance(); // Consume 'in'
        
        const test = this.parseExpression();
        
        let body;
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after for statement');
            body = this.parseBlock();
        } else {
            body = this.parseStatement();
        }
        
        return new ASTNode(NodeType.FOR_STATEMENT, {
            init: init,
            test: test,
            body: body
        });
    }
    
    parseForeverStatement() {
        this.advance(); // Consume 'forever'
        
        let body;
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after forever');
            body = this.parseBlock();
        } else {
            body = this.parseStatement();
        }
        
        return new ASTNode(NodeType.FOREVER_STATEMENT, {
            body: body
        });
    }
    
    parseRepeatStatement() {
        this.advance(); // Consume 'repeat'
        
        const count = this.parseExpression();
        
        let body;
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after repeat count');
            body = this.parseBlock();
        } else {
            body = this.parseStatement();
        }
        
        return new ASTNode(NodeType.REPEAT_STATEMENT, {
            count: count,
            body: body
        });
    }
    
    parseUntilStatement() {
        this.advance(); // Consume 'until'
        
        const test = this.parseExpression();
        
        let body;
        if (this.current.type === TokenType.COLON) {
            this.advance();
            this.expect(TokenType.NEWLINE, 'Expected newline after until condition');
            body = this.parseBlock();
        } else {
            body = this.parseStatement();
        }
        
        return new ASTNode(NodeType.UNTIL_STATEMENT, {
            test: test,
            body: body
        });
    }
    
    parseBreakStatement() {
        this.advance(); // Consume 'break'
        return new ASTNode(NodeType.BREAK_STATEMENT);
    }
    
    parseContinueStatement() {
        this.advance(); // Consume 'continue'
        return new ASTNode(NodeType.CONTINUE_STATEMENT);
    }
    
    parseReturnStatement() {
        this.advance(); // Consume 'return'
        
        let argument = null;
        if (!this.isEndOfStatement()) {
            argument = this.parseExpression();
        }
        
        return new ASTNode(NodeType.RETURN_STATEMENT, {
            argument: argument
        });
    }
    
    // ============================================
    // Expression Parsers
    // ============================================
    
    parseExpressionStatement() {
        const expression = this.parseExpression();
        return new ASTNode(NodeType.EXPRESSION_STATEMENT, {
            expression: expression
        });
    }
    
    parseExpression() {
        return this.parseConditionalExpression();
    }
    
    parseConditionalExpression() {
        let left = this.parseLogicalORExpression();
        
        while (this.current.type === TokenType.OPERATOR && this.current.value === '?') {
            this.advance(); // Consume '?'
            
            const test = left;
            const consequent = this.parseExpression();
            this.expect(TokenType.COLON, 'Expected colon in conditional expression');
            this.advance(); // Consume ':'
            const alternate = this.parseExpression();
            
            left = new ASTNode(NodeType.CONDITIONAL_EXPRESSION, {
                test: test,
                consequent: consequent,
                alternate: alternate
            });
        }
        
        return left;
    }
    
    parseLogicalORExpression() {
        let left = this.parseLogicalANDExpression();
        
        while (this.current.type === TokenType.OPERATOR && (this.current.value === '||' || this.current.value === 'or')) {
            const operator = this.current.value;
            this.advance();
            
            const right = this.parseLogicalANDExpression();
            
            left = new ASTNode(NodeType.BINARY_EXPRESSION, {
                operator: operator,
                left: left,
                right: right
            });
        }
        
        return left;
    }
    
    parseLogicalANDExpression() {
        let left = this.parseEqualityExpression();
        
        while (this.current.type === TokenType.OPERATOR && (this.current.value === '&&' || this.current.value === 'and')) {
            const operator = this.current.value;
            this.advance();
            
            const right = this.parseEqualityExpression();
            
            left = new ASTNode(NodeType.BINARY_EXPRESSION, {
                operator: operator,
                left: left,
                right: right
            });
        }
        
        return left;
    }
    
    parseEqualityExpression() {
        let left = this.parseRelationalExpression();
        
        while (this.current.type === TokenType.COMPARISON || 
               (this.current.type === TokenType.OPERATOR && (this.current.value === '==' || this.current.value === '!='))) {
            const operator = this.current.value;
            this.advance();
            
            const right = this.parseRelationalExpression();
            
            left = new ASTNode(NodeType.BINARY_EXPRESSION, {
                operator: operator,
                left: left,
                right: right
            });
        }
        
        return left;
    }
    
    parseRelationalExpression() {
        let left = this.parseAdditiveExpression();
        
        while (this.current.type === TokenType.COMPARISON) {
            const operator = this.current.value;
            this.advance();
            
            const right = this.parseAdditiveExpression();
            
            left = new ASTNode(NodeType.BINARY_EXPRESSION, {
                operator: operator,
                left: left,
                right: right
            });
        }
        
        return left;
    }
    
    parseAdditiveExpression() {
        let left = this.parseMultiplicativeExpression();
        
        while (this.current.type === TokenType.OPERATOR && (this.current.value === '+' || this.current.value === '-')) {
            const operator = this.current.value;
            this.advance();
            
            const right = this.parseMultiplicativeExpression();
            
            left = new ASTNode(NodeType.BINARY_EXPRESSION, {
                operator: operator,
                left: left,
                right: right
            });
        }
        
        return left;
    }
    
    parseMultiplicativeExpression() {
        let left = this.parseUnaryExpression();
        
        while (this.current.type === TokenType.OPERATOR && (this.current.value === '*' || this.current.value === '/' || this.current.value === '%')) {
            const operator = this.current.value;
            this.advance();
            
            const right = this.parseUnaryExpression();
            
            left = new ASTNode(NodeType.BINARY_EXPRESSION, {
                operator: operator,
                left: left,
                right: right
            });
        }
        
        return left;
    }
    
    parseUnaryExpression() {
        if (this.current.type === TokenType.OPERATOR && (this.current.value === '!' || this.current.value === 'not' || this.current.value === '-')) {
            const operator = this.current.value;
            this.advance();
            
            const argument = this.parseUnaryExpression();
            
            return new ASTNode(NodeType.UNARY_EXPRESSION, {
                operator: operator,
                argument: argument
            });
        }
        
        return this.parsePostfixExpression();
    }
    
    parsePostfixExpression() {
        let left = this.parsePrimaryExpression();
        
        while (this.current.type === TokenType.DOT || this.current.type === TokenType.LBRACKET) {
            if (this.current.type === TokenType.DOT) {
                this.advance(); // Consume '.'
                
                const property = this.expect(TokenType.IDENTIFIER, 'Expected property name');
                
                left = new ASTNode(NodeType.MEMBER_EXPRESSION, {
                    object: left,
                    property: property.value,
                    computed: false
                });
            } else if (this.current.type === TokenType.LBRACKET) {
                this.advance(); // Consume '['
                
                const property = this.parseExpression();
                
                this.expect(TokenType.RBRACKET, 'Expected closing bracket');
                
                left = new ASTNode(NodeType.MEMBER_EXPRESSION, {
                    object: left,
                    property: property,
                    computed: true
                });
            }
        }
        
        return left;
    }
    
    parsePrimaryExpression() {
        const token = this.current;
        
        // Literals
        if (token.type === TokenType.NUMBER) {
            this.advance();
            return new ASTNode(NodeType.LITERAL, {
                type: 'number',
                value: token.value
            });
        }
        
        if (token.type === TokenType.STRING) {
            this.advance();
            return new ASTNode(NodeType.LITERAL, {
                type: 'string',
                value: token.value
            });
        }
        
        if (token.type === TokenType.BOOLEAN) {
            this.advance();
            return new ASTNode(NodeType.LITERAL, {
                type: 'boolean',
                value: token.value === 'true'
            });
        }
        
        if (token.type === TokenType.NULL) {
            this.advance();
            return new ASTNode(NodeType.LITERAL, {
                type: 'null',
                value: null
            });
        }
        
        // Identifiers
        if (token.type === TokenType.IDENTIFIER) {
            const name = token.value;
            this.advance();
            
            // Check if it's a function call
            if (this.current.type === TokenType.LPAREN) {
                return this.parseCallExpression(name);
            }
            
            // It's just an identifier
            return new ASTNode(NodeType.IDENTIFIER, {
                name: name
            });
        }
        
        // Parenthesized expression
        if (token.type === TokenType.LPAREN) {
            this.advance(); // Consume '('
            
            const expression = this.parseExpression();
            
            this.expect(TokenType.RPAREN, 'Expected closing parenthesis');
            
            return expression;
        }
        
        // Arrays
        if (token.type === TokenType.LBRACKET) {
            return this.parseArrayExpression();
        }
        
        // Objects
        if (token.type === TokenType.LBRACE) {
            return this.parseObjectExpression();
        }
        
        // Special Scratch values
        if (token.type === TokenType.VALUE) {
            this.advance();
            return new ASTNode(NodeType.LITERAL, {
                type: 'scratch-value',
                value: token.value
            });
        }
        
        // Unknown token
        throw new Error(`Unexpected token: ${token.type} (${token.value}) at line ${token.line}, column ${token.column}`);
    }
    
    parseCallExpression(name) {
        this.expect(TokenType.LPAREN, 'Expected opening parenthesis');
        
        const args = [];
        
        while (this.current.type !== TokenType.RPAREN && !this.isEOF()) {
            const arg = this.parseExpression();
            if (arg) {
                args.push(arg);
            }
            
            if (this.current.type === TokenType.COMMA) {
                this.advance();
            }
        }
        
        this.expect(TokenType.RPAREN, 'Expected closing parenthesis');
        
        return new ASTNode(NodeType.CALL_EXPRESSION, {
            callee: name,
            arguments: args
        });
    }
    
    parseArrayExpression() {
        this.advance(); // Consume '['
        
        const elements = [];
        
        while (this.current.type !== TokenType.RBRACKET && !this.isEOF()) {
            const element = this.parseExpression();
            if (element) {
                elements.push(element);
            }
            
            if (this.current.type === TokenType.COMMA) {
                this.advance();
            }
        }
        
        this.expect(TokenType.RBRACKET, 'Expected closing bracket');
        
        return new ASTNode(NodeType.LITERAL, {
            type: 'array',
            value: elements
        });
    }
    
    parseObjectExpression() {
        this.advance(); // Consume '{'
        
        const properties = [];
        
        while (this.current.type !== TokenType.RBRACE && !this.isEOF()) {
            const key = this.expect(TokenType.IDENTIFIER, 'Expected property key');
            
            if (this.current.type === TokenType.COLON) {
                this.advance();
            }
            
            const value = this.parseExpression();
            
            properties.push({
                key: key.value,
                value: value
            });
            
            if (this.current.type === TokenType.COMMA) {
                this.advance();
            }
        }
        
        this.expect(TokenType.RBRACE, 'Expected closing brace');
        
        return new ASTNode(NodeType.LITERAL, {
            type: 'object',
            value: properties
        });
    }
    
    // ============================================
    // Block Parsing
    // ============================================
    
    parseBlock() {
        const block = new ASTNode(NodeType.BLOCK, {
            body: []
        });
        
        this.parseIndentedBlock(() => {
            while (!this.isEOF() && !this.isEndOfBlock()) {
                const statement = this.parseStatement();
                if (statement) {
                    block.body.push(statement);
                }
            }
        });
        
        return block;
    }
    
    parseIndentedBlock(callback) {
        // Skip the newline after colon
        if (this.current.type === TokenType.NEWLINE) {
            this.advance();
        }
        
        // Get current indentation
        const startIndent = this.getIndentation();
        
        // Parse statements with same or greater indentation
        while (!this.isEOF()) {
            const indent = this.getIndentation();
            
            // End of block if indentation is less
            if (indent < startIndent) {
                break;
            }
            
            // Skip empty lines
            if (this.current.type === TokenType.NEWLINE) {
                this.advance();
                continue;
            }
            
            // Parse statement
            callback();
        }
    }
    
    getIndentation() {
        // In a real implementation, we would track indentation from the lexer
        // For now, we'll just return 0
        return 0;
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    advance() {
        this.position++;
        this.current = this.tokens[this.position];
        this.lookahead = this.tokens[this.position + 1];
    }
    
    advanceN(n) {
        for (let i = 0; i < n; i++) {
            this.advance();
        }
    }
    
    peek(n = 0) {
        return this.tokens[this.position + n];
    }
    
    isEOF() {
        return this.current.type === TokenType.EOF;
    }
    
    isEndOfStatement() {
        return this.isEOF() || 
               this.current.type === TokenType.NEWLINE ||
               this.current.type === TokenType.SEMICOLON ||
               this.current.type === TokenType.RBRACE ||
               this.current.type === TokenType.COMMA;
    }
    
    isEndOfBlock() {
        return this.isEOF() || 
               this.current.type === TokenType.NEWLINE && this.getIndentation() === 0;
    }
    
    expect(type, message, value) {
        if (this.isEOF()) {
            throw new Error(`${message} at line ${this.current.line}, column ${this.current.column}`);
        }
        
        if (this.current.type !== type) {
            if (value && this.current.value !== value) {
                throw new Error(`${message} at line ${this.current.line}, column ${this.current.column}`);
            }
            throw new Error(`${message} (got ${this.current.type}: "${this.current.value}") at line ${this.current.line}, column ${this.current.column}`);
        }
        
        return this.current;
    }
}

// ============================================
// AST Node Class
// ============================================

class ASTNode {
    constructor(type, properties = {}) {
        this.type = type;
        Object.assign(this, properties);
        this.loc = {
            start: { line: 0, column: 0 },
            end: { line: 0, column: 0 }
        };
    }
    
    toString() {
        const props = Object.keys(this).filter(k => k !== 'type' && k !== 'loc' && k !== 'toString');
        const propsStr = props.length > 0 ? props.map(p => ` ${p}=${JSON.stringify(this[p])}`).join('') : '';
        return `${this.type}${propsStr}`;
    }
    
    toJSON() {
        const obj = { ...this };
        delete obj.toString;
        delete obj.toJSON;
        return obj;
    }
}

// ============================================
// Scope Class
// ============================================

class Scope {
    constructor(parent = null) {
        this.parent = parent;
        this.variables = new Map();
        this.functions = new Map();
        this.types = new Map();
    }
    
    addVariable(name, declaration) {
        this.variables.set(name, declaration);
    }
    
    getVariable(name) {
        if (this.variables.has(name)) {
            return this.variables.get(name);
        }
        if (this.parent) {
            return this.parent.getVariable(name);
        }
        return null;
    }
    
    addFunction(name, declaration) {
        this.functions.set(name, declaration);
    }
    
    getFunction(name) {
        if (this.functions.has(name)) {
            return this.functions.get(name);
        }
        if (this.parent) {
            return this.parent.getFunction(name);
        }
        return null;
    }
}

// ============================================
// Utility Function
// ============================================

function parse(input) {
    const tokens = tokenize(input);
    const parser = new Parser(tokens);
    return parser.parse();
}

// ============================================
// Export
// ============================================

window.Parser = Parser;
window.ASTNode = ASTNode;
window.Scope = Scope;
window.NodeType = NodeType;
window.parse = parse;
