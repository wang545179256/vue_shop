<template>
	<div>
		<h2 align="center">Welcome</h2>
		<h3 class="medium">{{ item }}</h3>
		<el-carousel :interval="4000" type="card" height="400px">
			<el-carousel-item v-for="item in imagesbox" :key="item.id">
				<img :src="item.idView">
			</el-carousel-item>
		</el-carousel>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				imagesbox: [{
						id: 0,
						idView: require("../assets/welcom (1).jpg")
					}, {
						id: 1,
						idView: require("../assets/welcom (2).jpg")
					},

					{
						id: 2,
						idView: require("../assets/welcom (3).jpg")
					},
					{
						id: 3,
						idView: require("../assets/welcom (4).jpg")
					},
					{
						id: 4,
						idView: require("../assets/welcom (5).jpg")
					},
					{
						id: 5,
						idView: require("../assets/welcom (6).jpg")
					}
				]
			}
		},
		methods: {

		},
		mounted() {}
	}
</script>

<style>
</style>
