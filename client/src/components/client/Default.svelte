<script lang="ts">
  export let data: any;
</script>

<div class="default">
  {@html data?.html}
</div>

<style lang="scss">
  .default {
    white-space: pre-wrap;
    font-size: 16px;
    font-family: "Roboto Mono", monospace;
    font-weight: normal;
    word-break: break-all;
    margin: 10px 0;
  }
</style>
