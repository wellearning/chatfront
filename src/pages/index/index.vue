<template>
  <div>
    <el-container>
      <el-header class="pageHeader">
        <span class="pageTitle">Chatin Memo</span>
        <span class="welcome">welcome, {{account}}</span>
        <el-button icon="el-icon-switch-button" type="primary" round @click="logout()" :loading="isLoading"></el-button>
      </el-header>
      <el-container>
        <el-aside class="pageAside">
          <el-col :span="24" class="pageAsideMenu">
            <el-menu :default-active="$route.path" :unique-opened="true" :router="true">
              <SidebarItem v-for="item in menu" :subRoute="item" :key="item.id">
              </SidebarItem>
            </el-menu>
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
import SidebarItem from '@/component/sidebar/sidebarItem'

export default {
  components: {
    SidebarItem
  },
  data: function () {
    return {
      isLoading: false,
      account: this.$store.getters.getAccount,
      menu: (JSON.parse(this.$store.getters.getPermissionList))[0].children
    }
  },
  methods: {
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
