<script setup>
const tableData = [
    {
        id: '1',
        name: 'test1',
        date: '2022-2-2'
    },
    {
        id: '2',
        name: 'test2',
        date: '2022-2-3'
    },
    {
        id: '3',
        name: 'test3',
        date: '2022-2-4'
    }
]
</script>

<template>
    <div class="container">
        <el-table class="table" :data="tableData" border>
            <el-table-column label="编号" prop="id"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="时间" prop="date"></el-table-column>
        </el-table>
    </div>
</template>

<style scoped>
.container {
    padding: 20px;
}
</style>