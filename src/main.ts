import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import './assets/css/min.css'

import App from './App.vue'

createApp(App).use(createVuetify({ components, directives })).mount('#app')
