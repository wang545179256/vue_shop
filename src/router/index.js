import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Categories from '../components/goods/Categories.vue'
// import Params from '../components/goods/Params.vue'
// import GoodsList from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
// import Login from '../components/Login.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
// import Home from '../components/Home.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue')
// import Welcome from '../components/Welcome.vue'
const Users = () => import(/* webpackChunkName:"user" */ '../components/user/Users.vue')
// import Users from '../components/user/Users.vue'
const Rights = () => import(/* webpackChunkName:"power" */ '../components/power/Rights.vue')
// import Rights from '../components/power/Rights.vue'
const Roles = () => import(/* webpackChunkName:"power" */ '../components/power/Roles.vue')
// import Roles from '../components/power/Roles.vue'
const Categories = () => import(/* webpackChunkName:"goods" */ '../components/goods/Categories.vue')
// import Categories from '../components/goods/Categories.vue'
const Params = () => import(/* webpackChunkName:"goods" */ '../components/goods/Params.vue')
// import Params from '../components/goods/Params.vue'
const GoodsList = () => import(/* webpackChunkName:"goods" */ '../components/goods/List.vue')
// import GoodsList from '../components/goods/List.vue'
const Add = () => import(/* webpackChunkName:"goods" */ '../components/goods/Add.vue')
// import Add from '../components/goods/Add.vue'
const Order = () => import(/* webpackChunkName:"order" */ '../components/order/Order.vue')
// import Order from '../components/order/Order.vue'
const Report = () => import(/* webpackChunkName:"report" */ '../components/report/Report.vue')
// import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const router = new VueRouter({
	routes: [{
			path: '/',
			redirect: '/login'
		},
		{
			path: '/login',
			component: Login
		},
		{
			path: '/home',
			component: Home,
			redirect: '/welcome',
			children:[
				{path:'/welcome',component:Welcome},
				{path:'/users',component:Users},
				{path:'/rights',component:Rights},
				{path:'/roles',component:Roles},
				{path:'/categories',component:Categories},
				{path:'/params',component:Params},
				{path:'/goods',component:GoodsList},
				{path:'/goods/add',component:Add},
				{path:'/orders',component:Order},
				{path:'/reports',component:Report}
			]
		}
	]
})

export default router

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
	//to 代表将要访问的路径
	//from 代表从哪个路径跳转而来
	//next 是一个函数，表示放行方式
	// next（）放行   next('/login') 强制跳转

	if (to.path === '/login') return next();
	//获取token
	const tokenStr = window.sessionStorage.getItem('token')
	if (!tokenStr) return next('/login')
	next()
})
