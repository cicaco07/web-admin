import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Register from './views/auth/Register.vue'
import Login from './views/auth/Login.vue'
import Dashboard from './views/dashboard/Dashboard.vue'
import DataHero from './views/data-hero/DataHero.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    },
    {
      path: '/dashboard',
      component: Dashboard
    },
    {
      path: '/data-hero',
      component: DataHero
    },
    // {
    //   path: '/data-persiapan/data-emblem',
    //   name: 'DataPersiapanEmblem',
    // }

  ]
})

createApp(App).use(router).mount('#app')
