<script setup>
</script>

<template>
    <div class="login-panel">
        <div class="test-class">test</div>
        <div class="login-area"></div>
    </div>
</template>

<style scoped>
/* * {
    margin: 0;
    padding: 0;
} */
.login-panel {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../assets/login-bg2.jpg);
    background-size: 100%;
    background-position: center top;
    background-repeat: no-repeat;
}

.login-area {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    margin: -190px 0 0 -175px;
    background-color: rgba(255, 255, 255, 0.5);
}
.test-class {
    overflow: hidden;
}
</style>