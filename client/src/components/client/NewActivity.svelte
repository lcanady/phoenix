<script lang="ts">
  import { messages, newMessage } from "../../stores";
  import { onDestroy, onMount } from "svelte";

  export const data: any = {};
  let theDiv: HTMLDivElement;

  const scrollHandeler = (output: HTMLDivElement) => {
    if (output) {
      if (output.scrollTop === output.scrollHeight - output.offsetHeight) {
        if (theDiv !== undefined) theDiv?.remove();
      }
    }
  };

  onMount(() => {
    const output = document.querySelector<HTMLDivElement>(".output");

    if (output) {
      output.addEventListener("scroll", () => scrollHandeler(output));
    }
  });

  onDestroy(() => {
    const output = document.querySelector<HTMLDivElement>(".output");

    if (output) {
      output.removeEventListener("scroll", () => scrollHandeler(output));
      $messages = $messages.filter((msg) => msg.data.cmd !== "new");
      $newMessage = false;
    }
  });
</script>

<div class="container new-message" bind:this={theDiv}>
  <p>New Activity</p>
</div>
