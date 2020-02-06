// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import store from './store'
import ElementUI, {Message} from 'element-ui'

import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import 'babel-polyfill'
import axios from 'axios'
import VueAxios from 'vue-axios'
import ECharts from 'vue-echarts'

import htmlToPdf from '@/component/utils/htmlToPdf/htmlToPdf'

Vue.prototype.axios = axios
Vue.use(VueAxios, axios)
Vue.use(ElementUI)

Vue.use(htmlToPdf)

// 设置语言
locale.use(lang)

Vue.component('v-chart', ECharts)
Vue.config.productionTip = false

// 递归遍历树
function translateTreeMain (arr) {
  for (let i = arr.length - 1; i > -1; i--) {
    if (arr[i].id === 141) {
      arr[i].path = '/questions'
      arr[i].componentPath = 'pages/index/Memo Design/questions/questions'
      arr[i].redirect = '/titles'
    }
    // 过滤掉DataItemAdmin，WebPage，WebService，Menu
    if (arr[i].id === 0) {
      arr.splice(i, 1)
      continue
    }
    if (arr[i].redirect === '') {
      delete arr[i].redirect
    }
    arr[i].component = resolve => require(['@/' + arr[i].componentPath + ''], resolve)
    if (arr[i].children !== undefined && arr[i].children !== null && arr[i].children.length > 0) {
      translateTreeMain(arr[i].children)
    } else {
      delete arr[i].children
    }
  }
  return arr
}

// 路由拦截
let registerRouteFresh = true
router.beforeEach((to, from, next) => {
  store.commit('clearToken') // 取消请求
  if (to.path !== '/login') { // 本身目的地址非login页
    if (store.getters.getAccount !== '' && store.getters.getAccount !== null) { // token非空
      if (registerRouteFresh) { // 防止死循环
        console.log('刷新后跳转')
        registerRouteFresh = false
        router.addRoutes(translateTreeMain(JSON.parse(store.getters.getPermissionList)))
        next({ ...to, replace: true }) //  hack方法，确保addRoutes已完成
      } else {
        console.log('普通跳转')
        next()
      }
    } else { // token为空
      console.log('token为空跳转到login页')
      next({ path: '/login' })
    }
  } else { // 本身目的地址为login页
    console.log('本身目的地址为login页')
    next()
  }
})

// 请求拦截
axios.interceptors.request.use(config => {
  if (store.getters.getAccount !== '' && store.getters.getAccount !== null) { // 如果token非空，请求时带上token
    config.headers.Authorization = JSON.parse(store.getters.getAccount).Token
  }
  config.cancelToken = new axios.CancelToken(function (cancel) {
    store.commit('pushToken', {cancelToken: cancel})
  })
  return config
})

// 响应截器
axios.interceptors.response.use((response) => {
  let finalRes = JSON.parse(response.data.d)
  if (finalRes.code === 0) {
    return finalRes
  } else if (finalRes.code === 2) {
    Message({
      message: finalRes.message,
      type: 'error'
    })
    store.dispatch('asynClean')
    router.push({ path: '/login' })
    return false
  } else {
    Message({
      message: finalRes.message,
      type: 'error'
    })
    return false
  }
}, function (error) {
  if (axios.isCancel(error)) { // 为了终结promise链 就是实际请求不会走到.catch(rej=>{});这样就不会触发错误提示之类了
    return new Promise(() => {})
  } else if (error.response.status === 400) {
    Message({
      message: 'Bad Request',
      type: 'error'
    })
  } else if (error.response.status === 403) {
    Message({
      message: 'Forbidden',
      type: 'error'
    })
  } else if (error.response.status === 404) {
    Message({
      message: 'Not Found',
      type: 'error'
    })
  } else if (error.response.status === 503) {
    Message({
      message: 'Service Unavailable',
      type: 'error'
    })
  } else if (error.response.status === 504) {
    Message({
      message: 'Gateway Timeout',
      type: 'error'
    })
  } else {
    Message({
      message: 'Internal Server Error',
      type: 'error'
    })
  }
  return Promise.reject(error)
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
