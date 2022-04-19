<script setup>
import { ref, reactive, toRaw } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";

import axiosRequest from "../utils/axiosUtils.js";

import { Refresh, Plus } from "@element-plus/icons-vue";

// 表格信息
const tableData = ref([]);
const tableDataLength = ref(0);

// 分页信息
const pageSize = ref(15);
const currentPage = ref(1);

// 分页处理
const sliceTableData = () => {
    return tableData.value.slice(
        (currentPage.value - 1) * pageSize.value,
        currentPage.value * pageSize.value
    );
};

// 获取全部表格信息
const getTableData = () => {
    axiosRequest
        .get("/user/listAll?token=" + localStorage.getItem("token"))
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get user data ok!");
            console.log(response.data.data);

            formatTableData(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });
};

// 格式化表格信息
const formatTableData = (data) => {
    // 向表格填入信息
    tableData.value = data;

    //处理分页
    currentPage.value = 1;
    tableDataLength.value = data.length;
};

// 格式化表格序号
const formatTableIndex = (index) => {
    return index + 1 + (currentPage.value - 1) * pageSize.value;
};

// 页面初始化
getTableData();
</script>

<template>
    <!-- 表格组件 -->
    <div class="table-functions">
        <el-button type="primary" :icon="Plus" circle></el-button>
        <el-button
            type="success"
            :icon="Refresh"
            circle
            @click="getTableData"
        ></el-button>
    </div>

    <!-- 表格主体 -->
    <div class="table-container">
        <el-table
            border
            stripe
            size="small"
            height="529"
            :data="sliceTableData()"
        >
            <el-table-column
                label="序号"
                type="index"
                :index="formatTableIndex"
                width="60"
                align="center"
            >
            </el-table-column>
            <el-table-column
                label="用户名"
                prop="name"
                align="center"
            ></el-table-column>
            <el-table-column
                label="用户角色"
                prop="role"
                align="center"
            ></el-table-column>
            <el-table-column
                label="用户权限"
                prop="permission"
                align="center"
            ></el-table-column>
            <el-table-column label="操作" align="center" width="135">
                <template #default="scope">
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
