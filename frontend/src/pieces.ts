// Font Awesome Free 6.4.0 chess icons (CC BY 4.0), stored locally in assets/pieces.
// Imported raw so they stay inline SVG and can be coloured via CSS `fill`.
import kingSvg from "./assets/pieces/king.svg?raw";
import queenSvg from "./assets/pieces/queen.svg?raw";
import bishopSvg from "./assets/pieces/bishop.svg?raw";
import knightSvg from "./assets/pieces/knight.svg?raw";
import rookSvg from "./assets/pieces/rook.svg?raw";
import pawnSvg from "./assets/pieces/pawn.svg?raw";
import cBombs from "./assets/pieces/67cactusbombs.png";

const piece = (id: string, svg: string): string =>
  `<div class="piece" id="${id}">${svg.trim()}</div>`;

export const King = piece("king", kingSvg);
export const Queen = piece("queen", queenSvg);
export const Bishop = piece("bishop", bishopSvg);
export const Knight = piece("knight", knightSvg);
export const Rook = piece("rook", rookSvg);
export const Pawn = piece("pawn", pawnSvg);
export const Bombs = `<div class="piece" id="bombs"><img src="${cBombs}" alt="bombs"></div>`;
