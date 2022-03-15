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
            }
        ]
    },
    
]

const router = createRouter(
    {
        history: createWebHistory(),
        routes
    }
)

export default router;