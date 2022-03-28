<script setup>
import { ref, reactive, toRaw } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import axios from 'axios'

import {
    Refresh,
    Plus
} from '@element-plus/icons-vue'

// 表格信息
const tableData = ref([]);
const tableDataLength = ref(0)

// 分页信息
const pageSize = ref(15)
const currentPage = ref(1)

// 分页处理
const sliceTableData = () => {
    return toRaw(tableData.value).slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
}

// 获取全部表格信息
const getTableData = () => {
    axios.get('http://127.0.0.1:8080/taskData/listAll')
        .then(function (response) {
            // TEST 控制台输出提示
            console.log('Get table data ok!')
            console.log(response.data)

            formatTableData(response.data)
        })
        .catch(function (error) {
            console.log(error)
        })
}

// 格式化表格信息
const formatTableData = (data) => {
    // 向表格填入信息
    tableData.value = data

    // TODO 获取负责人和状态的详细信息

    //处理分页
    currentPage.value = 1
    tableDataLength.value = data.length
}

// 格式化表格序号
const formatTableIndex = (index) => {
    return (index + 1) + (currentPage.value - 1) * pageSize.value;
}

// 详情对话框信息
const detailDialog = reactive({
    isVisible: false,
    title: '',
    tableData: [],
    memberData: []
})

// 详情对话框初始化
const openDetailDialog = (row) => {
    getTaskDetail(row.id)
    getTaskMember(row.id)

    // TODO 获取课题成员和开支类别的详细信息

    detailDialog.isVisible = true
}

// 获取指定课题详情信息
const getTaskDetail = (taskId) => {
    axios.get('http://127.0.0.1:8080/taskDetail/listByTaskId?taskId=' + taskId)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log('Get table detail ok!')
            console.log(response.data)

            detailDialog.tableData = response.data
        })
        .catch(function (error) {
            console.log(error)
        })
}

// 获取指定课题成员信息
const getTaskMember = (taskId) => {
    axios.get('http://127.0.0.1:8080/taskMember/listByTaskId?taskId=' + taskId)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log('Get table member ok!')
            console.log(response.data)

            detailDialog.memberData = response.data
        })
        .catch(function (error) {
            console.log(error)
        })
}

// 页面初始化
getTableData()
</script>

<template>
    <!-- 表格组件 -->
    <div class="table-functions">
        <el-button type="primary" :icon="Plus" circle></el-button>
        <el-button type="success" :icon="Refresh" circle @click="getTableData"></el-button>
    </div>

    <!-- 表格主体 -->
    <div class="table-container">
        <el-table border stripe size="small" height="529" :data="sliceTableData()">
            <el-table-column label="序号" type="index" :index="formatTableIndex" width="60" align="center"></el-table-column>
            <el-table-column label="课题编号" prop="taskIndex"></el-table-column>
            <el-table-column label="课题名" prop="taskName"></el-table-column>
            <el-table-column label="起始日期" prop="taskStartDate"></el-table-column>
            <el-table-column label="截止日期" prop="taskEndDate"></el-table-column>
            <el-table-column label="负责人" prop="taskLeaderUserId"></el-table-column>
            <el-table-column label="预算" prop="taskBudget"></el-table-column>
            <el-table-column label="结余" prop="taskBalance"></el-table-column>
            <el-table-column label="状态" prop="taskStatusId"></el-table-column>
            <el-table-column label="操作" prop align="center" width="200">
                <template #default="scope">
                    <el-button type="success" size="small" @click="openDetailDialog(scope.row)">详情</el-button>
                    <el-button type="primary" size="small">编辑</el-button>
                    <el-button type="danger" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            background
            layout="prev, pager, next"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            :total="tableDataLength"
        />
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialog.isVisible">
        <template #title>{{ detailDialog.title }} 详情栏</template>
        <el-card class="detail-dialog-card" shadow="never">
            <template #header>课题成员</template>
            <span v-for="data in detailDialog.memberData">{{ data.userId + ' ' }}</span>
        </el-card>
        <el-table border stripe size="small" :data="detailDialog.tableData">
            <el-table-column label="开支类别" prop="expenseTypeId"></el-table-column>
            <el-table-column label="类别预算" prop="expenseTypeBudget"></el-table-column>
            <el-table-column label="类别结余" prop="expenseTypeBalance"></el-table-column>、
        </el-table>
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
.detail-dialog-card {
    text-align: left;
    margin-bottom: 10px;
}
</style>