import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLogin, useLogout, useRegister } from '../api/AuthApi';

export function useAuthService() {
  const router = useRouter();

  // State untuk form
  const email = ref('');
  const password = ref('');
  const name = ref('');
  const loading = ref(false);
  const error = ref('');

  // Panggil composable dari AuthApi
  const { login: loginMutation, onDone: onLoginDone, onError: onLoginError } = useLogin();
  const { register: registerMutation, onDone: onRegisterDone, onError: onRegisterError } = useRegister();
  const { logout: logoutMutation } = useLogout();

  // Fungsi untuk menangani login
  const handleLogin = async (e: Event) => {
    if (e) e.preventDefault();
    loading.value = true;
    error.value = '';
    try {
      await loginMutation({ email: email.value, password: password.value });
    } catch (err) {
      error.value = 'Network error';
      loading.value = false;
    }
  };

  // Fungsi untuk menangani register
  const handleRegister = async (e: Event) => {
    if (e) e.preventDefault();
    loading.value = true;
    error.value = '';
    try {
      await registerMutation({ email: email.value, name: name.value, password: password.value });
    } catch (err) {
      error.value = 'Network error';
      loading.value = false;
    }
  };

  // Fungsi untuk menangani logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await logoutMutation();
      }
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  // Penanganan hasil mutasi (onDone)
  onLoginDone((result) => {
    const { login: loginData } = result.data;
    if (loginData && loginData.access_token) {
      localStorage.setItem('token', loginData.access_token);
      router.push('/dashboard');
    }
    loading.value = false;
  });

  onRegisterDone((result) => {
    const { register: registerData } = result.data;
    if (registerData && registerData.access_token) {
      localStorage.setItem('token', registerData.access_token);
      router.push('/dashboard');
    }
    loading.value = false;
  });

  // Penanganan error mutasi (onError)
  onLoginError((err) => {
    error.value = err.message || 'Login failed';
    loading.value = false;
  });

  onRegisterError((err) => {
    error.value = err.message || 'Registration failed';
    loading.value = false;
  });

  // Mengembalikan semua state dan fungsi yang dibutuhkan
  return {
    email,
    password,
    name,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}