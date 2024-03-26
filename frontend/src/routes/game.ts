  export type Player = {
    name: string;
  };
  export type Color = "white" | "black";
  export type Position = { x: number; y: number };

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
                position: {x, y},
                color: piece === piece.toLowerCase() ? "black" : "white",
                type: pieceType[piece]
            }
        })
    })
    return {
        pieces,
        turn: turn === "w" ? "white" : "black",
        // castling: castling.split(""),
        // enPassant: enPassant !== "-" ? {x: enPassant[0], y: enPassant[1]} : null,
        halfmoveClock: Number(halfmoveClock),
        fullmoveNumber: Number(fullmoveNumber),
    }
  }

  export class Game {
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
  }