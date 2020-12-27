import Vue from 'vue'
import App from './App'
import http from '@/common/http-promise.js'
import api from '@/common/api.js'
import common from '@/common/common.js'

Vue.config.productionTip = false

Vue.prototype.$http = http
Vue.prototype.$api = api
Vue.prototype.$common = common

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
