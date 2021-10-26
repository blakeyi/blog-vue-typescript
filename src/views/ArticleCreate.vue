<template>
  <div class="left">
    <el-input
      v-model="state.title"
      placeholder="请输入文章标题"
      prefix-icon="el-icon-search"
      style="width:35%"
    />
    <el-button type="primary" icon="el-icon-plus" @click="handleSave">保存草稿</el-button>
    <el-button type="primary" icon="el-icon-plus" @click="handleAdd">发布文章</el-button>
    <v-md-editor v-model="state.markContent" height="800px"  style="margin-top: 300px"></v-md-editor>
    
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
      title:"",
      markContent:""
    })
    function handleSave() {
      console.log("handleSave")
    };

    const handleAdd = async (): Promise<void> => {
      console.log("handleAdd")
      console.log(state.title)
      console.log(state.markContent)
    };

    return {
      state,
      handleSave,
      handleAdd,
    }
  
  },
});
</script>
<style lang="less" scoped>
.demo-input-suffix {
  position: fixed;
}
.anchor {
  display: block;
  position: sticky;
  top: 213px;
  margin-top: 213px;
  border-left: 1px solid #eee;
  .anchor-ul {
    position: relative;
    top: 0;
    max-width: 250px;
    border: none;
    -moz-box-shadow: 0 0px 0px #fff;
    -webkit-box-shadow: 0 0px 0px #fff;
    box-shadow: 0 0px 0px #fff;

    li.active {
      color: #009a61;
    }
  }
  a {
    color: #333;
  }
}
.article {
  width: 100%;
  .header {
    .title {
      margin: 20px 0 0;
      text-align: center;
      font-size: 34px;
      font-weight: bold;
    }
    .author {
      position: relative;
      margin: 30px 0 40px;
      padding-left: 50px;
      .avatar {
        position: absolute;
        left: 0;
        top: 0;
        width: 48px;
        height: 48px;
        vertical-align: middle;
        display: inline-block;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      .info {
        float: left;
        vertical-align: middle;
        // display: inline-block;
        margin-left: 8px;
        a {
          color: #333;
        }
      }
      .name {
        margin-right: 3px;
        font-size: 16px;
        vertical-align: middle;
      }
      .meta {
        margin-top: 5px;
        font-size: 12px;
        color: #969696;
        span {
          padding-right: 5px;
        }
      }
      .tags {
        float: right;
        padding-top: 15px;
        // padding-right: 20px;
        .tag {
          // padding: 0 10px;
          margin-left: 5px;
          border-right: 2px solid #eee;
        }
      }
    }
  }
  .content {
    min-height: 300px;
  }
}
.heart {
  height: 60px;
  text-align: center;
  margin: 50px;
}
.loader {
  color: rgb(226, 44, 44);
  text-align: center;
  padding: 50px;
  font-size: 16px;
}
.clearfix {
  clear: both;
}

.el-input__inner {
  width: 50%;
}
</style>

