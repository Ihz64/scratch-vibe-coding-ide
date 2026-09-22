/**
 * Scratch Vibe Coding IDE - Lexer
 * Converts Vibe Code into tokens for parsing
 */

// ============================================
// Token Types
// ============================================

const TokenType = {
    // Structural
    EOF: 'EOF',
    NEWLINE: 'NEWLINE',
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',
    
    // Identifiers
    IDENTIFIER: 'IDENTIFIER',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    BOOLEAN: 'BOOLEAN',
    NULL: 'NULL',
    
    // Keywords
    KEYWORD: 'KEYWORD',
    
    // Operators
    OPERATOR: 'OPERATOR',
    COMPARISON: 'COMPARISON',
    ASSIGNMENT: 'ASSIGNMENT',
    
    // Punctuation
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    COLON: 'COLON',
    COMMA: 'COMMA',
    DOT: 'DOT',
    SEMICOLON: 'SEMICOLON',
    
    // Comments
    COMMENT: 'COMMENT',
    
    // Special
    SPRITE: 'SPRITE',
    EVENT: 'EVENT',
    ACTION: 'ACTION',
    VALUE: 'VALUE',
    TYPE: 'TYPE',
    VARIABLE: 'VARIABLE',
    FUNCTION: 'FUNCTION',
    BROADCAST: 'BROADCAST'
};

// ============================================
// Keywords
// ============================================

const Keywords = {
    // Control Flow
    if: 'KEYWORD',
    else: 'KEYWORD',
    elif: 'KEYWORD',
    
    forever: 'KEYWORD',
    repeat: 'KEYWORD',
    until: 'KEYWORD',
    while: 'KEYWORD',
    for: 'KEYWORD',
    in: 'KEYWORD',
    
    // Events
    on: 'EVENT',
    when: 'EVENT',
    broadcast: 'BROADCAST',
    
    // Declarations
    sprite: 'SPRITE',
    scene: 'KEYWORD',
    level: 'KEYWORD',
    var: 'KEYWORD',
    let: 'KEYWORD',
    const: 'KEYWORD',
    function: 'FUNCTION',
    def: 'FUNCTION',
    
    // Boolean
    true: 'BOOLEAN',
    false: 'BOOLEAN',
    null: 'NULL',
    undefined: 'NULL',
    
    // Special Values
    green_flag: 'EVENT',
    clicked: 'EVENT',
    key_pressed: 'EVENT',
    mouse_down: 'EVENT',
    mouse_up: 'EVENT',
    edge: 'VALUE',
    random: 'FUNCTION',
    
    // Types
    number: 'TYPE',
    string: 'TYPE',
    boolean: 'TYPE',
    list: 'TYPE',
    sprite: 'TYPE',
    costume: 'TYPE',
    sound: 'TYPE',
    backdrop: 'TYPE'
};

// ============================================
// Operators
// ============================================

const Operators = {
    // Arithmetic
    '+': 'OPERATOR',
    '-': 'OPERATOR',
    '*': 'OPERATOR',
    '/': 'OPERATOR',
    '%': 'OPERATOR',
    '**': 'OPERATOR',
    
    // Assignment
    '=': 'ASSIGNMENT',
    '+=': 'ASSIGNMENT',
    '-=': 'ASSIGNMENT',
    '*=': 'ASSIGNMENT',
    '/=': 'ASSIGNMENT',
    
    // Comparison
    '==': 'COMPARISON',
    '!=': 'COMPARISON',
    '<': 'COMPARISON',
    '>': 'COMPARISON',
    '<=': 'COMPARISON',
    '>=': 'COMPARISON',
    
    // Logical
    'and': 'OPERATOR',
    'or': 'OPERATOR',
    'not': 'OPERATOR',
    '&&': 'OPERATOR',
    '||': 'OPERATOR',
    '!': 'OPERATOR',
    
    // Bitwise
    '&': 'OPERATOR',
    '|': 'OPERATOR',
    '^': 'OPERATOR',
    '~': 'OPERATOR',
    '<<': 'OPERATOR',
    '>>': 'OPERATOR',
    
    // Other
    '.': 'DOT',
    ',': 'COMMA',
    ':': 'COLON',
    ';': 'SEMICOLON'
};

