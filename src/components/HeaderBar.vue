<script setup>
import { ref } from 'vue'

const defaultActiveIndex = ref('1')

const handleSelect = (key, keyPath) => {
    console.log(key, keyPath)
}
</script>

<template>
    <el-row class="top-bar">
        <el-col :span="3" class="top-bar-label">测试管理系统</el-col>
        <el-col :span="21">
            <el-menu
                :default-active=defaultActiveIndex
                class="top-bar-main-menu"
                mode="horizontal"
                background-color="#545c64"
                text-color="#fff"
                active-text-color="#ffd04b"
                default-active="1"
                @select="handleSelect"
            >
                <el-menu-item index="1">Data</el-menu-item>
                <el-menu-item index="2">Workspace</el-menu-item>
                <el-menu-item index="3">Info</el-menu-item>
                <el-menu-item index="4">User Center</el-menu-item>
            </el-menu>
        </el-col>
    </el-row>
</template>

<style scoped>
.top-bar {
    background-color: #545c64;
}

.top-bar-label{
    margin: auto;
    color: lightseagreen;
}
</style>