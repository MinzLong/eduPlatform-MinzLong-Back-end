import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/HomePage.vue';
import CourseDetails from './components/CourseDetails.vue';
import CoursesPage from './components/CoursesPage.vue';
import LoginPage from './components/LoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';

const routes = [
  { path: '/', component: HomePage, name: 'HomePage' },
  { path: '/course/:title', component: CourseDetails, name: 'CourseDetails', props: true },
  { path: '/courses', component: CoursesPage, props: true },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
