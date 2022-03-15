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

export default router;