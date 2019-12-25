<template>
  <el-menu :default-active="$route.path" :collapse="collapse" :unique-opened="true" :router="true">
    <SidebarItem v-for="item in routes" :subRoute="item" :key="item.id"></SidebarItem>
  </el-menu>
</template>

<script>
import SidebarItem from '@/component/sidebar/sidebarItem'

export default {
  name: 'Sidebar',
  components: {
    SidebarItem
  },
  props: {
    collapse: {
      type: Boolean
    },
    routes: {
      type: Array
    }
  }
}
</script>

<style scoped>

</style>
