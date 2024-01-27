<template>
  <!-- 当前 subRoute 有子节点 -->
  <el-submenu v-if="subRoute.children !== undefined && subRoute.children.length > 0" :index="subRoute.path">
    <template slot="title">
      <i class="el-icon-s-promotion"></i>
      <span slot="title">{{subRoute.name}}</span>
    </template>
    <!-- 递归调用自身，直到 subRoute 无子节点 -->
    <SidebarItem v-for="submenu in subRoute.children" :subRoute="submenu" :key="submenu.id"></SidebarItem>
  </el-submenu>
  <!-- 当前 subRoute 无子节点 -->
  <el-menu-item v-else :index="subRoute.callPath">
    <i class="el-icon-s-promotion"></i>
    <span slot="title">{{subRoute.name}}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: 'SidebarItem',
  props: {
    subRoute: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>
