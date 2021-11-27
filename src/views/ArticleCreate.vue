<template>
  <div class="aritcleCreate">
    <div class="top">
      <div class="left">
        <router-link to="/articles">
          <i class="el-icon-arrow-left" style="color: #409eff"></i>
          <el-button type="text" style="padding: 5px"> 文章管理</el-button>
        </router-link>
        <el-input
          v-model="title"
          placeholder="请输入文章标题"
          style="width: 35%"
        />
      </div>
      <div class="right">
        <el-button icon="el-icon-save" @click="handleSave" round
          >保存草稿</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="dialogFormVisible = true"
          round
          >发布文章</el-button
        >
      </div>
    </div>
    <div class="body">
      <v-md-editor
        v-model="markContent"
        height="700px"
        style="margin-top: 40px"
      ></v-md-editor>
    </div>

    <el-dialog
      v-model="dialogFormVisible"
      title="发布文章"
      :append-to-body="true"
    >
      <div>
        <label style="margin-right: 5px; vertical-align: top">文章标题:</label>
        <el-input
          v-model="title"
          size="mini"
          placeholder="请输入内容"
          style="width: 280px; margin-right: 5px"
        ></el-input>
      </div>
      <div class="articleTags">
        <label style="margin-right: 5px">文章标签:</label>
        <span
          v-for="(item, index) in tags.labels"
          :key="index"
          style="padding: 3px"
        >
          <span> {{ item }}</span>
          <i
            class="el-icon-circle-close"
            style="color: red"
            @click="handleDelLabel(label, index)"
          ></i>
        </span>
        <el-input
          v-model="tags.input"
          size="mini"
          style="width: 80px; margin-right: 5px"
        ></el-input>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAddLabel(tags.input)"
          >增加</el-button
        >
      </div>
      <div>
        <label style="margin-right: 5px; vertical-align: top">文章描述:</label>
        <el-input
          v-model="desc"
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          style="width: 280px; margin-right: 5px"
        ></el-input>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button @click="handleSave()">保存为草稿</el-button>
          <el-button type="primary" @click="handleAdd()">发布文章</el-button>
        </span>
      </template>
    </el-dialog>
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
  data() {
    return {
      dialogFormVisible: false,
      tags: {
        input: "",
        labels: [],
      },
      tag_input: "",
      desc: "",
      title: "",
      markContent: "",
    };
  },
  methods: {
    handleDelLabel(label: String, index: Number) {
      console.log(label, index);
      let temp = new Array();
      this.tags.labels.forEach((element: any, key: Number) => {
        if (key != index) {
          temp.push(element);
        }
      });
      console.log(temp);
      this.tags.labels = temp;
    },
    handleAddLabel(label: any) {
      let exist = false;
      this.tags.labels.forEach((element: String) => {
        if (label == element) {
          exist = true;
        }
      });
      if (exist) {
        this.$message.error("请勿添加重复标签");
        return;
      }
      this.tags.labels.push(label);
      console.log(label);
    },
    handleSave() {},
    handleAdd() {
      this.dialogFormVisible = false;
      const loading = this.$loading({
        lock: true,
        text: "正在发布文章",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      var date = new Date();
      var newData = {
        title: this.title,
        author: "blakeyi",
        desc: this.desc,
        meta: {
          views: 0,
          comments: 0,
          likes: 0,
        },
        tags: this.tags.labels,
        comments: [],
        likeusers: [],
        createtime: date.getTime().toString(),
        updatetime: date.getTime().toString(),
        content: Base64.encode(this.markContent),
      };
      console.log(newData);
      var that = this;
      axios
        .post("http://blakeyi.cn/articleCreate", newData)
        .then((response: Object) => {
          console.log(that);

          if (response.data.ret_code == 0) {
            console.log(response.data);
            this.$notify.success({
              title: "成功",
              message: "文章发布成功",
              type: "success",
            });
            this.$router.push("/articles");
          } else {
            that.$notify.error({
              type: "success",
              title: "提示",
              message: "文章发布失败",
            });
          }
        })
        .catch(function (error) {
          alert(error);
        })
        .finally(function () {
          loading.close();
        });
    },
  },
  setup() {},
});
</script>
<style lang="less" scoped>
.aritcleCreate {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.top {
  height: 40px;
  width: 100%;
  display: flex;
  margin-top: 5px;
}
.body {
  width: 100%;
  display: flex;
  margin-top: 5px;
}

.right {
  display: flex;
  justify-content: flex-end;
}

.left {
  display: flex;
  margin-left: 10px;
}

.articleTags {
  padding: 3px;
  height: 60px;
  margin-right: 5px;
  margin-top: 5px;
}
</style>

