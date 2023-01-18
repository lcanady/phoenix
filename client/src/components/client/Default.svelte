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

    background: transparent;
  }

  @media screen and (max-width: 1024px) {
    .default {
      margin: 5px 20px;
    }
  }
</style>
