// AST (Abstract Syntax Tree) Node Definitions
// Defines all node types for the Vibe Coding language

class ASTNode {
    constructor(type, start, end) {
        this.type = type;
        this.start = start || { line: 0, column: 0 };
        this.end = end || { line: 0, column: 0 };
        this.parent = null;
    }

    // Add child node
    addChild(child) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
        child.parent = this;
        return this;
    }

    // Get all child nodes
    getChildren() {
        return this.children || [];
    }

    // Get node text representation
    getText() {
        return this.type;
    }

    // Check if node has children
    hasChildren() {
        return this.children && this.children.length > 0;
    }

    // Get first child
    getFirstChild() {
        return this.children && this.children.length > 0 ? this.children[0] : null;
    }

    // Get last child
    getLastChild() {
        return this.children && this.children.length > 0 ? this.children[this.children.length - 1] : null;
    }

    // Find child by type
    findChild(type) {
        return this.getChildren().find(child => child.type === type);
    }

    // Find all children by type
    findChildren(type) {
        return this.getChildren().filter(child => child.type === type);
    }

    // Get node position as string
    getPosition() {
        return `${this.start.line + 1}:${this.start.column + 1}`;
    }

    // Get node range as string
    getRange() {
        return `${this.getPosition()}-${this.end.line + 1}:${this.end.column + 1}`;
    }

    // Accept visitor for traversal
    accept(visitor) {
        if (visitor.visit) {
            return visitor.visit(this);
        }
        return null;
    }
}

// Program Node - Root of the AST
class ProgramNode extends ASTNode {
    constructor(start, end) {
        super('Program', start, end);
        this.declarations = [];
        this.imports = [];
        this.metadata = {};
    }

    addDeclaration(declaration) {
        this.declarations.push(declaration);
        declaration.parent = this;
        return this;
    }

    addImport(importNode) {
        this.imports.push(importNode);
        importNode.parent = this;
        return this;
    }

    getText() {
        return `Program (${this.declarations.length} declarations)`;
    }
}

// Import Node
class ImportNode extends ASTNode {
    constructor(path, start, end) {
        super('Import', start, end);
        this.path = path;
        this.alias = null;
    }

    getText() {
        return `Import "${this.path}"${this.alias ? ` as ${this.alias}` : ''}`;
    }
}

// Sprite Declaration Node
class SpriteDeclarationNode extends ASTNode {
    constructor(name, start, end) {
        super('SpriteDeclaration', start, end);
        this.name = name;
        this.costumes = [];
        this.sounds = [];
        this.variables = [];
        this.lists = [];
        this.scripts = [];
        this.properties = {};
    }

    addCostume(costume) {
        this.costumes.push(costume);
        costume.parent = this;
        return this;
    }

    addSound(sound) {
        this.sounds.push(sound);
        sound.parent = this;
        return this;
    }

    addVariable(variable) {
        this.variables.push(variable);
        variable.parent = this;
        return this;
    }

    addList(list) {
        this.lists.push(list);
        list.parent = this;
        return this;
    }

    addScript(script) {
        this.scripts.push(script);
        script.parent = this;
        return this;
    }

    getText() {
        return `Sprite "${this.name}"`;
    }
}

// Stage Declaration Node
class StageDeclarationNode extends ASTNode {
    constructor(start, end) {
        super('StageDeclaration', start, end);
        this.backdrops = [];
        this.sounds = [];
        this.variables = [];
        this.lists = [];
        this.scripts = [];
        this.properties = {};
    }

    addBackdrop(backdrop) {
        this.backdrops.push(backdrop);
        backdrop.parent = this;
        return this;
    }

    addSound(sound) {
        this.sounds.push(sound);
        sound.parent = this;
        return this;
    }

    addVariable(variable) {
        this.variables.push(variable);
        variable.parent = this;
        return this;
    }

    addList(list) {
        this.lists.push(list);
        list.parent = this;
        return this;
    }

    addScript(script) {
        this.scripts.push(script);
        script.parent = this;
        return this;
    }

    getText() {
        return 'Stage';
    }
}

// Scene Declaration Node
class SceneDeclarationNode extends ASTNode {
    constructor(name, start, end) {
        super('SceneDeclaration', start, end);
        this.name = name;
        this.backdrop = null;
        this.sprites = [];
        this.scripts = [];
        this.properties = {};
    }

    setBackdrop(backdrop) {
        this.backdrop = backdrop;
        backdrop.parent = this;
        return this;
    }

    addSprite(sprite) {
        this.sprites.push(sprite);
        sprite.parent = this;
        return this;
    }

    addScript(script) {
        this.scripts.push(script);
        script.parent = this;
        return this;
    }

    getText() {
        return `Scene "${this.name}"`;
    }
}

// Costume Node
class CostumeNode extends ASTNode {
    constructor(name, start, end) {
        super('Costume', start, end);
        this.name = name;
        this.path = null;
        this.data = null;
        this.properties = {};
    }

