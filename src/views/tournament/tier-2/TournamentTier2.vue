<script setup lang="ts">
import DashboardLayout from '../../../components/DashboardLayout.vue';


</script>

<template>
  <DashboardLayout>
    <Breadcrumb 
      title="Tournament Tier 2"
      :items="[
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Tournament' },
        { name: 'Tier 2' }
      ]"
    />
  </DashboardLayout>
</template>