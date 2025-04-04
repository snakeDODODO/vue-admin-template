import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.scss'
import 'element-plus/dist/index.css'
import router from './router'
import pinia from './stores'
import directives from './directives'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }

app.use(router)
app.use(pinia)
app.use(directives)

app.mount('#app')
