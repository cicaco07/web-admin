import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import DataHero from '../views/data-hero/data-hero/DataHero.vue';
import DataSkill from '../views/data-hero/data-skill/DataSkill.vue';
import SkillCreate from '../views/data-hero/data-skill/SkillCreate.vue';
import SkillEdit from '../views/data-hero/data-skill/SkillEdit.vue';
import DataBaseStat from '../views/data-hero/data-base-stat/DataBaseStat.vue';
import DataItem from '../views/data-persiapan/data-item/DataItem.vue';
import NotFound from '../components/Error/NotFound.vue';
import DataEmblem from '../views/data-persiapan/data-emblem/DataEmblem.vue';
import DataBattleSpell from '../views/data-persiapan/data-battlespell/DataBattleSpell.vue';
import NavigationList from '../views/navigasi/data-navigasi/NavigationList.vue';
import TournamentTier1 from '../views/tournament/tier-1/TournamentTier1.vue';
import TournamentTier2 from '../views/tournament/tier-2/TournamentTier2.vue';
import TournamentList from '../views/tournament/tournament-list/TournamentList.vue';
import TournamentDetail from '../views/tournament/tournament-detail/TournamentDetail.vue';
import DraftPickSimulation from '../views/draft-pick/simulation/DraftPickSimulation.vue';
import BuildDasar from '../views/build/build-dasar/BuildDasar.vue';
import PatchList from '../views/patch-note/patch-list/PatchList.vue';
import PatchDetail from '../views/patch-note/patch-list/PatchDetail.vue';
import HeroPatchNote from '../views/patch-note/hero/HeroPatchNote.vue';
import BattlefieldPatchNote from '../views/patch-note/battlefield/BattlefieldPatchNote.vue';
import SystemPatchNote from '../views/patch-note/system/SystemPatchNote.vue';
import GameModePatchNote from '../views/patch-note/game-mode/GameModePatchNote.vue';
import PatchHistory from '../views/patch-note/patch-history/PatchHistory.vue';
import UserManagement from '../views/user-management/UserManagement.vue';
import AuditLog from '../views/audit-log/AuditLog.vue';

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
      path: "/draft-pick",
      name: "DraftPick",
      children: [
        {
          path: "simulation",
          name: "DraftPickSimulation",
          component: DraftPickSimulation,
        },
      ]
    },
    {
      path: "/build",
      name: "Build",
      children: [
        {
          path: "build-dasar",
          name: "BuildDasar",
          component: BuildDasar,
        },
      ]
    },
    {
      path: "/patch-note",
      name: "PatchNote",
      children: [
        { 
          path: "patch-list",
          name: "PatchList",
          component: PatchList
        },
        {
          path: "patch-list/:id",
          name: "PatchDetail",
          component: PatchDetail,
        },
        {
          path: "history/hero",
          name: "HeroPatchHistory",
          component: PatchHistory,
          props: { targetType: 'HERO' },
        },
        {
          path: "history/item",
          name: "ItemPatchHistory",
          component: PatchHistory,
          props: { targetType: 'ITEM' },
        },
        {
          path: "history/battlefield",
          name: "BattlefieldPatchHistory",
          component: PatchHistory,
          props: { targetType: 'BATTLEFIELD' },
        },
        {
          path: "history/system",
          name: "SystemPatchHistory",
          component: PatchHistory,
          props: { targetType: 'SYSTEM' },
        },
        {
          path: "history/game-mode",
          name: "GameModePatchHistory",
          component: PatchHistory,
          props: { targetType: 'GAME_MODE' },
        },
        { 
          path: "patch-hero", 
          name: "PatchNoteHero", 
          component: HeroPatchNote 
        },
        { 
          path: "patch-battlefield", 
          name: "PatchNoteBattlefield", 
          component: BattlefieldPatchNote 
        },
        { 
          path: "patch-system", 
          name: "PatchNoteSistem", 
          component: SystemPatchNote 
        },
        { 
          path: "patch-game-mode", 
          name: "PatchNoteModeGame", 
          component: GameModePatchNote 
        },
      ],
    },
    {
      path: "/navigasi",
      component: NavigationList,
    },
    {
      path: "/manajemen-user",
      name: "UserManagement",
      component: UserManagement,
    },
    {
      path: "/audit-logs",
      name: "AuditLogs",
      component: AuditLog,
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
