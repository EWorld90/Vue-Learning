<script lang="ts" setup>
import { ref, reactive, toRaw } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";
import Decimal from "decimal.js";

import { Refresh, Plus } from "@element-plus/icons-vue";

import axiosRequest from "../utils/axiosUtils.js";
import { validateCheckAmount } from "../utils/checkUtils.js";

// 表格信息
const tableData = ref([]);
const tableDataLength = ref(0);

// 各项 id 与 name 的对应 Map
let expenseTypeMap = new Map();

// 各项 id 与 name 的对应 Array
const expenseTypeArray = ref([]);

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
const getTableData = async () => {
    let data = null;

    await axiosRequest
        .get("/expenseData/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get expense data ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    await formatTableData(data);
};

// 格式化表格信息
const formatTableData = async (data) => {
    // 获取开支类别信息
    await getExpenseTypeName();
    for (let d of data) {
        d.expenseTypeId = expenseTypeMap.get(d.expenseTypeId);
    }

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

// 添加对话框信息
const addDialog = reactive({
    isVisible: false,
});

// 添加表单信息
const addForm = reactive({
    taskIndex: "",
    expenseTypeId: "",
    expenseDate: "",
    expenseAmount: "",
    expenseNote: "",
});
const addFormRef = ref<FormInstance>();

// 添加表单验证规则
const addFormRules = reactive({
    taskIndex: [
        {
            required: true,
            message: "请输入课题编号",
            trigger: "blur",
        },
    ],
    expenseTypeId: [
        {
            required: true,
            message: "请选择开支类别",
            trigger: "change",
        },
    ],
    expenseDate: [
        {
            required: true,
            message: "请选择日期",
            trigger: "change",
        },
    ],
    expenseAmount: [
        {
            validator: validateCheckAmount,
            required: true,
            trigger: "blur",
        },
    ],
});

// 初始化添加对话框
const openAddDialog = () => {
    addDialog.isVisible = true;
};

// 重置添加对话框
const resetAddDialog = (formRef: FormInstance | undefined) => {
    if (!formRef) return;
    formRef.resetFields();
};

// 确认提交添加表单的操作
const checkSubmitAddForm = async (formRef: FormInstance | undefined) => {
    if (!formRef) return;

    // 表单验证功能
    await formRef.validate((valid, fields) => {
        if (valid) {
            ElMessageBox.confirm("确认添加？", "警告", {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    let status = await submitAddForm();

                    if (status.isSuccess === true) {
                        ElMessage({
                            type: "success",
                            message: "添加成功",
                        });
                        addDialog.isVisible = false;
                    } else {
                        ElMessage({
                            type: "error",
                            message: status.response.data.data,
                            duration: 5000,
                        });
                    }
                })
                .catch(() => {
                    // ElMessage({
                    //     type: 'info',
                    //     message: '已取消',
                    //     duration: 1000,
                    // })
                });
        } else {
            // TEST 控制台输出提示
            console.log("error submit:", fields);
        }
    });
};

// 提交添加表单
const submitAddForm = async () => {
    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .post("/expenseData/add", {
            taskIndex: addForm.taskIndex,
            expenseTypeId: addForm.expenseTypeId,
            expenseDate: addForm.expenseDate,
            expenseAmount: new Decimal(addForm.expenseAmount).toNumber(),
            expenseNote: addForm.expenseNote,
        })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Post expense data ok!");
            console.log(response.data.data);

            status.isSuccess = true;
            status.response = response;
        })
        .catch(function (error) {
            console.log(error);
            status.response = error.response;
        });

    return status;
};

// 编辑对话框信息
const editDialog = reactive({
    isVisible: false,
    editRow: null,
});

// 编辑表单信息
const editForm = reactive({
    id: "",
    taskIndex: "",
    expenseTypeId: "",
    expenseDate: "",
    expenseAmount: "",
    expenseNote: "",
});
const editFormRef = ref<FormInstance>();

