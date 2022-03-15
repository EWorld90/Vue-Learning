<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

// 菜单高亮与路由跳转的界面绑定
const route = useRoute();
const activeIndex = ref(route.path);

const handleSelect = (key, keyPath) => {
    console.log(key, keyPath);
}
</script>

<template>
    <el-menu
        :default-active="activeIndex"
        class="top-bar-main-menu"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
        @select="handleSelect"
    >
        <span class="top-bar-label">测试管理系统</span>
        <el-menu-item index="/basetable">Table</el-menu-item>
        <el-menu-item index="/login">Login</el-menu-item>
        <el-menu-item index="/baseusercenter">User Center</el-menu-item>
    </el-menu>
</template>

<style scoped>
.top-bar {
    background-color: #545c64;
}

.top-bar-label {
    text-align: center;
    line-height: 58px;
    width: 160px;
    color: lightseagreen;
}
</style>