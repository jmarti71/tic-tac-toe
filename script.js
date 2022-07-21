"use strict";

const Gameboard = (() => {
    const gameBoard = ['','','','','','','','','']; 
    let Player1;
    let Player2;
    let turnCount = 0;
    let gameComplete;

    // Creates upon clicking "start game"
    const createBoard = () => {
        for(let i = 0; i < gameBoard.length; i++) {
            const boardCell = document.createElement('div');
            boardCell.id = i;
            boardCell.textContent = gameBoard[i];
            accessDOM.gameBoardGrid.appendChild(boardCell);
            boardCell.addEventListener('click', () => {_insertMarker(i, boardCell)});
        }
    }

    // Clears board for next game if user selects to play again
    const clearBoard = () => {
        turnCount = 0;
        gameComplete = false
        for(let i = 0; i < gameBoard.length; i++) {
            gameBoard[i] = '';
            const boardCell = document.getElementById(i);
            boardCell.textContent = gameBoard[i];
            boardCell.className = "default";
        }
        accessDOM.statusText.textContent = `${Player1.name}'s turn`;
        displayController.toggleBtnOptions(gameComplete);
    }

    // Player factory
    const _Player = (playersuit, playername) => {
        const name = playername;
        const suit = playersuit;
        const setMarker = ()=> {
            return suit;
        }
        return {
            suit,
            name,
            setMarker
        }
    }

    // creates player and applies user selections
    const createPlayer = (playerNumber, selectedSuit, playerName) => {
        if(playerNumber === 0){
            Player1 = _Player(selectedSuit, playerName);
        }
        else if(playerNumber === 1) {
            Player2 = _Player(selectedSuit, playerName);
        }
    }

     // Winning combinations
     const _winKey = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ];

    const _winCondition = (a,b,c) => {
        if(gameBoard[a] !== '' && gameBoard[b] !== '' && gameBoard[c] !== ''){
            if(gameBoard[a] == gameBoard[b] && gameBoard[b] == gameBoard[c]) {
                return true;
            }
        }
    }

    // Uses key to check if winning condition is met with each player's turn
    const _checkForWin = () => {
        for(let i = 0; i < _winKey.length; i++){
            let win;
            win = _winCondition(_winKey[i][0],_winKey[i][1],_winKey[i][2]);
            if (win === true) {
                gameComplete = true;
                displayController.toggleBtnOptions(gameComplete);
                break;
            }
        }
    }

    const _checkForTie = () => {
        if(turnCount == 9 && !gameComplete) {
            accessDOM.statusText.textContent = `Tied Game`;
            gameComplete = true;
            displayController.toggleBtnOptions(gameComplete);
        }
    }

    // moves game forward with each turn
    const _advanceGame = () => {
        turnCount++;
        _checkForWin();
        if(turnCount % 2 == 0){
            if(gameComplete == true) {
                accessDOM.statusText.textContent = `${Player2.name} wins!`;
            }
            else {
                accessDOM.statusText.textContent = `${Player1.name}'s turn`;
            }
        }
        else {
            if(gameComplete == true) {
                accessDOM.statusText.textContent = `${Player1.name} wins!`;
            }
            else {
                accessDOM.statusText.textContent = `${Player2.name}'s turn`;
            }  
        }
        _checkForTie();
    }

    // Random cell selection, returns selected if cell not already taken, otherwise, recurse.
    const _selectRandomCell = () => {
        const selected = Math.floor(Math.random() * gameBoard.length);
        if(gameBoard[selected] === ''){
            console.log('Random cell:' + selected);
            return selected;
        }
        else {
            return _selectRandomCell(); //returning function was the fix
        }
    }

    // Assess board for potential winning moves from player
    const _aiAssessBoard = (a,b,c) => {    
        if(gameBoard[a] == Player1.suit) {
            if(gameBoard[a] == gameBoard[b] && gameBoard[c] === '') {
                return c;
            }
            else if(gameBoard[a] == gameBoard[c] && gameBoard[b] === '') {
                return b;
            }
        }
        else if(gameBoard[b] == Player1.suit) {
            if (gameBoard[b] == gameBoard[c] && gameBoard[a] === '') {
                return a;
            }   
        }
    }

    // returns cell to place marker in, based on board assessment
    const _aiDecideMove = () => {   
        let decidedCell;   
        for(let i = 0; i < _winKey.length; i++){
            decidedCell = _aiAssessBoard(_winKey[i][0],_winKey[i][1],_winKey[i][2]);     
            if(typeof decidedCell === 'number'){
                console.log('Assessment based cell:' + decidedCell);
                return decidedCell;
            }            
        }
        // if assessment did not return a cell number, select random
        if (typeof decidedCell !== 'number') {
            return _selectRandomCell();
        }
    }

    // Ai's turn, called immediately after player sets their marker if ai opponent
    const _aiTurn = () => {
        if(!gameComplete){
            let cellToPlay = _aiDecideMove();   
            setTimeout(() => {
                gameBoard[cellToPlay] = Player2.setMarker();
                const chosenCell = document.getElementById(cellToPlay);
                chosenCell.textContent = gameBoard[cellToPlay];
                chosenCell.className = "opp-cell";
                _advanceGame();
            },1500);
        }
    }

    // Inserts player marker based on turn, if player 2 is ai, calls ai turn immediately after player 1 plays.
    const _insertMarker = (arrayIndex, cell) => {
        if(!gameComplete) {
            if(turnCount % 2 == 0){
                if(gameBoard[arrayIndex] === ''){
                    gameBoard[arrayIndex] = Player1.setMarker();
                    cell.textContent = gameBoard[arrayIndex];
                    cell.className = "player-cell";                 
                    _advanceGame();
                    if(Player2.name == 'Ai'){
                        _aiTurn();
                    }
                }
             }
             else {
                if(Player2.name !== 'Ai') {
                    if(gameBoard[arrayIndex] === ''){
                        gameBoard[arrayIndex] = Player2.setMarker();
                        cell.textContent = gameBoard[arrayIndex];
                        cell.className = "opp-cell";                
                        _advanceGame();                 
                    }
                }
            }
        }
    }

    return{
        clearBoard: clearBoard,
        createBoard: createBoard,
        createPlayer: createPlayer,
        Player1,
        Player2
    }
})();