    getText() {
        return `Costume "${this.name}"`;
    }
}

// Sound Node
class SoundNode extends ASTNode {
    constructor(name, start, end) {
        super('Sound', start, end);
        this.name = name;
        this.path = null;
        this.data = null;
        this.properties = {};
    }

    getText() {
        return `Sound "${this.name}"`;
    }
}

// Variable Declaration Node
class VariableDeclarationNode extends ASTNode {
    constructor(name, start, end) {
        super('VariableDeclaration', start, end);
        this.name = name;
        this.value = null;
        this.isCloud = false;
        this.isPersistent = false;
        this.scope = 'local'; // 'local' or 'global'
    }

    setValue(value) {
        this.value = value;
        value.parent = this;
        return this;
    }

    getText() {
        return `Variable ${this.scope} "${this.name}"`;
    }
}

// List Declaration Node
class ListDeclarationNode extends ASTNode {
    constructor(name, start, end) {
        super('ListDeclaration', start, end);
        this.name = name;
        this.items = [];
        this.isCloud = false;
        this.scope = 'local'; // 'local' or 'global'
    }

    addItem(item) {
        this.items.push(item);
        item.parent = this;
        return this;
    }

    getText() {
        return `List ${this.scope} "${this.name}"`;
    }
}

// Function Declaration Node
class FunctionDeclarationNode extends ASTNode {
    constructor(name, start, end) {
        super('FunctionDeclaration', start, end);
        this.name = name;
        this.parameters = [];
        this.body = null;
        this.returnType = null;
    }

    addParameter(param) {
        this.parameters.push(param);
        param.parent = this;
        return this;
    }

    setBody(body) {
        this.body = body;
        body.parent = this;
        return this;
    }

    getText() {
        return `Function "${this.name}"(${this.parameters.map(p => p.name).join(', ')})`;
    }
}

// Script Node (Event handler or function)
class ScriptNode extends ASTNode {
    constructor(start, end) {
        super('Script', start, end);
        this.event = null;
        this.blocks = [];
        this.parameters = [];
    }

    setEvent(event) {
        this.event = event;
        event.parent = this;
        return this;
    }

    addBlock(block) {
        this.blocks.push(block);
        block.parent = this;
        return this;
    }

    addParameter(param) {
        this.parameters.push(param);
        param.parent = this;
        return this;
    }

    getText() {
        return `Script${this.event ? ` on ${this.event.getText()}` : ''}`;
    }
}

// Event Node
class EventNode extends ASTNode {
    constructor(type, start, end) {
        super('Event', start, end);
        this.type = type; // 'green_flag', 'key_pressed', 'mouse_clicked', 'broadcast', etc.
        this.value = null;
        this.condition = null;
    }

    setValue(value) {
        this.value = value;
        return this;
    }

    setCondition(condition) {
        this.condition = condition;
        condition.parent = this;
        return this;
    }

    getText() {
        switch (this.type) {
            case 'green_flag': return 'Green Flag';
            case 'key_pressed': return `Key "${this.value}" Pressed`;
            case 'mouse_clicked': return 'Mouse Clicked';
            case 'broadcast': return `Broadcast "${this.value}"`;
            case 'broadcast_and_wait': return `Broadcast "${this.value}" and Wait`;
            case 'when_clicked': return 'When Clicked';
            case 'when_cloned': return 'When Cloned';
            case 'when_backdrop_switches': return `When Backdrop Switches to "${this.value}"`;
            case 'when_loudness_gt': return `When Loudness > ${this.value}`;
            case 'when_timer_gt': return `When Timer > ${this.value}`;
            default: return this.type;
        }
    }
}

// Block Node
class BlockNode extends ASTNode {
    constructor(type, start, end) {
        super('Block', start, end);
        this.type = type; // 'motion', 'looks', 'sound', 'control', 'sensing', 'operators', 'variables', 'lists', 'custom'
        this.opcode = null; // Scratch opcode
        this.arguments = [];
        this.next = null;
        this.children = []; // For control blocks that contain other blocks
    }

    setOpcode(opcode) {
        this.opcode = opcode;
        return this;
    }

    addArgument(arg) {
        this.arguments.push(arg);
        arg.parent = this;
        return this;
    }

    setNext(block) {
        this.next = block;
        block.parent = this;
        return this;
    }

    addChild(block) {
        this.children.push(block);
        block.parent = this;
        return this;
    }

    getText() {
        return `${this.type}.${this.opcode}`;
    }
}

// Literal Node (numbers, strings, booleans, null)
class LiteralNode extends ASTNode {
    constructor(value, start, end) {
        super('Literal', start, end);
        this.value = value;
        this.raw = String(value);
    }

    getText() {
        return JSON.stringify(this.value);
    }
}

// Identifier Node (variable names, function names, etc.)
class IdentifierNode extends ASTNode {
    constructor(name, start, end) {
        super('Identifier', start, end);
        this.name = name;
        this.reference = null; // Reference to the actual declaration
    }