// ============================================
// Lexer Class
// ============================================

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.length = input.length;
        this.line = 1;
        this.column = 0;
        this.tokens = [];
        this.indentStack = [0];
        this.currentIndent = 0;
        this.waitingForNewline = false;
    }
    
    // ============================================
    // Main Methods
    // ============================================
    
    tokenize() {
        while (this.position < this.length) {
            const char = this.peek();
            
            // Skip whitespace
            if (this.isWhitespace(char)) {
                this.consume();
                continue;
            }
            
            // Handle newlines
            if (char === '\n') {
                this.handleNewline();
                continue;
            }
            
            // Handle comments
            if (char === '/' && this.peek(1) === '/') {
                this.handleComment();
                continue;
            }
            
            // Handle strings
            if (char === '"' || char === "'") {
                this.handleString(char);
                continue;
            }
            
            // Handle numbers
            if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek(1)))) {
                this.handleNumber();
                continue;
            }
            
            // Handle identifiers and keywords
            if (this.isIdentifierStart(char)) {
                this.handleIdentifier();
                continue;
            }
            
            // Handle operators
            if (this.isOperatorStart(char)) {
                this.handleOperator();
                continue;
            }
            
            // Handle parentheses, brackets, braces
            if ('()[]{}'.includes(char)) {
                this.handleBracket(char);
                continue;
            }
            
            // Handle other punctuation
            if (',.;:'.includes(char)) {
                this.handlePunctuation(char);
                continue;
            }
            
            // Unknown character
            this.handleUnknown(char);
        }
        
        // Add EOF token
        this.addToken(TokenType.EOF, '', this.line, this.column);
        
        return this.tokens;
    }
    
    // ============================================
    // Token Handlers
    // ============================================
    
    handleNewline() {
        const char = this.consume();
        this.line++;
        this.column = 0;
        
        // Check if we need to add indent/dedent tokens
        if (this.waitingForNewline) {
            this.waitingForNewline = false;
            return;
        }
        
        // Add newline token
        this.addToken(TokenType.NEWLINE, char, this.line, this.column);
    }
    
    handleComment() {
        const start = this.position;
        this.consume(); // Consume first /
        this.consume(); // Consume second /
        
        while (this.position < this.length) {
            const char = this.peek();
            if (char === '\n') {
                break;
            }
            this.consume();
        }
        
        const text = this.input.slice(start, this.position);
        this.addToken(TokenType.COMMENT, text, this.line, this.column - text.length);
    }
    
    handleString(delimiter) {
        const start = this.position;
        this.consume(); // Consume opening quote
        
        let escaped = false;
        while (this.position < this.length) {
            const char = this.peek();
            
            if (escaped) {
                escaped = false;
                this.consume();
                continue;
            }
            
            if (char === '\\') {
                escaped = true;
                this.consume();
                continue;
            }
            
            if (char === delimiter) {
                this.consume(); // Consume closing quote
                break;
            }
            
            if (char === '\n') {
                this.handleNewline();
                // String continues on next line
                continue;
            }
            
            this.consume();
        }
        
        const text = this.input.slice(start + 1, this.position - 1);
        this.addToken(TokenType.STRING, text, this.line, this.column - text.length - 1);
    }
    
    handleNumber() {
        const start = this.position;
        let hasDot = false;
        let hasExponent = false;
        
        while (this.position < this.length) {
            const char = this.peek();
            
            if (this.isDigit(char)) {
                this.consume();
                continue;
            }
            
            if (char === '.' && !hasDot) {
                hasDot = true;
                this.consume();
                continue;
            }
            
            if ((char === 'e' || char === 'E') && !hasExponent) {
                hasExponent = true;
                this.consume();
                
                const next = this.peek();
                if (next === '+' || next === '-') {
                    this.consume();
                }
                continue;
            }
            
            break;
        }
        
        const text = this.input.slice(start, this.position);
        const value = parseFloat(text);
        this.addToken(TokenType.NUMBER, value, this.line, this.column - text.length);
    }
    
    handleIdentifier() {
        const start = this.position;
        
        while (this.position < this.length) {
            const char = this.peek();
            if (this.isIdentifierChar(char)) {
                this.consume();
                continue;
            }
            break;
        }
        
        const text = this.input.slice(start, this.position);
        const type = this.getIdentifierType(text);
        this.addToken(type, text, this.line, this.column - text.length);
    }
    
    handleOperator() {
        // Check for multi-character operators first
        const twoCharOps = ['==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '**', '&&', '||', '<<', '>>'];
        const threeCharOps = ['===', '!=='];
        
        let op = '';
        
        // Check three characters
        const threeChar = this.input.slice(this.position, this.position + 3);
        if (threeCharOps.includes(threeChar)) {
            op = this.consumeN(3);
        }
        // Check two characters
        else {
            const twoChar = this.input.slice(this.position, this.position + 2);
            if (twoCharOps.includes(twoChar)) {
                op = this.consumeN(2);
            }
            // Check one character
            else {
                op = this.consume();
            }
        }
        
        // Determine operator type
        const type = Operators[op] || TokenType.OPERATOR;
        this.addToken(type, op, this.line, this.column - op.length);
    }
    
    handleBracket(char) {
        let type;
        switch (char) {
            case '(':
                type = TokenType.LPAREN;
                break;
            case ')':
                type = TokenType.RPAREN;
                break;
            case '[':
                type = TokenType.LBRACKET;
                break;
            case ']':
                type = TokenType.RBRACKET;
                break;
            case '{':
                type = TokenType.LBRACE;
                break;
            case '}':
                type = TokenType.RBRACE;
                break;
            default:
                type = TokenType.OPERATOR;
        }
        
        this.consume();
        this.addToken(type, char, this.line, this.column - 1);
    }
    
    handlePunctuation(char) {
        let type;
        switch (char) {
            case ':':
                type = TokenType.COLON;
                break;
            case ',':
                type = TokenType.COMMA;
                break;
            case '.':
                type = TokenType.DOT;
                break;
            case ';':
                type = TokenType.SEMICOLON;
                break;
            default:
                type = TokenType.OPERATOR;
        }
        
        this.consume();
        this.addToken(type, char, this.line, this.column - 1);
    }
    
    handleUnknown(char) {
        this.consume();
        this.addToken(TokenType.ERROR, char, this.line, this.column - 1);
    }
    
    // ============================================
    // Helper Methods
    // ============================================
    
    peek(offset = 0) {
        return this.position + offset < this.length ? this.input[this.position + offset] : null;
    }
    
    consume() {
        const char = this.input[this.position];
        this.position++;
        this.column++;
        return char;
    }
    
    consumeN(n) {
        const chars = this.input.slice(this.position, this.position + n);
        this.position += n;
        this.column += n;
        return chars;
    }
    
    isWhitespace(char) {
        return /\s/.test(char) && char !== '\n';
    }
    
    isDigit(char) {
        return /\d/.test(char);
    }
    
    isIdentifierStart(char) {
        return /[a-zA-Z_]/.test(char);
    }
    
    isIdentifierChar(char) {
        return /[a-zA-Z0-9_]/.test(char);
    }
    
    isOperatorStart(char) {
        return /[+\-*/%=<>!&|^~.,:;]/.test(char);
    }
    
    getIdentifierType(text) {
        // Check keywords first
        if (Keywords[text]) {
            return Keywords[text];
        }
        
        // Check if it's a boolean
        if (text === 'true' || text === 'false') {
            return TokenType.BOOLEAN;
        }
        
        // Check if it's null
        if (text === 'null' || text === 'undefined') {
            return TokenType.NULL;
        }
        
        // It's an identifier
        return TokenType.IDENTIFIER;
    }
    
    addToken(type, value, line, column) {
        this.tokens.push({
            type: type,
            value: value,
            line: line,
            column: column,
            start: this.position - (typeof value === 'string' ? value.length : 0),
            end: this.position
        });
    }
    
    // ============================================
    // Indentation Handling
    // ============================================
    
    handleIndentation() {
        // This would be called at the start of each line
        // to determine if we need to add INDENT or DEDENT tokens
    }
}

// ============================================
// Token Class
// ============================================

class Token {
    constructor(type, value, line, column, start, end) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
        this.start = start;
        this.end = end;
    }
    
    toString() {
        return `${this.type}(${JSON.stringify(this.value)}) at line ${this.line}, column ${this.column}`;
    }
    
    is(type) {
        return this.type === type;
    }
    
    isOneOf(types) {
        return types.includes(this.type);
    }
}

// ============================================
// Utility Function
// ============================================

function tokenize(input) {
    const lexer = new Lexer(input);
    return lexer.tokenize();
}

// ============================================
// Export
// ============================================

window.Lexer = Lexer;
window.Token = Token;
window.TokenType = TokenType;
window.Keywords = Keywords;
window.Operators = Operators;
window.tokenize = tokenize;
