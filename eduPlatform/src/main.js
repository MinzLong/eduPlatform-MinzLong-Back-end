import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import focusDirective from './directives/focus';


const app = createApp(App);

app.directive('focus', focusDirective);
app.use(router);
app.mount('#app');
