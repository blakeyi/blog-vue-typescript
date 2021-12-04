<template>
  <div style="width: 100%">
    <div class="article">
      <div class="header">
        <h1 class="title">{{ state.articleDetail.title }}</h1>
        <div class="author">
          <div class="avatar">
            <img
              class="auth-logo"
              src="../assets/userLogo.jpeg"
              alt="blakeyi"
            />
          </div>
          <div class="info">
            <span class="name">
              <span>{{ state.articleDetail.author }}</span>
            </span>
            <div
              props-data-classes="user-follow-button-header"
              data-author-follow-button=""
            />
            <div class="meta">
              <span class="publish-time">
                {{
                  state.articleDetail.create_time
                    ? formatTime(state.articleDetail.create_time)
                    : ""
                }}
              </span>
              <span class="wordage">
                字数 {{ state.articleDetail.numbers }}
              </span>
              <span class="views-count">
                阅读 {{ state.articleDetail.meta?.views }}
              </span>
              <span class="comments-count">
                评论 {{ state.articleDetail.meta?.comments }}
              </span>
              <span class="likes-count">
                喜欢 {{ state.articleDetail.meta?.likes }}
              </span>
              <span>
                <el-button
                  v-show="state.curUser == 'blakeyi'"
                  type="text"
                  :loading="state.btnLoading"
                  @click="changeModel()"
                  style="color: #969696; font-size: 12px"
                  >编辑</el-button
                >
              </span>
              <span>
                <el-button
                  v-show="state.curUser == 'blakeyi'"
                  type="text"
                  :loading="state.btnLoading"
                  @click="republish()"
                  style="color: #969696; font-size: 12px"
                  >重新发布</el-button
                >
              </span>
              <span>
                <el-button
                  v-show="state.curUser == 'blakeyi'"
                  type="text"
                  :loading="state.btnLoading"
                  @click="handleDelArticle()"
                  style="color: red; font-size: 12px"
                  >删除</el-button
                >
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <div v-if="Model == 2">
          <v-md-editor
            v-model="state.markContentEdit"
            height="600px"
          ></v-md-editor>
        </div>
        <div v-if="Model == 1">
          <v-md-editor
            v-model="state.markContent"
            height="600px"
            mode="preview"
            :include-level="[3, 4]"
          ></v-md-editor>
        </div>
      </div>
      <div class="heart">
        <el-button
          type="danger"
          size="large"
          icon="el-icon-star-on"
          :loading="state.isLoading"
          @click="likeArticle"
        >
          <span v-if="state.likeTimes == 0"> 点赞</span>
          <span v-if="state.likeTimes > 0"> 取消点赞</span>
        </el-button>
      </div>
      <div class="comment">
        <el-input
          placeholder="文明社会，理性评论"
          type="textarea"
          v-model="state.content"
        ></el-input>
        <el-button
          style="margin-top: 15px"
          type="primary"
          :loading="state.btnLoading"
          @click="handleAddComment"
          >发 送</el-button
        >
      </div>
      <CommentList
        v-if="!state.isLoading"
        :numbers="state.articleDetail.meta.comments"
        :list="state.articleDetail.comments"
        :article_id="state.articleDetail._id"
        @refreshArticle="refreshArticle"
      />
    </div>
    <div
      v-if="!state.isMobileOrPc"
      style="width: 23%"
      class="article-right fr anchor"
    ></div>
    <LoadingCustom v-if="state.isLoading"></LoadingCustom>
  </div>
</template>


