<template>
  <div class="left clearfix">
    <!-- 功能栏 -->
    <h3 v-if="state.params.tag_id">{{ state.tag_name }} 相关的文章</h3>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input
          v-model="state.searchInput"
          placeholder="关键字"
          prefix-icon="el-icon-search"
          style="margin-right: 10px"
        >
        </el-input>
      </el-col>
      <el-col :span="8">
        <el-button type="primary" icon="el-icon-search" @click="filterArticle"
          >搜索文章</el-button
        >
      </el-col>
      <el-col :span="8" v-show="state.curUser == 'blakeyi'">
        <router-link to="/articleCreate">
          <el-button type="success" icon="el-icon-plus">新增文章</el-button>
        </router-link>
      </el-col>
    </el-row>
    <ul class="articles-list" id="list">
      <transition-group name="el-fade-in">
        <li v-for="article in state.filterList" :key="article._id" class="item">
          <router-link :to="state.href + article._id">
            <div class="content">
              <h4 class="title">{{ article.title }}</h4>
              <p class="abstract">{{ article.desc }}</p>
              <div class="meta">
                <span>阅读 {{ article.meta.views }}</span>
                <span>评论 {{ article.meta.comments }}</span>
                <span>赞 {{ article.meta.likes }}</span>
                <span v-if="article.createtime" class="time">
                  {{ formatTime(article.createtime) }}
                </span>
              </div>
            </div>
          </router-link>
        </li>
      </transition-group>
    </ul>
    <LoadingCustom v-if="state.isLoading"></LoadingCustom>
    <LoadEnd v-if="state.isLoadEnd"></LoadEnd>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, nextTick, watch } from "vue";
import service from "../utils/https";
import urls from "../utils/urls";
import LoadEnd from "../components/LoadEnd.vue";
import LoadingCustom from "../components/Loading.vue";
import {
  throttle,
  getScrollTop,
  getDocumentHeight,
  getWindowHeight,
  getQueryStringByName,
  timestampToTime,
} from "../utils/utils";
import { ArticlesParams, ArticlesData } from "../types/index";

import axios from "axios";

// 获取可视区域的高度
const viewHeight = window.innerHeight || document.documentElement.clientHeight;
// 用新的 throttle 包装 scroll 的回调
const lazyload = throttle(() => {
  // 获取所有的图片标签
  const imgs = document.querySelectorAll("#list .item img");
  // num 用于统计当前显示到了哪一张图片，避免每次都从第一张图片开始检查是否露出
  let num = 0;
  for (let i = num; i < imgs.length; i++) {
    // 用可视区域高度减去元素顶部距离可视区域顶部的高度
    let distance = viewHeight - imgs[i].getBoundingClientRect().top;
    let imgItem: any = imgs[i];
    // 如果可视区域高度大于等于元素顶部距离可视区域顶部的高度，说明元素露出
    if (distance >= 100) {
      // 给元素写入真实的 src，展示图片
      let hasLaySrc = imgItem.getAttribute("data-has-lazy-src");
      if (hasLaySrc === "false") {
        imgItem.src = imgItem.getAttribute("data-src");
        imgItem.setAttribute("data-has-lazy-src", "true");
      }
      // 前 i 张图片已经加载完毕，下次从第 i+1 张开始检查是否露出
      num = i + 1;
    }
  }
}, 1000);

