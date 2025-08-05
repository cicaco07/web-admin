import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import DataHero from '../views/data-hero/DataHero.vue';
import DataSkill from '../views/data-hero/DataSkill.vue';
import DataBaseStat from '../views/data-hero/DataBaseStat.vue';
import DataItem from '../views/data-persiapan/DataItem.vue';
import NotFound from '../components/Error/NotFound.vue';
import DataEmblem from '../views/data-persiapan/DataEmblem.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      component: Login,
    },
    {
      path: "/register",
      component: Register,
    },
    {
      path: "/dashboard",
      component: Dashboard,
    },
    {
      path: "/data-hero",
      name: "DataHero",
      children: [
        {
          path: "hero",
          name: "Hero",
          component: DataHero,
        },
        {
          path: "skill",
          name: "Skill",
          component: DataSkill,
        },
        {
          path: "base-stat",
          name: "BaseStat",
          component: DataBaseStat,
        },
      ],
    },
    {
      path: "/data-persiapan",
      name: "DataPersiapan",
      children: [
        {
          path: "data-item",
          name: "DataItem",
          component: DataItem,
        },
        {
          path: "data-emblem",
          name: "DataEmblem",
          component: DataEmblem,
        },
        // {
        //   path: "data-battle-spell",
        //   name: "DataBattleSpell",
        //   component: () => import('../views/data-persiapan/DataBattleSpell.vue'),
        // }
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    }
  ],
});

export default router
