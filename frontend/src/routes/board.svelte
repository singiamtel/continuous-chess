<script lang="ts">
  import { onMount } from "svelte";
  import {
    Game,
    type Color,
    type Piece,
    getPieceMovement,
  } from "$lib/game.svelte";
  import { capitalize } from "$lib";
  import { writable } from "svelte/store";

  let canvas: HTMLCanvasElement;
  let canvasWidth: number;
  let squareSize: number;
  let turn: Color = "white";
  let game = writable(new Game());
  let winner: Game["winner"];

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

      ctx.lineWidth = $game.pieceFatness * squareSize;
      ctx.strokeStyle = "rgba(0, 128, 0, 0.5)";
      ctx.lineCap = "round";
      if (Array.isArray(moves)) {
        // its an array of lines
        // type line = [{x: number, y: number}, {x: number, y: number}]
        moves.forEach((move) => {
          ctx.beginPath();
          ctx.moveTo(move.from.x * squareSize, move.from.y * squareSize);
          ctx.lineTo(move.to.x * squareSize, move.to.y * squareSize);
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

    function drawWinner(
      ctx: CanvasRenderingContext2D,
      winner: Exclude<Game["winner"], null>
    ) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "48px serif";
      ctx.textAlign = "center";
      ctx.fillText(
        winner === "draw"
          ? "Game drawn"
          : `${capitalize(winner.name)} (${winner.color}) wins!`,
        canvasWidth / 2,
        canvasWidth / 2
      );
    }

    function drawPiece(ctx: CanvasRenderingContext2D, piece: Piece) {
      if ($game.selectedPiece === piece) {
        drawPieceMove(ctx, piece);
      }
      ctx.fillStyle =
        $game.selectedPiece === piece && piece.type === "knight"
          ? "rgba(0, 128, 0, 0.5)"
          : "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(
        piece.position.x * squareSize,
        piece.position.y * squareSize,
        (squareSize * $game.pieceFatness) / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.fillStyle = piece.color === "white" ? "white" : "black";

      ctx.drawImage(
        images[piece.color][piece.type],
        piece.position.x * squareSize - (squareSize * $game.pieceFatness) / 2,
        piece.position.y * squareSize - (squareSize * $game.pieceFatness) / 2,
        squareSize * $game.pieceFatness,
        squareSize * $game.pieceFatness
      );
      // ctx.fillText(
      //   piece.type.toUpperCase().charAt(0),
      //   piece.position.x * squareSize,
      //   piece.position.y * squareSize
      // );
    }

    function drawPieces(ctx: CanvasRenderingContext2D, pieces: Piece[]) {
      pieces
        .filter((piece) => piece.alive)
        .forEach((piece) => drawPiece(ctx, piece));
    }

    function handlePieceClick(event: MouseEvent) {
      if (winner) {
        return;
      }
      if ($game.selectedPiece) {
        if (
          !$game.attemptMove({
            x: event.offsetX / squareSize,
            y: event.offsetY / squareSize,
          })
        )
          $game.selectedPiece = null;
        turn = $game.getTurn();
        winner = $game.checkWinner();
        return;
      }
      const x = event.offsetX / squareSize;
      const y = event.offsetY / squareSize;
      console.log(x, y);
      const piece = $game.getPieceAt({ x, y });
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
      canvasWidth = canvas.style.width ? parseInt(canvas.style.width) : 800;
      squareSize = canvasWidth / 8;
      frame = requestAnimationFrame(loop);
      //   ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBoard(ctx);
      drawPieces(ctx, $game.pieces);
      winner && drawWinner(ctx, winner);
    })();
    return () => cancelAnimationFrame(frame);
  });
</script>

<div class="w-full h-full rounded-xl">
  <p>{capitalize(turn)}'s turn</p>
  <canvas bind:this={canvas} class="w-full aspect-square rounded"></canvas>
  <div class="grid grid-cols-2 mt-2">
    <div
      class="flex flex-col items-center gap-2 border rounded-s border-slate-400 p-2"
    >
      <label for="pieceFatness">Piece Fatness ({$game.pieceFatness})</label>
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.01"
        bind:value={$game.pieceFatness}
      />
      <button
        class="bg-blue-300 text-black rounded-md px-2 py-1"
        on:click={() => ($game.pieceFatness = Game.defaultPieceFatness)}
        >Reset fatness</button
      >
    </div>
    <div
      class="flex flex-col items-center gap-2 border-y border-e rounded-e border-slate-400 p-2"
    >
      <button
        class="bg-blue-300 text-black px-2 py-1 rounded-md"
        on:click={() => ($game = new Game())}>Reset Game</button
      >
    </div>
  </div>
</div>
