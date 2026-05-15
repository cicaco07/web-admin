<template>
  <div
    class="page-wrapper auth-shell"
    id="main-wrapper"
    data-layout="vertical"
    data-sidebartype="full"
    data-sidebar-position="fixed"
    data-header-position="fixed"
  >
    <div class="auth-frame">
      <section class="auth-visual" aria-label="Evernight admin overview">
        <div class="brand-lockup">
          <span class="brand-mark">E</span>
          <span>Evernight</span>
        </div>

        <div class="visual-copy">
          <p class="eyebrow">Admin Command Center</p>
          <h1>Manage the game data with calmer focus.</h1>
          <p class="visual-description">
            Keep heroes, items, drafts, builds, and tournament operations organized in one workspace.
          </p>
        </div>

        <div class="visual-card">
          <div>
            <span class="metric-label">Today's Workspace</span>
            <strong>Live Control</strong>
          </div>
          <div class="status-pill">
            <span></span>
            Secure
          </div>
        </div>

        <img
          class="auth-art"
          src="/dist/images/big/auth-bg.jpg"
          alt=""
          aria-hidden="true"
        >
      </section>

      <section class="auth-panel">
        <div class="auth-card">
          <div class="mobile-brand">
            <span class="brand-mark">E</span>
            <span>Evernight</span>
          </div>
          <slot />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background:
    linear-gradient(120deg, rgba(7, 14, 38, 0.94), rgba(16, 30, 71, 0.88) 46%, rgba(238, 244, 252, 0.96) 46.2%),
    #eef4fc;
  color: #17213a;
}

.auth-frame {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
  min-height: 100vh;
}

.auth-visual,
.auth-panel {
  position: relative;
  display: flex;
  min-height: 100vh;
}

.auth-visual {
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px clamp(32px, 5vw, 76px);
  color: #fff;
  isolation: isolate;
}

.auth-visual::before {
  position: absolute;
  inset: 0;
  z-index: -2;
  content: "";
  background:
    linear-gradient(135deg, rgba(8, 18, 49, 0.88), rgba(11, 27, 64, 0.74)),
    url("/dist/images/backgrounds/login-bg.svg") center / cover no-repeat;
}

.auth-visual::after {
  position: absolute;
  inset: auto -12% -22% 16%;
  z-index: -1;
  height: 44%;
  content: "";
  background: linear-gradient(100deg, rgba(53, 180, 255, 0.22), rgba(255, 186, 48, 0.18), rgba(255, 85, 132, 0.16));
  filter: blur(24px);
  transform: skewY(-9deg);
}

.brand-lockup,
.mobile-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 800;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2f6bff, #22c7d7 52%, #ffb02e);
  color: #fff;
  box-shadow: 0 16px 40px rgba(34, 126, 255, 0.34);
}

.visual-copy {
  width: min(560px, 100%);
  margin-block: auto;
}

.eyebrow {
  margin-bottom: 16px;
  color: #7dd8ff;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.visual-copy h1 {
  max-width: 620px;
  margin-bottom: 18px;
  color: #fff;
  font-size: clamp(40px, 5vw, 68px);
  font-weight: 800;
  line-height: 1.02;
}

.visual-description {
  max-width: 520px;
  margin-bottom: 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 17px;
  line-height: 1.7;
}

.visual-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(440px, 100%);
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(14px);
}

.metric-label {
  display: block;
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.visual-card strong {
  color: #fff;
  font-size: 20px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  border-radius: 8px;
  background: rgba(23, 213, 146, 0.14);
  color: #96ffd7;
  font-size: 13px;
  font-weight: 800;
}

.status-pill span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28e59e;
  box-shadow: 0 0 0 6px rgba(40, 229, 158, 0.14);
}

.auth-art {
  position: absolute;
  right: -120px;
  bottom: -110px;
  z-index: -1;
  width: min(760px, 78%);
  opacity: 0.34;
  mix-blend-mode: screen;
}

.auth-panel {
  align-items: center;
  justify-content: center;
  padding: 42px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(244, 248, 255, 0.96)),
    url("/dist/images/big/auth-bg2.jpg") left bottom / 56% auto no-repeat;
}

.auth-card {
  width: min(100%, 470px);
  padding: clamp(28px, 4vw, 42px);
  border: 1px solid rgba(144, 163, 191, 0.28);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 34px 90px rgba(31, 53, 94, 0.18);
  backdrop-filter: blur(18px);
}

.mobile-brand {
  display: none;
  margin-bottom: 30px;
}

@media (max-width: 991.98px) {
  .auth-shell {
    background: #eef4fc;
  }

  .auth-frame {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    display: none;
  }

  .auth-panel {
    min-height: 100vh;
    padding: 24px;
    background:
      linear-gradient(180deg, rgba(246, 250, 255, 0.88), rgba(255, 255, 255, 0.94)),
      url("/dist/images/backgrounds/login-bg.svg") center / cover no-repeat;
  }

  .mobile-brand {
    display: inline-flex;
  }
}

@media (max-width: 575.98px) {
  .auth-panel {
    align-items: stretch;
    padding: 16px;
  }

  .auth-card {
    align-self: center;
    padding: 24px;
  }
}
</style>