    getText() {
        return this.name;
    }
}

// Binary Expression Node
class BinaryExpressionNode extends ASTNode {
    constructor(operator, left, right, start, end) {
        super('BinaryExpression', start, end);
        this.operator = operator;
        this.left = left;
        this.right = right;
        left.parent = this;
        right.parent = this;
    }

    getText() {
        return `${this.left.getText()} ${this.operator} ${this.right.getText()}`;
    }
}

// Unary Expression Node
class UnaryExpressionNode extends ASTNode {
    constructor(operator, argument, start, end) {
        super('UnaryExpression', start, end);
        this.operator = operator;
        this.argument = argument;
        argument.parent = this;
    }

    getText() {
        return `${this.operator}${this.argument.getText()}`;
    }
}

// Call Expression Node (function calls, block calls)
class CallExpressionNode extends ASTNode {
    constructor(callee, start, end) {
        super('CallExpression', start, end);
        this.callee = callee;
        this.arguments = [];
        callee.parent = this;
    }

    addArgument(arg) {
        this.arguments.push(arg);
        arg.parent = this;
        return this;
    }

    getText() {
        return `${this.callee.getText()}(${this.arguments.map(a => a.getText()).join(', ')})`;
    }
}

// Member Expression Node (accessing properties)
class MemberExpressionNode extends ASTNode {
    constructor(object, property, start, end) {
        super('MemberExpression', start, end);
        this.object = object;
        this.property = property;
        this.computed = false;
        object.parent = this;
        property.parent = this;
    }

    getText() {
        return `${this.object.getText()}.${this.property.getText()}`;
    }
}

// Array Expression Node (list indexing)
class ArrayExpressionNode extends ASTNode {
    constructor(array, index, start, end) {
        super('ArrayExpression', start, end);
        this.array = array;
        this.index = index;
        array.parent = this;
        index.parent = this;
    }

    getText() {
        return `${this.array.getText()}[${this.index.getText()}]`;
    }
}

// Conditional Expression Node (ternary)
class ConditionalExpressionNode extends ASTNode {
    constructor(test, consequent, alternate, start, end) {
        super('ConditionalExpression', start, end);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
        test.parent = this;
        consequent.parent = this;
        alternate.parent = this;
    }

    getText() {
        return `${this.test.getText()} ? ${this.consequent.getText()} : ${this.alternate.getText()}`;
    }
}

// If Statement Node
class IfStatementNode extends ASTNode {
    constructor(test, start, end) {
        super('IfStatement', start, end);
        this.test = test;
        this.consequent = null;
        this.alternate = null;
        test.parent = this;
    }

    setConsequent(body) {
        this.consequent = body;
        body.parent = this;
        return this;
    }

    setAlternate(body) {
        this.alternate = body;
        body.parent = this;
        return this;
    }

    getText() {
        return `If ${this.test.getText()}`;
    }
}

// While Statement Node
class WhileStatementNode extends ASTNode {
    constructor(test, start, end) {
        super('WhileStatement', start, end);
        this.test = test;
        this.body = null;
        test.parent = this;
    }

    setBody(body) {
        this.body = body;
        body.parent = this;
        return this;
    }

    getText() {
        return `While ${this.test.getText()}`;
    }
}

// Repeat Statement Node
class RepeatStatementNode extends ASTNode {
    constructor(count, start, end) {
        super('RepeatStatement', start, end);
        this.count = count;
        this.body = null;
        count.parent = this;
    }

    setBody(body) {
        this.body = body;
        body.parent = this;
        return this;
    }

    getText() {
        return `Repeat ${this.count.getText()}`;
    }
}

// Forever Statement Node
class ForeverStatementNode extends ASTNode {
    constructor(start, end) {
        super('ForeverStatement', start, end);
        this.body = null;
    }

    setBody(body) {
        this.body = body;
        body.parent = this;
        return this;
    }

    getText() {
        return 'Forever';
    }
}

// For Statement Node
class ForStatementNode extends ASTNode {
    constructor(variable, start, end) {
        super('ForStatement', start, end);
        this.variable = variable;
        this.from = null;
        this.to = null;
        this.step = null;
        this.body = null;
        variable.parent = this;
    }

    setFrom(from) {
        this.from = from;
        from.parent = this;
        return this;
    }

    setTo(to) {
        this.to = to;
        to.parent = this;
        return this;
    }

    setStep(step) {
        this.step = step;
        step.parent = this;
        return this;
    }

    setBody(body) {
        this.body = body;
        body.parent = this;
        return this;
    }

    getText() {
        return `For ${this.variable.getText()}`;
    }
}

// Broadcast Statement Node
class BroadcastStatementNode extends ASTNode {
    constructor(message, start, end) {
        super('BroadcastStatement', start, end);
        this.message = message;
        this.wait = false;
        message.parent = this;
    }

