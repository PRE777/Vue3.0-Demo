import Vue from 'vue'
import Router from 'vue-router'
import HomePage from "../src/components/views/HomePage";

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'HomePage',
        component: HomePage
    }]
})