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
const tableLoading = ref(true);

// 各项 id 与 name 的对应 Map
let userMap = new Map();
let expenseTypeMap = new Map();
let statusTypeMap = new Map();

// 各项 id 与 name 的对应 Array
const userArray = ref([]);
const expenseTypeArray = ref([]);
const statusTypeArray = ref([]);

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
        .get("http://127.0.0.1:8080/taskData/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get table data ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    await formatTableData(data);

    tableLoading.value = false;
};

// 格式化表格信息
const formatTableData = async (data) => {
    // 修改用户 id 为用户 name
    for await (let d of data) {
        await getUserName(d.taskLeaderUserId).then(function (res) {
            d.taskLeaderUserId = res;
        });
    }

    // 修改状态类别 id 为状态类别 name
    await getStatusTypeName();
    for (let d of data) {
        d.taskStatusId = statusTypeMap.get(d.taskStatusId);
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

// 美化表格的状态类别一栏
const beautifyStatus = (statusName) => {
    if (statusName === "进行中") {
        return "warning";
    } else if (statusName === "已完成") {
        return "success";
    } else {
        return "";
    }
};

// 详情对话框信息
const detailDialog = reactive({
    isVisible: false,
    title: "",
    tableData: [],
    memberData: [],
});

// 初始化详情对话框
const openDetailDialog = (row) => {
    detailDialog.title = row.taskName;

    getTaskDetail(row.id);
    getTaskMember(row.id);

    detailDialog.isVisible = true;
};

// 获取指定课题详情信息
const getTaskDetail = async (taskId) => {
    let data = null;

    await axiosRequest
        .get("http://127.0.0.1:8080/taskDetail/listByTaskId?taskId=" + taskId)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get table detail ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    // 修改开支类别 id 为开支类别 name
    for (let d of data) {
        d.expenseTypeId = expenseTypeMap.get(d.expenseTypeId);
    }

    detailDialog.tableData = data;
};

// 获取指定课题成员信息
const getTaskMember = async (taskId) => {
    let data = null;

    // 清除之前的数据
    detailDialog.memberData = [];

    await axiosRequest
        .get("http://127.0.0.1:8080/taskMember/listByTaskId?taskId=" + taskId)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get task member ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    // 修改用户 id 为用户 name
    for await (let m of data) {
        await getUserName(m.userId).then(function (res) {
            detailDialog.memberData.push(res);
        });
    }
};

// 添加对话框信息
const addDialog = reactive({
    isVisible: false,
});

// 添加表单信息
const addForm = reactive({
    taskIndex: "",
    taskName: "",
    taskDate: "",
    taskLeaderUserId: "",
    taskBudget: "",
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
    taskName: [
        {
            required: true,
            message: "请输入课题名",
            trigger: "blur",
        },
    ],
    taskDate: [
        {
            required: true,
            message: "请选择日期",
            trigger: "change",
        },
    ],
    taskLeaderUserId: [
        {
            required: true,
            message: "请选择负责人",
            trigger: "change",
        },
    ],
    taskBudget: [
        {
            validator: validateCheckAmount,
            required: true,
            trigger: "blur",
        },
    ],
});

// 初始化添加对话框
const openAddDialog = () => {
    getAllUserName();

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
        .post("/taskData/add", {
            taskIndex: addForm.taskIndex,
            taskName: addForm.taskName,
            taskStartDate: addForm.taskDate[0],
            taskEndDate: addForm.taskDate[1],
            taskLeaderUserId: addForm.taskLeaderUserId,
            taskBudget: new Decimal(addForm.taskBudget).toNumber(),
            taskBalance: new Decimal(addForm.taskBudget).toNumber(),
            taskStatusId: 1,
        })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Post task data ok!");
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

// 初始化编辑对话框
const openEditDialog = (row) => {
    editDialog.editRow = row;

    editDialog.isVisible = true;
};

// 编辑课题信息对话框信息
const editTaskDataDialog = reactive({
    isVisible: false,
});

// 编辑课题信息对话框表格信息
const editTaskDataForm = reactive({
    taskIndex: "",
    taskName: "",
    taskDate: [],
    taskLeaderUserId: "",
    taskBudget: "",
    taskStatusId: -1,
});
const editTaskDataFormRef = ref<FormInstance>();

// 编辑表单验证规则
const editTaskDataFormRules = reactive({
    taskIndex: [
        {
            required: true,
            message: "请输入课题编号",
            trigger: "blur",
        },
    ],
    taskName: [
        {
            required: true,
            message: "请输入课题名",
            trigger: "blur",
        },
    ],
    taskDate: [
        {
            required: true,
            message: "请选择日期",
            trigger: "change",
        },
    ],
    taskLeaderUserId: [
        {
            required: true,
            message: "请选择负责人",
            trigger: "change",
        },
    ],
    taskBudget: [
        {
            validator: validateCheckAmount,
            required: true,
            trigger: "blur",
        },
    ],
});

// 初始化编辑课题信息对话框
const openEditTaskDataDialog = () => {
    editTaskDataForm.taskIndex = editDialog.editRow.taskIndex;
    editTaskDataForm.taskName = editDialog.editRow.taskName;
    editTaskDataForm.taskDate = [
        editDialog.editRow.taskStartDate,
        editDialog.editRow.taskEndDate,
    ];
    editTaskDataForm.taskLeaderUserId = editDialog.editRow.taskLeaderUserId;
    editTaskDataForm.taskBudget = editDialog.editRow.taskBudget;

    // 将状态类别 name 转换成 id
    for (const s of statusTypeMap) {
        if (editDialog.editRow.taskStatusId === s[1]) {
            editTaskDataForm.taskStatusId = s[0];
            break;
        }
    }

    getAllUserName();

    editTaskDataDialog.isVisible = true;
};

const resetEditTaskDataDialog = (formRef: FormInstance | undefined) => {
    if (!formRef) return;
    formRef.resetFields();
};

// 确认提交编辑课题信息表单的操作
const checkSubmitEditTaskDataForm = async (
    formRef: FormInstance | undefined
) => {
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
                    let status = await submitEditTaskDataForm();

                    if (status.isSuccess === true) {
                        ElMessage({
                            type: "success",
                            message: "编辑成功",
                        });

                        // 编辑成功后刷新一次表格
                        getTableData();

                        editTaskDataDialog.isVisible = false;
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

// 提交编辑课题信息表单
const submitEditTaskDataForm = async () => {
    // 如果未修改负责人，需要转换表单中的负责人表单项格式
    if (!Number.isNaN(editTaskDataForm.taskLeaderUserId)) {
        for (const user of userArray.value) {
            if (editTaskDataForm.taskLeaderUserId === user.name) {
                editTaskDataForm.taskLeaderUserId = user.id;
                break;
            }
        }
    }

    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .post("http://127.0.0.1:8080/taskData/updateById", {
            id: editDialog.editRow.id,
            taskIndex: editTaskDataForm.taskIndex,
            taskName: editTaskDataForm.taskName,
            taskStartDate: editTaskDataForm.taskDate[0],
            taskEndDate: editTaskDataForm.taskDate[1],
            taskLeaderUserId: editTaskDataForm.taskLeaderUserId,
            taskBudget: new Decimal(editTaskDataForm.taskBudget).toNumber(),
            taskStatusId: editTaskDataForm.taskStatusId,
        })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Submit edit task data test ok");
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

// 编辑课题成员对话框信息
const editTaskMemberDialog = reactive({
    isVisible: false,
    memberData: [],
    selectedMember: [],
});

// 初始化编辑课题成员对话框
const openEditTaskMemberDialog = async () => {
    // 清除穿梭框信息
    editTaskMemberDialog.memberData = [];
    editTaskMemberDialog.selectedMember = [];

    // 获取用户列表
    await axiosRequest
        .get("http://127.0.0.1:8080/user/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get user list ok!");
            console.log(response.data.data);

            for (const d of response.data.data) {
                editTaskMemberDialog.memberData.push({
                    key: d.id,
                    label: d.name,
                    disabled: false,
                });
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    // 获取课题成员信息
    await axiosRequest
        .get("/taskMember/listByTaskId?taskId=" + editDialog.editRow.id)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get task member ok!");
            console.log(response.data.data);

            for (const d of response.data.data) {
                editTaskMemberDialog.selectedMember.push(d.userId);
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    editTaskMemberDialog.isVisible = true;
};

// TEST 控制台输出提示
const testCheckEditTaskMember = (
    value: any,
    direction: "left" | "right",
    movedKeys: any
) => {
    console.log(value, direction, movedKeys);
};

// 确认提交编辑课题成员请求
const checkEditTaskMember = () => {
    // TEST 控制台输出提示
    console.log(
        editTaskMemberDialog.memberData,
        editTaskMemberDialog.selectedMember
    );

    ElMessageBox.confirm("确认编辑？", "警告", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let status = await editTaskMember();

            if (status.isSuccess === true) {
                ElMessage({
                    type: "success",
                    message: "编辑成功",
                });
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
};

// 提交编辑课题成员请求
const editTaskMember = async () => {
    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .post("/taskMember/updateBatchById", {
            taskId: editDialog.editRow.id,
            userIdList: editTaskMemberDialog.selectedMember,
        })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("edit task member ok");
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

// 确认提交删除课题信息请求
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

// 提交删除课题信息请求
const DeleteTableRow = async (id) => {
    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .get("http://127.0.0.1:8080/taskData/removeById?id=" + id)
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("remove task data test ok");
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

// 获取用户 id 对应的用户 name，函数会返回用户 name
const getUserName = async (id) => {
    if (userMap.get(id)) {
        return userMap.get(id);
    } else {
        await axiosRequest
            .get("http://127.0.0.1:8080/user/getById?id=" + id)
            .then(function (response) {
                // TEST 控制台输出提示
                console.log("Get user name ok!");
                console.log(response.data.data);

                userMap.set(id, response.data.data.name);
            })
            .catch(function (error) {
                console.log(error);
            });
        return userMap.get(id);
    }
};

// 获取全部用户的 id 与对应的 name，并本地保存
const getAllUserName = () => {
    axiosRequest
        .get("http://127.0.0.1:8080/user/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get user list ok!");
            console.log(response.data.data);

            userArray.value = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });
};

// 获取开支类别 id 对应的开支类别 name，并本地保存
const getExpenseTypeName = async () => {
    let data = null;

    await axiosRequest
        .get("http://127.0.0.1:8080/expenseType/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get expense type ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    for (const d of data) {
        expenseTypeMap.set(d.id, d.expenseName);
    }
};

// 获取状态类别 id 对应的状态类别 name，并本地保存
const getStatusTypeName = async () => {
    let data = null;

    await axiosRequest
        .get("http://127.0.0.1:8080/statusType/listAll")
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("Get status type ok!");
            console.log(response.data.data);

            data = response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });

    statusTypeArray.value = [];
    for (const d of data) {
        statusTypeMap.set(d.id, d.statusName);

        // 将数据一同存入 Array 中
        const id = d.id;
        const statusName = d.statusName;
        statusTypeArray.value.push({ id, statusName });
    }
};

// 页面初始化
getTableData();
getExpenseTypeName();
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
            height="531"
            :data="sliceTableData()"
            v-loading="tableLoading"
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
                label="课题编号"
                prop="taskIndex"
            ></el-table-column>
            <el-table-column label="课题名" prop="taskName"></el-table-column>
            <el-table-column
                label="起始日期"
                prop="taskStartDate"
            ></el-table-column>
            <el-table-column
                label="截止日期"
                prop="taskEndDate"
            ></el-table-column>
            <el-table-column
                label="负责人"
                prop="taskLeaderUserId"
            ></el-table-column>
            <el-table-column label="预算" prop="taskBudget"></el-table-column>
            <el-table-column label="结余" prop="taskBalance"></el-table-column>
            <el-table-column label="状态" prop="taskStatusId" align="center">
                <template #default="scope">
                    <el-tag :type="beautifyStatus(scope.row.taskStatusId)">{{
                        scope.row.taskStatusId
                    }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" prop align="center" width="200">
                <template #default="scope">
                    <el-button
                        type="success"
                        size="small"
                        @click="openDetailDialog(scope.row)"
                        >详情</el-button
                    >
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
                        >删除
                    </el-button>
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
    <el-dialog v-model="detailDialog.isVisible" width="40%">
        <template #title>{{ detailDialog.title }} 详情栏</template>
        <el-card class="detail-dialog-card" shadow="never">
            <template #header>课题成员</template>
            <span v-for="data in detailDialog.memberData">{{
                data + " "
            }}</span>
        </el-card>
        <el-table border stripe size="small" :data="detailDialog.tableData">
            <el-table-column
                label="开支类别"
                prop="expenseTypeId"
            ></el-table-column>
            <el-table-column
                label="类别花费"
                prop="expenseTypeAmount"
            ></el-table-column>
        </el-table>
    </el-dialog>

    <!-- 添加对话框 -->
    <el-dialog v-model="addDialog.isVisible" title="添加新课题" width="40%">
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
            <el-form-item label="课题名" prop="taskName">
                <el-input
                    v-model="addForm.taskName"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="日期" prop="taskDate">
                <el-date-picker
                    v-model="addForm.taskDate"
                    type="daterange"
                    unlink-panels
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    clearable
                    style="width: 100%"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="负责人" prop="taskLeaderUserId">
                <el-select
                    v-model="addForm.taskLeaderUserId"
                    placeholder="请选择"
                >
                    <el-option
                        v-for="user in userArray"
                        :key="user.id"
                        :value="user.id"
                        :label="user.name"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="预算" prop="taskBudget">
                <el-input
                    v-model="addForm.taskBudget"
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
    <el-dialog v-model="editDialog.isVisible" title="编辑课题信息" width="20%">
        <el-space direction="vertical">
            <el-button @click="openEditTaskDataDialog">编辑课题信息</el-button>
            <el-button @click="openEditTaskMemberDialog"
                >编辑课题成员</el-button
            >
        </el-space>
    </el-dialog>

    <!-- 编辑课题信息对话框 -->
    <el-dialog
        v-model="editTaskDataDialog.isVisible"
        title="编辑课题信息"
        width="40%"
    >
        <el-form
            :model="editTaskDataForm"
            ref="editTaskDataFormRef"
            :rules="editTaskDataFormRules"
            label-position="left"
            label-width="100px"
        >
            <el-form-item label="课题编号" prop="taskIndex">
                <el-input
                    v-model="editTaskDataForm.taskIndex"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="课题名" prop="taskName">
                <el-input
                    v-model="editTaskDataForm.taskName"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="日期" prop="taskDate">
                <el-date-picker
                    v-model="editTaskDataForm.taskDate"
                    type="daterange"
                    unlink-panels
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    clearable
                    style="width: 100%"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="负责人" prop="taskLeaderUserId">
                <el-select
                    v-model="editTaskDataForm.taskLeaderUserId"
                    placeholder="请选择"
                >
                    <el-option
                        v-for="user in userArray"
                        :key="user.id"
                        :value="user.id"
                        :label="user.name"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="预算" prop="taskBudget">
                <el-input
                    v-model="editTaskDataForm.taskBudget"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="状态" prop="taskStatusId">
                <el-radio-group v-model="editTaskDataForm.taskStatusId">
                    <el-radio
                        v-for="status in statusTypeArray"
                        :label="status.id"
                        >{{ status.statusName }}</el-radio
                    >
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button
                    type="primary"
                    @click="checkSubmitEditTaskDataForm(editTaskDataFormRef)"
                    >提交</el-button
                >
                <el-button
                    type="warning"
                    @click="resetEditTaskDataDialog(editTaskDataFormRef)"
                    >重置</el-button
                >
                <el-button @click="editTaskDataDialog.isVisible = false"
                    >关闭</el-button
                >
            </el-form-item>
        </el-form>
    </el-dialog>

    <!-- 编辑课题成员对话框 -->
    <el-dialog
        v-model="editTaskMemberDialog.isVisible"
        title="编辑课题成员"
        width="45%"
    >
        <el-transfer
            v-model="editTaskMemberDialog.selectedMember"
            :titles="['非课题成员', '课题成员']"
            :button-texts="['删除', '添加']"
            :data="editTaskMemberDialog.memberData"
            @change="testCheckEditTaskMember"
        >
        </el-transfer>
        <el-button type="primary" @click="checkEditTaskMember"
            >完成编辑</el-button
        >
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

.add-form-date-separator {
    height: 100%;
    line-height: 28px;
}
</style>