const displayController = (() => {
    let playerSuit = null;
    let opponentSuit = null;
    let opponent = null;

    const _displaySelections = (property, element, changeTo) => {
        if(property === 'className') {
            element.className = changeTo;
        }
        else if (property === 'textContent') {
            element.textContent = changeTo;
        }
    }

    const toggleGameEndOptions = (isComplete) => {
        if (isComplete == true) {
            accessDOM.finalPrompt.className = 'game-end-div';
            accessDOM.quitBtn.className = 'quit-btn hide';
        }
        else {
            accessDOM.finalPrompt.className = 'game-end-div hide';
            accessDOM.quitBtn.className = 'quit-btn';
        }
    }

    // Display selected properties upon starting game
    const startGame = () => {
        _establishSuits();
        _displaySelections('className', accessDOM.homeScreen, 'mainmenu hide');
        _displaySelections('className', accessDOM.gameScreen, 'gameboard show');
        _displaySelections('textContent', accessDOM.opp_nameDisp, opponent);
        _displaySelections('textContent', accessDOM.opp_suitDisp, opponentSuit.toUpperCase());
        _displaySelections('textContent', accessDOM.p_suitDisp, playerSuit.toUpperCase());
        Gameboard.createPlayer(0, playerSuit, 'Player 1');
        Gameboard.createPlayer(1, opponentSuit, opponent);
        accessDOM.statusText.textContent = `Player 1's turn`;
        Gameboard.createBoard();
    }

    // Updates player settings as user makes selections
    const updateSettings = (setting, btnContent, toSelect, toCancel) => {
        switch(setting) {
            case 'suit':
                if(btnContent !== playerSuit) {
                    playerSuit = btnContent.toLowerCase();
                    toSelect.className = 'selected';
                    toCancel.className = '';
                }
                break;
            case 'opponent':
                if(btnContent !== opponent) {
                    opponent = btnContent.toLowerCase();
                    toSelect.className = 'opp-btn material-symbols-outlined selected';
                    toCancel.className = 'opp-btn material-symbols-outlined';
                    if(opponent == 'smart_toy'){
                        opponent = 'Ai';
                    }
                    else if (opponent == 'person'){
                        opponent = 'Player 2';
                    }
                }
                break;
            }
        // Activates start button once settings are selected
        if(playerSuit !== null && opponent !== null) {
            accessDOM.startBtn.className = 'start-btn-anim active';
        }
    }

    // establishes suits prior to starting game
    const _establishSuits = () => {
        if(playerSuit == 'x') {
            opponentSuit = 'o';
        }
        else if(playerSuit == 'o'){
            opponentSuit = 'x';
        }
    }

    return {
        startGame: startGame,
        makeSelection: updateSettings,
        toggleBtnOptions: toggleGameEndOptions,
    }
})();

const accessDOM = (function() {

    // Select elements
    const homeScreen = document.querySelector('.mainmenu.show');
    const oBtn = document.getElementById('o-btn');
    const xBtn = document.getElementById('x-btn');
    const aiBtn = document.getElementById('ai-btn');
    const locPlayerBtn = document.getElementById('person-btn');
    const startBtn = document.querySelector('.start-btn-anim');
    const gameScreen = document.querySelector('.gameboard.hide');
    const p_suitDisp = document.querySelector('.player-suit');
    const opp_suitDisp = document.querySelector('.opp-suit');
    const opp_nameDisp = document.querySelector('.opp-name');
    const statusText = document.querySelector('.status-text');
    const gameBoardGrid = document.querySelector('.grid-board');
    const quitBtn = document.querySelector('.quit-btn');
    const homeBtn = document.querySelector('.home-btn');
    const retryBtn = document.querySelector('.retry-btn');
    const finalPrompt = document.querySelector('.game-end-div.hide')

    // Tie events
    oBtn.addEventListener('click', () =>  { 
        displayController.makeSelection('suit', oBtn.textContent, oBtn, xBtn); 
    });
    xBtn.addEventListener('click', () =>  { 
        displayController.makeSelection('suit', xBtn.textContent, xBtn, oBtn); 
    });
    aiBtn.addEventListener('click', () =>  { 
        displayController.makeSelection('opponent', aiBtn.textContent, aiBtn, locPlayerBtn); 
    });
    locPlayerBtn.addEventListener('click', () =>  { 
        displayController.makeSelection('opponent', locPlayerBtn.textContent, locPlayerBtn, aiBtn); 
    });
    startBtn.addEventListener('click', () => {displayController.startGame()});
    quitBtn.addEventListener('click', () => { location.reload() });
    homeBtn.addEventListener('click', () => { location.reload() });
    retryBtn.addEventListener('click', () => { Gameboard.clearBoard() });//////

    return {
        startBtn,
        homeScreen,
        gameScreen,
        p_suitDisp,
        opp_suitDisp,
        opp_nameDisp,
        gameBoardGrid,
        quitBtn,
        statusText,
        finalPrompt
    }
})();