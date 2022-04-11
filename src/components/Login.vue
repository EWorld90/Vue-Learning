<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from "element-plus"
import axios from 'axios'
import md5 from 'js-md5'

const router = useRouter()

// 登录表单
const form = reactive({
    name: '',
    password: '',
})

const onSubmit = () => {
    const url = 'http://127.0.0.1:8080/login'
    // 对密码进行加盐 md5 加密
    const salt = Math.round(Math.random() * 1000);
    axios.get(url, {
        params: {
            name: form.name,
            password: md5(form.password + salt),
            salt: salt
        }
    }).then(function (response) {
        if (response.data.status === 200) {
            // TEST 控制台输出提示
            console.log('success')

            localStorage.setItem('userName', form.name)
            localStorage.setItem('token', response.data.data)

            router.push('/basetable')
            ElMessage.success('登录成功')
        } else {
            ElMessage.error(response.data.data)
        }
    }).catch(function (error) {
        console.log(error);
        ElMessage.error(response.data.data)
    })
}
</script>

<template>
    <div class="login-panel">
        <div class="login-area">
            <div class="login-text">测试管理系统</div>
            <el-form
                class="login-form"
                :model="form"
                label-position="left"
                label-width="60px"
                @keyup.enter.native="onSubmit"
            >
                <el-form-item class="label-text" label="用户名">
                    <el-input class="input-area" v-model="form.name" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item class="label-text" label="密码">
                    <el-input
                        class="input-area"
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码"
                    ></el-input>
                </el-form-item>
                <el-form-item class="login-button-area">
                    <el-button class="login-button" type="primary" @click="onSubmit">登录</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<style scoped>
.login-panel {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../assets/login-bg.jpg);
    background-size: 100%;
    background-position: center top;
    background-repeat: no-repeat;
}

.login-area {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 450px;
    height: 220px;
    margin: -110px 0 0 -225px;
    background-color: rgba(255, 255, 255, 0.7);
}

.login-form {
    padding-top: 20px;
}

.login-text {
    width: 100%;
    text-align: center;
    font-size: 24px;
    line-height: 49px;
    border-bottom: 1px solid white;
}

.label-text {
    padding-left: 20px;
}

.input-area {
    padding-right: 20px;
}

.login-button-area {
    /*
    去掉 label-width="60px" 的影响
    */
    margin-left: -60px;
}

.login-button {
    margin: auto;
}
</style>