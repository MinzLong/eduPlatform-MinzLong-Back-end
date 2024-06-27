<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/">EduPlatform</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/courses">Courses</router-link>
            </li>
          </ul>
          <div v-if="user" class="d-flex">
            <span class="navbar-text me-3">Welcome, {{ user.email }}</span>
            <button class="btn btn-outline-secondary" @click="logout">Logout</button>
          </div>
          <div v-else class="d-flex">
            <router-link class="btn btn-outline-primary me-2" to="/login">Login</router-link>
            <router-link class="btn btn-outline-secondary" to="/register">Register</router-link>
          </div>
        </div>
      </div>
    </nav>
    <div class="container mt-4">
      <router-view :user="user" @login="login" @register="login"></router-view>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const user = ref(null);

    const login = (userData) => {
      user.value = userData;
    };

    const logout = () => {
      user.value = null;
    };

    return { user, login, logout };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
