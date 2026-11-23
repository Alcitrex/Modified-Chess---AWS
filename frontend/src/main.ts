import "./style.css";
import { King, Queen, Bishop, Knight, Rook, Pawn } from "./pieces";

const gameBoard = document.querySelector<HTMLElement>("#gameboard")!;
const playerDetails = document.querySelector<HTMLElement>("#player")!;
const infoDisplay = document.querySelector<HTMLElement>("#info-display")!;
const err = document.querySelector<HTMLElement>("#err")!;
const width = 8;

let playerTurn: "black" | "white" = "black";
playerDetails.textContent = "black";

const startPieces: string[] = [
    Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook,
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook,
];

function createBoard(): void {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement("div");
        square.classList.add("square");
        square.innerHTML = startPiece;

        square.setAttribute("square-id", String(i));
        square.firstElementChild?.setAttribute("draggable", "true");

        const row = Math.floor((63 - i) / 8) + 1;

        if (row % 2 === 0) {
            square.classList.add(i % 2 == 0 ? "beige" : "brown");
        } else {
            square.classList.add(i % 2 == 0 ? "brown" : "beige");
        }

        if (i <= 15) {
            square.firstElementChild?.firstElementChild?.classList.add("black");
        }
        if (i >= 48) {
            square.firstElementChild?.firstElementChild?.classList.add("white");
        }

        gameBoard.append(square);
    });
}

createBoard();

const allSquares = document.querySelectorAll<HTMLElement>("#gameboard .square");

allSquares.forEach(square => {
    square.addEventListener("dragstart", dragstart);
    square.addEventListener("dragover", dragover);
    square.addEventListener("drop", dragdrop);
});

let startPositionId: string | null = null;
let draggedElement: HTMLElement | null = null;

function occupied(id: number): boolean {
    return !!document.querySelector(`[square-id="${id}"]`)?.firstChild;
}

function dragstart(e: DragEvent): void {
    const target = e.target as HTMLElement;
    startPositionId = target.parentElement!.getAttribute("square-id");
    draggedElement = target;
}

function dragover(e: DragEvent): void {
    e.preventDefault();
}

function dragdrop(e: DragEvent): void {
    e.stopPropagation();
    if (!draggedElement) return;

    const target = e.target as HTMLElement;
    const correctTurn = draggedElement.firstElementChild!.classList.contains(playerTurn);
    const taken = target.classList.contains("piece");
    const valid = checkIfValid(target);
    const opponentTurn = playerTurn === "white" ? "black" : "white";
    const takenByOpponent = target.firstElementChild?.classList.contains(opponentTurn);

    if (correctTurn) {
        // must check this condition
        if (takenByOpponent && valid) {
            target.parentElement!.append(draggedElement);
            target.remove();
            checkForWin();
            changePlayer();
            return;
        }
        if (taken && !takenByOpponent) {
            err.textContent = "Can not go there";
            setTimeout(() => {
                err.textContent = "";
            }, 2000);
            return;
        }
        if (valid) {
            target.append(draggedElement);
            checkForWin();
            changePlayer();
            return;
        }
    }
}

