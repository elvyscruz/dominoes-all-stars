class DominoGame {
    constructor() {
        this.tiles = [];
        this.boneyard = [];
        this.playerHand = [];
        this.machineHand = [];
        this.board = [];
        this.currentPlayer = 'player';
        this.selectedTile = null;
        this.gameStarted = false;
        this.leftEnd = null;
        this.rightEnd = null;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.playerHandEl = document.getElementById('player-hand');
        this.machineHandEl = document.getElementById('machine-hand');
        this.boardEl = document.getElementById('game-board');
        this.boneyardEl = document.getElementById('boneyard');
        this.turnIndicatorEl = document.getElementById('turn-indicator');
        this.gameMessageEl = document.getElementById('game-message');
        this.newGameBtnEl = document.getElementById('new-game-btn');
        this.drawTileBtnEl = document.getElementById('draw-tile-btn');
        this.playerPointsEl = document.getElementById('player-points');
        this.machinePointsEl = document.getElementById('machine-points');
        this.boneyardCountEl = document.getElementById('boneyard-count');
        this.machineTilesCountEl = document.getElementById('machine-tiles-count');
        this.boardLeftEl = document.getElementById('board-left');
        this.boardRightEl = document.getElementById('board-right');
    }

    attachEventListeners() {
        this.newGameBtnEl.addEventListener('click', () => this.startNewGame());
        this.drawTileBtnEl.addEventListener('click', () => this.playerDrawTile());
    }

    startNewGame() {
        this.createTiles();
        this.shuffleTiles();
        this.dealTiles();
        this.board = [];
        this.leftEnd = null;
        this.rightEnd = null;
        this.currentPlayer = 'player';
        this.selectedTile = null;
        this.gameStarted = true;

        this.updateDisplay();
        this.showMessage('¡Nuevo juego iniciado! Tú comienzas.');
        this.drawTileBtnEl.disabled = false;
    }

    createTiles() {
        this.tiles = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                this.tiles.push({ left: i, right: j, id: `${i}-${j}` });
            }
        }
    }

    shuffleTiles() {
        for (let i = this.tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }
        this.boneyard = [...this.tiles];
    }

    dealTiles() {
        this.playerHand = [];
        this.machineHand = [];

        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.boneyard.pop());
            this.machineHand.push(this.boneyard.pop());
        }
    }

    renderTile(tile, isHidden = false, isSmall = false) {
        const isDouble = tile.left === tile.right;
        const tileEl = document.createElement('div');
        tileEl.className = `domino-tile ${isDouble ? 'vertical' : 'horizontal'} ${isHidden ? 'machine-tile' : ''} ${isSmall ? 'small' : ''}`;
        tileEl.dataset.id = tile.id;

        if (isHidden) {
            tileEl.innerHTML = `
                <div class="domino-half">?</div>
                <div class="domino-half">?</div>
            `;
        } else {
            tileEl.innerHTML = `
                <div class="domino-half">${this.renderDots(tile.left)}</div>
                <div class="domino-half">${this.renderDots(tile.right)}</div>
            `;
        }

        return tileEl;
    }

    renderDots(value) {
        if (value === 0) return '';

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'domino-dots';

        const dotPositions = this.getDotPositions(value);
        dotPositions.forEach(pos => {
            const dot = document.createElement('div');
            dot.className = `dot ${pos}`;
            dotsContainer.appendChild(dot);
        });

        return dotsContainer.outerHTML;
    }

    getDotPositions(value) {
        const positions = {
            1: ['dot-1'],
            2: ['dot-2-1', 'dot-2-2'],
            3: ['dot-3-1', 'dot-3-2', 'dot-3-3'],
            4: ['dot-4-1', 'dot-4-2', 'dot-4-3', 'dot-4-4'],
            5: ['dot-5-1', 'dot-5-2', 'dot-5-3', 'dot-5-4', 'dot-5-5'],
            6: ['dot-6-1', 'dot-6-2', 'dot-6-3', 'dot-6-4', 'dot-6-5', 'dot-6-6']
        };
        return positions[value] || [];
    }

    updateDisplay() {
        // Update player hand
        this.playerHandEl.innerHTML = '';
        this.playerHand.forEach(tile => {
            const tileEl = this.renderTile(tile);
            tileEl.addEventListener('click', () => this.selectTile(tile));
            this.playerHandEl.appendChild(tileEl);
        });

        // Update machine hand
        this.machineHandEl.innerHTML = '';
        this.machineHand.forEach(tile => {
            const tileEl = this.renderTile(tile, true);
            this.machineHandEl.appendChild(tileEl);
        });

        // Update board
        this.updateBoard();

        // Update boneyard
        this.boneyardCountEl.textContent = this.boneyard.length;
        this.machineTilesCountEl.textContent = this.machineHand.length;

        // Update turn indicator
        this.turnIndicatorEl.textContent = this.currentPlayer === 'player' ?
            'Turno del Jugador' : 'Turno de la Máquina';
    }

    updateBoard() {
        // Clear board except ends
        const boardEnds = this.boardEl.querySelectorAll('.board-end');
        this.boardEl.innerHTML = '';
        boardEnds.forEach(end => this.boardEl.appendChild(end));

        if (this.board.length === 0) {
            this.boardLeftEl.style.display = 'flex';
            this.boardRightEl.style.display = 'flex';
            this.boardLeftEl.textContent = 'Inicio';
            this.boardRightEl.textContent = 'Fin';
        } else {
            this.boardLeftEl.style.display = 'none';
            this.boardRightEl.style.display = 'none';

            this.board.forEach((tile, index) => {
                const tileEl = this.renderTile(tile);
                this.boardEl.appendChild(tileEl);
            });
        }
    }

    selectTile(tile) {
        if (this.currentPlayer !== 'player' || !this.gameStarted) return;

        // Remove previous selection
        document.querySelectorAll('.domino-tile.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Select new tile
        this.selectedTile = tile;
        const tileEl = document.querySelector(`[data-id="${tile.id}"]`);
        if (tileEl) {
            tileEl.classList.add('selected');
        }

        // Try to place the tile
        this.tryPlaceTile(tile);
    }

    tryPlaceTile(tile) {
        if (this.board.length === 0) {
            // First tile can be placed anywhere
            this.placeTile(tile, 'left');
            return;
        }

        // Check if tile can be placed on left
        if (this.canPlaceTile(tile, 'left')) {
            this.placeTile(tile, 'left');
            return;
        }

        // Check if tile can be placed on right
        if (this.canPlaceTile(tile, 'right')) {
            this.placeTile(tile, 'right');
            return;
        }

        this.showMessage('Esta ficha no puede ser colocada en ningún extremo.');
    }

    canPlaceTile(tile, side) {
        if (this.board.length === 0) return true;

        if (side === 'left') {
            return tile.left === this.leftEnd || tile.right === this.leftEnd;
        } else {
            return tile.left === this.rightEnd || tile.right === this.rightEnd;
        }
    }

    placeTile(tile, side) {
        // Remove tile from player's hand
        const index = this.playerHand.findIndex(t => t.id === tile.id);
        if (index === -1) return;

        this.playerHand.splice(index, 1);

        // Orient and place tile on board
        let orientedTile = { ...tile };

        if (this.board.length === 0) {
            // First tile
            this.board.push(orientedTile);
            this.leftEnd = orientedTile.left;
            this.rightEnd = orientedTile.right;
        } else if (side === 'left') {
            if (orientedTile.right === this.leftEnd) {
                // Tile is correctly oriented
                this.board.unshift(orientedTile);
                this.leftEnd = orientedTile.left;
            } else {
                // Flip tile
                orientedTile = { left: orientedTile.right, right: orientedTile.left, id: tile.id };
                this.board.unshift(orientedTile);
                this.leftEnd = orientedTile.left;
            }
        } else {
            if (orientedTile.left === this.rightEnd) {
                // Tile is correctly oriented
                this.board.push(orientedTile);
                this.rightEnd = orientedTile.right;
            } else {
                // Flip tile
                orientedTile = { left: orientedTile.right, right: orientedTile.left, id: tile.id };
                this.board.push(orientedTile);
                this.rightEnd = orientedTile.right;
            }
        }

        this.selectedTile = null;
        this.showMessage('Ficha colocada correctamente.');

        // Check for win
        if (this.playerHand.length === 0) {
            this.endGame('player');
            return;
        }

        // Switch turns
        this.switchTurn();
    }

    playerDrawTile() {
        if (this.currentPlayer !== 'player' || this.boneyard.length === 0) {
            this.showMessage('No hay fichas para robar o no es tu turno.');
            return;
        }

        const tile = this.boneyard.pop();
        this.playerHand.push(tile);
        this.showMessage('Has robado una ficha.');
        this.updateDisplay();

        // Check if player can play the drawn tile
        if (!this.canPlayerPlay()) {
            this.showMessage('No puedes jugar. Turno de la máquina.');
            this.switchTurn();
        }
    }

    canPlayerPlay() {
        if (this.board.length === 0) return true;

        return this.playerHand.some(tile =>
            this.canPlaceTile(tile, 'left') || this.canPlaceTile(tile, 'right')
        );
    }

    switchTurn() {
        this.currentPlayer = this.currentPlayer === 'player' ? 'machine' : 'player';
        this.updateDisplay();

        if (this.currentPlayer === 'machine') {
            setTimeout(() => this.machineTurn(), 1500);
        }
    }

    machineTurn() {
        if (!this.gameStarted) return;

        // Check if machine can play
        const playableTiles = this.machineHand.filter(tile =>
            this.board.length === 0 || this.canPlaceTile(tile, 'left') || this.canPlaceTile(tile, 'right')
        );

        if (playableTiles.length === 0) {
            // Machine needs to draw
            if (this.boneyard.length > 0) {
                const tile = this.boneyard.pop();
                this.machineHand.push(tile);
                this.showMessage('La máquina robó una ficha.');
                this.updateDisplay();

                // Check if can play with drawn tile
                setTimeout(() => this.machineTurn(), 1500);
                return;
            } else {
                this.showMessage('La máquina no puede jugar y no hay fichas para robar.');
                this.switchTurn();
                return;
            }
        }

        // Machine AI: Simple strategy - play highest value tile
        playableTiles.sort((a, b) => (b.left + b.right) - (a.left + a.right));
        const tileToPlay = playableTiles[0];

        // Determine where to play
        let playSide = 'left';
        if (this.board.length > 0) {
            if (this.canPlaceTile(tileToPlay, 'left') && this.canPlaceTile(tileToPlay, 'right')) {
                // Choose side based on strategy (here: prefer side with higher end value)
                playSide = this.leftEnd >= this.rightEnd ? 'left' : 'right';
            } else if (this.canPlaceTile(tileToPlay, 'right')) {
                playSide = 'right';
            }
        }

        // Remove tile from machine hand
        const index = this.machineHand.findIndex(t => t.id === tileToPlay.id);
        this.machineHand.splice(index, 1);

        // Place tile on board
        let orientedTile = { ...tileToPlay };

        if (this.board.length === 0) {
            this.board.push(orientedTile);
            this.leftEnd = orientedTile.left;
            this.rightEnd = orientedTile.right;
        } else if (playSide === 'left') {
            if (orientedTile.right === this.leftEnd) {
                this.board.unshift(orientedTile);
                this.leftEnd = orientedTile.left;
            } else {
                orientedTile = { left: orientedTile.right, right: orientedTile.left, id: tileToPlay.id };
                this.board.unshift(orientedTile);
                this.leftEnd = orientedTile.left;
            }
        } else {
            if (orientedTile.left === this.rightEnd) {
                this.board.push(orientedTile);
                this.rightEnd = orientedTile.right;
            } else {
                orientedTile = { left: orientedTile.right, right: orientedTile.left, id: tileToPlay.id };
                this.board.push(orientedTile);
                this.rightEnd = orientedTile.right;
            }
        }

        this.showMessage('La máquina colocó una ficha.');
        this.updateDisplay();

        // Check for win
        if (this.machineHand.length === 0) {
            this.endGame('machine');
            return;
        }

        // Switch turns
        this.switchTurn();
    }

    endGame(winner) {
        this.gameStarted = false;
        this.drawTileBtnEl.disabled = true;

        if (winner === 'player') {
            this.showMessage('¡Felicidades! ¡Has ganado el juego!');
            const points = this.calculatePoints(this.machineHand);
            this.playerPointsEl.textContent = parseInt(this.playerPointsEl.textContent) + points;
        } else {
            this.showMessage('La máquina ha ganado el juego.');
            const points = this.calculatePoints(this.playerHand);
            this.machinePointsEl.textContent = parseInt(this.machinePointsEl.textContent) + points;
        }
    }

    calculatePoints(hand) {
        return hand.reduce((sum, tile) => sum + tile.left + tile.right, 0);
    }

    showMessage(message) {
        this.gameMessageEl.textContent = message;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new DominoGame();
});