<script lang="ts">
import { defineComponent, reactive, onMounted, ref } from "vue";
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
import axios from "axios";
import { Base64 } from "js-base64";
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
  name: "ArticleDetail",
  inject: ["reload"],
  components: {
    LoadingCustom,
    CommentList,
    VMdEditor,
  },
  data() {
    return {
      editting: true,
    };
  },
  methods: {
    startEdit() {
      console.log(this.editting);
      this.editting = !this.editting;
    },
    handleDelArticle() {
      console.log(this.state.articleDetail);
      const loading = this.$loading({
        lock: true,
        text: "正在删除文章",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let data = {
        _id: this.state.articleDetail._id,
      };
      axios
        .post("https://blakeyi.cn/articleDelete", data)
        .then((response: Object) => {
          if (response.data.ret_code == 0) {
            console.log(response.data);
            this.$notify.success({
              title: "成功",
              message: "文章删除成功",
              type: "success",
            });
            this.$router.push("/articles");
          } else {
            this.$notify.error({
              type: "success",
              title: "提示",
              message: "文章删除失败",
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
  setup() {
    let text = ref(2);
    const state = reactive({
      btnLoading: false,
      isLoadEnd: false,
      isLoading: false,
      markContent: "",
      markContentEdit: "", // 编辑框内容
      isMobileOrPc: isMobileOrPc(),
      curUser: "", // 当前用户，没登录为空
      params: {
        id: "",
        type: 1, //文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
      } as ArticleDetailParams,
      content: "",
      articleDetail: {
        _id: "",
        title: "第一篇文章",
        author: "blakeyi",
        desc: "",
        meta: { views: 0, likes: 0, comments: 0 },
        tags: [],
        comments: [],
        likeusers: [],
        createtime: "",
        updatetime: "",
        content: "",
        numbers: 0,
      },
      cacheTime: 0, // 缓存时间
      times: 0, // 评论次数
      likeTimes: 0, // 点赞次数
    });

    const formatTime = (value: string | Date): string => {
      return timestampToTime(value, true);
    };

    const handleSearch = async (): Promise<void> => {
      var queryData = {
        _id: state.params.id,
      };
      axios
        .post("https://blakeyi.cn/articleQuery", queryData)
        .then(function (response) {
          console.log(response);
          console.log(state.isLoading);
          state.articleDetail = response.data.ret_content;
          state.markContent = Base64.decode(response.data.ret_content.content);
          state.articleDetail.numbers = state.markContent.length;
          state.likeTimes = response.data.ret_content.meta.likes;
        })
        .catch(function (error) {
          alert(error);
        });
    };

    const refreshArticle = (): void => {
      handleSearch();
    };

    const likeArticle = async (): Promise<void> => {
      if (!state.articleDetail._id) {
        ElMessage({
          message: "该文章不存在！",
          type: "warning",
        });
        return;
      }

      if (state.likeTimes > 0) {
        ElMessage({
          message: "您已经点过赞了！悠着点吧！",
          type: "warning",
        });
        return;
      }

      let user_id: string = "";
      if (window.sessionStorage.userInfo) {
        let userInfo = JSON.parse(window.sessionStorage.userInfo);
        user_id = userInfo.name;
      } else {
        ElMessage({
          message: "登录才能点赞，请先登录！",
          type: "warning",
        });
        return;
      }
      console.log(window.sessionStorage.userInfo);
      console.log(user_id);
      let params = {
        _id: state.articleDetail._id,
        likeusers: [user_id],
        operation: "add",
      };
      axios
        .post("https://blakeyi.cn/articleUpdate", params)
        .then((response: Object) => {
          console.log(response);
        });
      let params1 = {
        _id: state.articleDetail._id,
        meta: {
          likes: 1,
        },
        operation: "add",
      };
      axios
        .post("https://blakeyi.cn/articleUpdate", params1)
        .then((response: Object) => {
          console.log(response);
          state.btnLoading = false;
        })
        .catch(function (error) {
          alert(error);
        })
        .finally(function () {
          state.isLoading = false;

          state.likeTimes++;
          ++state.articleDetail.meta.likes;
          ElMessage({
            message: "操作成功",
            type: "success",
          });
        });
    };

    const handleAddComment = async (): Promise<void> => {
      console.log(state.articleDetail);
      if (!state.articleDetail._id) {
        ElMessage({
          message: "该文章不存在！",
          type: "error",
        });
        return;
      }

      if (state.times > 2) {
        ElMessage({
          message: "您今天评论的次数已经用完，明天再来评论吧！",
          type: "warning",
        });
        return;
      }

      let now = new Date();
      let nowTime = now.getTime();
      if (nowTime - state.cacheTime < 4000) {
        ElMessage({
          message: "您评论太过频繁，1 分钟后再来留言吧！",
          type: "warning",
        });
        return;
      }

      if (!state.content) {
        ElMessage({
          message: "请输入内容!",
          type: "warning",
        });
        return;
      }
      let userInfo = "";
      if (window.sessionStorage.userInfo) {
        userInfo = JSON.parse(window.sessionStorage.userInfo);
      } else {
        ElMessage({
          message: "登录才能评论，请先登录！",
          type: "warning",
        });
        return;
      }
      console.log(userInfo);
      state.btnLoading = true;
      let data = {
        operation: "add",
        _id: state.articleDetail._id,
        comments: [
          {
            user: {
              name: userInfo.name,
              type: userInfo.name == "blakeyi" ? 0 : 1,
            },
            createtime: nowTime.toString(),
            content: state.content,
            othercomments: [],
          },
        ],
      };
      console.log(data);

      await service.post("https://49.234.20.133:3333/articleUpdate", data);

      let data1 = {
        _id: state.articleDetail._id,
        meta: {
          comments: 1,
        },
        operation: "add",
      };
      await service.post("https://49.234.20.133:3333/articleUpdate", data1);
      state.btnLoading = false;
      state.times++;
      state.cacheTime = nowTime;
      state.content = "";
      ElMessage({
        message: "操作成功",
        type: "success",
      });
      handleSearch();
    };

    const route = useRoute();
    onMounted(() => {
      state.params.id = route.query.article_id as string;
      if (route.path === "/about") {
        state.params.type = 3;
      }
      handleSearch();
      if (window.sessionStorage.userInfo) {
        let userInfo = JSON.parse(window.sessionStorage.userInfo);
        state.curUser = userInfo.name;
      }
    });

    const Model = ref(1);
    const changeModel = () => {
      if (Model.value == 1) {
        state.markContentEdit = state.markContent;
        Model.value = 2;
      } else {
        Model.value = 1;
      }
    };
    const republish = () => {
      console.log(state.markContentEdit);
      state.markContent = state.markContentEdit;
      Model.value = 1;
      var updateData = {
        _id: state.params.id,
        content: Base64.encode(state.markContentEdit),
      };
      axios
        .post("https://blakeyi.cn/articleUpdate", updateData)
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          alert(error);
        });
    };
    return {
      state,
      formatTime,
      handleSearch,
      handleAddComment,
      likeArticle,
      refreshArticle,
      text,
      Model,
      changeModel,
      republish,
    };
  },
  beforeUnmount(): void {
    document.title = "月清浅微凉的博客网站";
    document
      .getElementById("keywords")
      .setAttribute("content", "月清浅微凉 的博客网站");
    document
      .getElementById("description")
      .setAttribute(
        "content",
        "分享大前端开发等相关的技术文章，热点资源，全栈程序员的成长之路。"
      );
  },
});
</script>
<style lang="less" scope>
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
    border: #333;
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
.el-textarea__inner {
  border-radius: 20px;
}
</style>

