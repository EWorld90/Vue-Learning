<script setup>
import { ref } from 'vue'
import axios from 'axios'

const tableData = ref([]);

// TODO 封装函数
let tableDataTemp = 1;
axios.get('http://127.0.0.1:8080/testData/selectAll')
    .then(function (response) {
        // TEST 输出 response
        console.log(response);

        tableDataTemp = response.data;
        
        // TEST 输出 tableDataTemp
        console.log(tableDataTemp);

        formatTableData(tableDataTemp);
    }).catch(function (error) {
        console.log(error);
    });

const formatTableData = (tableDataTemp) => {
    // TODO 前端格式化 tableData
    tableData.value = tableDataTemp;
};
</script>

<template>
    <div class="table-container">
        <el-table class="table-content" :data="tableData" border stripe>
            <el-table-column label="序号" prop width="60" align="center"></el-table-column>
            <el-table-column label="编号" prop="id"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="状态" prop="status" align="center"></el-table-column>
            <el-table-column label="操作" prop align="center"></el-table-column>
        </el-table>
    </div>
</template>

<style scoped>
.table-container {
    width: 80%;
    margin: auto;
}
</style>