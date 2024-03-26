<script lang="ts">
  import { onMount } from "svelte";
  import { Game, type Color, type Piece } from "./game";

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

    function drawPiece(ctx: CanvasRenderingContext2D, piece: Piece) {
      ctx.fillStyle = "green";
      // colored circle
      // ctx.beginPath();
      // ctx.arc(
      //   piece.position.x * squareSize + squareSize / 2,
      //   piece.position.y * squareSize + squareSize / 2,
      //   10,
      //   0,
      //   2 * Math.PI
      // );
      // ctx.fill();
      ctx.drawImage(
        images[piece.color][piece.type],
        piece.position.x * squareSize,
        piece.position.y * squareSize,
        squareSize,
        squareSize
      );
    }

    function drawPieces(ctx: CanvasRenderingContext2D, pieces: Piece[]) {
      pieces.forEach((piece) => drawPiece(ctx, piece));
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

<div class="w-full h-full rounded-xl bg-red-200">
  <canvas bind:this={canvas} class="w-full h-full rounded"></canvas>
  <!-- <img src="/black_rook.png" alt="rook" /> -->
</div>
