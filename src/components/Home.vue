<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import HeaderBar from './HeaderBar.vue';

// TEST 输出路由跳转路径
const route = useRoute();
console.log(route.path);

</script>

<template>
    <el-container>
        <el-header>
            <HeaderBar></HeaderBar>
        </el-header>
        <el-main>
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<style scoped>
* {
    padding: 0;
}

</style>