import Vue from 'vue'
import Vuex from "vuex";
Vue.use(Vuex);

const login = {
    namespaced: true, // 避免存在相同属性
    state: {
        loginState: false,
    },
    getters: {
        getLoginState(state) {
            return state.loginState
        }
    },
    mutations: {
        // 一般不会外部调用
        setLoginState(state, newVal) {
            state.loginState = newVal
        }
    },
    actions: {
        changeStateFun(context, newVal) {
            context.commit('setLoginState', newVal)
        }
    },
};
// 区分模块
const displayMode = {
    namespaced: true, // 避免存在相同属性
    state: {
        displayType: 0,
        year: "",
    },
    getters: {
        getDisplayType(state) {
            return state.displayType;
        },
        getYear(state) {
            return state.year;
        }
    },
    mutations: {
        // 一般不会外部调用
        setDisplayType(state, newVal) {
            state.displayType = newVal;
        },
        setYear(state, newVal) {
            state.year = newVal;
        }

    },
    actions: {
        /**
         * 
         * @param {*} context 
         * @param {*} newVal 新值
         * @param {string} funName mutations中的函数名，例如：setDisplayType,setYear
         */
        changeStateFun(context, { newVal, funName }) {
            context.commit(funName, newVal);
        }
    },
};

export default new Vuex.Store({
    modules: {
        login,
        displayMode,
    }
    // state,
    // getters,
    // mutations,
    // actions
});
/**
 * 用法
 * this.$store.getters['login/getLoginState']; // 取值
 * this.$store.getters['getLoginState']; // 取值
 * this.$store.dispatch('login/changeStateFun',true);// 赋值 
 * this.$store.dispatch("displayMode/changeStateFun",{newVal:year,funName:"setYear"});

 */