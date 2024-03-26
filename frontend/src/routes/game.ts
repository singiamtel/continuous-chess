import { assert, assertNever } from "$lib";
import { distance, distanceSegmentToPoint, relativeLine, type Line, type Position, type Circle, North, South, East, West, NorthWest, NorthEast, SouthWest, SouthEast } from "./vector";

  export type Player = {
    name: string;
  };
  export type Color = "white" | "black";

  export const pieceType = {
    "p": "pawn",
    "r": "rook",
    "n": "knight",
    "b": "bishop",
    "q": "queen",
    "k": "king",
    "P": "pawn",
    "R": "rook",
    "N": "knight",
    "B": "bishop",
    "Q": "queen",
    "K": "king",
    " ": "empty",
  } as const;

  export type Piece = {
    position: Position;
    color: Color;
    type: typeof pieceType[keyof typeof pieceType];
    alive: boolean;
    touched: boolean;
  };

//   type EnPassant = Position | null;
//   type Castling = ["K" | "Q" | "k" | "q", "K" | "Q" | "k" | "q"]

  
  function assertPieceType(piece: string): asserts piece is keyof typeof pieceType {
    if (!(piece in pieceType)) {
        throw new Error(`Invalid piece type: '${piece}' (expected one of ${Object.keys(pieceType).join(", ")}`);
    }
  }

  function parseFEN(fen: string): { pieces: Piece[], turn: Color, halfmoveClock: number, fullmoveNumber: number }{
    const [
      board,
      turn,
      _castling, // not implemented
      _enPassant, // not implemented
      halfmoveClock,
      fullmoveNumber
    ] = fen.split(" ");

    const pieces: Piece[] = board.split("/").flatMap((row, y) => {
        const expandedRow = row.replace(/\d/g, (match) => " ".repeat(Number(match)));
        return expandedRow.split("").flatMap((piece, x) => {
            assertPieceType(piece);
            return {
                position: {x: x + 0.5, y: y + 0.5},
                color: piece === piece.toLowerCase() ? "black" : "white" as Color,
                type: pieceType[piece],
                alive: true,
                touched: false,
            }
        })
    }).filter((piece) => piece.type !== "empty");

    return {
        pieces,
        turn: turn === "w" ? "white" : "black",
        // castling: castling.split(""),
        // enPassant: enPassant !== "-" ? {x: enPassant[0], y: enPassant[1]} : null,
        halfmoveClock: Number(halfmoveClock),
        fullmoveNumber: Number(fullmoveNumber),
    }
  }

  export function getPieceMovement(piece: Piece): Line[] | Circle {
    switch(piece.type) {
      case "pawn":
        {
            const lines: Line[] = [];
            if(piece.color === "white") {
                lines.push(relativeLine(piece.position, {x: 0, y: -1}));
                if(!piece.touched) {
                    lines.push(relativeLine(piece.position, {x: 0, y: -2}));
                }
            }
            if(piece.color === "black") {
                lines.push(relativeLine(piece.position, {x: 0, y: 1}));
                if(!piece.touched) {
                    lines.push(relativeLine(piece.position, {x: 0, y: 2}));
                }
            }
            return lines;
        }
      case "rook":
        {
            const lines: Line[] = [];
            [North, South, East, West].forEach((direction) => {
                lines.push(relativeLine(piece.position, direction));
            });
            return lines;
        }
      case "knight":
        {
            return {center: piece.position, radius: Math.sqrt(5)};
        }
        case "bishop":
        {
            const lines: Line[] = [];
            [NorthWest, NorthEast, SouthWest, SouthEast].forEach((direction) => {
                lines.push(relativeLine(piece.position, direction));
            });
            return lines;
        }
        case "queen":
        {
            const lines: Line[] = [];
            [North, South, East, West, NorthWest, NorthEast, SouthWest, SouthEast].forEach((direction) => {
                lines.push(relativeLine(piece.position, direction));
            });
            return lines;
        }
        case "king":
        {
            const lines: Line[] = [];
            [North, South, East, West, NorthWest, NorthEast, SouthWest, SouthEast].forEach((direction) => {
                lines.push(relativeLine(piece.position, {x: direction.x ? direction.x / Math.abs(direction.x) : 0, y: direction.y ? direction.y / Math.abs(direction.y) : 0}));
            });
            return lines;
        }
        case "empty":
            return [];
        default:
        {
            assertNever(piece.type);
            return [];
        }
    }

  }

  export class Game {
    readonly pieceFatness = 0.9;
    players: [
      { player: Player; color: Color },
      { player: Player; color: Color },
    ];
    pieces: Piece[];
    winner: Player | null | "draw" = null;
    turn: Color = "white";
    castling: ("K" | "Q" | "k" | "q")[] = [];
    halfmoveClock: number = 0;
    fullmoveNumber: number = 1;
    moves: { from: Position, to: Position, pieces: Piece[], firstTouch: boolean }[] = [];
    selectedPiece: Piece | null = null;
    constructor({fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}: {fen?: string} = {}) {
        const { pieces, turn, halfmoveClock, fullmoveNumber } = parseFEN(fen);
        this.pieces = pieces;
        this.turn = turn;
        this.halfmoveClock = halfmoveClock;
        this.fullmoveNumber = fullmoveNumber;
        this.players = [
            { player: { name: "Player 1" }, color: "white" },
            { player: { name: "Player 2" }, color: "black" },
          ];
    }

    private findCollision(position: Position, fatness = this.pieceFatness): Piece[] {
        // if we were to put a piece at the given position, would it collide with another piece(s)?
        const collidingPieces = this.pieces.filter((p) => {
            return distance(position, p.position) < fatness / 2;
        });
        return collidingPieces;
    }

    private raycast(from: Position, to: Position): Piece[] | boolean {
        // could you move in a straight line to the given position?
        // if you go through any pieces, return them
        // the movement is invalid if you went through a piece AND the destination doesn't collide with the same piece
        // colliding with your own piece is invalid
        const collisions = this.pieces.filter((piece) => {
            if (piece.position.x === from.x && piece.position.y === from.y) {
                // skip the piece we're moving
                return false;
            }
            if(distanceSegmentToPoint([from, to], piece.position) < this.pieceFatness / 2) {
                return true;
            }
        })
        if(collisions.some((piece) => piece.color === this.turn)) {
            // we collided with a piece of the same color
            return false;
        }
        if(collisions.some((piece) => distance(to, piece.position) < this.pieceFatness / 2)) {
            // we collided with a piece and went through it
            return false;
        }
        return collisions;
    }

    makeMove(from: Position, to: Position) {
        const pieces = this.findCollision(from);
        if (!pieces) {
            throw new Error("No piece at the given position");
        }
        assert(pieces.length === 1, "More than one piece at the given position" );
        const piece = pieces[0];
        const raycast = this.raycast(from, to);
        if(raycast === false) {
            throw new Error("Invalid move");
        }

        piece.position = to;
        this.turn = this.turn === "white" ? "black" : "white";
        this.moves.push({from, to, pieces: this.pieces, firstTouch: !piece.touched});
        piece.touched = true;
    }

    getPieceAt(position: Position): Piece | null {
        const piece = this.findCollision(position);
        if(piece.length === 0) {
            this.selectedPiece = null;
            return null;
        }
        console.log('pieces', piece.map((p) => `${p.color}_${p.type} (${distance(position, p.position)})`).join(", "));
        assert(piece.length === 1, "More than one piece at the given position" );
        this.selectedPiece = piece[0];
        return piece[0];
    }
  }