function checkIfValid(target: HTMLElement): boolean {
    const targetId = Number(target.getAttribute('square-id')) || Number(target.parentElement?.getAttribute('square-id'));
    const startId = Number(startPositionId);
    const piece = draggedElement!.id
    console.log(startId, targetId, piece)

    switch (piece) {
        case 'pawn':
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15];
            if (starterRow.includes(startId) && startId + width * 2 === targetId ||
                startId + width === targetId ||
                startId + width - 1 === targetId && occupied(startId + width - 1) ||
                startId + width + 1 === targetId && occupied(startId + width + 1)) {
                return true;
            }
            break;
        case 'knight':
            if (
                startId + width * 2 + 1 === targetId ||
                startId + width * 2 - 1 === targetId ||
                startId + width - 2 === targetId ||
                startId + width + 2 === targetId ||
                startId - width * 2 + 1 === targetId ||
                startId - width * 2 - 1 === targetId ||
                startId - width + 2 === targetId ||
                startId - width - 2 === targetId
            ) {
                return true
            }
            break;

        case 'bishop':
            if (
                // for right cross --- forward
                startId + width + 1 === targetId ||
                startId + width * 2 + 2 === targetId && !occupied(startId + width + 1) ||
                startId + width * 3 + 3 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) ||
                startId + width * 4 + 4 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) ||
                startId + width * 5 + 5 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) && !occupied(startId + width * 4 + 4) ||
                startId + width * 6 + 6 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) && !occupied(startId + width * 4 + 4) && !occupied(startId + width * 5 + 5) ||
                startId + width * 7 + 7 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) && !occupied(startId + width * 4 + 4) && !occupied(startId + width * 5 + 5) && !occupied(startId + width * 6 + 6) ||

                // for left cross --- forward
                startId + width - 1 === targetId ||
                startId + width * 2 - 2 === targetId && !occupied(startId + width - 1) ||
                startId + width * 3 - 3 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) ||
                startId + width * 4 - 4 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) ||
                startId + width * 5 - 5 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) && !occupied(startId + width * 4 - 4) ||
                startId + width * 6 - 6 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) && !occupied(startId + width * 4 - 4) && !occupied(startId + width * 5 - 5) ||
                startId + width * 7 - 7 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) && !occupied(startId + width * 4 - 4) && !occupied(startId + width * 5 - 5) && !occupied(startId + width * 6 - 6) ||

                // for right cross --- backward
                startId - width - 1 === targetId ||
                startId - width * 2 - 2 === targetId && !occupied(startId - width - 1) ||
                startId - width * 3 - 3 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) ||
                startId - width * 4 - 4 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) ||
                startId - width * 5 - 5 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) && !occupied(startId - width * 4 - 4) ||
                startId - width * 6 - 6 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) && !occupied(startId - width * 4 - 4) && !occupied(startId - width * 5 - 5) ||
                startId - width * 7 - 7 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) && !occupied(startId - width * 4 - 4) && !occupied(startId - width * 5 - 5) && !occupied(startId + width * 6 - 6) ||

                // fot left cross -- backward
                startId - width + 1 === targetId ||
                startId - width * 2 + 2 === targetId && !occupied(startId - width + 1) ||
                startId - width * 3 + 3 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) ||
                startId - width * 4 + 4 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) ||
                startId - width * 5 + 5 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) && !occupied(startId - width * 4 + 4) ||
                startId - width * 6 + 6 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) && !occupied(startId - width * 4 + 4) && !occupied(startId - width * 5 + 5) ||
                startId - width * 7 + 7 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) && !occupied(startId - width * 4 + 4) && !occupied(startId - width * 5 + 5) && !occupied(startId + width * 6 + 6)
            ) {
                return true;
            }
            break;

        case 'rook':
            if (
                // moving straight forward
                startId + width === targetId ||
                startId + width * 2 === targetId && !occupied(startId + width) ||
                startId + width * 3 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) ||
                startId + width * 4 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) ||
                startId + width * 5 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) && !occupied(startId + width * 4) ||
                startId + width * 6 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) && !occupied(startId + width * 4) && !occupied(startId + width * 5) ||
                startId + width * 7 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) && !occupied(startId + width * 4) && !occupied(startId + width * 5) && !occupied(startId + width * 6) ||

                // moving straight backward
                startId - width === targetId ||
                startId - width * 2 === targetId && !occupied(startId - width) ||
                startId - width * 3 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) ||
                startId - width * 4 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) ||
                startId - width * 5 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) && !occupied(startId - width * 4) ||
                startId - width * 6 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) && !occupied(startId - width * 4) && !occupied(startId - width * 5) ||
                startId - width * 7 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) && !occupied(startId - width * 4) && !occupied(startId - width * 5) && !occupied(startId - width * 6) ||

                // moving left side straight
                startId + 1 === targetId ||
                startId + 2 === targetId && !occupied(startId + 1) ||
                startId + 3 === targetId && !occupied(startId + 1) && !occupied(startId + 2) ||
                startId + 4 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) ||
                startId + 5 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) && !occupied(startId + 4) ||
                startId + 6 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) && !occupied(startId + 4) && !occupied(startId + 5) ||
                startId + 7 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) && !occupied(startId + 4) && !occupied(startId + 5) && !occupied(startId + 6) ||

                // moving right side straight
                startId - 1 === targetId ||
                startId - 2 === targetId && !occupied(startId - 1) ||
                startId - 3 === targetId && !occupied(startId - 1) && !occupied(startId - 2) ||
                startId - 4 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) ||
                startId - 5 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) && !occupied(startId - 4) ||
                startId - 6 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) && !occupied(startId - 4) && !occupied(startId - 5) ||
                startId - 7 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) && !occupied(startId - 4) && !occupied(startId - 5) && !occupied(startId - 6)
            ) {
                return true
            }
            break;

        case 'queen':
            if (
                // for right cross --- forward
                startId + width + 1 === targetId ||
                startId + width * 2 + 2 === targetId && !occupied(startId + width + 1) ||
                startId + width * 3 + 3 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) ||
                startId + width * 4 + 4 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) ||
                startId + width * 5 + 5 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) && !occupied(startId + width * 4 + 4) ||
                startId + width * 6 + 6 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) && !occupied(startId + width * 4 + 4) && !occupied(startId + width * 5 + 5) ||
                startId + width * 7 + 7 === targetId && !occupied(startId + width + 1) && !occupied(startId + width * 2 + 2) && !occupied(startId + width * 3 + 3) && !occupied(startId + width * 4 + 4) && !occupied(startId + width * 5 + 5) && !occupied(startId + width * 6 + 6) ||

                // for left cross --- forward
                startId + width - 1 === targetId ||
                startId + width * 2 - 2 === targetId && !occupied(startId + width - 1) ||
                startId + width * 3 - 3 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) ||
                startId + width * 4 - 4 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) ||
                startId + width * 5 - 5 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) && !occupied(startId + width * 4 - 4) ||
                startId + width * 6 - 6 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) && !occupied(startId + width * 4 - 4) && !occupied(startId + width * 5 - 5) ||
                startId + width * 7 - 7 === targetId && !occupied(startId + width - 1) && !occupied(startId + width * 2 - 2) && !occupied(startId + width * 3 - 3) && !occupied(startId + width * 4 - 4) && !occupied(startId + width * 5 - 5) && !occupied(startId + width * 6 - 6) ||

                // for right cross --- backward
                startId - width - 1 === targetId ||
                startId - width * 2 - 2 === targetId && !occupied(startId - width - 1) ||
                startId - width * 3 - 3 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) ||
                startId - width * 4 - 4 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) ||
                startId - width * 5 - 5 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) && !occupied(startId - width * 4 - 4) ||
                startId - width * 6 - 6 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) && !occupied(startId - width * 4 - 4) && !occupied(startId - width * 5 - 5) ||
                startId - width * 7 - 7 === targetId && !occupied(startId - width - 1) && !occupied(startId - width * 2 - 2) && !occupied(startId - width * 3 - 3) && !occupied(startId - width * 4 - 4) && !occupied(startId - width * 5 - 5) && !occupied(startId + width * 6 - 6) ||

                // fot left cross -- backward
                startId - width + 1 === targetId ||
                startId - width * 2 + 2 === targetId && !occupied(startId - width + 1) ||
                startId - width * 3 + 3 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) ||
                startId - width * 4 + 4 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) ||
                startId - width * 5 + 5 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) && !occupied(startId - width * 4 + 4) ||
                startId - width * 6 + 6 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) && !occupied(startId - width * 4 + 4) && !occupied(startId - width * 5 + 5) ||
                startId - width * 7 + 7 === targetId && !occupied(startId - width + 1) && !occupied(startId - width * 2 + 2) && !occupied(startId - width * 3 + 3) && !occupied(startId - width * 4 + 4) && !occupied(startId - width * 5 + 5) && !occupied(startId + width * 6 + 6) ||

                // moving straight forward
                startId + width === targetId ||
                startId + width * 2 === targetId && !occupied(startId + width) ||
                startId + width * 3 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) ||
                startId + width * 4 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) ||
                startId + width * 5 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) && !occupied(startId + width * 4) ||
                startId + width * 6 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) && !occupied(startId + width * 4) && !occupied(startId + width * 5) ||
                startId + width * 7 === targetId && !occupied(startId + width) && !occupied(startId + width * 2) && !occupied(startId + width * 3) && !occupied(startId + width * 4) && !occupied(startId + width * 5) && !occupied(startId + width * 6) ||

                // moving straight backward
                startId - width === targetId ||
                startId - width * 2 === targetId && !occupied(startId - width) ||
                startId - width * 3 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) ||
                startId - width * 4 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) ||
                startId - width * 5 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) && !occupied(startId - width * 4) ||
                startId - width * 6 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) && !occupied(startId - width * 4) && !occupied(startId - width * 5) ||
                startId - width * 7 === targetId && !occupied(startId - width) && !occupied(startId - width * 2) && !occupied(startId - width * 3) && !occupied(startId - width * 4) && !occupied(startId - width * 5) && !occupied(startId - width * 6) ||

                // moving left side straight
                startId + 1 === targetId ||
                startId + 2 === targetId && !occupied(startId + 1) ||
                startId + 3 === targetId && !occupied(startId + 1) && !occupied(startId + 2) ||
                startId + 4 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) ||
                startId + 5 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) && !occupied(startId + 4) ||
                startId + 6 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) && !occupied(startId + 4) && !occupied(startId + 5) ||
                startId + 7 === targetId && !occupied(startId + 1) && !occupied(startId + 2) && !occupied(startId + 3) && !occupied(startId + 4) && !occupied(startId + 5) && !occupied(startId + 6) ||

                // moving right side straight
                startId - 1 === targetId ||
                startId - 2 === targetId && !occupied(startId - 1) ||
                startId - 3 === targetId && !occupied(startId - 1) && !occupied(startId - 2) ||
                startId - 4 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) ||
                startId - 5 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) && !occupied(startId - 4) ||
                startId - 6 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) && !occupied(startId - 4) && !occupied(startId - 5) ||
                startId - 7 === targetId && !occupied(startId - 1) && !occupied(startId - 2) && !occupied(startId - 3) && !occupied(startId - 4) && !occupied(startId - 5) && !occupied(startId - 6)
            ) {
                return true
            }
            break;

        case 'king':
            if (
                startId + 1 === targetId ||
                startId - 1 === targetId ||
                startId + width === targetId ||
                startId + width + 1 === targetId ||
                startId + width - 1 === targetId ||
                startId - width === targetId ||
                startId - width + 1 === targetId ||
                startId - width - 1 === targetId
            ) {
                return true
            }
            break;
        default:
            break;
    }
    return false;
}

