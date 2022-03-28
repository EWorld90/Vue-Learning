import { createRouter, createWebHistory } from "vue-router";

// 懒加载路由
const loginRoute = () => import('../components/Login.vue')
const homeRoute = () => import('../components/Home.vue')
const taskTableRoute = () => import('../components/TaskTable.vue')
const expenseTableRoute = () => import('../components/ExpenseTable.vue')

const testRoute = () => import('../test/Test.vue')

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: loginRoute
    },
    {
        path: '/home',
        name: 'Home',
        component: homeRoute,
        children: [
            {
                path: '/tasktable',
                name: 'TaskTable',
                component: taskTableRoute
            },
            {
                path: '/expensetable',
                name: 'ExpenseTable',
                component: expenseTableRoute
            },
            {
                path: "/basetable",
                name: "BaseTable",
                component: () => import("../components/basetable.vue"),
            },
            {
                path: "/baseusercenter",
                name: "BaseUserCenter",
                component: () => import("../components/baseusercenter.vue"),
            },
        ],
    },
    {
        path: '/',
        redirect: '/basetable',
    },
    // TEST 测试界面路由入口
    {
        path: '/test',
        name: 'Test',
        component: testRoute,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// TODO: 用 meta 处理页面权限 userPermission
let userName = undefined
let userPermission = undefined
let userLoginTime = undefined
router.beforeEach((to, from, next) => {
    userName = localStorage.getItem('userName')
    userLoginTime = localStorage.getItem('userLoginTime')

    // TEST test页面无视导航守卫
    if (to.path === '/test') {
        // TEST 控制台输出提示
        console.log('goto test page');

        next();
    }
    // 检查用户是否登录
    else if (!userName && to.path !== '/login') {
        // TEST 控制台输出提示
        console.log(to.path + " but not logged in, goto login");

        next('/login');
    }
    // 检查用户登录状态是否过期
    else if (isExpiration() && to.path !== '/login') {
        // TEST 控制台输出提示
        console.log(to.path + " but login expire, goto login");

        // 过期时清除登录信息
        localStorage.removeItem('userName');
        localStorage.removeItem('userPermission');
        localStorage.removeItem('userLoginTime');

        next('/login');
    }
    // 如果在登录状态前往登录页面，则跳转回主页
    else if (userName && !isExpiration() && to.path === '/login') {
        next('/')
    } 
    else {
        // TEST 控制台输出提示
        console.log(to.path);

        next();
    }
});

// 返回用户登录状态是否过期
const expirationTime = 3600
const isExpiration = () => {
    return (Date.parse(new Date()) / 1000) - parseInt(userLoginTime) >= expirationTime || !userLoginTime
}

export default router;
