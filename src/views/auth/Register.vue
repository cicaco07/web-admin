<script setup lang="ts">
import googleIcon from '/dist/images/svgs/google-icon.svg';
import AuthLayout from '../../components/Auth/AuthLayout.vue';
import { useAuthService } from '../../lib/service/AuthService';

const { email, password, name, loading, error, handleRegister } = useAuthService();

</script>

<template>
  <AuthLayout>
    <div class="row">
      <div class="col-12 mb-2 mb-sm-0">
        <a class="btn btn-white text-dark border fw-normal d-flex align-items-center justify-content-center rounded-2 py-8" href="javascript:void(0)" role="button">
          <img :src="googleIcon" alt="Google icon" class="img-fluid me-2" width="18" height="18">
          <span class="d-none d-sm-block me-1 flex-shrink-0">Sign Up with</span>Google
        </a>
      </div>
    </div>
    <div class="position-relative text-center my-4">
      <p class="mb-0 fs-4 px-3 d-inline-block bg-white z-index-5 position-relative">or sign Up with</p>
      <span class="border-top w-100 position-absolute top-50 start-50 translate-middle"></span>
    </div>
    <form @submit="handleRegister">
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">Name</label>
        <input type="text" class="form-control" id="exampleInputtext" aria-describedby="textHelp" v-model="name">
      </div>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">Email address</label>
        <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" v-model="email">
      </div>
      <div class="mb-4">
        <label for="exampleInputPassword1" class="form-label">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword1" v-model="password">
      </div>
      <button type="submit" class="btn btn-primary w-100 py-8 mb-4 rounded-2" :disabled="loading">{{ loading ? 'Signing Up...' : 'Sign Up' }}</button>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="d-flex align-items-center">
        <p class="fs-4 mb-0 text-dark">Already have an Account?</p>
        <a class="text-primary fw-medium ms-2" href="/login">Sign In</a>
      </div>
    </form>
  </AuthLayout>
                
              
</template>