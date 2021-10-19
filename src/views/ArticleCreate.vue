<template>
  <div class="left clearfix">
    <el-input
      v-model="state.searchInput"
      placeholder="请输入文章标题"
      prefix-icon="el-icon-search"
      style="width:35%"
    />
    <el-button type="primary" icon="el-icon-plus">保存草稿</el-button>
    <el-button type="primary" icon="el-icon-plus">发布文章</el-button>
    <v-md-editor v-model="state.markContent" height="600px" v-if="state.editting" style="margin-top: 10px"></v-md-editor>
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
      btnLoading: false,
      isLoadEnd: false,
      isLoading: false,
      editting: true, // 正在编辑
      markContent: "## 2 test",
      isMobileOrPc: isMobileOrPc(),
      params: {
        id: "",
        type: 1, //文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
      } as ArticleDetailParams,
      content: "",
      title: "",
      articleDetail: {
        toc: "",
        _id: "",
        author: "blakeyi",
        category: [],
        comments: [],
        create_time: "",
        desc: "",
        content: "",
        id: 16,
        img_url: "",
        numbers: 0,
        keyword: [],
        like_users: [],
        meta: { views: 1, likes: 0, comments: 0 },
        origin: 0,
        state: 1,
        tags: [],
        title: "",
        update_time: "",
      } as ArticleDetailIF,
      cacheTime: 0, // 缓存时间
      times: 0, // 评论次数
      likeTimes: 0, // 点赞次数
    });

    const formatTime = (value: string | Date): string => {
      return timestampToTime(value, true);
    };

    const handleSearch = async (): Promise<void> => {
      console.log(urls.getArticleDetail);
      console.log(state.params);
      state.isLoading = true;
      //const data: any = await service.post(urls.getArticleDetail, state.params);
      state.isLoading = false;
      var data = {
        content: "# hello `java` ",
        keyword: ["test"],
        desc: "hell0",
        title: "blakeyi",
      };
      state.articleDetail = data;

      const article = markdown.marked(data.content);
      article.then((res: any) => {
        //state.articleDetail.content = res.content;
        state.articleDetail.content = "<h1>这是一个h1元素内容</h1>";
        state.articleDetail.toc = res.toc;
      });
      state.articleDetail.content = "<h1>这是一个h1元素内容</h1>";
      console.log(state.articleDetail.content);
      let keyword = data.keyword.join(",");
      let description = data.desc;
      let title = data.title;
      document.title = title;
      document.querySelector("#keywords").setAttribute("content", keyword);
      document
        .querySelector("#description")
        .setAttribute("content", description);
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
        user_id = userInfo._id;
      } else {
        ElMessage({
          message: "登录才能点赞，请先登录！",
          type: "warning",
        });
        return;
      }
      let params: LikeParams = {
        id: state.articleDetail._id,
        user_id,
      };
      await service.post(urls.likeArticle, params);
      state.isLoading = false;

      state.likeTimes++;
      ++state.articleDetail.meta.likes;
      ElMessage({
        message: "操作成功",
        type: "success",
      });
    };

    const handleAddComment = async (): Promise<void> => {
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
      let user_id = "";
      if (window.sessionStorage.userInfo) {
        let userInfo = JSON.parse(window.sessionStorage.userInfo);
        user_id = userInfo._id;
      } else {
        ElMessage({
          message: "登录才能评论，请先登录！",
          type: "warning",
        });
        return;
      }

      state.btnLoading = true;
      await service.post(urls.addComment, {
        article_id: state.articleDetail._id,
        user_id,
        content: state.content,
      });
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
    });

    return {
      state,
      formatTime,
      handleSearch,
      handleAddComment,
      likeArticle,
      refreshArticle,
    };
  },
  beforeUnmount(): void {
    document.title = "夜尽天明的博客网站";
    document
      .getElementById("keywords")
      .setAttribute("content", "夜尽天明 的博客网站");
    document
      .getElementById("description")
      .setAttribute(
        "content",
        "分享大前端开发等相关的技术文章，热点资源，全栈程序员的成长之路。"
      );
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

