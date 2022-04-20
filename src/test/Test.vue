<script lang="ts" setup>
import { ref, reactive, toRaw } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import axiosRequest from "../utils/axiosUtils.js";

import { Refresh, Plus } from "@element-plus/icons-vue";

// 表格信息
const tableData = ref([]);
const tableDataLength = ref(0);

// 各项 id 与 name 的对应 Array
const roleArray = ref([
    {
        id: 1,
        name: "管理员",
    },
    {
        id: 2,
        name: "高级用户",
    },
    {
        id: 3,
        name: "普通用户",
    },
]);

const permissionArray = ref([
    {
        id: 1,
        name: 1,
    },
    {
        id: 2,
        name: 2,
    },
    {
        id: 3,
        name: 3,
    },
]);

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
        .get("/user/listAll")
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
    // 修改用户角色显示

    for (let i = 0; i < data.length; i++) {
        data[i].role = roleArray.value[data[i].role - 1].name;
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
    name: "",
    password: "",
    role: "",
    permission: "",
});
const addFormRef = ref<FormInstance>();

// 添加表单验证规则
const addFormRules = reactive({
    name: [
        {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
        },
    ],
    password: [
        {
            required: true,
            message: "请输入密码",
            trigger: "blur",
        },
    ],
    role: [
        {
            required: true,
            message: "请选择用户角色",
            trigger: "change",
        },
    ],
    permission: [
        {
            required: true,
            message: "请选择用户权限",
            trigger: "change",
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
        .post("/user/add", {
            name: addForm.name,
            password: addForm.password,
            role: addForm.role,
            permission: addForm.permission,
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

// 编辑表单信息
const editForm = reactive({
    id: "",
    name: "",
    role: "",
    permission: "",
});
const editFormRef = ref<FormInstance>();

// 编辑表单验证规则
const editFormRules = reactive({
    name: [
        {
            required: true,
            message: "请输入用户名",
            trigger: "blur",
        },
    ],
    role: [
        {
            required: true,
            message: "请选择用户角色",
            trigger: "change",
        },
    ],
    permission: [
        {
            required: true,
            message: "请选择用户权限",
            trigger: "change",
        },
    ],
});

// 初始化编辑对话框
const openEditDialog = (row) => {
    editDialog.editRow = row;

    editForm.id = row.id;
    editForm.name = row.name;
    editForm.role = row.role;
    editForm.permission = row.permission;

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
    console.log(editForm);
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
    // 如果未修改角色，需要转换表单中的角色表单项格式
    if (!Number.isNaN(editForm.role)) {
        for (const role of roleArray.value) {
            if (editForm.role === role.name) {
                editForm.role = String(role.id);
                break;
            }
        }
    }

    let status = {
        isSuccess: false,
        response: null,
    };

    await axiosRequest
        .post("/user/updateById", {
            id: editForm.id,
            name: editForm.name,
            role: parseInt(editForm.role),
            permission: editForm.permission,
        })
        .then(function (response) {
            // TEST 控制台输出提示
            console.log("edit task data ok!");
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
        .get("http://127.0.0.1:8080/user/remove?id=" + id)
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
    <el-dialog v-model="addDialog.isVisible" title="添加新用户" width="30%">
        <el-form
            :model="addForm"
            ref="addFormRef"
            :rules="addFormRules"
            label-position="left"
            label-width="100px"
        >
            <el-form-item label="用户名" prop="name">
                <el-input
                    v-model="addForm.name"
                    type="text"
                    clearable
                ></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input
                    v-model="addForm.password"
                    type="password"
                    clearable
                    show-password
                ></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="role">
                <el-select v-model="addForm.role" placeholder="请选择">
                    <el-option
                        v-for="role in roleArray"
                        :key="role.id"
                        :value="role.id"
                        :label="role.name"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="权限" prop="permission">
                <el-select v-model="addForm.permission" placeholder="请选择">
                    <el-option
                        v-for="permission in permissionArray"
                        :key="permission.id"
                        :value="permission.id"
                        :label="permission.name"
                    />
                </el-select>
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
    <el-dialog v-model="editDialog.isVisible" title="编辑用户" width="30%">
        <el-form
            :model="editForm"
            ref="editFormRef"
            :rules="editFormRules"
            label-position="left"
            label-width="100px"
        >
            <el-form-item label="用户名" prop="name">
                <el-input
                    v-model="editForm.name"
                    type="text"
                    disabled
                ></el-input>
            </el-form-item>
            <el-form-item label="角色" prop="role">
                <el-select v-model="editForm.role" placeholder="请选择">
                    <el-option
                        v-for="role in roleArray"
                        :key="role.id"
                        :value="role.id"
                        :label="role.name"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="权限" prop="permission">
                <el-select v-model="editForm.permission" placeholder="请选择">
                    <el-option
                        v-for="permission in permissionArray"
                        :key="permission.id"
                        :value="permission.id"
                        :label="permission.name"
                    />
                </el-select>
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
