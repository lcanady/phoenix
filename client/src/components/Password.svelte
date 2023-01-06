<script lang="ts">
  export let label: string = "";
  export let value: string;
</script>

<input type="password" placeholder={label} bind:value />

<style lang="scss">
  input {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    font-family: "PunkType", monospace;
    height: 40px;
    letter-spacing: 5px;
    font-size: 16px;
    padding: 0 10px;
    margin-bottom: 5px;
    border-bottom: white 1px solid;
    outline: none;
  }
</style>