// 编辑表单验证规则
const editFormRules = reactive({
    taskIndex: [
        {
            required: true,
            message: "请输入课题编号",
            trigger: "blur",
        },
    ],
    expenseTypeId: [
        {
            required: true,
            message: "请选择开支类别",
            trigger: "change",
        },
    ],
    expenseDate: [
        {
            required: true,
            message: "请选择日期",
            trigger: "change",
        },
    ],
    expenseAmount: [
        {
            validator: validateCheckAmount,
            required: true,
            trigger: "blur",
        },
    ],
});

// 初始化编辑对话框
const openEditDialog = (row) => {
    editDialog.editRow = row;

    editForm.id = row.id;
    editForm.taskIndex = row.taskIndex;
    editForm.expenseTypeId = row.expenseTypeId;
    editForm.expenseDate = row.expenseDate;
    editForm.expenseAmount = row.expenseAmount;
    editForm.expenseNote = row.expenseNote;

    editDialog.isVisible = true;
};

// 重置编辑对话框
const resetEditDialog = (formRef: FormInstance | undefined) => {
    if (!formRef) return;
    formRef.resetFields();
};

// 确认提交编辑表单的操作
const checkSubmitEditForm = async (formRef: FormInstance | undefined) => {
    if (!formRef) return;

    // 表单验证功能
    await formRef.validate((valid, fields) => {
        if (valid) {
            ElMessageBox.confirm("确认编辑？", "警告", {
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(async () => {
                    let status = await submitEditForm();

                    if (status.isSuccess === true) {
                        ElMessage({
                            type: "success",
                            message: "编辑成功",
                        });

                        // 编辑成功后刷新一次表格
                        getTableData();

                        editDialog.isVisible = false;
                    } else {
                        ElMessage({
                            type: "error",
                            message: status.response.data.data,
                            duration: 5000,
                        });

                        formRef.resetFields();
                    }
                })
                .catch(() => {
                    // ElMessage({
                    //     type: 'info',
                    //     message: '已取消',
                    //     duration: 1000,
                    // })
                });
        } else {
            // TEST 控制台输出提示
            console.log("error submit:", fields);
        }
    });
};

// 提交编辑表单
const submitEditForm = async () => {
    // 如果未修改开支类别，需要转换表单中的开支类别表单项格式
    if (!Number.isNaN(editForm.expenseTypeId)) {
        for (const expenseType of expenseTypeArray.value) {
            if (editForm.expenseTypeId === expenseType.expenseName) {
                editForm.expenseTypeId = expenseType.id;
                break;
            }
        }
    }

    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .post("/expenseData/updateById", {
            id: editForm.id,
            taskIndex: editForm.taskIndex,
            expenseTypeId: editForm.expenseTypeId,
            expenseDate: editForm.expenseDate,
            expenseAmount: new Decimal(editForm.expenseAmount).toNumber(),
            expenseNote: editForm.expenseNote,
        })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("edit expense data ok!");
            console.log(response.data.data);

            status.isSuccess = true;
            status.response = response;
        })
        .catch(function (error) {
            console.log(error);
            status.response = error.response;
        });

    return status;
};

// 确认提交删除用户信息请求
const checkDeleteTableRow = (index, row) => {
    ElMessageBox.confirm("确认删除？", "警告", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let status = await DeleteTableRow(row.id);
            if (status.isSuccess === true) {
                ElMessage({
                    type: "success",
                    message: "删除成功",
                });
                tableData.value.splice(
                    index + (currentPage.value - 1) * pageSize.value,
                    1
                );
            } else {
                ElMessage({
                    type: "error",
                    message: status.response.data.data,
                    duration: 5000,
                });
            }
        })
        .catch(() => {});
};

// 提交删除用户信息请求
const DeleteTableRow = async (id) => {
    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .get("/expenseData/remove?id=" + id)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("remove expense data test ok");
            console.log(response.data.data);

            status.isSuccess = true;
            status.response = response;
        })
        .catch(function (error) {
            console.log(error);
            status.response = error.response;
        });

    return status;
};

