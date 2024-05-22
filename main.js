const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('iceCube', 'assets/icecube.png');
    this.load.image('waterDroplet', 'assets/waterdroplet.png');
    this.load.image('balloon', 'assets/watervapour.png');
    this.load.image('heatUpButton', 'assets/heatup.png');
    this.load.image('coolDownButton', 'assets/freeze.png');
}

function create() {
    // Zones
    createZone(this, 200, 300, 'Solid');
    createZone(this, 400, 300, 'Liquid');
    createZone(this, 600, 300, 'Gas');

    // Objects
    let iceCube = this.add.image(100, 100, 'iceCube').setInteractive();
    iceCube.state = 'solid';
    iceCube.setDisplaySize(120, 120); // Set initial size
    this.input.setDraggable(iceCube);

    // Buttons
    let heatUpButton = this.add.image(850,200, 'heatUpButton').setInteractive();
    let coolDownButton = this.add.image(850,400, 'coolDownButton').setInteractive();
    heatUpButton.setDisplaySize(120, 120);  // Set button size
    coolDownButton.setDisplaySize(120, 120);  // Set button size

    // Drag and Drop Functionality
    this.input.on('dragstart', (pointer, gameObject) => {
        gameObject.setTint(0xff0000);
    });

    this.input.on('dragend', (pointer, gameObject) => {
        gameObject.clearTint();
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        // Check if dropped in the correct zone
        if (isCorrectZone(gameObject, dropZone)) {
            console.log('Correct Zone!');
        } else {
            console.log('Incorrect Zone!');
        }
    });

    // Temperature Change Functionality
    heatUpButton.on('pointerdown', () => {
        changeState(iceCube, 'heat');
    });

    coolDownButton.on('pointerdown', () => {
        changeState(iceCube, 'cool');
    });
}

function update() {
    // Update game logic if needed
}

function createZone(scene, x, y, label) {
    let zone = scene.add.zone(x, y, 200, 400).setRectangleDropZone(200, 400);
    let graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
    scene.add.text(x - 30, y - 220, label, { fontSize: '20px', fill: '#ffffff' });
}

function isCorrectZone(object, zone) {
    if (object.state === 'solid' && zone.label === 'Solid') return true;
    if (object.state === 'liquid' && zone.label === 'Liquid') return true;
    if (object.state === 'gas' && zone.label === 'Gas') return true;
    return false;
}

function changeState(object, action) {
    if (action === 'heat') {
        if (object.state === 'solid') {
            object.setTexture('waterDroplet');
            object.state = 'liquid';
        } else if (object.state === 'liquid') {
            object.setTexture('balloon');
            object.state = 'gas';
        }
    } else if (action === 'cool') {
        if (object.state === 'gas') {
            object.setTexture('waterDroplet');
            object.state = 'liquid';
        } else if (object.state === 'liquid') {
            object.setTexture('iceCube');
            object.state = 'solid';
        }
    }
    object.setDisplaySize(120, 120); // Ensure consistent size
}
