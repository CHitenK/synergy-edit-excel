import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/index',
      name: 'index',
      meta: {
        title: 'Excel协同编辑'
      },
      component: () => import('@/views/Home/index.vue')
    },
    {
      path: '/excelTbale',
      name: 'excelTbale',
      meta: {
        title: 'Excel协同编辑'
      },
      component: () => import('@/views/ExcelTbale/index.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string
  next()
})

export default router