// 获取开支类别 id 对应的开支类别 name，并本地保存
const getExpenseTypeName = async () => {
    let data = null;

    await axiosRequest
        .get("/expenseType/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get expense type ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    expenseTypeArray.value = [];
    for (const d of data) {
        expenseTypeMap.set(d.id, d.expenseName);

        // 将数据一同存入 Array 中
        const id = d.id;
        const expenseName = d.expenseName;
        expenseTypeArray.value.push({ id, expenseName });
    }
};

// 页面初始化
getTableData();
</script>

<template>
    <!-- 表格组件 -->
    <div class="table-functions">
        <el-button
            type="primary"
            :icon="Plus"
            circle
            @click="openAddDialog"
        ></el-button>
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
            ></el-table-column>
            <el-table-column
                label="课题编号"
                prop="taskIndex"
            ></el-table-column>
            <el-table-column
                label="开支类别"
                prop="expenseTypeId"
            ></el-table-column>
            <el-table-column
                label="开支日期"
                prop="expenseDate"
            ></el-table-column>
            <el-table-column
                label="开支花费"
                prop="expenseAmount"
            ></el-table-column>
            <el-table-column label="备注" prop="expenseNote"></el-table-column>
            <el-table-column label="操作" prop align="center" width="135">
                <template #default="scope">
                    <el-button
                        type="primary"
                        size="small"
                        @click="openEditDialog(scope.row)"
                        >编辑</el-button
                    >
                    <el-button
                        type="danger"
                        size="small"
                        @click="checkDeleteTableRow(scope.$index, scope.row)"
                        >删除</el-button
                    >
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

    <!-- 添加对话框 -->
    <el-dialog v-model="addDialog.isVisible" title="添加新开支" width="40%">
        <el-form
            :model="addForm"
            ref="addFormRef"
            :rules="addFormRules"
            label-position="left"
            label-width="100px"
        >
            <el-form-item label="课题编号" prop="taskIndex">
                <el-input
                    v-model="addForm.taskIndex"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="开支类别" prop="expenseTypeId">
                <el-select v-model="addForm.expenseTypeId" placeholder="请选择">
                    <el-option
                        v-for="expenseType in expenseTypeArray"
                        :key="expenseType.id"
                        :value="expenseType.id"
                        :label="expenseType.expenseName"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="日期" prop="expenseDate">
                <el-date-picker
                    v-model="addForm.expenseDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    clearable
                    style="width: 100%"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="开支花费" prop="expenseAmount">
                <el-input
                    v-model="addForm.expenseAmount"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="expenseNote">
                <el-input
                    v-model="addForm.expenseNote"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button
                    type="primary"
                    @click="checkSubmitAddForm(addFormRef)"
                    >提交</el-button
                >
                <el-button type="warning" @click="resetAddDialog(addFormRef)"
                    >重置</el-button
                >
                <el-button @click="addDialog.isVisible = false">关闭</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialog.isVisible" title="编辑用户" width="40%">
        <el-form
            :model="editForm"
            ref="editFormRef"
            :rules="editFormRules"
            label-position="left"
            label-width="100px"
        >
            <el-form-item label="课题编号" prop="taskIndex">
                <el-input
                    v-model="editForm.taskIndex"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="开支类别" prop="expenseTypeId">
                <el-select
                    v-model="editForm.expenseTypeId"
                    placeholder="请选择"
                >
                    <el-option
                        v-for="expenseType in expenseTypeArray"
                        :key="expenseType.id"
                        :value="expenseType.id"
                        :label="expenseType.expenseName"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="日期" prop="expenseDate">
                <el-date-picker
                    v-model="editForm.expenseDate"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    clearable
                    style="width: 100%"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="开支花费" prop="expenseAmount">
                <el-input
                    v-model="editForm.expenseAmount"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="备注" prop="expenseNote">
                <el-input
                    v-model="editForm.expenseNote"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button
                    type="primary"
                    @click="checkSubmitEditForm(editFormRef)"
                    >提交</el-button
                >
                <el-button type="warning" @click="resetEditDialog(editFormRef)"
                    >重置</el-button
                >
                <el-button @click="editDialog.isVisible = false"
                    >关闭</el-button
                >
            </el-form-item>
        </el-form>
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
