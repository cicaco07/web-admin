<script setup lang="ts">
import Breadcrumb from '../../../components/Breadcrumb/Breadcrumb.vue';
import DashboardLayout from '../../../components/DashboardLayout.vue';
</script>

<template>
  <DashboardLayout>
    <Breadcrumb 
      title="Tournament Tier 1"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Tournament' },
        { name: 'Tier 1' }
      ]"
    />
  </DashboardLayout>
</template>