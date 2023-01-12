<script lang="ts">
  import Close from "./close.svelte";
  export let style = "";
  export let message = "";
</script>

<div class="wrapper" {style}>
  <p>{message}</p>
  <Close color={"white"} />
</div>

<style lang="scss">
  .wrapper {
    background: #5f0000;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40px;
    position: absolute;
    z-index: 80000;
    width: 600px;
    top: 0;
    height: 100px;

    p {
      color: white;
      font-family: "Roboto Mono", monospace;
      font-size: 20px;

      margin: 0;
    }
  }
</style>
