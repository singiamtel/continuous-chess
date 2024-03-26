<script>
  import Board from "./board.svelte";
</script>

<div class="flex flex-col items-center h-screen white w-full">
  <div
    class="flex flex-col items-center h-screen bg-slate-200 w-full xl:max-w-4xl md:max-w-2xl"
  >
    <div class="w-full border-b border-slate-400 p-4">Your profile etc</div>
    <div class="w-96 h-96 mt-2">
      <Board />
    </div>
  </div>
</div>
