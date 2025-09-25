<script setup lang="ts">
import { onMounted, reactive, computed, watch } from 'vue';
import { useGetUserNavigations } from '../../lib/api/NavigationApi';

const token = localStorage.getItem('token') ?? '';
if (!token) {
  console.error('No token found in localStorage');
}
const { result: navigationResult, loading, refetch } = useGetUserNavigations(token);
const navigations = computed(() => navigationResult.value?.getUserNavigations || []);

interface NavigationItem {
  _id: string;
  name: string;
  parent_id?: string;
  icon: string;
  route: string;
  is_header: boolean;
  is_active: boolean;
  order: number;
  roles: string[];
  permissions: string[];
  level: number;
  component: string;
  is_visible: boolean;
  children?: NavigationItem[];
}

const expandedMenus = reactive<Record<string, boolean>>({});

// Function untuk initialize expanded state
function initializeExpandedState() {
  navigations.value.forEach((item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      // Set default ke false
      expandedMenus[item._id] = false;
    }
  });
}

// Function untuk toggle menu
function toggleMenu(menuId: string) {
  expandedMenus[menuId] = !expandedMenus[menuId];
  
  // Close other menus jika ingin accordion behavior
  Object.keys(expandedMenus).forEach(key => {
    if (key !== menuId) {
      expandedMenus[key] = false;
    }
  });
}

// Function untuk check apakah menu sedang active (optional)
function isMenuActive(item: NavigationItem): boolean {
  const currentPath = window.location.pathname;
  
  // Check jika current path sama dengan item route
  if (item.route === currentPath) {
    return true;
  }
  
  // Check jika salah satu children active
  if (item.children) {
    return item.children.some(child => child.route === currentPath);
  }
  
  return false;
}

// Function untuk auto expand menu yang active (optional)
function autoExpandActiveMenu() {
  navigations.value.forEach((item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      const hasActiveChild = item.children.some(child => 
        child.route === window.location.pathname
      );
      
      if (hasActiveChild) {
        expandedMenus[item._id] = true;
      }
    }
  });
}

// Watch navigations untuk auto-initialize saat data tersedia
watch(navigations, (newNavigations) => {
  if (newNavigations.length > 0) {
    initializeExpandedState();
    autoExpandActiveMenu();
  }
}, { immediate: true });

onMounted(async () => {
  // Refetch untuk memastikan data terbaru
  await refetch();
});
</script>

<template>
  <aside class="left-sidebar">
    <div>
      <div class="brand-logo d-flex align-items-center justify-content-between">
        <a href="#" class="text-nowrap logo-img">
          <img src="/dist/images/logos/dark-logo.svg" class="dark-logo" width="180" alt="" />
        </a>
        <div class="close-btn d-lg-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
          <i class="ti ti-x fs-8 text-muted"></i>
        </div>
      </div>
      <nav class="sidebar-nav scroll-sidebar" data-simplebar>
        <ul id="sidebarnav">
          <li class="nav-small-cap">
            <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
            <span class="hide-menu">Home</span>
            <slot />
          </li>

          <!-- Skeleton Loading state -->
          <template v-if="loading">
            <li v-for="n in 6" :key="`skeleton-${n}`" class="sidebar-item">
              <div class="sidebar-link skeleton-item">
                <span class="d-flex align-items-center">
                  <div class="skeleton skeleton-icon me-3"></div>
                  <div class="skeleton skeleton-text"></div>
                </span>
              </div>
            </li>
          </template>
          
          <template v-else>
            <li v-for="navigationHeader in navigations" :key="navigationHeader._id" class="sidebar-item">
              <template v-if="!navigationHeader.children || navigationHeader.children.length === 0">
                <!-- Dynamic active class -->
                <a 
                  class="sidebar-link" 
                  :class="{ 'active': isMenuActive(navigationHeader) }"
                  :href="navigationHeader.route" 
                  aria-expanded="false"
                >
                  <span class="">
                    <i :class="navigationHeader.icon"></i>
                  </span>
                  <span class="hide-menu">{{ navigationHeader.name }}</span>
                </a>
              </template>
              <template v-else>
                <!-- Click handler dan dynamic aria-expanded -->
                <a 
                  class="sidebar-link has-arrow" 
                  :class="{ 'active': isMenuActive(navigationHeader) }"
                  href="#" 
                  :aria-expanded="expandedMenus[navigationHeader._id] ? 'true' : 'false'"
                  @click.prevent="toggleMenu(navigationHeader._id)"
                >
                  <span class="d-flex">
                    <i :class="navigationHeader.icon"></i>
                  </span>
                  <span class="hide-menu">{{ navigationHeader.name }}</span>
                </a>
                <!-- Dynamic collapse classes dan transition -->
                <ul
                  :aria-expanded="expandedMenus[navigationHeader._id] ? 'true' : 'false'" 
                  :class="[
                    'first-level', 
                    'collapse',
                    { 'show': expandedMenus[navigationHeader._id] }
                  ]"
                  :style="{
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }"
                >
                  <li v-for="child in navigationHeader.children" :key="child._id" class="sidebar-item">
                    <a 
                      :href="child.route" 
                      class="sidebar-link"
                      :class="{ 'active': isMenuActive(child) }"
                    >
                      <div class="round-16 d-flex align-items-center justify-content-center">
                        <i class="ti ti-circle"></i>
                      </div>
                      <span class="hide-menu">{{ child.name }}</span>
                    </a>
                  </li>
                </ul>
              </template>
            </li>
          </template>
        </ul>
      </nav>
      <div class="fixed-profile p-3 bg-light-secondary rounded sidebar-ad mt-3">
        <div class="hstack gap-3">
          <div class="john-img">
            <img src="/dist/images/profile/user-1.jpg" class="rounded-circle" width="40" height="40" alt="">
          </div>
          <div class="john-title">
            <h6 class="mb-0 fs-4 fw-semibold">Mathew</h6>
            <span class="fs-2 text-dark">Designer</span>
          </div>
          <button class="border-0 bg-transparent text-primary ms-auto" tabindex="0" type="button" aria-label="logout" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="logout">
            <i class="ti ti-power fs-6"></i>
          </button>
        </div>
      </div>  
    </div>
  </aside>
</template>

<style scoped>
.collapse {
  display: none;
}

.collapse.show {
  display: block;
}

.sidebar-link.active {
  background-color: var(--bs-primary);
  color: white;
}

.sidebar-link.active i {
  color: white;
}

.first-level {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.first-level.show {
  max-height: 500px;
  opacity: 1;
}

.sidebar-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  transform: translateX(2px);
  transition: all 0.2s ease;
}

/* Skeleton styles */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-item {
  padding: 24px 32px;
  margin-bottom: 4px;
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-text {
  height: 24px;
  width: 150px;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>