    setWait(wait) {
        this.wait = wait;
        return this;
    }

    getText() {
        return `Broadcast "${this.message.getText()}"${this.wait ? ' and Wait' : ''}`;
    }
}

// Stop Statement Node
class StopStatementNode extends ASTNode {
    constructor(target, start, end) {
        super('StopStatement', start, end);
        this.target = target || 'this';
    }

    getText() {
        return `Stop ${this.target}`;
    }
}

// Wait Statement Node
class WaitStatementNode extends ASTNode {
    constructor(duration, start, end) {
        super('WaitStatement', start, end);
        this.duration = duration;
        duration.parent = this;
    }

    getText() {
        return `Wait ${this.duration.getText()}`;
    }
}

// Say Statement Node
class SayStatementNode extends ASTNode {
    constructor(message, start, end) {
        super('SayStatement', start, end);
        this.message = message;
        this.duration = null;
        message.parent = this;
    }

    setDuration(duration) {
        this.duration = duration;
        duration.parent = this;
        return this;
    }

    getText() {
        return `Say "${this.message.getText()}"${this.duration ? ` for ${this.duration.getText()} seconds` : ''}`;
    }
}

// Think Statement Node
class ThinkStatementNode extends ASTNode {
    constructor(message, start, end) {
        super('ThinkStatement', start, end);
        this.message = message;
        this.duration = null;
        message.parent = this;
    }

    setDuration(duration) {
        this.duration = duration;
        duration.parent = this;
        return this;
    }

    getText() {
        return `Think "${this.message.getText()}"${this.duration ? ` for ${this.duration.getText()} seconds` : ''}`;
    }
}

// Change Statement Node (change x by, change y by, etc.)
class ChangeStatementNode extends ASTNode {
    constructor(property, value, start, end) {
        super('ChangeStatement', start, end);
        this.property = property;
        this.value = value;
        property.parent = this;
        value.parent = this;
    }

    getText() {
        return `Change ${this.property.getText()} by ${this.value.getText()}`;
    }
}

// Set Statement Node (set x to, set y to, etc.)
class SetStatementNode extends ASTNode {
    constructor(property, value, start, end) {
        super('SetStatement', start, end);
        this.property = property;
        this.value = value;
        property.parent = this;
        value.parent = this;
    }

    getText() {
        return `Set ${this.property.getText()} to ${this.value.getText()}`;
    }
}

// Show/Hide Statement Node
class VisibilityStatementNode extends ASTNode {
    constructor(show, start, end) {
        super('VisibilityStatement', start, end);
        this.show = show;
    }

    getText() {
        return this.show ? 'Show' : 'Hide';
    }
}

// Go To Statement Node
class GoToStatementNode extends ASTNode {
    constructor(target, start, end) {
        super('GoToStatement', start, end);
        this.target = target;
        this.x = null;
        this.y = null;
        this.frontBack = null; // 'front', 'back', or null
        target.parent = this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (x) x.parent = this;
        if (y) y.parent = this;
        return this;
    }

    setFrontBack(frontBack) {
        this.frontBack = frontBack;
        return this;
    }

    getText() {
        if (this.target) {
            return `Go to ${this.target.getText()}`;
        }
        return `Go to x: ${this.x.getText()} y: ${this.y.getText()}`;
    }
}

// Glide Statement Node
class GlideStatementNode extends ASTNode {
    constructor(duration, target, start, end) {
        super('GlideStatement', start, end);
        this.duration = duration;
        this.target = target;
        this.x = null;
        this.y = null;
        duration.parent = this;
        target.parent = this;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        if (x) x.parent = this;
        if (y) y.parent = this;
        return this;
    }

    getText() {
        return `Glide ${this.duration.getText()} secs to ${this.target ? this.target.getText() : `x: ${this.x.getText()} y: ${this.y.getText()}`}`;
    }
}

// Point In Direction Statement Node
class PointInDirectionStatementNode extends ASTNode {
    constructor(direction, start, end) {
        super('PointInDirectionStatement', start, end);
        this.direction = direction;
        direction.parent = this;
    }

    getText() {
        return `Point in direction ${this.direction.getText()}`;
    }
}

// Turn Statement Node
class TurnStatementNode extends ASTNode {
    constructor(direction, degrees, start, end) {
        super('TurnStatement', start, end);
        this.direction = direction; // 'left' or 'right'
        this.degrees = degrees;
        degrees.parent = this;
    }

    getText() {
        return `Turn ${this.direction} ${this.degrees.getText()} degrees`;
    }
}

// Change Size Statement Node
class ChangeSizeStatementNode extends ASTNode {
    constructor(percent, start, end) {
        super('ChangeSizeStatement', start, end);
        this.percent = percent;
        percent.parent = this;
    }

    getText() {
        return `Change size by ${this.percent.getText()}%`;
    }
}

