/**
 * Scratch AI Generator - JavaScript Library
 * Diese Datei enthält die Kernfunktionen für die .sb3 Datei-Generierung
 */

class ScratchAIGenerator {
    constructor() {
        this.templates = {
            empty: this.createEmptyTemplate(),
            sprite: this.createSpriteTemplate(),
            game: this.createGameTemplate(),
            story: this.createStoryTemplate()
        };
        
        this.providerModels = {
            gemini: [
                { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', free: true },
                { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', free: false },
                { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', free: true }
            ],
            openai: [
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', free: false },
                { id: 'gpt-4o', name: 'GPT-4o', free: false },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', free: false }
            ],
            anthropic: [
                { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', free: false },
                { id: 'claude-3-haiku', name: 'Claude 3 Haiku', free: false },
                { id: 'claude-2-1', name: 'Claude 2.1', free: false }
            ]
        };
    }
    
    // Template: Leeres Projekt
    createEmptyTemplate() {
        return {
            name: 'Leeres Projekt',
            description: 'Standard Scratch-Projekt mit leerer Bühne',
            structure: {
                sprites: [],
                stage: {
                    costumes: [this.createEmptyCostume(480, 360)],
                    sounds: [],
                    code: []
                }
            }
        };
    }
    
    // Template: Einfacher Sprite
    createSpriteTemplate() {
        return {
            name: 'Einfacher Sprite',
            description: 'Projekt mit einem Sprite und Grundbewegungen',
            structure: {
                sprites: [{
                    name: 'Sprite1',
                    costumes: [this.createColoredCostume('#4a6baf')],
                    sounds: [],
                    code: [
                        this.createBlock('whenGreenFlag'),
                        this.createBlock('forever', [
                            this.createBlock('move', { steps: 10 }),
                            this.createBlock('ifOnEdgeBounce')
                        ])
                    ]
                }],
                stage: {
                    costumes: [this.createEmptyCostume(480, 360)],
                    sounds: [],
                    code: []
                }
            }
        };
    }
    
    // Template: Spiel
    createGameTemplate() {
        return {
            name: 'Spiel-Template',
            description: 'Grundgerüst für Spiele mit Score und Leben',
            structure: {
                sprites: [
                    {
                        name: 'Player',
                        costumes: [this.createColoredCostume('#4a6baf')],
                        sounds: [],
                        code: [
                            this.createBlock('whenGreenFlag'),
                            this.createBlock('setVar', { name: 'score', value: 0 }),
                            this.createBlock('setVar', { name: 'lives', value: 3 }),
                            this.createBlock('forever', [
                                this.createBlock('ifKeyPressed', { 
                                    key: 'right arrow', 
                                    substack: [this.createBlock('changeX', { value: 10 })]
                                }),
                                this.createBlock('ifKeyPressed', { 
                                    key: 'left arrow', 
                                    substack: [this.createBlock('changeX', { value: -10 })]
                                })
                            ])
                        ]
                    }
                ],
                stage: {
                    costumes: [this.createEmptyCostume(480, 360)],
                    sounds: [],
                    code: []
                }
            }
        };
    }
    
    // Template: Geschichte
    createStoryTemplate() {
        return {
            name: 'Geschichte',
            description: 'Template für interaktive Geschichten',
            structure: {
                sprites: [
                    {
                        name: 'Character',
                        costumes: [
                            this.createColoredCostume('#4a6baf'),
                            this.createColoredCostume('#ff715b')
                        ],
                        sounds: [],
                        code: [
                            this.createBlock('whenGreenFlag'),
                            this.createBlock('switchCostumeTo', { costume: 'costume1' }),
                            this.createBlock('say', { text: 'Hallo!', duration: 2 }),
                            this.createBlock('wait', { duration: 2 }),
                            this.createBlock('switchCostumeTo', { costume: 'costume2' }),
                            this.createBlock('say', { text: 'Wie geht es dir?', duration: 2 })
                        ]
                    }
                ],
                stage: {
                    costumes: [this.createEmptyCostume(480, 360)],
                    sounds: [],
                    code: []
                }
            }
        };
    }
    
    // Scratch-Block erstellen
    createBlock(opcode, inputs = {}, next = null) {
        const block = {
            opcode: opcode,
            next: next,
            parent: null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: true,
            x: 0,
            y: 0
        };
        
        // Standard-Inputs für häufige Blöcke
        const defaultInputs = {
            'move': { STEPS: [1, [10, "10"]] },
            'setVar': { VAR: [1, [10, "score"]], VALUE: [1, [10, "0"]] },
            'changeX': { DX: [1, [10, "10"]] },
            'wait': { DURATION: [1, [10, "1"]] },
            'say': { MESSAGE: [1, [10, "Hallo!"]], SECS: [1, [10, "2"]] },
            'whenGreenFlag': {},
            'forever': { SUBSTACK: [1, []] },
            'ifOnEdgeBounce': {},
            'ifKeyPressed': { KEY: [1, [10, "right arrow"]], SUBSTACK: [1, []] },
            'switchCostumeTo': { COSTUME: [1, [10, "costume1"]] },
            'comment': { COMMENT: [1, [10, "// Automatisch generierter Code"]] }
        };
        
        if (defaultInputs[opcode]) {
            block.inputs = { ...defaultInputs[opcode], ...inputs };
        } else {
            block.inputs = inputs;
        }
        
        return block;
    }
    
    // Leeres Kostüm erstellen
    createEmptyCostume(width = 480, height = 360) {
        // In einer Browser-Umgebung
        if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            return canvas.toDataURL('image/png');
        }
        
        // Server-seitig: Base64 für weißes Bild
        return this.createWhitePngBase64(width, height);
    }
    
    // Farbiges Kostüm erstellen
    createColoredCostume(color, width = 48, height = 48) {
        if (typeof document !== 'undefined') {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.rect(10, 10, width - 20, height - 20);
            ctx.fill();
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(10, 10, width - 20, height - 20);
            
            return canvas.toDataURL('image/png');
        }
        
        return this.createColoredPngBase64(color, width, height);
    }
    
    // Base64 für weißes PNG (Server-seitig)
    createWhitePngBase64(width, height) {
        // Vereinfachte Version - in einer echten Implementierung würde man ein PNG generieren
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA${this.toBase64Width(width)}x${this.toBase64Width(height)}AAAAEklEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC`;
    }
    
    // Hilfsfunktion für Base64-Kodierung von Zahlen
    toBase64Width(num) {
        return ('00' + num.toString(16)).substr(-2);
    }
    
    // Base64 für farbiges PNG (Server-seitig)
    createColoredPngBase64(color, width, height) {
        // Vereinfachte Version
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA${this.toBase64Width(width)}x${this.toBase64Width(height)}AAAAEklEQVR42mNkYPhfz0AEYBxVSF+FAP5FDvcfRYWgAAAAAElFTkSuQmCC`;
    }
    
    // Projekt aus Template generieren
    generateFromTemplate(templateName, projectName, designOptions = {}) {
        const template = this.templates[templateName] || this.templates.empty;
        
        const project = {
            objName: projectName || 'MeinProjekt',
            editorData: {
                stage: template.structure.stage,
                sprites: template.structure.sprites
            },
            meta: {
                semver: '3.0.0',
                vm: '0.2.0-prerelease.20210419103757',
                agent: 'Scratch AI Generator'
            }
        };
        
        // Design-Optionen anwenden
        return this.applyDesignOptions(project, designOptions);
    }
    
    // Design-Optionen anwenden
    applyDesignOptions(project, options = {}) {
        const {
            bgColor = '#f8f9fa',
            spriteColor = '#4a6baf',
            textColor = '#333333',
            animationSpeed = 5,
            includeComments = true,
            optimizeCode = true
        } = options;
        
        // Hintergrundfarbe anpassen
        if (project.editorData.stage.costumes && project.editorData.stage.costumes.length > 0) {
            project.editorData.stage.costumes[0].data = this.createColoredCostume(bgColor, 480, 360);
        }
        
        // Sprite-Farben anpassen
        if (project.editorData.sprites) {
            project.editorData.sprites.forEach(sprite => {
                if (sprite.costumes && sprite.costumes.length > 0) {
                    sprite.costumes[0].data = this.createColoredCostume(spriteColor);
                }
                
                // Animationsgeschwindigkeit in Code anpassen
                if (sprite.code) {
                    sprite.code.forEach(block => {
                        if (block.opcode === 'move' && block.inputs && block.inputs.STEPS) {
                            block.inputs.STEPS[1] = (animationSpeed * 2).toString();
                        }
                    });
                }
            });
        }
        
        // Code optimieren
        if (optimizeCode) {
            project = this.optimizeProjectCode(project);
        }
        
        // Kommentare hinzufügen
        if (includeComments) {
            project = this.addCommentsToProject(project);
        }
        
        return project;
    }
    
    // Projekt-Code optimieren
    optimizeProjectCode(project) {
        if (project.editorData.sprites) {
            project.editorData.sprites.forEach(sprite => {
                if (sprite.code && sprite.code.length > 0) {
                    // Hier könnte man komplexere Optimierungen durchführen
                    // Für jetzt nur ein Platzhalter
                }
            });
        }
        return project;
    }
    
    // Kommentare zum Projekt hinzufügen
    addCommentsToProject(project) {
        if (project.editorData.sprites) {
            project.editorData.sprites.forEach(sprite => {
                if (sprite.code && sprite.code.length > 0) {
                    // Kommentar-Block am Anfang hinzufügen
                    sprite.code.unshift(this.createBlock('comment', {
                        COMMENT: [1, [10, `// ${sprite.name} - Automatisch generierter Code`]]
                    }));
                }
            });
        }
        return project;
    }
    
    // Echte .sb3 Datei erstellen (erfordert JSZip)
    async createSb3File(project, useJSZip = false) {
        if (useJSZip && typeof JSZip !== 'undefined') {
            return await this.createSb3WithJSZip(project);
        } else {
            // Fallback: JSON-Datei
            const projectJson = JSON.stringify(project, null, 2);
            return new Blob([projectJson], { type: 'application/json' });
        }
    }
    
    // .sb3 Datei mit JSZip erstellen
    async createSb3WithJSZip(project) {
        try {
            const JSZip = window.JSZip;
            if (!JSZip) {
                throw new Error('JSZip nicht verfügbar');
            }
            
            const zip = new JSZip();
            
            // Projekt-Datei hinzufügen
            zip.file('project.json', JSON.stringify(project, null, 2));
            
            // Costumes und Sounds hinzufügen
            if (project.editorData.stage.costumes) {
                project.editorData.stage.costumes.forEach((costume, index) => {
                    const base64Data = costume.data.replace(/^data:image\/\w+;base64,/, '');
                    const binaryData = atob(base64Data);
                    zip.file(`stage/costumes/${costume.name}.png`, binaryData, { binary: true });
                });
            }
            
            if (project.editorData.sprites) {
                project.editorData.sprites.forEach((sprite, spriteIndex) => {
                    if (sprite.costumes) {
                        sprite.costumes.forEach((costume, costumeIndex) => {
                            const base64Data = costume.data.replace(/^data:image\/\w+;base64,/, '');
                            const binaryData = atob(base64Data);
                            zip.file(`sprites/${sprite.name}/costumes/${costume.name}.png`, binaryData, { binary: true });
                        });
                    }
                });
            }
            
            // ZIP-Archiv generieren
            const content = await zip.generateAsync({ type: 'blob' });
            return content;
            
        } catch (error) {
            console.error('Fehler bei der ZIP-Erstellung:', error);
            // Fallback: JSON-Datei
            const projectJson = JSON.stringify(project, null, 2);
            return new Blob([projectJson], { type: 'application/json' });
        }
    }
    
    // Projekt als .sb3 Datei herunterladen
    downloadProject(project, filename) {
        const projectName = filename || project.objName || 'scratch_project';
        
        // Zuerst als JSON speichern (da JSZip möglicherweise nicht verfügbar ist)
        const projectJson = JSON.stringify(project, null, 2);
        const blob = new Blob([projectJson], { type: 'application/json' });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = projectName + '.sb3.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // KI-spezifische Prompts generieren
    generateAIPrompt(projectName, description, templateName) {
        const template = this.templates[templateName] || this.templates.empty;
        
        return `Erstelle ein Scratch 3 (.sb3) Projekt mit dem Namen "${projectName}" basierend auf folgender Beschreibung: ${description}

Verwende das Template: ${template.name} - ${template.description}

Antworte NUR mit einem gültigen JSON-Objekt, das die Scratch-Projektstruktur enthält.`;
    }
    
    // KI-Antwort in Projekt umwandeln
    parseAIResponse(responseText) {
        try {
            // Versuche, die Antwort als JSON zu parsen
            const project = JSON.parse(responseText);
            
            // Grundlegende Validierung
            if (!project.editorData) {
                throw new Error('Ungültige Projektstruktur');
            }
            
            return project;
        } catch (error) {
            console.error('Fehler beim Parsen der KI-Antwort:', error);
            // Fallback: Leeres Projekt
            return this.generateFromTemplate('empty', 'KI_Projekt');
        }
    }
    
    // Dateigröße formatieren
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' Bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

// Export für Node.js und Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScratchAIGenerator;
} else if (typeof window !== 'undefined') {
    window.ScratchAIGenerator = ScratchAIGenerator;
}
