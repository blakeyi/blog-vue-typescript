<template>
   <div class="left clearfix">
    <h1>hello </h1>
  </div>
</template>


<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import LoadingCustom from "../components/Loading.vue";
declare let document: Document | any;

export default defineComponent({
  name: "About",
  components: {
    LoadingCustom,
  },
  data() {
    return {
    };
  },
  methods: {
  
  },
  setup() {},
});
</script>
<style lang="less" scoped>
.left{
  width: 50%;
}
</style>