export default defineComponent({
  name: "Articles",
  components: {
    LoadEnd,
    LoadingCustom,
  },
  watch: {
    $route: {
      handler(val: any, oldVal: any) {
        this.routeChange(val, oldVal);
      },
      immediate: true,
    },
  },
  setup(props, context) {
    const state = reactive({
      isLoadEnd: false as Boolean,
      isLoading: false as Boolean,
      searchInput: "" as String,
      articlesList: [] as Array<any>,
      filterList: [] as Array<any>, // 用于过滤文章
      total: 0 as Number,
      curUser: "" as String, // 当前用户
      tag_name: decodeURI(getQueryStringByName("tag_name")),
      params: {
        keyword: "",
        likes: "", // 是否是热门文章
        state: 1, // 文章发布状态 => 0 草稿，1 已发布,'' 代表所有文章
        tag_id: getQueryStringByName("tag_id"),
        category_id: getQueryStringByName("category_id"),
        pageNum: 1,
        pageSize: 10,
      } as ArticlesParams,
      href:
        import.meta.env.MODE === "development"
          ? "https://localhost:3001/articleDetail?article_id="
          : "https://blakeyi.cn/articleDetail?article_id=",
      href1:
        import.meta.env.MODE === "development"
          ? "https://localhost:3001/articleCreate"
          : "https://blakeyi.cn/articleCreate",
    });

    const formatTime = (value: string | Date): string => {
      return timestampToTime(value, true);
    };
    // 过滤文章
    const filterArticle = () => {
      console.log(state.searchInput);
      state.filterList = new Array();
      for (let article of state.articlesList) {
        console.log(article.title.search(state.searchInput));

        if (article.title.search(state.searchInput) > -1) {
          state.filterList.push(article);
        }
      }
    };
    const handleSearch = async (): Promise<void> => {
      var data = {
        page_num: 1,
        page_size: 10,
      };
      state.isLoading = true;
      const response: any = await service.get("/api/articleList", data);
      console.log(response)
      state.isLoading = false;
      state.articlesList = response.ret_content.list;
      state.filterList = response.ret_content.list;
      state.total = response.ret_content.count;
      state.params.pageNum++;
      nextTick(() => {
        lazyload();
      });
    };
    const routeChange = (val: any, oldVal: any): void => {
      state.tag_name = decodeURI(getQueryStringByName("tag_name"));
      state.params.tag_id = getQueryStringByName("tag_id");
      state.params.category_id = getQueryStringByName("category_id");
      state.articlesList = [];
      state.filterList = [];
      state.params.pageNum = 1;
      console.log("routeChange");
      //handleSearch();
    };

    onMounted(() => {
      console.log("onMounted");
      handleSearch();
      if (window.sessionStorage.userInfo) {
        let userInfo = JSON.parse(window.sessionStorage.userInfo);
        state.curUser = userInfo.name;
      }
      window.onscroll = () => {
        if (getScrollTop() + getWindowHeight() > getDocumentHeight() - 100) {
          // 如果不是已经没有数据了，都可以继续滚动加载
          if (state.isLoadEnd === false && state.isLoading === false) {
            handleSearch();
            console.log("onMounted1");
          }
        }
      };
      document.addEventListener("scroll", lazyload);
    });

    return {
      state,
      formatTime,
      handleSearch,
      routeChange,
      filterArticle,
    };
  },
});
</script>


<style lang="less" scoped>
.left {
  .articles-list {
    margin: 0;
    padding: 0;
    list-style: none;
    height: 65vh;
    .title {
      color: #333;
      margin: 7px 0 4px;
      display: inherit;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.5;
    }
    .item > div {
      padding-right: 140px;
    }
    .item .wrap-img {
      position: absolute;
      top: 50%;
      margin-top: -50px;
      right: 0;
      width: 125px;
      height: 100px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 1px solid #f0f0f0;
      }
    }
    li {
      line-height: 20px;
      position: relative;
      // width: 100%;
      padding: 15px 0px;
      padding-right: 150px;
      border-bottom: 1px solid #f0f0f0;
      word-wrap: break-word;
      cursor: pointer;
      &:hover {
        .title {
          color: #000;
        }
      }
      .abstract {
        min-height: 30px;
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 24px;
        color: #555;
      }
      .meta {
        padding-right: 0 !important;
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
        a {
          margin-right: 10px;
          color: #b4b4b4;
          &::hover {
            transition: 0.1s ease-in;
            -webkit-transition: 0.1s ease-in;
            -moz-transition: 0.1s ease-in;
            -o-transition: 0.1s ease-in;
            -ms-transition: 0.1s ease-in;
          }
        }
        span {
          margin-right: 10px;
          color: #666;
        }
      }
    }
  }
}
.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
.el-button--primary {
  color: #fff;
  margin-right: 10px;
}
</style>