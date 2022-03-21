<script setup>
import { ref } from 'vue';

import avatar from '../assets/ffxiv.jpg';

const avatarUrl = ref(avatar);

const avatarSize = ref(60);

const username = ref(localStorage.getItem('username'));
</script>

<template>
    <el-card class="user-card">
        <div class="user-avatar">
            <el-avatar :size="avatarSize" :src="avatarUrl" alt="User"></el-avatar>
        </div>
        <div class="user-info">{{ username }}</div>
    </el-card>
</template>

<style scoped>
.user-card {
    width: 30%;
    margin: auto;
    margin-top: 50px;
}

.user-avatar {
    border-bottom: 1px solid lightgray;
}

.user-info {
    font-size: 28px;
}
</style>