import { Pawn, Bombs } from "./pieces";

type Color = "black" | "white";
/*Gets all squares currently on the board*/
function squares(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>("#gameboard .square"));
}

function placePiece(square: HTMLElement, pieceHtml: string, color: Color): void {
    square.innerHTML = pieceHtml;
    const piece = square.firstElementChild as HTMLElement;
    piece.setAttribute("draggable", "true");
    piece.firstElementChild?.classList.add(color);
}

function onOwnSide(domIndex: number, color: Color): boolean {
    return color === "white" ? domIndex >= 32 : domIndex < 32;
}

/* the events: each one takes the current player and returns a message*/
export function bombDeployed(color: Color): string {
    const empty = squares().filter((sq, i) => !sq.firstChild && onOwnSide(i, color));
    if (empty.length === 0) return "No room on your side.";
    const spot = empty[Math.floor(Math.random() * empty.length)];
    placePiece(spot, Bombs, color);
    return "Reinforcements arrived!";
}

// the list main.ts picks from
export const events = [
    { name: "Reinforcements", run: bombDeployed },
];