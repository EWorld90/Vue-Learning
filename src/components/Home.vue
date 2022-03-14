<script setup>
import HeaderBar from './HeaderBar.vue';
import BaseTable from './BaseTable.vue';
</script>

<template>
    <el-container>
        <el-header>
            <HeaderBar></HeaderBar>
        </el-header>
        <el-main>
            <BaseTable></BaseTable>
        </el-main>
    </el-container>
</template>

<style scoped>
* {
    padding: 0;
}

</style>