<script setup>
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

import {
    Refresh,
    Plus
} from '@element-plus/icons-vue'

// 表格信息
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
    for (let i = 0; i < tableDataTemp.length; i++) {
        // TODO 获取数据库中状态 id 与状态名称的关系
        if (tableDataTemp[i].status === 2) {
            tableDataTemp[i].status = '已完成';
        } else if (tableDataTemp[i].status === 1) {
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

// 添加表格数据的表单
const dialogInsertDataFormVisible = ref(false);

const insertDataForm = reactive({
    name: '',
    date: ''
});

// 添加表格数据
const insertData = () => {
    axios.post('http://127.0.0.1:8080/testData/insert', {
        name: insertDataForm.name,
        date: insertDataForm.date,
        status: 1
    })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log('add ' + response.data + ' row');
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            // TODO 刷新表格时会重复访问数据库，注意性能问题
            getTableData();
        });
}

// TODO 添加表格数据确认
const checkInsertData = () => {

}

// 页面初始化操作
getTableData();
</script>

<template>
    <div class="table-functions">
        <el-button type="primary" :icon="Plus" circle @click="dialogInsertDataFormVisible = true"></el-button>
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
                    <el-button type="primary" size="small">编辑</el-button>
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

    <el-dialog v-model="dialogInsertDataFormVisible" title="添加数据" width="25%">
        <el-form class="dialog-insert-data-form" :model="insertDataForm">
            <el-form-item label="名称">
                <el-input v-model="insertDataForm.name" />
            </el-form-item>
            <el-form-item label="日期">
                <el-date-picker
                    class="test"
                    v-model="insertDataForm.date"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width: 100%"
                ></el-date-picker>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-insert-data-footer">
                <el-button @click="dialogInsertDataFormVisible = false">取消</el-button>
                <el-button type="primary" @click="insertData">确认</el-button>
            </span>
        </template>
    </el-dialog>
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

.test {
    width: 300px;
}
</style>