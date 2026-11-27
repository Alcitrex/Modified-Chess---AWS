import "./style.css";
import { King, Queen, Bishop, Knight, Rook, Pawn, Bombs} from "./pieces";

const gameBoard = document.querySelector<HTMLElement>("#gameboard")!;
const gameOptions = document.querySelector<HTMLElement>("#game-options")!;
const playerDetails = document.querySelector<HTMLElement>("#player")!;
const infoDisplay = document.querySelector<HTMLElement>("#info-display")!;
const err = document.querySelector<HTMLElement>("#err")!;
const width = 8;

let moveCounter = 0;
let playerTurn: "black" | "white" = "white";
playerDetails.textContent = "white";

const startPieces: string[] = [
    Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook,
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Pawn, Bombs,
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
reverseIds();

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

    // A drop on a piece can land on its inner <svg>/<path>; climb up to the piece (or empty square)
    let target = (e.target as Element).closest<HTMLElement>(".piece, .square")!;
    if (target.classList.contains("square") && target.firstElementChild) {
        target = target.firstElementChild as HTMLElement;
    }
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
/*These arrays are all offsets off the original position, i.e if you're on tile 18 and want to move like down or up, you'd add the width or sub the width*/
const STRAIGHT = [width, -width, 1, -1];   /*So since the board is a grid, we can move up/down by the width and left and right by -1 and 1*/
const DIAGONAL = [width + 1, width - 1, -width + 1, -width - 1];
const EIGHT_DIRECTIONS = [width, -width, 1, -1, width + 1, width - 1, -width + 1, -width - 1];

/*So this function is generally for the pieces that can go really long distances like the bishop rook and the queen
I just optimized it here because seriously the original lines were LONG*/
function checkDirections(startId: number, targetId: number, directions: number[]): boolean {
    for (const d of directions) {
        for (let step = 1; step < width; step++) {
            const squareId = startId + d * step;
            if (squareId === targetId) return true;
            if (occupied(squareId)) break;            /*This means we met another piece on the way to the target id, for pieces that dont allow jumping this fails*/
        }
    }
    return false;                                     // no direction worked
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
            return checkDirections(startId, targetId, DIAGONAL);
        case 'rook':
            return checkDirections(startId, targetId, STRAIGHT);
        case 'queen':
           return checkDirections(startId, targetId, EIGHT_DIRECTIONS);
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
        case 'bombs':
            const starterRowa = [8, 9, 10, 11, 12, 13, 14, 15];
            if (starterRowa.includes(startId) && startId + width * 2 === targetId ||
                startId + width === targetId ||
                startId + width - 1 === targetId && occupied(startId + width - 1) ||
                startId + width + 1 === targetId && occupied(startId + width + 1)) {
                return true;
            }
            break;
        default:
            break;
    }
    return false;
}

function changePlayer(): void {
  moveCounter++
  if (moveCounter % 5 == 0) {
    showOptions();
    moveCounter = 0;
  }
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

// new stuff

function showOptions(): void {
    gameOptions.classList.add("visible");
}

function hideOptions(): void {
    gameOptions.classList.remove("visible");
}

const option1 = document.querySelector<HTMLButtonElement>("#option1")!;
const option2 = document.querySelector<HTMLButtonElement>("#option2")!;
const option3 = document.querySelector<HTMLButtonElement>("#option3")!;

option1.addEventListener("click", () => {
    hideOptions();
});

option2.addEventListener("click", () => {
    hideOptions();
});

option3.addEventListener("click", () => {
    hideOptions();
});