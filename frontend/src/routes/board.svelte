<script lang="ts">
  import { onMount } from "svelte";
  import { Game, type Color, type Piece, getPieceMovement } from "./game";

  let canvas: HTMLCanvasElement;
  let squareSize: number;

  let game: Game = new Game();

  function getOrThrow<T>(value: T | null, message: string): T {
    if (value === null) {
      throw new Error(message);
    }
    return value;
  }

  const boardTheme = {
    lightSquare: "#F0D9B5",
    darkSquare: "#B58863",
  } as const;

  function drawBoard(ctx: CanvasRenderingContext2D) {
    // 8x8 board
    const size = 8;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        ctx.fillStyle =
          (x + y) % 2 === 0 ? boardTheme.lightSquare : boardTheme.darkSquare;
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }
  }

  onMount(() => {
    function getPieceImage(
      name: Piece["type"],
      color: Color
    ): CanvasImageSource {
      const img = new Image();
      if (name === "empty") {
        return img;
      }
      img.src = `/${color}_${name}.png`;
      return img;
    }

    const images: {
      white: Record<Piece["type"], CanvasImageSource>;
      black: Record<Piece["type"], CanvasImageSource>;
    } = {
      white: {
        pawn: getPieceImage("pawn", "white"),
        rook: getPieceImage("rook", "white"),
        knight: getPieceImage("knight", "white"),
        bishop: getPieceImage("bishop", "white"),
        queen: getPieceImage("queen", "white"),
        king: getPieceImage("king", "white"),
        empty: getPieceImage("empty", "white"),
      },
      black: {
        pawn: getPieceImage("pawn", "black"),
        rook: getPieceImage("rook", "black"),
        knight: getPieceImage("knight", "black"),
        bishop: getPieceImage("bishop", "black"),
        queen: getPieceImage("queen", "black"),
        king: getPieceImage("king", "black"),
        empty: getPieceImage("empty", "black"),
      },
    } as const;

    console.log(images);

    function drawPieceMove(ctx: CanvasRenderingContext2D, piece: Piece) {
      const moves = getPieceMovement(piece);

      ctx.lineWidth = game.pieceFatness * squareSize;
      ctx.strokeStyle = "rgba(0, 128, 0, 0.5)";
      ctx.lineCap = "round";
      if (Array.isArray(moves)) {
        // its an array of lines
        // type line = [{x: number, y: number}, {x: number, y: number}]
        moves.forEach((move) => {
          ctx.beginPath();
          ctx.moveTo(move[0].x * squareSize, move[0].y * squareSize);
          ctx.lineTo(move[1].x * squareSize, move[1].y * squareSize);
          ctx.stroke();
        });
      } else {
        // its a circle
        // type Circle = { center: {x: number, y: number}; radius: number };
        ctx.beginPath();
        ctx.arc(
          moves.center.x * squareSize,
          moves.center.y * squareSize,
          moves.radius * squareSize,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    }

    function drawPiece(ctx: CanvasRenderingContext2D, piece: Piece) {
      if (game.selectedPiece === piece) {
        drawPieceMove(ctx, piece);
        if (piece.type === "knight") {
        }
      }
      ctx.fillStyle =
        game.selectedPiece === piece && piece.type === "knight"
          ? "rgba(0, 128, 0, 0.5)"
          : "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(
        piece.position.x * squareSize,
        piece.position.y * squareSize,
        (squareSize * game.pieceFatness) / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.fillStyle = piece.color === "white" ? "white" : "black";

      ctx.drawImage(
        images[piece.color][piece.type],
        piece.position.x * squareSize - squareSize / 2,
        piece.position.y * squareSize - squareSize / 2,
        squareSize,
        squareSize
      );
      // ctx.fillText(
      //   piece.type.toUpperCase().charAt(0),
      //   piece.position.x * squareSize,
      //   piece.position.y * squareSize
      // );
    }

    function drawPieces(ctx: CanvasRenderingContext2D, pieces: Piece[]) {
      pieces.forEach((piece) => drawPiece(ctx, piece));
    }

    function handlePieceClick(event: MouseEvent) {
      const x = event.offsetX / squareSize;
      const y = event.offsetY / squareSize;
      console.log(x, y);
      const piece = game.getPieceAt({ x, y });
      if (piece) {
        console.log(piece);
      } else {
        console.log("No piece at", x, y);
      }
    }

    const ctx = getOrThrow(
      canvas.getContext("2d"),
      "Could not get canvas context"
    );
    let frame: number;
    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.addEventListener("click", handlePieceClick);

    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    (function loop() {
      squareSize = canvas.style.width ? parseInt(canvas.style.width) / 8 : 100;
      frame = requestAnimationFrame(loop);
      //   ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBoard(ctx);
      drawPieces(ctx, game.pieces);
    })();
    return () => cancelAnimationFrame(frame);
  });
</script>

<div class="w-full h-full rounded-xl">
  <canvas bind:this={canvas} class="w-full aspect-square rounded"></canvas>
  <!-- <img src="/black_rook.png" alt="rook" /> -->
</div>