// Set Size Statement Node
class SetSizeStatementNode extends ASTNode {
    constructor(percent, start, end) {
        super('SetSizeStatement', start, end);
        this.percent = percent;
        percent.parent = this;
    }

    getText() {
        return `Set size to ${this.percent.getText()}%`;
    }
}

// Change Effect Statement Node
class ChangeEffectStatementNode extends ASTNode {
    constructor(effect, value, start, end) {
        super('ChangeEffectStatement', start, end);
        this.effect = effect; // 'color', 'fisheye', 'whirl', 'pixelate', 'mosaic', 'brightness', 'ghost'
        this.value = value;
        effect.parent = this;
        value.parent = this;
    }

    getText() {
        return `Change ${this.effect.getText()} effect by ${this.value.getText()}`;
    }
}

// Set Effect Statement Node
class SetEffectStatementNode extends ASTNode {
    constructor(effect, value, start, end) {
        super('SetEffectStatement', start, end);
        this.effect = effect;
        this.value = value;
        effect.parent = this;
        value.parent = this;
    }

    getText() {
        return `Set ${this.effect.getText()} effect to ${this.value.getText()}`;
    }
}

// Clear Effects Statement Node
class ClearEffectsStatementNode extends ASTNode {
    constructor(start, end) {
        super('ClearEffectsStatement', start, end);
    }

    getText() {
        return 'Clear graphic effects';
    }
}

// Switch Costume Statement Node
class SwitchCostumeStatementNode extends ASTNode {
    constructor(costume, start, end) {
        super('SwitchCostumeStatement', start, end);
        this.costume = costume;
        costume.parent = this;
    }

    getText() {
        return `Switch costume to ${this.costume.getText()}`;
    }
}

// Switch Backdrop Statement Node
class SwitchBackdropStatementNode extends ASTNode {
    constructor(backdrop, start, end) {
        super('SwitchBackdropStatement', start, end);
        this.backdrop = backdrop;
        backdrop.parent = this;
    }

    getText() {
        return `Switch backdrop to ${this.backdrop.getText()}`;
    }
}

// Next Costume Statement Node
class NextCostumeStatementNode extends ASTNode {
    constructor(start, end) {
        super('NextCostumeStatement', start, end);
    }

    getText() {
        return 'Next costume';
    }
}

// Next Backdrop Statement Node
class NextBackdropStatementNode extends ASTNode {
    constructor(start, end) {
        super('NextBackdropStatement', start, end);
    }

    getText() {
        return 'Next backdrop';
    }
}

// Play Sound Statement Node
class PlaySoundStatementNode extends ASTNode {
    constructor(sound, start, end) {
        super('PlaySoundStatement', start, end);
        this.sound = sound;
        sound.parent = this;
    }

    getText() {
        return `Play sound ${this.sound.getText()}`;
    }
}

// Stop Sound Statement Node
class StopSoundStatementNode extends ASTNode {
    constructor(sound, start, end) {
        super('StopSoundStatement', start, end);
        this.sound = sound;
        sound.parent = this;
    }

    getText() {
        return `Stop sound ${this.sound.getText()}`;
    }
}

// Play Sound Until Done Statement Node
class PlaySoundUntilDoneStatementNode extends ASTNode {
    constructor(sound, start, end) {
        super('PlaySoundUntilDoneStatement', start, end);
        this.sound = sound;
        sound.parent = this;
    }

    getText() {
        return `Play sound ${this.sound.getText()} until done`;
    }
}

// Stop All Sounds Statement Node
class StopAllSoundsStatementNode extends ASTNode {
    constructor(start, end) {
        super('StopAllSoundsStatement', start, end);
    }

    getText() {
        return 'Stop all sounds';
    }
}

// Change Volume Statement Node
class ChangeVolumeStatementNode extends ASTNode {
    constructor(volume, start, end) {
        super('ChangeVolumeStatement', start, end);
        this.volume = volume;
        volume.parent = this;
    }

    getText() {
        return `Change volume by ${this.volume.getText()}`;
    }
}

// Set Volume Statement Node
class SetVolumeStatementNode extends ASTNode {
    constructor(volume, start, end) {
        super('SetVolumeStatement', start, end);
        this.volume = volume;
        volume.parent = this;
    }

    getText() {
        return `Set volume to ${this.volume.getText()}%`;
    }
}

// Ask Statement Node
class AskStatementNode extends ASTNode {
    constructor(question, start, end) {
        super('AskStatement', start, end);
        this.question = question;
        this.wait = false;
        question.parent = this;
    }

    setWait(wait) {
        this.wait = wait;
        return this;
    }

    getText() {
        return `Ask ${this.question.getText()}${this.wait ? ' and wait' : ''}`;
    }
}

// Answer Node (represents the answer to an ask statement)
class AnswerNode extends ASTNode {
    constructor(start, end) {
        super('Answer', start, end);
    }

    getText() {
        return 'Answer';
    }
}

