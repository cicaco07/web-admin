<script setup lang="ts">
import Sidebar from './Navbar/Sidebar.vue';
import Topbar from './Navbar/Topbar.vue';

</script>

<template>
  <!--  Body Wrapper -->
  <div class="page-wrapper" id="main-wrapper" data-theme="blue_theme"  data-layout="vertical" data-sidebartype="full" data-sidebar-position="fixed" data-header-position="fixed">
      <Sidebar />
      <!--  Main wrapper -->
      <div class="body-wrapper">
        <Topbar />
        <div class="container-fluid mw-100">
          <slot/>
        </div>
      </div>
      <div class="dark-transparent sidebartoggler"></div>
    <div class="dark-transparent sidebartoggler"></div>
  </div>
</template>