function changePlayer(): void {
    if (playerTurn === "black") {
        reverseIds();
        playerTurn = "white";
        playerDetails.textContent = "white";
    } else {
        revertIds();
        playerTurn = "black";
        playerDetails.textContent = "black";
    }
}

function reverseIds(): void {
    const squares = document.querySelectorAll<HTMLElement>("#gameboard .square");
    squares.forEach((square, i) => {
        square.setAttribute("square-id", String(width * width - 1 - i));
    });
}

function revertIds(): void {
    const squares = document.querySelectorAll<HTMLElement>("#gameboard .square");
    squares.forEach((square, i) => {
        square.setAttribute("square-id", String(i));
    });
}

function checkForWin(): void {
    const kings = Array.from(document.querySelectorAll<HTMLElement>("#king"));

    if (!kings.some(king => king.firstElementChild?.classList.contains("white"))) {
        infoDisplay.innerHTML = "Black Player Wins!";
        document.querySelectorAll<HTMLElement>(".square").forEach(square =>
            square.firstElementChild?.setAttribute("draggable", "false"));
    }
    if (!kings.some(king => king.firstElementChild?.classList.contains("black"))) {
        infoDisplay.innerHTML = "White Player Wins!";
        document.querySelectorAll<HTMLElement>(".square").forEach(square =>
            square.firstElementChild?.setAttribute("draggable", "false"));
    }
}
