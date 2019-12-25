<template>
  <div>
    <el-container>
      <el-header class="pageHeader">
        <span class="pageTitle">Chatin Memo</span>
        <span class="welcome">welcome, {{account}}</span>
        <el-button icon="el-icon-switch-button" type="primary" round @click="logout()" :loading="isLoading"></el-button>
      </el-header>
      <el-container>
        <el-aside class="pageAside" :width="isCollapse ? '64px' : '300px'">
          <el-col :span="24" class="pageAsideMenu">
            <Sidebar :collapse="isCollapse" :routes="menu"></Sidebar>
          </el-col>
        </el-aside>
        <el-main class="pageMain">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Sidebar from '@/component/sidebar/sidebar'

export default {
  components: {
    Sidebar
  },
  data: function () {
    return {
      isLoading: false,
      innerWidth: window.innerWidth,
      isCollapse: false, // todo: 折叠后导航会报Maximum call stack size exceeded
      account: this.$store.getters.getAccount,
      menu: (JSON.parse(this.$store.getters.getPermissionList))[0].children
    }
  },
  mounted: function () {
    console.log('menu', this.menu)
    this.menuStyle()
    this.$nextTick(() => {
      window.onresize = () => {
        return (() => {
          this.innerWidth = window.innerWidth
          this.menuStyle()
        })()
      }
    })
  },
  methods: {
    // 根据屏幕宽度，改变菜单
    menuStyle: function () {
      if (this.innerWidth > 768) {
        this.isCollapse = false
      } else {
        this.isCollapse = true
      }
    },
    // 退出登录
    logout: function () {
      this.isLoading = true
      this.$store.dispatch('asynClean')
      this.$router.push({ name: 'Login' })
      this.isLoading = false
    }
  }
}
</script>

<style scoped>

</style>
