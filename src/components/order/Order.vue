<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>订单管理</el-breadcrumb-item>
			<el-breadcrumb-item>订单列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<el-row>
				<el-col :span="8">
					<!-- 订单搜索输入框 -->
					<el-input class="selectInput" placeholder="请输入内容">
					    <el-button slot="append" icon="el-icon-search"></el-button>
					  </el-input>
				</el-col>
			</el-row>
			<!-- 订单列表表格 -->
			<el-table :data='orderlist'  border stripe>
				<el-table-column type="index"></el-table-column>
				<el-table-column label="订单编号" prop="order_number" width="600px"></el-table-column>
				<el-table-column label="订单价格" prop="order_price"></el-table-column>
				<el-table-column label="是否付款" prop="pay_status">
					<template v-slot="scope">
						<el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
						<el-tag type="danger" v-else>未付款</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="是否发货" prop="is_send"></el-table-column>
				<el-table-column label="下单时间" prop="pay_status" width="200px">
					<template v-slot="scope">
						{{scope.row.create_time | dateFormat}}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150px">
					<template v-slot="scope">
						<el-button type="primary"  icon="el-icon-edit" size="mini" @click="showBox"></el-button>
						<el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页效果 -->
			 <el-pagination
			      @size-change="handleSizeChange"
			      @current-change="handleCurrentChange"
			      :current-page="queryInfo.pagenum"
			      :page-sizes="[5,10,15]"
			      :page-size="queryInfo.pagesize"
			      layout="total, sizes, prev, pager, next, jumper"
			      :total="total" background>
			    </el-pagination>
		</el-card>
		<!-- 修改地址对话框 -->
		<el-dialog
		  title="修改订单地址"
		  :visible.sync="addressDialogVisible"
		  width="50%" @close="addressDialogClosed">
		  <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
		    <el-form-item label="省市区/县" prop="address1">
		      <el-cascader :options="cityDate" v-model="addressForm.address1"></el-cascader>
		    </el-form-item>
			<el-form-item label="详细地址" prop="address2">
			  <el-input v-model="addressForm.address2"></el-input>
			</el-form-item>
		</el-form>
		  <span slot="footer" class="dialog-footer">
		    <el-button @click="addressDialogVisible = false">取 消</el-button>
		    <el-button type="primary" @click="editAddress">确 定</el-button>
		  </span>
		</el-dialog>
		<!-- 展示物流进度的对话框 -->
		<el-dialog
		  title="物流进度"
		  :visible.sync="progressVisible"
		  width="50%">
		  <!-- 物流信息时间线 -->
		   <el-timeline>
		       <el-timeline-item
		         v-for="(progressInfo, index) in activities"
		         :key="index"
		         :timestamp="activities.time">
		         {{activities.context}}
		       </el-timeline-item>
		     </el-timeline>
		</el-dialog>
	</div>
</template>

<script>
	import cityDate from './citydata.js'
	export default {
		data(){
			return{
				queryInfo:{
					query:'',
					pagenum:1,
					pagesize:10,
				},
				total:0,
				orderlist:[],
				addressDialogVisible:false,
				addressForm:{
					address1:[],
					address2:'',
				},
				addressFormRules:{
					address1:[
						{required: true,
						message: '选择省市区/县',
						trigger: 'blur'}
					],
					address2:[
						{required: true,
						message: '请输入详细地址',
						trigger: 'blur'}
					]
				},
				cityDate,
				progressVisible:false,
				progressInfo:[]
			}
		},
		created(){
			this.getOrderList()
		},
		methods:{
			async getOrderList(){
				const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
				if(res.meta.status !== 200){
					return this.$message.error('订单列表获取失败...')
				}
				
				// console.log(res)
				this.total = res.data.total
				this.orderlist = res.data.goods
			},
			handleSizeChange(newSize){
				this.queryInfo.pagesize = newSize
				this.getOrderList()
			},
			handleCurrentChange(newPage){
				this.queryInfo.pagenum = newPage
				this.getOrderList()
			},
			//展示修改地址对话框
			showBox(){
				this.addressDialogVisible = true
			},
			addressDialogClosed(){
				this.$refs.addressFormRef.resetFields()
			},
			// 修改地址对话框确定按钮的功能
			editAddress(){
				console.log(this.addressForm)
				if(this.addressForm.address2 === '' || this.addressForm.address1.length <= 1){
					return this.$message.error('请输入正确的地址信息...')
				}
				this.$message.success('修改地址成功！')
				this.getOrderList()
				this.addressDialogVisible = false
			},
			// 显示物流进度对话框
			async showProgressBox(){
				const {data:res} = await this.$http.get('/kuaidi/1106975712662')
				if(res.meta.status !== 200){
					return this.$message.error('获取物流信息失败...')
				}
				this.progressInfo = res.data
				this.progressVisible = true
				console.log(this.progressInfo)
			}
		}
	}
</script>

<style lang="less" scoped>
	
	@import '../../plugins/timeline/timeline.css';
	@import '../../plugins/timeline-item/timeline-item.css';
	
	.selectInput{
		width:500px;
	}
	.table-column-mid{
		width:100px;
	}
	
	.el-cascader{
		width: 100%;
	}
</style>
