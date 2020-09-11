<template>
	<div>
		<h2 align="center">Welcome</h2>
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
						idView: require("../assets/welcome1.jpg")
					}, {
						id: 1,
						idView: require("../assets/welcome2.jpg")
					},

					{
						id: 2,
						idView: require("../assets/welcome3.jpg")
					},
					{
						id: 3,
						idView: require("../assets/welcome4.jpg")
					},
					{
						id: 4,
						idView: require("../assets/welcome5.jpg")
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
