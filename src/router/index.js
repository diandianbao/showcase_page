import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '看板' }
      },
      {
        path: 'my-todos',
        name: 'MyTodos',
        component: () => import('../views/MyTodos.vue'),
        meta: { title: '我的代办' }
      },
      {
        path: 'tracing',
        name: 'Tracing',
        component: () => import('../views/Tracing.vue'),
        meta: { title: '追踪' }
      },
      {
        path: 'sessions',
        name: 'Sessions',
        component: () => import('../views/Sessions.vue'),
        meta: { title: '会话' }
      },
      {
        path: 'evaluation',
        name: 'Evaluation',
        component: () => import('../views/Evaluation.vue'),
        meta: { title: '评估' }
      },
      {
        path: 'badcase',
        name: 'BadCase',
        component: () => import('../views/BadCase.vue'),
        meta: { title: 'BadCase 分析' }
      },
      {
        path: 'prompt',
        name: 'Prompt',
        component: () => import('../views/Prompt.vue'),
        meta: { title: '提示词' }
      },
      {
        path: 'intent',
        name: 'Intent',
        component: () => import('../views/Intent.vue'),
        meta: { title: '意图' }
      },
      {
        path: 'memory',
        name: 'Memory',
        component: () => import('../views/Memory.vue'),
        meta: { title: '记忆' }
      },
      {
        path: 'vocabulary',
        name: 'Vocabulary',
        component: () => import('../views/Vocabulary.vue'),
        meta: { title: '词汇表' }
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('../views/KnowledgeBase.vue'),
        meta: { title: '知识库' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
