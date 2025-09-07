// Menu Scene - Main menu with millionaire-style game options
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    preload() {
        console.log('MenuScene preload complete');
    }
    
    create() {
        console.log('🎮 MenuScene create() called');
        const { width, height } = this.scale;
        
        // Create vibrant millionaire background
        this.createMillionaireBackground();
        
        // Title with enhanced styling
        this.createTitle();
        
        // Game statistics
        this.createStatistics();

        // Menu buttons with millionaire theme
        this.createMenuButtons();

        // Animated background effects
        this.createBackgroundEffects();

        // Set up resize handler for mobile responsiveness
        this.events.on('resize', this.handleResize, this);
        this.scale.on('resize', this.handleResize, this);

        console.log('✅ MenuScene creation complete');
    }
    
    handleResize() {
        const { width, height } = this.scale;
        
        // Recreate layout for new dimensions
        this.children.removeAll(true);
        
        // Recreate all elements with new dimensions
        this.createMillionaireBackground();
        this.createTitle();
        this.createStatistics();
        this.createMenuButtons();
        this.createBackgroundEffects();
    }

    createMillionaireBackground() {
        const { width, height } = this.scale;

        // Create rich gradient background like millionaire show
        const graphics = this.add.graphics();

        // Deep blue to purple gradient with gold accents
        graphics.fillGradientStyle(0x001144, 0x001144, 0x4400AA, 0x6600CC);
        graphics.fillRect(0, 0, width, height);

        // Add golden accent lines
        graphics.lineStyle(4, 0xFFD700, 0.9);
        graphics.beginPath();
        graphics.moveTo(0, height * 0.12);
        graphics.lineTo(width, height * 0.12);
        graphics.moveTo(0, height * 0.88);
        graphics.lineTo(width, height * 0.88);
        graphics.strokePath();

        // Add diamond pattern
        for (let i = 0; i < 6; i++) {
            const x = (width / 7) * (i + 1);
            const y = height * 0.12;
            this.createDiamond(graphics, x, y, 10, 0xFFD700, 0.6);
        }

        for (let i = 0; i < 6; i++) {
            const x = (width / 7) * (i + 1);
            const y = height * 0.88;
            this.createDiamond(graphics, x, y, 10, 0xFFD700, 0.6);
        }

        // Add corner sparkles
        this.createSparkles();
    }

    createDiamond(graphics, x, y, size, color, alpha) {
        graphics.fillStyle(color, alpha);
        graphics.beginPath();
        graphics.moveTo(x, y - size);
        graphics.lineTo(x + size, y);
        graphics.lineTo(x, y + size);
        graphics.lineTo(x - size, y);
        graphics.closePath();
        graphics.fillPath();
    }

    createSparkles() {
        const { width, height } = this.scale;

        // Add animated sparkles in corners
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.1;

            const sparkle = this.add.circle(x, y, 2, 0xFFFFFF, 0.8);

            this.tweens.add({
                targets: sparkle,
                alpha: { from: 0.2, to: 1 },
                scale: { from: 0.5, to: 1.2 },
                duration: 1500 + Math.random() * 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createTitle() {
        const { width, height } = this.scale;
        const translations = window.translationManager;
        const isMobile = width < 768;

        const titleText = 'QuizFlow';
        const subtitleText = translations && translations.getCurrentLanguage() === 'hi' ?
            'करोड़पति बनो!' :
            'Who Wants to be a Millionaire?';

        // Mobile-responsive font sizes and positioning
        const titleFontSize = isMobile ? (width < 400 ? '48px' : '60px') : '96px';
        const titleY = isMobile ? height * 0.2 : height * 0.25;
        const subtitleFontSize = isMobile ? (width < 400 ? '18px' : '24px') : '32px';
        const subtitleY = isMobile ? height * 0.28 : height * 0.35;
        const strokeThickness = isMobile ? 3 : 6;

        // Main title with gold effect - mobile responsive
        const title = this.add.text(width / 2, titleY, titleText, {
            fontSize: titleFontSize,
            fontFamily: 'Orbitron, monospace',
            fill: '#FFD700',
            stroke: '#B8860B',
            strokeThickness: strokeThickness,
            fontWeight: '900',
            align: 'center'
        }).setOrigin(0.5);
        
        // Title shadow - mobile responsive
        const titleShadow = this.add.text(width / 2 + (isMobile ? 2 : 4), titleY + (isMobile ? 2 : 4), titleText, {
            fontSize: titleFontSize,
            fontFamily: 'Orbitron, monospace',
            fill: '#000000',
            alpha: 0.7,
            fontWeight: '900',
            align: 'center'
        }).setOrigin(0.5);
        titleShadow.setDepth(-1);
        
        // Subtitle with glow effect - mobile responsive
        const subtitle = this.add.text(width / 2, subtitleY, subtitleText, {
            fontSize: subtitleFontSize,
            fontFamily: 'Roboto, sans-serif',
            fill: '#FFFFFF',
            stroke: '#4400AA',
            strokeThickness: isMobile ? 1 : 2,
            fontWeight: '400',
            align: 'center',
            wordWrap: { width: width * 0.9 }
        }).setOrigin(0.5);
        
        // Add pulsing effect to title
        this.tweens.add({
            targets: title,
            scaleX: { from: 1, to: 1.05 },
            scaleY: { from: 1, to: 1.05 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createStatistics() {
        const { width, height } = this.scale;
        const translations = window.translationManager;
        const isMobile = width < 768;
        
        if (isMobile) {
            // On mobile, show simplified stats or skip to save space
            return;
        }
        
        // Stats background - only on larger screens
        const statsBg = this.add.rectangle(width * 0.15, height * 0.5, 200, 150, 0x000033, 0.8);
        statsBg.setStrokeStyle(2, 0xFFD700);
        
        const statsTitle = translations && translations.getCurrentLanguage() === 'hi' ?
            'आंकड़े' : 'Statistics';

        this.add.text(width * 0.15, height * 0.43, statsTitle, {
            fontSize: '18px',
            fontFamily: 'Orbitron, monospace',
            fill: '#FFD700'
        }).setOrigin(0.5);
        
        // Sample stats
        const stats = [
            'Games Played: 0',
            'Best Score: 0',
            'Accuracy: 0%'
        ];
        
        stats.forEach((stat, index) => {
            this.add.text(width * 0.15, height * 0.48 + (index * 20), stat, {
                fontSize: '14px',
                fontFamily: 'Roboto, sans-serif',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
        });
    }
    
    createMenuButtons() {
        const { width, height } = this.scale;
        const translations = window.translationManager;
        const isMobile = width < 768;
        
        const buttonData = [
            {
                text: translations && translations.getCurrentLanguage() === 'hi' ? 'खेल शुरू करें' : 'START GAME',
                y: isMobile ? height * 0.5 : height * 0.55,
                color: 0x00AA00,
                glowColor: 0x00FF00,
                action: () => this.startNewGame()
            },
            {
                text: translations && translations.getCurrentLanguage() === 'hi' ? 'सेटिंग्स' : 'SETTINGS',
                y: isMobile ? height * 0.62 : height * 0.65,
                color: 0x0066CC,
                glowColor: 0x00AAFF,
                action: () => this.showSettings()
            },
            {
                text: translations && translations.getCurrentLanguage() === 'hi' ? 'निर्देश' : 'INSTRUCTIONS',
                y: isMobile ? height * 0.74 : height * 0.75,
                color: 0xAA6600,
                glowColor: 0xFFAA00,
                action: () => this.showInstructions()
            }
        ];
        
        buttonData.forEach(button => {
            this.createMillionaireButton(width / 2, button.y, button.text, button.color, button.glowColor, button.action);
        });
    }
    
    createMillionaireButton(x, y, text, baseColor, glowColor, callback) {
        const { width } = this.scale;
        const isMobile = width < 768;
        
        // Mobile-responsive button sizing
        const buttonWidth = isMobile ? width * 0.8 : 240;
        const buttonHeight = isMobile ? 60 : 50;
        const fontSize = isMobile ? '20px' : '22px';
        
        // Button background with gradient
        const button = this.add.graphics();
        button.fillGradientStyle(baseColor, baseColor, baseColor * 0.7, baseColor * 0.7);
        button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        button.lineStyle(3, glowColor, 0.8);
        button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        button.x = x;
        button.y = y;
        
        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: fontSize,
            fontFamily: 'Orbitron, monospace',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Make interactive with mobile-responsive hit area
        const hitArea = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });
        
        // Hover effects with mobile-responsive dimensions
        hitArea.on('pointerover', () => {
            button.clear();
            button.fillGradientStyle(glowColor, glowColor, glowColor * 0.7, glowColor * 0.7);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            button.lineStyle(4, 0xFFFFFF, 1);
            button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            
            buttonText.setStyle({ fill: '#000000' });
            
            // Play hover sound
            if (window.audioManager) {
                window.audioManager.playSFX('menu_hover');
            }
        });
        
        hitArea.on('pointerout', () => {
            button.clear();
            button.fillGradientStyle(baseColor, baseColor, baseColor * 0.7, baseColor * 0.7);
            button.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            button.lineStyle(3, glowColor, 0.8);
            button.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
            
            buttonText.setStyle({ fill: '#FFFFFF' });
        });
        
        hitArea.on('pointerdown', () => {
            if (window.audioManager) {
                window.audioManager.playSFX('answer_select');
            }
            if (callback) callback();
        });
        
        return { button, text: buttonText, hitArea };
    }
    
    createBackgroundEffects() {
        const { width, height } = this.scale;
        
        // Add floating lights
        for (let i = 0; i < 15; i++) {
            const light = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 3 + 1,
                0xFFD700,
                0.3
            );

            this.tweens.add({
                targets: light,
                y: light.y - 50,
                alpha: { from: 0.1, to: 0.6 },
                duration: 3000 + Math.random() * 2000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    async startNewGame() {
        console.log('Starting new game...');

        // Generate a new quiz session
        if (window.questionManager && window.questionManager.isLoaded) {
            const success = window.questionManager.generateSession();
            if (!success) {
                console.error('Failed to generate quiz session');
                return;
            }
        } else {
            console.error('Question manager not ready');
            return;
        }

        if (window.audioManager) {
            window.audioManager.playSFX('question_reveal');
        }
        
        // Transition to game scene
        this.scene.start('GameScene');
    }
    
    showSettings() {
        console.log('Showing settings...');
        const translations = window.translationManager;

    // Simple settings overlay
        const { width, height } = this.scale;
        
        // Settings background
        const settingsBg = this.add.rectangle(width / 2, height / 2, 400, 300, 0x000044, 0.95);
        settingsBg.setStrokeStyle(3, 0xFFD700);
        
        const settingsTitle = translations && translations.getCurrentLanguage() === 'hi' ?
            'सेटिंग्स' : 'SETTINGS';

        this.add.text(width / 2, height / 2 - 120, settingsTitle, {
            fontSize: '28px',
            fontFamily: 'Orbitron, monospace',
            fill: '#FFD700'
        }).setOrigin(0.5);
        
        // Language toggle
        const langLabel = translations && translations.getCurrentLanguage() === 'hi' ?
            'भाषा:' : 'Language:';

        this.add.text(width / 2 - 100, height / 2 - 50, langLabel, {
            fontSize: '18px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#FFFFFF'
        });

        const currentLang = translations ? translations.getCurrentLanguage() : 'en';
        const langText = currentLang === 'hi' ? 'हिंदी' : 'English';
        
        const langButton = this.add.text(width / 2 + 50, height / 2 - 50, langText, {
            fontSize: '18px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#FFD700'
        }).setInteractive({ useHandCursor: true });
        
        langButton.on('pointerdown', () => {
            if (translations) {
                const newLang = currentLang === 'en' ? 'hi' : 'en';
                translations.setLanguage(newLang);
                this.scene.restart(); // Restart scene to apply language changes
            }
        });
        
        // Close button
        const closeBtn = this.add.text(width / 2, height / 2 + 100, 'CLOSE', {
            fontSize: '20px',
            fontFamily: 'Orbitron, monospace',
            fill: '#FF6666'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            settingsBg.destroy();
            closeBtn.destroy();
            langButton.destroy();
        });
    }
    
    showInstructions() {
        console.log('Showing instructions...');
        const translations = window.translationManager;

        const { width, height } = this.scale;
        
        // Store all instruction elements for cleanup
        const instructionElements = [];
        
        const instructionsBg = this.add.rectangle(width / 2, height / 2, 500, 400, 0x000044, 0.95);
        instructionsBg.setStrokeStyle(3, 0xFFD700);
        instructionElements.push(instructionsBg);
        
        const instructionsTitle = translations && translations.getCurrentLanguage() === 'hi' ?
            'निर्देश' : 'HOW TO PLAY';

        const titleText = this.add.text(width / 2, height / 2 - 160, instructionsTitle, {
            fontSize: '28px',
            fontFamily: 'Orbitron, monospace',
            fill: '#FFD700'
        }).setOrigin(0.5);
        instructionElements.push(titleText);
        
        const instructions = translations && translations.getCurrentLanguage() === 'hi' ? [
            '• सवालों के जवाब दें',
            '• सही जवाब चुनें',
            '• लाइफलाइन का उपयोग करें',
            '• करोड़पति बनें!'
        ] : [
            '• Answer questions correctly',
            '• Choose the right option',
            '• Use lifelines wisely',
            '• Become a millionaire!'
        ];

        instructions.forEach((instruction, index) => {
            const instructionText = this.add.text(width / 2, height / 2 - 80 + (index * 30), instruction, {
                fontSize: '16px',
                fontFamily: 'Roboto, sans-serif',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            instructionElements.push(instructionText);
        });

        // Close button
        const closeBtn = this.add.text(width / 2, height / 2 + 150, 'CLOSE', {
            fontSize: '20px',
            fontFamily: 'Orbitron, monospace',
            fill: '#FF6666'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        instructionElements.push(closeBtn);

        closeBtn.on('pointerdown', () => {
            // Destroy all instruction elements
            instructionElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });
    }
    
    updateLanguage() {
        // Restart the scene to apply language changes
        this.scene.restart();
    }
}
