<script setup>
import HeaderBar from './HeaderBar.vue';

// TEST 控制台输出提示
console.log(localStorage.getItem('username'));
</script>

<template>
    <el-container>
        <el-header>
            <HeaderBar></HeaderBar>
        </el-header>
        <el-main class="main-content">
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

.main-content {
    width: 100%;
}
</style>