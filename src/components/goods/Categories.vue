<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/categories' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<el-row>
				<el-col>
					<!-- 添加角色按钮区域 -->
					<el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
				</el-col>
			</el-row>
			<!-- 表格区域 -->
			<tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text=""
			 border :show-row-hover="false">
				<!-- 是否有效 -->
				<template v-slot:isok="scope">
					<i class="el-icon-success" style="color:lightgreen;" v-if="scope.row.cat_deleted === false"></i>
					<i class="el-icon-error" style="color:red;" v-else></i>
				</template>
				<!-- 排序模板 -->
				<template v-slot:order="scope">
					<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
					<el-tag size="mini" type="warning" v-else>三级</el-tag>
				</template>
				<!-- 操作模板 -->
				<template v-slot:opt="scope">
					<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
				</template>
			</tree-table>
			</el-table>
			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			 :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
			 :total="total">
			</el-pagination>
		</el-card>
		<!-- 添加分类的对话框 -->
		<el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
			<!-- 添加分类表单 -->
			<el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
				<el-form-item label="分类名称:" prop="cat_name">
					<el-input v-model="addCateForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类名称:">
					<!-- 级联选择器，option用来指定数据源 -->
					<el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange"
					 clearable></el-cascader>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addCateDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 编辑分类对话框 -->
		<el-dialog title="编辑分类" :visible.sync="editCateDialogVisble" width="50%" >
			<el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="70px">
				<el-form-item label="分类名称">
					<el-input v-model="editCateForm.cat_name" prop="cat_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editCateDialogVisble = false">取 消</el-button>
				<el-button type="primary" @click="editCateInfo">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				queryInfo: {
					//查询条件保存
					type: 3,
					pagenum: 1,
					pagesize: 5
				},
				//商品分类列表
				cateList: [],
				// 总数据条数
				total: 0,
				columns: [{
						label: '分类名称',
						prop: 'cat_name',
						width: '400px',
					},
					{
						label: '是否有效',
						//表示将当前列定义为模板列
						type: 'template',
						//表示当前这一模板列的名称
						template: 'isok',
					},
					{
						label: '排序',
						type: 'template',
						template: 'order',
					},
					{
						label: '操作',
						type: 'template',
						template: 'opt',
					},
				],
				// 控制添加分类对话框的显示与隐藏
				addCateDialogVisible: false,
				// 添加分类的表单数据对象
				addCateForm: {
				//将要添加的分类的名称
				cat_name: '',
				// 父级分类的id
				cat_pid: 0,
				//当前分类的等级，默认要添加一级分类
				cat_level: 0,
				},
				// 添加分类表单的验证规则对象
				addCateFormRules: {
					cat_name: [{
						required: true,
						message: '请输入分类名称',
						trigger: 'blur'
					}]
				},
				parentCateList: [],
				// 指定级联选择器的数据对象
				cascaderProps: {
					value: 'cat_id',
					label: 'cat_name',
					children: 'children',
					expandTrigger: 'hover',
					checkStrictly: true
				},
				// 选中的父级分类的id数组
				selectedKeys: [],
				//编辑分类对话框的显示与隐藏
				editCateDialogVisble:false,
				//查询要编辑分类的表单数据
				editCateForm: {},
				//编辑分类的文本框验证规则
				editCateFormRules:{
					cat_name: [{
						required: true,
						message: '请输入分类名称',
						trigger: 'blur'
					}]
				}
			}
		},
		created() {
			//获取商品分类数据列表
			this.getCateList()
		},
		methods: {
			//获取商品分类数据
			async getCateList() {
				const {
					data: res
				} = await this.$http.get('categories', {
					params: this.queryInfo
				})

				if (res.meta.status !== 200) {
					return this.$message.error('获取商品信息失败...')
				}
				// console.log(res.data)
				//把数据列表保存到cateList中
				this.cateList = res.data.result
				//为总数据条数赋值
				this.total = res.data.total
			},

			// 监听pagesize改变的时间
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getCateList()
			},
			// 监听pagenum的改变
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage
				this.getCateList()
			},
			//点击按钮展示添加分类对话框
			showAddCateDialog() {
				//先获取父级分类数据列表
				this.getParetCateList()
				//再展示对话框
				this.addCateDialogVisible = true
			},
			// 获取父级分类的数据列表
			async getParetCateList() {
				const {
					data: res
				} = await this.$http.get('categories', {
					params: {
						type: 2
					}
				})
				if (res.meta.status !== 200) {
					return this.$message.error('获取父级分类失败！')
				}
				// console.log(res.data)
				this.parentCateList = res.data
			},
			//选择项发生改变触发这个函数
			parentCateChange() {
				console.log(this.selectedKeys)
				//如果selectedKeys数据中的length大于0，证明选中了父级分类
				if (this.selectedKeys.length > 0) {
					// 父级分类的ID
					this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1]
					//为当前分类的等级赋值
					this.addCateForm.cat_level = this.selectedKeys.length
					return
				} else {
					// 父级分类的ID
					this.addCateForm.cat_pid = 0
					//当前分类的等级
					this.addCateForm.cat_level = 0
				}
			},
			// 点击按钮添加新的分类
			addCate() {
				// console.log(this.addCateForm)
				this.$refs.addCateFormRef.validate(async valid => {
					if(!valid) return
					const {data:res} = await this.$http.post(`categories`,this.addCateForm)
					if(res.meta.status !== 201) {
						return this.$message.error('添加分类失败！')
					}
					
					this.$message.success('添加分类成功！')
					this.getCateList()
					this.addCateDialogVisible = false
				})
			},
			// 监听对话框的关闭事件
			addCateDialogClosed(){
				this.$refs.addCateFormRef.resetFields()
				this.selectedKeys = []
				this.addCateForm.cat_level = 0
				this.addCateForm.cat_pid = 0
			},
			//展示编辑用户的对话框
			async showEditCateDialog(cat_id) {
				const {
					data: res
				} = await this.$http.get('categories/' + cat_id)
				
					console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('查询此分类信息失败！')
				}
				this.editCateForm = res.data
				this.editCateDialogVisble = true
			},
			// 监听编辑分类对话框确定与关闭事件
			editCateInfo(){
				this.$refs.editCateFormRef.validate(async valid => {
					// console.log(valid)
					if (!valid) return
					//发起修改用户信息的数据请求
					const {
						data: res
					} = await this.$http.put('categories/' + this.editCateForm.cat_id, {
						cat_name: this.editCateForm.cat_name,
					})
					// console.log(res)
					if (res.meta.status !== 200) {
						return this.$message.error('更新商品信息失败！')
					}
					//关闭对话框
					this.editCateDialogVisble = false
					//刷新数据列表
					this.getCateList()
					//显示修改成功
					this.$message.success('用户商品信息修改成功！')
				})
			},
			async removeCateById(cat_id) {
				// console.log(id)
				const confirmResult = await this.$confirm('此操作将永久删除该角色信息, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)
				//如果用户确认删除，则返回字符串confirm
				// 如果用户取消删除，则返回字符串cancel
				// console.log(confirmResult)
				if (confirmResult !== 'confirm') {
					return this.$message.info('删除操作已取消！')
				}
				// console.log('确认了删除！')
				const {
					data: res
				} = await this.$http.delete('categories/' + cat_id)
				if (res.meta.status !== 200) {
					return this.$message.error('删除角色信息失败！')
				}
				this.$message.success('删除角色信息成功！')
				this.getCateList()
			},
		}
	}
</script>

<style>
	.el-cascader {
		width: 100%;
	}
</style>
