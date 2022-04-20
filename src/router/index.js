import { createRouter, createWebHistory } from "vue-router";

// 懒加载路由
const loginRoute = () => import('../components/Login.vue')
const homeRoute = () => import('../components/Home.vue')
const taskTableRoute = () => import('../components/TaskTable.vue')
const expenseTableRoute = () => import('../components/ExpenseTable.vue')
const userTableRoute = () => import('../components/UserTable.vue')

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
                path: '/usertable',
                name: 'UserTable',
                component: userTableRoute
            },
            {
                path: "/basetable",
                name: "BaseTable",
                component: () => import("../components/BaseTable.vue"),
            },
            {
                path: "/baseusercenter",
                name: "BaseUserCenter",
                component: () => import("../components/BaseUserCenter.vue"),
            },
        ],
    },
    {
        path: '/',
        redirect: '/login',
    },
    // TEST 测试界面路由入口
    {
        path: '/test',
        name: 'Test',
        component: testRoute,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    let userName = localStorage.getItem('userName')

    // TEST test页面无视导航守卫
    if (to.path === '/test') {
        // TEST 控制台输出提示
        console.log('goto test page')

        next()
    } else {
        // 检查用户是否登录
        if (!userName) {
            // 未登录的情况下，访问其他页面则重定向到登录页面
            if (to.path !== '/login') {
                // TEST 控制台输出提示
                console.log(to.path + " but not logged in, goto login")
                
                next('/login')
            } else {
                next()
            }
        }
        // 如果在登录状态前往登录页面，则重定向回主页
        else if (to.path === '/login') {
            // TEST 控制台输出提示
            console.log(to.path + " but logged in, goto basetable")
            
            next('/basetable')
        }
        // 登录状态下正常访问页面
        else {
            // TEST 控制台输出提示
            console.log(to.path)
        
            next()
        }
    }

})

export default router