// Touching Condition Node
class TouchingConditionNode extends ASTNode {
    constructor(target, start, end) {
        super('TouchingCondition', start, end);
        this.target = target;
        this.type = 'sprite'; // 'sprite', 'color', 'edge'
        target.parent = this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    getText() {
        switch (this.type) {
            case 'color': return `Touching color ${this.target.getText()}`;
            case 'edge': return 'Touching edge';
            default: return `Touching ${this.target.getText()}`;
        }
    }
}

// Key Pressed Condition Node
class KeyPressedConditionNode extends ASTNode {
    constructor(key, start, end) {
        super('KeyPressedCondition', start, end);
        this.key = key;
        key.parent = this;
    }

    getText() {
        return `Key ${this.key.getText()} pressed`;
    }
}

// Mouse Pressed Condition Node
class MousePressedConditionNode extends ASTNode {
    constructor(start, end) {
        super('MousePressedCondition', start, end);
    }

    getText() {
        return 'Mouse down';
    }
}

// Boolean Condition Node
class BooleanConditionNode extends ASTNode {
    constructor(value, start, end) {
        super('BooleanCondition', start, end);
        this.value = value;
        value.parent = this;
    }

    getText() {
        return this.value.getText();
    }
}

// Comparison Node
class ComparisonNode extends ASTNode {
    constructor(left, operator, right, start, end) {
        super('Comparison', start, end);
        this.left = left;
        this.operator = operator; // '>', '<', '>=', '<=', '=', '!='
        this.right = right;
        left.parent = this;
        right.parent = this;
    }

    getText() {
        return `${this.left.getText()} ${this.operator} ${this.right.getText()}`;
    }
}

// Logic Node (and, or)
class LogicNode extends ASTNode {
    constructor(left, operator, right, start, end) {
        super('Logic', start, end);
        this.left = left;
        this.operator = operator; // 'and', 'or'
        this.right = right;
        left.parent = this;
        right.parent = this;
    }

    getText() {
        return `${this.left.getText()} ${this.operator} ${this.right.getText()}`;
    }
}

// Not Node
class NotNode extends ASTNode {
    constructor(operand, start, end) {
        super('Not', start, end);
        this.operand = operand;
        operand.parent = this;
    }

    getText() {
        return `not ${this.operand.getText()}`;
    }
}

// Math Node
class MathNode extends ASTNode {
    constructor(operator, operands, start, end) {
        super('Math', start, end);
        this.operator = operator; // '+', '-', '*', '/', '%', '^'
        this.operands = operands || [];
        this.operands.forEach(op => op.parent = this);
    }

    getText() {
        return this.operands.map(op => op.getText()).join(` ${this.operator} `);
    }
}

// Random Node
class RandomNode extends ASTNode {
    constructor(min, max, start, end) {
        super('Random', start, end);
        this.min = min;
        this.max = max;
        min.parent = this;
        max.parent = this;
    }

    getText() {
        return `random(${this.min.getText()}, ${this.max.getText()})`;
    }
}

// Length Node (string or list length)
class LengthNode extends ASTNode {
    constructor(target, start, end) {
        super('Length', start, end);
        this.target = target;
        target.parent = this;
    }

    getText() {
        return `length of ${this.target.getText()}`;
    }
}

// Join Node (string concatenation)
class JoinNode extends ASTNode {
    constructor(parts, start, end) {
        super('Join', start, end);
        this.parts = parts || [];
        this.parts.forEach(part => part.parent = this);
    }

    getText() {
        return this.parts.map(p => p.getText()).join(' + ');
    }
}

// Letter Node (get letter at index)
class LetterNode extends ASTNode {
    constructor(index, string, start, end) {
        super('Letter', start, end);
        this.index = index;
        this.string = string;
        index.parent = this;
        string.parent = this;
    }

    getText() {
        return `letter ${this.index.getText()} of ${this.string.getText()}`;
    }
}

// Contains Node
class ContainsNode extends ASTNode {
    constructor(string, substring, start, end) {
        super('Contains', start, end);
        this.string = string;
        this.substring = substring;
        string.parent = this;
        substring.parent = this;
    }

    getText() {
        return `${this.string.getText()} contains ${this.substring.getText()}`;
    }
}

// Modulo Node
class ModuloNode extends ASTNode {
    constructor(dividend, divisor, start, end) {
        super('Modulo', start, end);
        this.dividend = dividend;
        this.divisor = divisor;
        dividend.parent = this;
        divisor.parent = this;
    }

    getText() {
        return `${this.dividend.getText()} mod ${this.divisor.getText()}`;
    }
}

// Round Node
class RoundNode extends ASTNode {
    constructor(value, start, end) {
        super('Round', start, end);
        this.value = value;
        value.parent = this;
    }

    getText() {
        return `round(${this.value.getText()})`;
    }
}

// Math Function Node (abs, floor, ceil, sqrt, sin, cos, tan, asin, acos, atan, ln, log, e^)
class MathFunctionNode extends ASTNode {
    constructor(functionName, argument, start, end) {
        super('MathFunction', start, end);
        this.functionName = functionName;
        this.argument = argument;
        argument.parent = this;
    }

