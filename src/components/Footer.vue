
<template>
  <div class="footer">
    <div>月清浅微凉 ©2021 Created by blakeyi</div>
    <div class="number">
      <a href="http://www.beian.miit.gov.cn" target="_blank"
        >公安备案号44030602006255 赣ICP备2021008784号-1</a
      >
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Footer",
});
</script>
<style scoped>
.footer {
  text-align: center;
  padding: 20px;
  font-weight: bold;
  position: fixed;
  bottom: 0;
  left: 30%;
}
</style>

