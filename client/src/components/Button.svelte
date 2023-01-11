<script lang="ts">
  export let label: string;
  export let onClick: () => void = () => {};
  export let alt: Boolean = false;
  export let fullwidth: Boolean = false;
  export let mobile: Boolean = false;
</script>

<button on:click={onClick} class:fullwidth class:mobile class:clear={alt}
  >{label}</button
>

<style lang="scss">
  button {
    background: rgba(255, 255, 255, 0.1);

    color: white;
    font-family: "PunkType", monospace;
    height: 40px;
    letter-spacing: 5px;
    font-size: 16px;
    padding: 0 20px;
    outline: none;
    border: none;
  }

  .mobile {
    min-height: 72px;
  }

  .fullwidth {
    flex-grow: 1;
  }

  .clear {
    background: transparent;
    border: 1px solid white;
  }
</style>
