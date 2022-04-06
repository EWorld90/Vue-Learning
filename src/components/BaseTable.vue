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
const tableDataLength = ref(0);
const pageSize = ref(12);
const currentPage = ref(1);

// 获取表格信息
const getTableData = () => {
    axios.get('http://127.0.0.1:8080/testData/selectAll')
        .then(function (response) {
            let tableDataTemp = response.data.data;
            formatTableData(tableDataTemp);

            // TEST 控制台输出提示
            console.log('Get table data success');
            console.log(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

// 格式化表格信息
const formatTableData = (tableDataTemp) => {
    for (let i = 0; i < tableDataTemp.length; i++) {
        if (tableDataTemp[i].status === 1) {
            tableDataTemp[i].status = '进行中';
        } else if (tableDataTemp[i].status === 2) {
            tableDataTemp[i].status = '已完成';
        }
    }

    // 格式化表格分页信息
    tableData.value = tableDataTemp;
    tableDataLength.value = tableDataTemp.length;
    currentPage.value = 1;
};

// 格式化表格序号
const formatTableIndex = (index) => {
    return (index + 1) + (currentPage.value - 1) * pageSize.value;
}

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
        });
}

// 添加表格数据的表单交互
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
            // 提交完成后清除表单信息
            insertDataForm.name = '';
            insertDataForm.date = '';

            // TEST 控制台输出提示
            console.log('add ' + response.data.data + ' row');
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            getTableData();
            dialogInsertDataFormVisible.value = false;
        });
}

// 添加表格数据确认
const checkInsertData = () => {
    ElMessageBox.confirm(
        '确认添加？',
        '警告',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            insertData();
            ElMessage({
                type: 'success',
                message: '添加成功',
            });
        })
        .catch(() => {
            // TEST 控制台输出提示
            console.log('Canceled');
        });
}

// 编辑表格数据的表单交互
const dialogEditDataFormVisible = ref(false);

const editDataForm = reactive({
    id: '',
    name: '',
    status: ''
});

let editRow;

// 初始化编辑表格数据的表单
const initEditDataForm = (row) => {
    editRow = row;
    editDataForm.id = editRow.id;
    editDataForm.name = editRow.name;

    if (editRow.status === '进行中') {
        editDataForm.status = 1;
    } else if (editRow.status === '已完成') {
        editDataForm.status = 2;
    }

    dialogEditDataFormVisible.value = true;
}

// 编辑表格数据
const editData = () => {
    // 本地更新表格数据
    editRow.name = editDataForm.name;

    if (editDataForm.status === 1) {
        editRow.status = '进行中';
    } else if (editDataForm.status === 2) {
        editRow.status = '已完成';
    }

    axios.post('http://127.0.0.1:8080/testData/updateNameAndStatus', {
        id: editDataForm.id,
        name: editDataForm.name,
        status: editDataForm.status
    })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log('edit ' + response.data.data + ' row');
        })
        .catch(function (error) {
            console.log(error);
        })
        .then(function () {
            dialogEditDataFormVisible.value = false;
        });
}

// 编辑表格数据确认
const checkEditData = () => {
    ElMessageBox.confirm(
        '确认编辑？',
        '警告',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            editData();
            ElMessage({
                type: 'success',
                message: '编辑成功',
            });
        })
        .catch(() => {
            // TEST 控制台输出提示
            console.log('Canceled');
        });
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
        
        <el-table
            class="table-content"
            :data="tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
            border
            stripe
            height="537"
        >
            <el-table-column label="序号" type="index" :index="formatTableIndex" width="60" align="center"></el-table-column>
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
                    <el-button type="primary" size="small" @click="initEditDataForm(scope.row)">编辑</el-button>
                    <el-button
                        type="danger"
                        size="small"
                        @click="checkDeleteTableRow(scope.$index, scope.row.id)"
                    >删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            layout="prev, pager, next"
            hide-on-single-page
            :page-size="pageSize"
            v-model:current-page="currentPage"
            :total="tableDataLength"
        />
        
    </div>

    <el-dialog v-model="dialogInsertDataFormVisible" title="添加数据" width="25%">
        <el-form class="dialog-insert-data-form" :model="insertDataForm">
            <el-form-item label="名称">
                <el-input v-model="insertDataForm.name" />
            </el-form-item>
            <el-form-item label="日期">
                <el-date-picker
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
                <el-button type="primary" @click="checkInsertData">确认</el-button>
            </span>
        </template>
    </el-dialog>

    <el-dialog v-model="dialogEditDataFormVisible" title="编辑数据" width="25%">
        <el-form class="dialog-edit-data-form" :model="editDataForm">
            <el-form-item label="名称">
                <el-input v-model="editDataForm.name" />
            </el-form-item>
            <el-form-item label="状态">
                <el-radio-group v-model="editDataForm.status">
                    <el-radio :label="1">进行中</el-radio>
                    <el-radio :label="2">已完成</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-edit-data-footer">
                <el-button @click="dialogEditDataFormVisible = false">取消</el-button>
                <el-button type="primary" @click="checkEditData">确认</el-button>
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
</style>