    getText() {
        return `${this.functionName}(${this.argument.getText()})`;
    }
}

// List Operations Node
class ListOperationNode extends ASTNode {
    constructor(operation, list, index, value, start, end) {
        super('ListOperation', start, end);
        this.operation = operation; // 'add', 'remove', 'insert', 'replace'
        this.list = list;
        this.index = index;
        this.value = value;
        list.parent = this;
        if (index) index.parent = this;
        if (value) value.parent = this;
    }

    getText() {
        switch (this.operation) {
            case 'add': return `add ${this.value.getText()} to ${this.list.getText()}`;
            case 'remove': return `remove ${this.index ? `item ${this.index.getText()} from ` : ''}${this.list.getText()}`;
            case 'insert': return `insert ${this.value.getText()} at ${this.index.getText()} in ${this.list.getText()}`;
            case 'replace': return `replace item ${this.index.getText()} of ${this.list.getText()} with ${this.value.getText()}`;
            default: return this.operation;
        }
    }
}

// List Index Node (get item at index)
class ListIndexNode extends ASTNode {
    constructor(list, index, start, end) {
        super('ListIndex', start, end);
        this.list = list;
        this.index = index;
        list.parent = this;
        index.parent = this;
    }

    getText() {
        return `item ${this.index.getText()} of ${this.list.getText()}`;
    }
}

// List Contains Node
class ListContainsNode extends ASTNode {
    constructor(list, value, start, end) {
        super('ListContains', start, end);
        this.list = list;
        this.value = value;
        list.parent = this;
        value.parent = this;
    }

    getText() {
        return `${this.list.getText()} contains ${this.value.getText()}`;
    }
}

// List Length Node
class ListLengthNode extends ASTNode {
    constructor(list, start, end) {
        super('ListLength', start, end);
        this.list = list;
        list.parent = this;
    }

    getText() {
        return `length of ${this.list.getText()}`;
    }
}

// Timer Node
class TimerNode extends ASTNode {
    constructor(start, end) {
        super('Timer', start, end);
    }

    getText() {
        return 'timer';
    }
}

// Current Date/Time Node
class CurrentDateNode extends ASTNode {
    constructor(start, end) {
        super('CurrentDate', start, end);
    }

    getText() {
        return 'current date';
    }
}

// Current Year Node
class CurrentYearNode extends ASTNode {
    constructor(start, end) {
        super('CurrentYear', start, end);
    }

    getText() {
        return 'current year';
    }
}

// Current Month Node
class CurrentMonthNode extends ASTNode {
    constructor(start, end) {
        super('CurrentMonth', start, end);
    }

    getText() {
        return 'current month';
    }
}

// Current Day Node
class CurrentDayNode extends ASTNode {
    constructor(start, end) {
        super('CurrentDay', start, end);
    }

    getText() {
        return 'current day';
    }
}

// Current Hour Node
class CurrentHourNode extends ASTNode {
    constructor(start, end) {
        super('CurrentHour', start, end);
    }

    getText() {
        return 'current hour';
    }
}

// Current Minute Node
class CurrentMinuteNode extends ASTNode {
    constructor(start, end) {
        super('CurrentMinute', start, end);
    }

    getText() {
        return 'current minute';
    }
}

// Current Second Node
class CurrentSecondNode extends ASTNode {
    constructor(start, end) {
        super('CurrentSecond', start, end);
    }

    getText() {
        return 'current second';
    }
}

// Mouse X Node
class MouseXNode extends ASTNode {
    constructor(start, end) {
        super('MouseX', start, end);
    }

    getText() {
        return 'mouse x';
    }
}

// Mouse Y Node
class MouseYNode extends ASTNode {
    constructor(start, end) {
        super('MouseY', start, end);
    }

    getText() {
        return 'mouse y';
    }
}

// Mouse Down Node
class MouseDownNode extends ASTNode {
    constructor(start, end) {
        super('MouseDown', start, end);
    }

    getText() {
        return 'mouse down';
    }
}

// X Position Node
class XPositionNode extends ASTNode {
    constructor(target, start, end) {
        super('XPosition', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `x position of ${this.target.getText()}` : 'x position';
    }
}

// Y Position Node
class YPositionNode extends ASTNode {
    constructor(target, start, end) {
        super('YPosition', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `y position of ${this.target.getText()}` : 'y position';
    }
}

// Direction Node
class DirectionNode extends ASTNode {
    constructor(target, start, end) {
        super('Direction', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `direction of ${this.target.getText()}` : 'direction';
    }
}

// Costume Number Node
class CostumeNumberNode extends ASTNode {
    constructor(target, start, end) {
        super('CostumeNumber', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `costume number of ${this.target.getText()}` : 'costume number';
    }
}

// Costume Name Node
class CostumeNameNode extends ASTNode {
    constructor(target, start, end) {
        super('CostumeName', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `costume name of ${this.target.getText()}` : 'costume name';
    }
}

// Size Node
class SizeNode extends ASTNode {
    constructor(target, start, end) {
        super('Size', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `size of ${this.target.getText()}` : 'size';
    }
}

// Volume Node
class VolumeNode extends ASTNode {
    constructor(target, start, end) {
        super('Volume', start, end);
        this.target = target || null;
        if (target) target.parent = this;
    }

