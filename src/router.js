import Vue from 'vue'
import Router from 'vue-router'
import HomePage from "../src/views/HomePage";
import SecondPage from "../src/views/SecondPage";

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'HomePage',
        component: HomePage
    }, {
        path: '/secondPage',
        name: 'SecondPage',
        component: SecondPage
    }, ]
})