<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

import {
    Refresh,
    Plus
} from '@element-plus/icons-vue'

const tableData = ref([]);

// 获取表格信息
const getTableData = () => {
    axios.get('http://127.0.0.1:8080/testData/selectAll')
        .then(function (response) {
            let tableDataTemp = response.data;
            formatTableData(tableDataTemp);

            // TEST 控制台输出提示
            console.log('Get table data success');
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

// 格式化表格信息
const formatTableData = (tableDataTemp) => {
    for(let i = 0; i < tableDataTemp.length; i++) {
        // TODO 获取数据库中状态 id 与状态名称的关系
        if(tableDataTemp[i].status === 1) {
            tableDataTemp[i].status = '已完成';
        } else if(tableDataTemp[i].status === 2) {
            tableDataTemp[i].status = '进行中';
        }
    }

    tableData.value = tableDataTemp;
};

// 删除表格指定行
const deleteTableRow = (rowIndex, rowId) => {
    tableData.value.splice(rowIndex, 1);
    axios.get('http://127.0.0.1:8080/testData/deleteById', {
        params: {
            id: rowId
        }
    })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log('Deleted: ' + rowId);
        })
        .catch(function (error) {
            console.log(error);
        });
};

// 删除表格指定行确认
const checkDeleteTableRow = (rowIndex, rowId) => {
    ElMessageBox.confirm(
        '确认删除？',
        '警告',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            deleteTableRow(rowIndex, rowId)
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
        })
        .catch(() => {
            // TEST 控制台输出提示
            console.log('Canceled');
        })
}

// 初始化
getTableData();
</script>

<template>
    <div class="table-functions">
        <el-button type="primary" :icon="Plus" circle></el-button>
        <el-button type="success" :icon="Refresh" circle @click="getTableData"></el-button>
    </div>
    <div class="table-container">
        <el-table class="table-content" :data="tableData" border stripe>
            <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
            <el-table-column label="编号" prop="id"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="状态" prop="status" align="center">
                <template #default="scope">
                    <el-tag
                        :type="scope.row.status === '已完成' ? 'success' : scope.row.status === 3 ? 'danger' : ''
                        "
                    >{{ scope.row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" prop align="center">
                <template #default="scope">
                    <el-button
                        type="primary"
                        size="small"
                        @click=""
                    >编辑</el-button>
                    <el-button
                        type="danger"
                        size="small"
                        @click="checkDeleteTableRow(scope.$index, scope.row.id)"
                    >删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
    <!-- <div class="table-pagination">
        <el-button>分页预留</el-button>
    </div>-->
</template>

<style scoped>
.table-functions {
    width: 80%;
    margin: 10px auto;
    text-align: right;
}
.table-container {
    width: 80%;
    margin: 10px auto;
}
</style>