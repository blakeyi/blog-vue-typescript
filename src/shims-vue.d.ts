
// import Vue from "vue";
// import VueRouter, { Route } from "vue-router";

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const componentOptions: ComponentOptions
  export default componentOptions
}

