import {createApp} from 'vue';
import {createPinia} from 'pinia';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import {createVuetify} from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@/assets/css/controlbar.css';
import '@/assets/css/sidebar.css';

import App from './App.vue';

createApp(App).use(createPinia()).use(createVuetify({components, directives})).mount('#app');
