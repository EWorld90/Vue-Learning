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

    //处理分页
    currentPage.value = 1
    tableDataLength.value = data.length
}

// 详情对话框信息
const detailDialog = reactive({
    isVisible: false,
    title: '',
})

// 页面初始化
getTableData()
</script>

<template>
    <!-- 表格组件 -->
    <div class="table-functions">
        <el-button type="primary" :icon="Plus" circle></el-button>
        <el-button type="success" :icon="Refresh" circle></el-button>
    </div>

    <!-- 表格主体 -->
    <div class="table-container">
        <el-table border stripe size="small" height="529" :data="sliceTableData()">
            <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
            <el-table-column label="课题号" prop="taskIndex"></el-table-column>
            <el-table-column label="课题名" prop="taskName"></el-table-column>
            <el-table-column label="起始日期" prop="taskStartDate"></el-table-column>
            <el-table-column label="截止日期" prop="taskEndDate"></el-table-column>
            <el-table-column label="负责人" prop="taskLeaderUserId"></el-table-column>
            <el-table-column label="预算" prop="taskBudget"></el-table-column>
            <el-table-column label="结余" prop="taskBalance"></el-table-column>
            <el-table-column label="状态" prop="taskStatusId"></el-table-column>
            <el-table-column label="操作" prop align="center" width="200">
                <template #default="scope">
                    <el-button type="success" size="small" @click="detailDialog.isVisible = true">详情</el-button>
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
        <el-table border stripe>
            <el-table-column label="课题号">123</el-table-column>
            <el-table-column label="课题名">测试123</el-table-column>
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
</style>