<script setup>
import HeaderBar from './HeaderBar.vue';

// TEST 控制台输出提示
console.log('user name: ' + localStorage.getItem('userName'));
console.log('token: ' + localStorage.getItem('token'));
</script>

<template>
    <el-container>
        <el-header class="header-content">
            <HeaderBar></HeaderBar>
        </el-header>
        <el-main class="main-content">
            <el-scrollbar>
            <router-view></router-view>
            </el-scrollbar>
        </el-main>
    </el-container>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
}
.header-content {
    position: relative;
    height: 60px;
    width: 100%;
}

.main-content {
    position: absolute;
    left: 0;
    right: 0;
    top: 60px;
    bottom: 0;
    overflow-y: hidden;
    width: 100%;
}
</style>