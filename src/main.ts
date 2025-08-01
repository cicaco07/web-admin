import { createApp } from "vue";
import App from "./App.vue";
import { DefaultApolloClient } from "@vue/apollo-composable";
import apolloClient from "./plugins/apollo";
import { createRouter, createWebHistory } from "vue-router";
import Register from "./views/auth/Register.vue";
import Login from "./views/auth/Login.vue";
import Dashboard from "./views/dashboard/Dashboard.vue";
import DataHero from "./views/data-hero/DataHero.vue";
import DataSkill from "./views/data-hero/DataSkill.vue";
import DataBaseStat from "./views/data-hero/DataBaseStat.vue";
import DataItem from "./views/data-persiapan/DataItem.vue";
import NotFound from "./components/Error/NotFound.vue";

const router = createRouter({
  history: createWebHistory(),
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
      path: "/data-hero/hero",
      component: DataHero,
    },
    {
      path: "/data-hero/skill",
      component: DataSkill,
    },
    {
      path: "/data-hero/base-stat",
      component: DataBaseStat,
    },
    {
      path: "/data-persiapan/data-item",
      component: DataItem,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    }
  ],
});

const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)

app.use(router)

app.mount('#app')
