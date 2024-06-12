document.addEventListener('DOMContentLoaded', () => {
    const board = Array.from({ length: 6 }, () => Array(7).fill(null));
    let currentPlayer = 'player1';
    let currentCol = 0;
    let gameActive = true;
    
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    
    const createBoard = () => {
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
            }
        }
    };
    
    const highlightColumn = (col) => {
        document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('highlight'));
        for (let row = 0; row < 6; row++) {
            const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            cell.classList.add('highlight');
        }
    };
    
    const switchPlayer = () => {
        currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    };
    
    const placeToken = (col) => {
        for (let row = 5; row >= 0; row--) {
            if (!board[row][col]) {
                board[row][col] = currentPlayer;
                const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
                cell.classList.add(currentPlayer);
                const winningTokens = checkWin(row, col);
                if (winningTokens) {
                    message.textContent = `${currentPlayer === 'player1' ? 'Joueur 1' : 'Joueur 2'} a gagné!`;
                    highlightWinningTokens(winningTokens);
                    gameActive = false;
                } else {
                    switchPlayer();
                }
                break;
            }
        }
    };
    
    const highlightWinningTokens = (tokens) => {
        tokens.forEach(([row, col]) => {
            const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            cell.classList.add('winner');
        });
    };
    
    const checkDirection = (row, col, rowDir, colDir) => {
        let count = 0;
        const positions = [];
        let r = row;
        let c = col;
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === currentPlayer) {
            positions.push([r, c]);
            count++;
            r += rowDir;
            c += colDir;
        }
        return { count, positions };
    };
    
    const checkWin = (row, col) => {
        const directions = [
            { rowDir: 0, colDir: 1 },  // Horizontal
            { rowDir: 1, colDir: 0 },  // Vertical
            { rowDir: 1, colDir: 1 },  // Diagonal down-right
            { rowDir: 1, colDir: -1 }  // Diagonal down-left
        ];
        
        for (let { rowDir, colDir } of directions) {
            const { count: count1, positions: positions1 } = checkDirection(row, col, rowDir, colDir);
            const { count: count2, positions: positions2 } = checkDirection(row, col, -rowDir, -colDir);
            const totalPositions = [...positions1, ...positions2.slice(1)];
            if (count1 + count2 - 1 >= 4) {
                return totalPositions;
            }
        }
        return null;
    };
    
    const handleKeyPress = (event) => {
        if (!gameActive) return;
        
        if (event.key === 'ArrowLeft') {
            currentCol = (currentCol - 1 + 7) % 7;
        } else if (event.key === 'ArrowRight') {
            currentCol = (currentCol + 1) % 7;
        } else if (event.key === ' ') {
            placeToken(currentCol);
        }
        highlightColumn(currentCol);
    };
    
    const handleHIDInput = (data) => {
        if (!gameActive) return;
        
        const xAxis = data.getUint8(2); // Assuming the X-axis value is at byte index 2
        
        if (xAxis === 0) {
            currentCol = (currentCol - 1 + 7) % 7;
        } else if (xAxis === 255) {
            currentCol = (currentCol + 1) % 7;
        }
        
        const buttonState = data.getUint8(0);
        if (buttonState & 0b00000001) { // Button A pressed
            placeToken(currentCol);
        }
        
        highlightColumn(currentCol);
    };
    
    document.getElementById('connect').addEventListener('click', async () => {
        try {
            const device = await navigator.hid.requestDevice({ filters: [] });
            
            if (device.length === 0) {
                console.log('No device selected.');
                return;
            }
            
            const selectedDevice = device[0];
            await selectedDevice.open();
            console.log('Connected to device:', selectedDevice.productName);
            
            selectedDevice.addEventListener('inputreport', event => {
                handleHIDInput(event.data);
            });
            
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
    createBoard();
    highlightColumn(currentCol);
    document.addEventListener('keydown', handleKeyPress);
});
