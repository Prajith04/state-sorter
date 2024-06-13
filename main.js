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

let fallingBlocks = [];
let nextFallTime = 0;
let fallInterval = 8000; // Initial interval between each block fall in milliseconds
let score = 0;
let scoreText;
let feedbackText;

function preload() {
    this.load.image('iceCube', 'assets/icecube.png');
    this.load.image('waterDroplet', 'assets/waterdroplet.png');
    this.load.image('balloon', 'assets/watervapour.png');
    this.load.image('heatUpButton', 'assets/heatup.png');
    this.load.image('coolDownButton', 'assets/freeze.png');
}

function create() {
    // Zones
    createZone(this, 200, 950, 'Solid');
    createZone(this, 600, 950, 'Liquid');
    createZone(this, 1000, 950, 'Gas');

    // Score and Feedback Text
    scoreText = this.add.text(1600, 50, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    feedbackText = this.add.text(1600, 100, '', { fontSize: '32px', fill: '#fff' });

    // Buttons
    let heatUpButton = this.add.image(1600, 200, 'heatUpButton').setInteractive();
    let coolDownButton = this.add.image(1600, 400, 'coolDownButton').setInteractive();
    heatUpButton.setDisplaySize(120, 120); // Set button size
    coolDownButton.setDisplaySize(120, 120); // Set button size

    // Temperature Change Functionality
    heatUpButton.on('pointerdown', () => {
        changeState(fallingBlocks[0], 'heat');
    });

    coolDownButton.on('pointerdown', () => {
        changeState(fallingBlocks[0], 'cool');
    });
}

function update(time) {
    // Adjust fall interval based on score
    adjustFallInterval();

    // Create a new block at intervals
    if (time > nextFallTime) {
        let block = createFallingBlock(this);
        fallingBlocks.push(block);
        nextFallTime = time + fallInterval;
    }

    // Update falling blocks
    fallingBlocks.forEach((block, index) => {
        block.y += 1; // Adjust falling speed as needed

        // Check if block has reached the bottom
        if (block.y >= 950) {
            if (isCorrectZone(block)) {
                feedbackText.setText('Correct!');
                updateScore(10);
            } else {
                feedbackText.setText('Wrong!');
                updateScore(0); // No negative score update
            }
            block.destroy();
            fallingBlocks.splice(index, 1); // Remove block from array
        }
    });
}

function createZone(scene, x, y, label) {
    let zone = scene.add.zone(x, y, 200, 100).setRectangleDropZone(200, 100);
    let graphics = scene.add.graphics();
    graphics.lineStyle(2, 0xffff00);
    graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
    scene.add.text(x - 30, y - 40, label, { fontSize: '20px', fill: '#ffffff' });

    zone.label = label;
}

function createFallingBlock(scene) {
    const states = ['solid', 'liquid', 'gas'];
    const textures = ['iceCube', 'waterDroplet', 'balloon'];
    const positions = [200, 600, 1000]; // X positions directly above the zones

    let randomIndex = Phaser.Math.Between(0, states.length - 1);
    let incorrectPositions = positions.filter(pos => pos !== positions[randomIndex]); // Exclude correct position
    let randomPosition = incorrectPositions[Phaser.Math.Between(0, incorrectPositions.length - 1)]; // Select an incorrect position

    let block = scene.add.image(randomPosition, 0, textures[randomIndex]).setInteractive();
    block.state = states[randomIndex];
    block.setDisplaySize(120, 120); // Set initial size

    return block;
}

function isCorrectZone(block) {
    if (block.state === 'solid' && block.x === 200) return true;
    if (block.state === 'liquid' && block.x === 600) return true;
    if (block.state === 'gas' && block.x === 1000) return true;
    return false;
}

function changeState(block, action) {
    if (!block) return;

    if (action === 'heat') {
        if (block.state === 'solid') {
            block.setTexture('waterDroplet');
            block.state = 'liquid';
        } else if (block.state === 'liquid') {
            block.setTexture('balloon');
            block.state = 'gas';
        }
    } else if (action === 'cool') {
        if (block.state === 'gas') {
            block.setTexture('waterDroplet');
            block.state = 'liquid';
        } else if (block.state === 'liquid') {
            block.setTexture('iceCube');
            block.state = 'solid';
        }
    }
    block.setDisplaySize(120, 120); // Ensure consistent size
}

function updateScore(value) {
    if (value > 0) {
        score += value;
    }
    scoreText.setText('Score: ' + score);
}

function adjustFallInterval() {
    fallInterval = 8000 - Math.floor(score / 30) * 1000;
    if (fallInterval < 3000) {
        fallInterval = 3000; // Ensure the interval does not go below 3000ms
    }
}
