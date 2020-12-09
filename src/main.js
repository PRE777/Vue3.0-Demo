import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import Bus from "./assets/js/tool/bus"
import ElementUI from 'element-ui'
import drag from "./assets/js/tool/drag";
import $ from 'jquery'

var Cesium = require('cesium/Cesium'); 
var widgets = require('cesium/Widgets/widgets.css');


window.$ = $;

Vue.prototype.Cesium = Cesium
Vue.prototype.widgets = widgets

Vue.config.productionTip = false
Vue.prototype.$bus = Bus;
Vue.use(ElementUI, { size: 'small', zIndex: 30000 });

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0OTcwMjNhMy00YjM0LTRiZDEtYTg4OC0yN2MzYzE4OTc0N2QiLCJpZCI6MzkzNjMsImlhdCI6MTYwNzQ5NDY0OX0.Exc3GIhxfnLy36_cHEczqrT-ZeBcvf6Kxk4p9Qj5zv0";



// 避免跳转统一路由报错
import Router from 'vue-router'
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
new Vue({
    render: h => h(App),
    router
}).$mount('#app')