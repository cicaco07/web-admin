import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import DataHero from '../views/data-hero/data-hero/DataHero.vue';
import DataSkill from '../views/data-hero/data-skill/DataSkill.vue';
import SkillCreate from '../views/data-hero/data-skill/SkillCreate.vue';
import SkillEdit from '../views/data-hero/data-skill/SkillEdit.vue';
// import DataBaseStat from '../views/data-hero/DataBaseStat.vue';
import DataItem from '../views/data-persiapan/data-item/DataItem.vue';
import NotFound from '../components/Error/NotFound.vue';
import DataEmblem from '../views/data-persiapan/data-emblem/DataEmblem.vue';
import DataBattleSpell from '../views/data-persiapan/data-battlespell/DataBattleSpell.vue';
import NavigationList from '../views/navigasi/data-navigasi/NavigationList.vue';
import TournamentTier1 from '../views/tournament/tier-1/TournamentTier1.vue';
import TournamentTier2 from '../views/tournament/tier-2/TournamentTier2.vue';
import TournamentList from '../views/tournament/tournament-list/TournamentList.vue';
import TournamentDetail from '../views/tournament/tournament-detail/TournamentDetail.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
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
          path: "skill/create",
          name: "SkillCreate",
          component: SkillCreate,
        },
        {
          path: "skill/:id/edit",
          name: "SkillEdit",
          component: SkillEdit,
        },
        // {
        //   path: "base-stat",
        //   name: "BaseStat",
        //   component: DataBaseStat,
        // },
      ],
    },
    {
      path: "/data-persiapan",
      name: "DataPersiapan",
      children: [
        {
          path: "item",
          name: "DataItem",
          component: DataItem,
        },
        {
          path: "emblem",
          name: "DataEmblem",
          component: DataEmblem,
        },
        {
          path: "battle-spell",
          name: "DataBattleSpell",
          component: DataBattleSpell
        }
      ],
    },
    {
      path: "/tournament",
      name: "Tournament",
      children: [
        {
          path: "tournament-list",
          name: "TournamentList",
          component: TournamentList,
        },  
        {
          path: ":id",
          name: "TournamentDetail",
          component: TournamentDetail,
          // props: true,
        },
        {
          path: "tier-1",
          name: "TournamentTier1",
          component: TournamentTier1,
        },
        {
          path: "tier-2",
          name: "TournamentTier2",
          component: TournamentTier2,
        }
      ]
    },
    {
      path: "/navigasi",
      component: NavigationList,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    }
  ],
});

router.beforeEach((to, _from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');

  if (authRequired && !token) {
    return next('/login');
  }
  next();
});

export default router
