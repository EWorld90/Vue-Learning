import {createRouter,createWebHistory} from "vue-router";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../components/Login.vue')
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('../components/Home.vue'),
        children: [
            {
                path: '/basetable',
                name: 'BaseTable',
                component: () => import('../components/BaseTable.vue')
            },
            {
                path: '/baseusercenter',
                name: 'BaseUserCenter',
                component: () => import('../components/BaseUserCenter.vue')
            }
        ]
    },
    {
        path: '/',
        redirect: '/basetable'
    },
    // TEST 测试界面路由入口
    {
        path: '/test',
        name: 'Test',
        component: () => import('../test/Test.vue')
    }
];

const router = createRouter(
    {
        history: createWebHistory(),
        routes
    }
);

router.beforeEach((to, from, next) => {
    const username = localStorage.getItem('username');

    // TEST test页面无视导航守卫
    if (to.path === '/test') {
        // TEST 控制台输出提示
        console.log('test page ' + to.path);

        next();
    } else if (!username && to.path !== '/login') {
        // TEST 控制台输出提示
        console.log(to.path + ' goto login');

        next('/login');
    } else {
        // TEST 控制台输出提示
        console.log(to.path);

        next();
    }
});

export default router;