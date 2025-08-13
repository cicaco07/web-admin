<script setup lang="ts">
import { ref, onMounted } from 'vue';

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

const navigationTree = ref<NavigationItem[]>([]);
const loading = ref(false);

async function fetchNavigationTree() {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST', // Changed from GET to POST for GraphQL
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
  } catch (error) {
    console.error('Error fetching navigation tree:', error);
    navigationTree.value = [];
  } finally {
    loading.value = false;
  }
}

function renderNavigationItem(item: NavigationItem): any {
  if (!item.is_visible) return null;

  if (item.is_header) {
    return {
      type: 'header',
      name: item.name,
      icon: item.icon
    };
  }

  return {
    type: 'item',
    ...item,
    hasChildren: item.children && item.children.length > 0
  };
}

onMounted(() => {
  fetchNavigationTree();
});
console.log('Navigation Tree:', navigationTree);
</script>

<template>
  <!-- Sidebar Start -->
  <aside class="left-sidebar">
    <!-- Sidebar scroll-->
    <div>
      <div class="brand-logo d-flex align-items-center justify-content-between">
        <a href="#" class="text-nowrap logo-img">
          <img src="/dist/images/logos/dark-logo.svg" class="dark-logo" width="180" alt="" />
        </a>
        <div class="close-btn d-lg-none d-block sidebartoggler cursor-pointer" id="sidebarCollapse">
          <i class="ti ti-x fs-8 text-muted"></i>
        </div>
      </div>
      <!-- Sidebar navigation-->
      <nav class="sidebar-nav scroll-sidebar" data-simplebar>
        <ul id="sidebarnav">
          <!-- ============================= -->
          <!-- Home -->
          <!-- ============================= -->
          <li class="nav-small-cap">
            <i class="ti ti-dots nav-small-cap-icon fs-4"></i>
            <span class="hide-menu">Home</span>
            <slot />
          </li>
          <!-- =================== -->
          <!-- Dashboard -->
          <!-- =================== -->
          <li v-for="child in navigationTree">
            <a class="sidebar-link" :href="child.route" aria-expanded="false">
              <span class="">
                <i :class="child.icon"></i>
              </span>
              <span class="hide-menu">{{ child.name }}</span>
            </a>
          </li>
          <li v-for="navigationHeader in navigationTree" class="sidebar-item">
            <template v-if="navigationHeader.children && navigationHeader.children.length == 0">
              <a class="sidebar-link" :href="navigationHeader.route" aria-expanded="false">
                <span class="">
                  <i :class="navigationHeader.icon"></i>
                </span>
                <span class="hide-menu">{{ navigationHeader.name }}</span>
              </a>
            </template>
            <template v-else>
              <a class="sidebar-link has-arrow" href="#" aria-expanded="false">
                <span class="d-flex">
                  <i :class="navigationHeader.icon"></i>
                </span>
                <span class="hide-menu">{{ navigationHeader.name }}</span>
              </a>
              <ul aria-expanded="false" class="collapse first-level">
                
              </ul>
            </template>
          </li>
          
          <!-- <li class="sidebar-item">
            <a class="sidebar-link" href="/dashboard" aria-expanded="false">
              <span>
                <i class="ti ti-aperture"></i>
              </span>
              <span class="hide-menu">Dashboard</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a class="sidebar-link has-arrow" href="#" aria-expanded="false">
              <span class="d-flex">
                <i class="ti ti-shopping-cart"></i>
              </span>
              <span class="hide-menu">Data Hero</span>
            </a>
            <ul aria-expanded="false" class="collapse first-level">
              <li class="sidebar-item">
                <a href="/data-hero/hero" class="sidebar-link">
                  <div class="round-16 d-flex align-items-center justify-content-center">
                    <i class="ti ti-circle"></i>
                  </div>
                  <span class="hide-menu">Hero</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a href="/data-hero/skill" class="sidebar-link">
                  <div class="round-16 d-flex align-items-center justify-content-center">
                    <i class="ti ti-circle"></i>
                  </div>
                  <span class="hide-menu">Skill</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a href="/data-hero/base-stat" class="sidebar-link">
                  <div class="round-16 d-flex align-items-center justify-content-center">
                    <i class="ti ti-circle"></i>
                  </div>
                  <span class="hide-menu">Base Stat</span>
                </a>
              </li>
            </ul>
          </li>
          <li class="sidebar-item">
            <a class="sidebar-link has-arrow" href="#" aria-expanded="false">
              <span class="d-flex">
                <i class="ti ti-cards"></i>
              </span>
              <span class="hide-menu">Data Persiapan</span>
            </a>
            <ul aria-expanded="false" class="collapse first-level">
              <li class="sidebar-item">
                <a href="/data-persiapan/data-emblem" class="sidebar-link">
                  <div class="round-16 d-flex align-items-center justify-content-center">
                    <i class="ti ti-circle"></i>
                  </div>
                  <span class="hide-menu">Emblems</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a href="/data-persiapan/data-item" class="sidebar-link">
                  <div class="round-16 d-flex align-items-center justify-content-center">
                    <i class="ti ti-circle"></i>
                  </div>
                  <span class="hide-menu">Items</span>
                </a>
              </li>
              <li class="sidebar-item">
                <a href="/data-persiapan/data-battle-spell" class="sidebar-link">
                  <div class="round-16 d-flex align-items-center justify-content-center">
                    <i class="ti ti-circle"></i>
                  </div>
                  <span class="hide-menu">Battle Spells</span>
                </a>
              </li>
            </ul>
          </li>
          <li class="sidebar-item">
            <a class="sidebar-link" href="./build" aria-expanded="false">
              <span>
                <i class="ti ti-cpu"></i>
              </span>
              <span class="hide-menu">Builds</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a class="sidebar-link" href="./patch-note" aria-expanded="false">
              <span>
                <i class="ti ti-activity-heartbeat"></i>
              </span>
              <span class="hide-menu">Patch Notes</span>
            </a>
          </li> -->
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
      <!-- End Sidebar navigation -->
    </div>
    <!-- End Sidebar scroll-->
  </aside>
  <!--  Sidebar End -->
</template>