import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 要设置的全局访问的state对象
const state = {
  account: '',
  permissionList: '',
  cancelTokenArr: [],
  MemoID: ''
}

const getters = { // 实时监听state值的变化(最新状态)
  getAccount (state) {
    if (state.account === '') {
      state.account = localStorage.getItem('account')
    }
    return state.account
  },
  getPermissionList (state) {
    if (state.permissionList === '') {
      state.permissionList = localStorage.getItem('permissionList')
    }
    return state.permissionList
  }
}

const mutations = {
  setAccount (state, account) {
    state.account = account
    localStorage.setItem('account', account)
  },
  setPermissionList (state, account) {
    state.permissionList = account
    localStorage.setItem('permissionList', account)
  },
  pushToken (state, payload) {
    state.cancelTokenArr.push(payload.cancelToken)
  },
  clearToken (state) {
    state.cancelTokenArr.forEach(item => {
      item('路由跳转取消请求')
    })
    state.cancelTokenArr = []
  }
}

const actions = {
  asynSetAccount (context, account) {
    context.commit('setAccount', account)
  },
  asynSetPermissionList (context, account) {
    context.commit('setPermissionList', account)
  },
  asynClean (context) {
    context.commit('setAccount', '')
    localStorage.setItem('account', '')
    context.commit('setPermissionList', '')
    localStorage.setItem('permissionList', '')
  }
}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
