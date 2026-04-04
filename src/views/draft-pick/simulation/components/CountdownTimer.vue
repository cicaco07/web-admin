<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ seconds: number; maxSeconds: number }>();

const circumference = 2 * Math.PI * 45;
const dashOffset = computed(() => {
  if (props.maxSeconds === 0) return circumference;
  return circumference * (1 - props.seconds / props.maxSeconds);
});
const colorClass = computed(() => {
  const pct = (props.seconds / props.maxSeconds) * 100;
  if (pct > 50) return 'timer-green';
  if (pct > 25) return 'timer-yellow';
  return 'timer-red';
});
const isUrgent = computed(() => props.seconds <= 10);
</script>

<template>
  <div class="countdown-timer" :class="[colorClass, { urgent: isUrgent }]">
    <svg class="timer-ring" viewBox="0 0 100 100">
      <circle class="ring-bg" cx="50" cy="50" r="45" fill="none" stroke-width="5" />
      <circle class="ring-progress" cx="50" cy="50" r="45" fill="none" stroke-width="5"
        stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
        transform="rotate(-90 50 50)" />
    </svg>
    <div class="timer-value">{{ seconds }}</div>
  </div>
</template>

<style scoped>
.countdown-timer { position: relative; width: 68px; height: 68px; flex-shrink: 0; }
.timer-ring { width: 100%; height: 100%; }
.ring-bg { stroke: rgba(255,255,255,0.08); }
.ring-progress { transition: stroke-dashoffset 0.5s ease, stroke 0.5s ease; }
.timer-green .ring-progress { stroke: #4ade80; }
.timer-yellow .ring-progress { stroke: #facc15; }
.timer-red .ring-progress { stroke: #ef4444; }
.timer-value {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; color: #fff;
}
.timer-red .timer-value { color: #ef4444; }
.urgent .timer-value { animation: pulseUrgent 0.5s ease-in-out infinite; }
@keyframes pulseUrgent {
  0%,100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}
</style>