    getText() {
        return this.target ? `volume of ${this.target.getText()}` : 'volume';
    }
}

// Backdrop Number Node
class BackdropNumberNode extends ASTNode {
    constructor(start, end) {
        super('BackdropNumber', start, end);
    }

    getText() {
        return 'backdrop number';
    }
}

// Backdrop Name Node
class BackdropNameNode extends ASTNode {
    constructor(start, end) {
        super('BackdropName', start, end);
    }

    getText() {
        return 'backdrop name';
    }
}

// Loudness Node
class LoudnessNode extends ASTNode {
    constructor(start, end) {
        super('Loudness', start, end);
    }

    getText() {
        return 'loudness';
    }
}

// Distance To Node
class DistanceToNode extends ASTNode {
    constructor(target, start, end) {
        super('DistanceTo', start, end);
        this.target = target;
        target.parent = this;
    }

    getText() {
        return `distance to ${this.target.getText()}`;
    }
}

// Days Since 2000 Node
class DaysSince2000Node extends ASTNode {
    constructor(start, end) {
        super('DaysSince2000', start, end);
    }

    getText() {
        return 'days since 2000';
    }
}

// Username Node
class UsernameNode extends ASTNode {
    constructor(start, end) {
        super('Username', start, end);
    }

    getText() {
        return 'username';
    }
}

// User ID Node
class UserIdNode extends ASTNode {
    constructor(start, end) {
        super('UserId', start, end);
    }

    getText() {
        return 'user id';
    }
}

// Export all node classes
const AST = {
    ASTNode,
    ProgramNode,
    ImportNode,
    SpriteDeclarationNode,
    StageDeclarationNode,
    SceneDeclarationNode,
    CostumeNode,
    SoundNode,
    VariableDeclarationNode,
    ListDeclarationNode,
    FunctionDeclarationNode,
    ScriptNode,
    EventNode,
    BlockNode,
    LiteralNode,
    IdentifierNode,
    BinaryExpressionNode,
    UnaryExpressionNode,
    CallExpressionNode,
    MemberExpressionNode,
    ArrayExpressionNode,
    ConditionalExpressionNode,
    IfStatementNode,
    WhileStatementNode,
    RepeatStatementNode,
    ForeverStatementNode,
    ForStatementNode,
    BroadcastStatementNode,
    StopStatementNode,
    WaitStatementNode,
    SayStatementNode,
    ThinkStatementNode,
    ChangeStatementNode,
    SetStatementNode,
    VisibilityStatementNode,
    GoToStatementNode,
    GlideStatementNode,
    PointInDirectionStatementNode,
    TurnStatementNode,
    ChangeSizeStatementNode,
    SetSizeStatementNode,
    ChangeEffectStatementNode,
    SetEffectStatementNode,
    ClearEffectsStatementNode,
    SwitchCostumeStatementNode,
    SwitchBackdropStatementNode,
    NextCostumeStatementNode,
    NextBackdropStatementNode,
    PlaySoundStatementNode,
    StopSoundStatementNode,
    PlaySoundUntilDoneStatementNode,
    StopAllSoundsStatementNode,
    ChangeVolumeStatementNode,
    SetVolumeStatementNode,
    AskStatementNode,
    AnswerNode,
    TouchingConditionNode,
    KeyPressedConditionNode,
    MousePressedConditionNode,
    BooleanConditionNode,
    ComparisonNode,
    LogicNode,
    NotNode,
    MathNode,
    RandomNode,
    LengthNode,
    JoinNode,
    LetterNode,
    ContainsNode,
    ModuloNode,
    RoundNode,
    MathFunctionNode,
    ListOperationNode,
    ListIndexNode,
    ListContainsNode,
    ListLengthNode,
    TimerNode,
    CurrentDateNode,
    CurrentYearNode,
    CurrentMonthNode,
    CurrentDayNode,
    CurrentHourNode,
    CurrentMinuteNode,
    CurrentSecondNode,
    MouseXNode,
    MouseYNode,
    MouseDownNode,
    XPositionNode,
    YPositionNode,
    DirectionNode,
    CostumeNumberNode,
    CostumeNameNode,
    SizeNode,
    VolumeNode,
    BackdropNumberNode,
    BackdropNameNode,
    LoudnessNode,
    DistanceToNode,
    DaysSince2000Node,
    UsernameNode,
    UserIdNode
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AST = AST;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AST;
}
