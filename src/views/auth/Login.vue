<script setup lang="ts">
import googleIcon from '/dist/images/svgs/google-icon.svg';
import AuthLayout from '../../components/Auth/AuthLayout.vue';
import { useAuthService } from '../../lib/service/AuthService';

const { email, password, loading, error, handleLogin } = useAuthService();
</script>

<template>
  <AuthLayout>
    <div class="login-heading">
      <span class="login-kicker">Welcome back</span>
      <h2>Sign in to Evernight</h2>
      <p>Use your admin account to continue.</p>
    </div>

    <div class="social-login">
      <a class="google-button" href="javascript:void(0)" role="button">
        <img :src="googleIcon" alt="Google icon" width="20" height="20">
        <span>Sign in with Google</span>
      </a>
    </div>

    <div class="auth-divider">
      <span>or continue with email</span>
    </div>

    <form class="login-form" @submit="handleLogin">
      <div class="form-field">
        <label for="exampleInputEmail1" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="admin@evernight.com"
          v-model="email"
          required
        >
      </div>

      <div class="form-field">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input
          type="password"
          class="form-control"
          id="exampleInputPassword1"
          placeholder="Enter your password"
          v-model="password"
          required
        >
      </div>

      <div class="login-options">
        <div class="form-check remember-check">
          <input class="form-check-input primary" type="checkbox" value="" id="flexCheckChecked" checked>
          <label class="form-check-label text-dark" for="flexCheckChecked">
            Remember this device
          </label>
        </div>
        <a class="forgot-link" href="./authentication-forgot-password.html">Forgot password?</a>
      </div>

      <button
        type="submit"
        class="submit-button"
        :disabled="loading"
      >
        <span v-if="loading">Signing In...</span>
        <span v-else>Sign In</span>
      </button>

      <div v-if="error" class="alert alert-danger auth-alert">{{ error }}</div>

      <div class="register-row">
        <p>New to Evernight?</p>
        <a href="/register">Create an account</a>
      </div>
    </form>
  </AuthLayout>             
</template>

<style scoped>
.login-heading {
  margin-bottom: 26px;
}

.login-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: #2f6bff;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.login-heading h2 {
  margin-bottom: 8px;
  color: #101b36;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.18;
}

.login-heading p {
  margin-bottom: 0;
  color: #69758f;
  font-size: 15px;
}

.social-login {
  margin-bottom: 24px;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  border: 1px solid #dce5f1;
  border-radius: 8px;
  background: #fff;
  color: #15213a;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(42, 63, 105, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.google-button:hover {
  border-color: #b8c7df;
  color: #15213a;
  box-shadow: 0 16px 34px rgba(42, 63, 105, 0.13);
  transform: translateY(-1px);
}

.auth-divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  color: #7a859b;
  font-size: 13px;
  font-weight: 700;
}

.auth-divider::before {
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  content: "";
  background: #e6edf6;
}

.auth-divider span {
  position: relative;
  padding-inline: 14px;
  background: rgba(255, 255, 255, 0.96);
}

.login-form {
  display: grid;
  gap: 18px;
}

.form-field {
  display: grid;
  gap: 8px;
}

.form-label {
  margin-bottom: 0;
  color: #24304b;
  font-size: 14px;
  font-weight: 800;
}

.form-control {
  min-height: 48px;
  border: 1px solid #d7e1ef;
  border-radius: 8px;
  background: #f9fbff;
  color: #13213a;
  font-size: 15px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.form-control::placeholder {
  color: #9aa7bd;
}

.form-control:focus {
  border-color: #2f6bff;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(47, 107, 255, 0.12);
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 2px;
}

.remember-check {
  display: flex;
  align-items: center;
  min-height: 22px;
  margin-bottom: 0;
}

.remember-check .form-check-input {
  width: 18px;
  height: 18px;
  margin-top: 0;
  border-color: #bac8dd;
  border-radius: 5px;
}

.remember-check .form-check-input:checked {
  background-color: #2f6bff;
  border-color: #2f6bff;
}

.remember-check .form-check-label {
  color: #4b5872;
  font-size: 14px;
}

.forgot-link,
.register-row a {
  color: #2f6bff;
  font-weight: 800;
}

.forgot-link:hover,
.register-row a:hover {
  color: #174dd4;
}

.submit-button {
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2f6bff, #19b8d2);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 18px 36px rgba(47, 107, 255, 0.28);
  transition: box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  box-shadow: 0 22px 44px rgba(47, 107, 255, 0.34);
  transform: translateY(-1px);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.auth-alert {
  margin-bottom: 0;
  border-radius: 8px;
}

.register-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 2px;
}

.register-row p {
  margin-bottom: 0;
  color: #66728a;
  font-weight: 700;
}

@media (max-width: 575.98px) {
  .login-heading h2 {
    font-size: 26px;
  }

  .login-options,
  .register-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
