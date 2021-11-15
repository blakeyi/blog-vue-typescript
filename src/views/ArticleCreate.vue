<template>
  <div class="main">
  <div class="top">
    <div class="left">
      <el-input
        v-model="state.title"
        placeholder="请输入文章标题"
        prefix-icon="el-icon-search"
        style="width: 35%"
      />
    </div>
    <div class="right">
      <el-button type="primary" icon="el-icon-plus" @click="handleSave"
        >保存草稿</el-button
      >
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd"
        >发布文章</el-button
      >
    </div>
  </div>
  <div class="body">
    <v-md-editor
      v-model="state.markContent"
      height="780px"
      style="margin-top:40px"
    ></v-md-editor>
  </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, reactive, onMounted } from "vue";
import service from "../utils/https";
import urls from "../utils/urls";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { timestampToTime, isMobileOrPc } from "../utils/utils";
import markdown from "../utils/markdown";
import LoadingCustom from "../components/Loading.vue";
import CommentList from "../components/CommentList.vue";
import {
  ArticleDetailIF,
  LikeParams,
  ArticleDetailParams,
} from "../types/index";

import VMdEditor from "@kangc/v-md-editor/lib/codemirror-editor";
import "@kangc/v-md-editor/lib/style/codemirror-editor.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";

// highlightjs
import hljs from "highlight.js";
import axios from "axios";
import { Base64 } from "js-base64";
// codemirror 编辑器的相关资源
import Codemirror from "codemirror";
// mode
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/vue/vue";
// edit
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/matchbrackets";
// placeholder
import "codemirror/addon/display/placeholder";
// active-line
import "codemirror/addon/selection/active-line";
// scrollbar
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
// style
import "codemirror/lib/codemirror.css";

VMdEditor.Codemirror = Codemirror;
VMdEditor.use(githubTheme, {
  Hljs: hljs,
  config: {
    toc: {
      includeLevel: [3, 4],
    },
  },
});

declare let document: Document | any;

export default defineComponent({
  name: "ArticleCreate",
  components: {
    LoadingCustom,
    CommentList,
    VMdEditor,
  },
  setup() {
    const state = reactive({
      title: "",
      markContent: "",
    });
    function handleSave() {
      console.log("handleSave");
    }

    const handleAdd = async (): Promise<void> => {
      console.log("handleAdd");
      console.log(state.title);
      console.log(state.markContent);
      var date = new Date();
      var newData = {
        title: state.title,
        author: "blakeyi",
        desc: "MongoDB 是一个 Nosql 数据库",
        meta: {
          views: 0,
          comments: 0,
          likes: 0,
        },
        tags: ["mongodb", "database", "NoSQL"],
        comments: [],
        likeusers: [],
        createtime: date.getTime().toString(),
        updatetime: date.getTime().toString(),
        content: Base64.encode(state.markContent),
      };
      console.log(newData);

      axios
        .post("http://blakeyi.cn/articleCreate", newData)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          alert(error);
        });
    };

    return {
      state,
      handleSave,
      handleAdd,
    };
  },
});
</script>
<style lang="less" scoped>
.main {
  height: 60px;
  width: 120%;
  display: flex;
  flex-direction: column;
}
.top {
  height: 60px;
  width: 120%;
  display: flex;
}
.body {
  height: 600px;
  width: 120%;
  display: flex;
}

</style>

