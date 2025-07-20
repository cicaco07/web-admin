<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Data Hero'
  },
  imageSrc: {
    type: String,
    default: '/dist/images/breadcrumb/ChatBc.png'
  },
  items: {
    type: Array as () => Array<{ name: string; href?: string }>,
    default: () => [
      { name: '', href: '' },
    ]
  }
});
</script>

<template>
  <div class="card bg-light-info shadow-none position-relative overflow-hidden">
    <div class="card-body px-4 py-3">
      <div class="row align-items-center">
        <div class="col-9">
          <h4 class="fw-semibold mb-8">{{ title }}</h4>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li
                v-for="(item, index) in items"
                :key="index"
                class="breadcrumb-item"
                :aria-current="index === items.length - 1 ? 'page' : undefined"
              >
                <template v-if="item.href && index !== items.length - 1">
                  <a :href="item.href" class="text-muted">{{ item.name }}</a>
                </template>
                <template v-else>
                  {{ item.name }}
                </template>
              </li>
            </ol>
          </nav>
        </div>
        <div class="col-3">
          <div class="text-center mb-n5">
            <img :src="imageSrc" alt="" class="img-fluid mb-n4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>