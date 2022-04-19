<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

// 菜单高亮与路由跳转的界面绑定
const route = useRoute();
const activeIndex = ref(route.path);

const userName = ref(localStorage.getItem('userName'))

const handleSelect = (index, indexPath) => {
    // 前往 login 页面时删除用户登录状态
    if (index === '/login') {
        localStorage.removeItem('userName');
        localStorage.removeItem('token');
    }
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
        <span class="top-bar-label">课题数据管理系统</span>
        <el-menu-item index="/basetable">测试表格</el-menu-item>
        <el-menu-item index="/tasktable">课题列表</el-menu-item>
        <el-menu-item index="/expensetable">支出明细</el-menu-item>
        <el-menu-item index="/usertable">用户列表</el-menu-item>
        <el-menu-item index="/baseusercenter">用户中心</el-menu-item>
        <el-sub-menu index>
            <template #title>{{ userName }}</template>
            <el-menu-item index="/login">退出登录</el-menu-item>
        </el-sub-menu>
    </el-menu>
</template>

<style scoped>
.top-bar {
    background-color: #545c64;
}

.top-bar-label {
    text-align: center;
    line-height: 58px;
    width: 180px;
    color: lightseagreen;
}
</style>