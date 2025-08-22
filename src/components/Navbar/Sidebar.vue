<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';

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

interface User {
  role: string;
}

const navigationTree = ref<NavigationItem[]>([]);
const currentUser = ref<User | null>(null);
const loading = ref(false);

const expandedMenus = reactive<Record<string, boolean>>({});

async function fetchNavigationTree() {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query: `
          query {
            getNavigationTree {
              _id
              name
              parent_id
              icon
              route
              is_header
              is_active
              order
              roles
              permissions
              level
              component
              is_visible
              children {
                _id
                name
                parent_id
                icon
                route
                is_header
                is_active
                order
                roles
                permissions
                level
                component
                is_visible
                children {
                  _id
                  name
                  parent_id
                  icon
                  route
                  is_header
                  is_active
                  order
                  roles
                  permissions
                  level
                  component
                  is_visible
                }
              }
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    navigationTree.value = data.data.getNavigationTree || [];
    
    // Initialize expanded state untuk semua parent menus
    initializeExpandedState();
    
  } catch (error) {
    console.error('Error fetching navigation tree:', error);
    navigationTree.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        query: `
          query {
            me {
              role
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    currentUser.value = data.data.me;

  } catch (error) {
    console.error('Error fetching current user:', error);
  }
}

// Function untuk initialize expanded state
function initializeExpandedState() {
  navigationTree.value.forEach(item => {
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
  navigationTree.value.forEach(item => {
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

onMounted(async () => {
  await fetchNavigationTree();
  await fetchCurrentUser();
  // Auto expand menu yang active setelah data dimuat
  autoExpandActiveMenu();
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
          
          <!-- Loading state -->
          <li v-if="loading" class="sidebar-item">
            <div class="d-flex align-items-center justify-content-center p-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </li>
          
          <template v-else>
            <li v-for="navigationHeader in navigationTree" :key="navigationHeader._id" class="sidebar-item">
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

<!-- CSS untuk smooth transitions -->
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

/* Smooth animation untuk collapse */
.first-level {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.first-level.show {
  max-height: 500px; /* Sesuaikan dengan kebutuhan */
  opacity: 1;
}

/* Hover effects */
.sidebar-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  transform: translateX(2px);
  transition: all 0.2s ease;
}
</style>