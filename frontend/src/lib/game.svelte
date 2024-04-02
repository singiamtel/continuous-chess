<script lang="ts" context="module">
  import { assert, assertNever } from "$lib";
  import {
    distance,
    distanceSegmentToPoint,
    relativeLine,
    type Line,
    type Position,
    type Circunference,
    North,
    South,
    East,
    West,
    NorthWest,
    NorthEast,
    SouthWest,
    SouthEast,
    isCircunference,
    closestPointToCircunference,
    closestPointToLine,
  } from "$lib/vector";

  export type Color = "white" | "black";
  export type Player = {
    name: string;
    color: Color;
  };

  export const pieceType = {
    p: "pawn",
    r: "rook",
    n: "knight",
    b: "bishop",
    q: "queen",
    k: "king",
    P: "pawn",
    R: "rook",
    N: "knight",
    B: "bishop",
    Q: "queen",
    K: "king",
    " ": "empty",
  } as const;

  export type Piece = {
    position: Position;
    color: Color;
    type: (typeof pieceType)[keyof typeof pieceType];
    alive: boolean;
    touched: boolean;
  };

  //   type EnPassant = Position | null;
  //   type Castling = ["K" | "Q" | "k" | "q", "K" | "Q" | "k" | "q"]

  function assertPieceType(
    piece: string
  ): asserts piece is keyof typeof pieceType {
    if (!(piece in pieceType)) {
      throw new Error(
        `Invalid piece type: '${piece}' (expected one of ${Object.keys(pieceType).join(", ")}`
      );
    }
  }

  function parseFEN(fen: string): {
    pieces: Piece[];
    turn: Color;
    halfmoveClock: number;
    fullmoveNumber: number;
  } {
    const [
      board,
      turn,
      _castling, // not implemented
      _enPassant, // not implemented
      halfmoveClock,
      fullmoveNumber,
    ] = fen.split(" ");

    const pieces: Piece[] = board
      .split("/")
      .flatMap((row, y) => {
        const expandedRow = row.replace(/\d/g, (match) =>
          " ".repeat(Number(match))
        );
        return expandedRow.split("").flatMap((piece, x) => {
          assertPieceType(piece);
          return {
            position: { x: x + 0.5, y: y + 0.5 },
            color: piece === piece.toLowerCase() ? "black" : ("white" as Color),
            type: pieceType[piece],
            alive: true,
            touched: false,
          };
        });
      })
      .filter((piece) => piece.type !== "empty");

    return {
      pieces,
      turn: turn === "w" ? "white" : "black",
      // castling: castling.split(""),
      // enPassant: enPassant !== "-" ? {x: enPassant[0], y: enPassant[1]} : null,
      halfmoveClock: Number(halfmoveClock),
      fullmoveNumber: Number(fullmoveNumber),
    };
  }

  export function getPieceMovement(piece: Piece): Line[] | Circunference {
    switch (piece.type) {
      case "pawn": {
        const lines: Line[] = [];
        if (piece.color === "white") {
          lines.push(relativeLine(piece.position, { x: 0, y: -1 }));
          if (!piece.touched) {
            lines.push(relativeLine(piece.position, { x: 0, y: -2 }));
          }
        }
        if (piece.color === "black") {
          lines.push(relativeLine(piece.position, { x: 0, y: 1 }));
          if (!piece.touched) {
            lines.push(relativeLine(piece.position, { x: 0, y: 2 }));
          }
        }
        return lines;
      }
      case "rook": {
        const lines: Line[] = [];
        [North, South, East, West].forEach((direction) => {
          lines.push(relativeLine(piece.position, direction));
        });
        return lines;
      }
      case "knight": {
        return { center: piece.position, radius: Math.sqrt(5) };
      }
      case "bishop": {
        const lines: Line[] = [];
        [NorthWest, NorthEast, SouthWest, SouthEast].forEach((direction) => {
          lines.push(relativeLine(piece.position, direction));
        });
        return lines;
      }
      case "queen": {
        const lines: Line[] = [];
        [
          North,
          South,
          East,
          West,
          NorthWest,
          NorthEast,
          SouthWest,
          SouthEast,
        ].forEach((direction) => {
          lines.push(relativeLine(piece.position, direction));
        });
        return lines;
      }
      case "king": {
        const lines: Line[] = [];
        [
          North,
          South,
          East,
          West,
          NorthWest,
          NorthEast,
          SouthWest,
          SouthEast,
        ].forEach((direction) => {
          lines.push(
            relativeLine(piece.position, {
              x: direction.x ? direction.x / Math.abs(direction.x) : 0,
              y: direction.y ? direction.y / Math.abs(direction.y) : 0,
            })
          );
        });
        return lines;
      }
      case "empty":
        return [];
      default: {
        assertNever(piece.type);
        return [];
      }
    }
  }

  export class Game {
    static readonly defaultPieceFatness = 0.34 * 2; // if radius higher than sqrt(2)/4, pieces will collide with allies when moving diagonally in the opening
    static readonly defaultFEN =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    pieceFatness = Game.defaultPieceFatness;
    players: [{ player: Player }, { player: Player }];
    pieces: Piece[];
    winner: Player | null | "draw" = null;
    turn: Color = "white";
    castling: ("K" | "Q" | "k" | "q")[] = [];
    halfmoveClock: number = 0;
    fullmoveNumber: number = 1;
    moves: {
      from: Position;
      to: Position;
      pieces: Piece[];
      firstTouch: boolean;
    }[] = [];
    selectedPiece: Piece | null = null;
    constructor({ fen = Game.defaultFEN }: { fen?: string } = {}) {
      const { pieces, turn, halfmoveClock, fullmoveNumber } = parseFEN(fen);
      this.pieces = pieces;
      this.turn = turn;
      this.halfmoveClock = halfmoveClock;
      this.fullmoveNumber = fullmoveNumber;
      this.players = [
        { player: { name: "Player 1", color: "white" } },
        { player: { name: "Player 2", color: "black" } },
      ];
    }

    private findCollision(
      position: Position,
      fatness = this.pieceFatness
    ): Piece[] {
      // if we were to put a piece at the given position, would it collide with another piece(s)?
      const collidingPieces = this.pieces.filter((p) => {
        if (!p.alive) {
          return false;
        }
        return (
          distance(position, p.position) < (this.pieceFatness + fatness) / 2
        );
      });
      return collidingPieces;
    }

    private raycast(
      self: Piece,
      from: Position,
      to: Position
    ): Piece[] | false {
      // could you move in a straight line to the given position?
      // if you go through any pieces, return them
      // the movement is invalid if you went through a piece AND the destination doesn't collide with the same piece
      // colliding with your own piece is invalid
      const collisions = this.pieces.filter((piece) => {
        if (
          self.position.x === piece.position.x &&
          self.position.y === piece.position.y
        ) {
          // skip the piece we're moving
          console.log("skipping self");
          return false;
        }
        if (!piece.alive) {
          // skip dead pieces
          return false;
        }
        console.log(
          "checking collision with",
          piece.color,
          piece.type,
          piece.position,
          to
        );
        if (
          distanceSegmentToPoint({ from, to }, piece.position) <
          this.pieceFatness
        ) {
          console.log(
            { x: from, y: to },
            "collided with",
            piece.color,
            piece.type,
            "at",
            piece.position
          );
          return true;
        }
      });
      if (collisions.some((piece) => piece.color === self.color)) {
        // we collided with a piece of the same color, illegal move
        console.log("collided with same color");
        return false;
      }
      if (
        collisions.some(
          (piece) => distance(to, piece.position) > this.pieceFatness
        )
      ) {
        // we collided with an enemy piece and went through it, illegal move
        console.log(
          "collided with enemy but went through",
          to,
          collisions.find(
            (piece) => distance(to, piece.position) > this.pieceFatness / 2
          )
        );
        return false;
      }
      // will capture these piece(s) on move (can be empty if no capture)
      return collisions;
    }

    private approximateMove(
      to: Position,
      movements: Line[] | Circunference
    ): Position | false {
      if (isCircunference(movements)) {
        const closest = closestPointToCircunference(movements, to);
        if (distance(closest, to) < this.pieceFatness / 2) {
          return closest;
        }
        return false;
      }
      const closestMoves = movements
        .map((line) => closestPointToLine(line, to))
        .sort((a, b) => distance(a, to) - distance(b, to));
      const closest = closestMoves[0];
      if (distance(closest, to) < this.pieceFatness / 2) {
        return closest;
      }
      return false;
    }

    getTurn() {
      return this.turn;
    }

    attemptMove(to: Position): boolean {
      if (!this.selectedPiece) {
        return false;
      }
      const movement = getPieceMovement(this.selectedPiece);
      console.log("movement", movement);
      const approximatedMove = this.approximateMove(to, movement); // center the move to the closest point in the movement
      if (!approximatedMove) {
        return false;
      }

      if (this.selectedPiece.type === "knight") {
        const captured = this.findCollision(approximatedMove);
        if (captured.some((piece) => piece.color === this.selectedPiece!.color))
          return false;
        captured.forEach((piece) => (piece.alive = false));
      } else {
        const captured = this.raycast(
          this.selectedPiece,
          this.selectedPiece.position,
          approximatedMove
        );
        if (!captured) return false;
        console.log("captured", captured);
        captured.forEach((piece) => (piece.alive = false));
      }

      this.turn = this.turn === "white" ? "black" : "white";
      this.halfmoveClock++;
      this.fullmoveNumber++;
      this.selectedPiece.position = approximatedMove;
      this.selectedPiece.touched = true;
      this.moves.push({
        from: this.selectedPiece.position,
        to: approximatedMove,
        pieces: this.pieces,
        firstTouch: !this.selectedPiece.touched,
      });
      this.selectedPiece = null;
      return true;
    }

    getPieceAt(position: Position): Piece | null {
      const piece = this.findCollision(position, 0);
      if (piece.length === 0) {
        this.selectedPiece = null;
        return null;
      }
      console.log(
        "pieces",
        piece
          .map(
            (p) => `${p.color}_${p.type} (${distance(position, p.position)})`
          )
          .join(", ")
      );
      assert(piece.length === 1, "More than one piece at the given position");
      if (piece[0].color !== this.turn) {
        this.selectedPiece = null;
        return null;
      }
      this.selectedPiece = piece[0];
      return piece[0];
    }

    checkWinner(): Game["winner"] {
      const whiteKing = this.pieces.find(
        (piece) => piece.type === "king" && piece.color === "white"
      );
      const blackKing = this.pieces.find(
        (piece) => piece.type === "king" && piece.color === "black"
      );
      if (!whiteKing || !blackKing) {
        // Only happens with wrong FENs so far
        // How would you even draw in this game?
        this.winner = "draw";
        return "draw";
      }
      if (!whiteKing.alive) {
        this.winner = this.players[1].player;
        return this.players[1].player;
      }
      if (!blackKing.alive) {
        this.winner = this.players[0].player;
        return this.players[0].player;
      }
      return null;
    }
  }

  //   export let game = writable(new Game());
</script>
