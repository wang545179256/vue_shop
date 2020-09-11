<template>
	<div>
		<!-- 面包屑导航区域 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图 -->
		<el-card>
			<el-row>
				<el-col>
					<!-- 添加角色按钮区域 -->
					<el-button type="primary" @click="addDialogVisble = true">添加角色</el-button>
				</el-col>
				<!-- 角色列表区域 -->
				<el-table :data="roleList" border stripe>
					<!-- 展开列 -->
					<el-table-column type="expand">
						<template v-slot="scope">
							<el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
								<!-- 渲染一级权限 -->
								<el-col :span="5">
									<el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
									<i class="el-icon-caret-right"></i>
								</el-col>
								<!-- 渲染二级和三级权限 -->
								<el-col :span="19">
									<!-- 通过for循环嵌套渲染二级权限 -->
									<el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
										<el-col :span="6">
											<el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
											<i class="el-icon-caret-right"></i>
										</el-col>
										<el-col :span="18">
											<el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
												{{item3.authName}}
											</el-tag>
										</el-col>
									</el-row>
								</el-col>
							</el-row>
							<!-- <pre>
								{{scope.row}}
							</pre> -->
						</template>
					</el-table-column>
					<!-- 索引列 -->
					<el-table-column type="index"></el-table-column>
					<el-table-column label="角色名称" min-width="100px" prop="roleName"></el-table-column>
					<el-table-column label="角色描述" min-width="100px" prop="roleDesc"></el-table-column>
					<el-table-column label="操作" width="300px">
						<template v-slot="scope">
							<!-- 编辑按钮 -->
							<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
							<!-- 删除按钮 -->
							<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">删除</el-button>
							<!-- 分配权限按钮 -->
							<el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-row>
		</el-card>
		<!-- 添加角色对话框 -->
		<el-dialog title="添加角色" :visible.sync="addDialogVisble" width="50%" @close="addDialogClose">
			<!-- 内容主体区域 -->
			<el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef" label-width="100px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="addRolesForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="addRolesForm.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<!-- 底部区域 -->
			<span slot="footer">
				<el-button @click="addDialogVisble = false">取 消</el-button>
				<el-button type="primary" @click="addRoles">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 修改用户的对话框 -->
		<el-dialog title="修改用户" :visible.sync="editDialogVisble" width="50%" @close="editDialogClosed">
			<el-form :model="editRolesForm" :rules="editRolesFormRules" ref="editRolesFormRef" label-width="100px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="editRolesForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色名称" prop="roleDesc">
					<el-input v-model="editRolesForm.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisble = false">取 消</el-button>
				<el-button type="primary" @click="editRolesinfo">确 定</el-button>
			</span>
		</el-dialog>
		<!-- 分配权限对话框 -->
		<el-dialog title="提示" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose">
			<!-- 树形控件 -->
			<el-tree ref="treeRef" :data="rightsList" :props="treeProps" show-checkbox node-key="id"  default-expand-all :default-checked-keys="defKeys"></el-tree>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRightDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				//角色列表
				roleList: [],
				//控制隐藏对话框的显示
				addDialogVisble: false,
				//添加角色的表单数据
				addRolesForm: {
					roleName: '',
					roleDesc: '',
				},
				addRolesFormRules: {
					roleName: [{
						required: true,
						message: '请输入您的角色名称',
						trigger: 'blur'
					}],
					roleDesc: [{
						required: true,
						message: '请输入您的角色描述',
						trigger: 'blur'
					}]
				},
				// 控制修改用户对话框的显示与隐藏
				editDialogVisble: false,
				//查询到的用户信息对象
				editRolesForm: {},
				editRolesFormRules: {
					roleName: [{
						required: true,
						message: '请输入您的角色名称',
						trigger: 'blur'
					}],
					roleDesc: [{
						required: true,
						message: '请输入您的角色描述',
						trigger: 'blur'
					}]
				},
				//控制分配权限对话框的显示与隐藏
				setRightDialogVisible:false,
				// 所有权限数据
				rightsList:[],
				// 树形控件属性绑定对象
				treeProps:{
					label:'authName',
					children:'children'
				},
				// 默认选中的节点ID值的数组
				defKeys:[],
				//当前即将分配权限的角色id
				roleId:''
			}
		},
		created() {
			//获取所有角色列表
			this.getRolesList()
		},
		methods: {
			async getRolesList() {
				const {
					data: res
				} = await this.$http.get('roles')
				if (res.meta.status !== 200) {
					return this.$message.error('获取角色列表失败！')
				}

				this.roleList = res.data
				// console.log(this.roleList)
			},
			//监听添加用户对话框的关闭事件
			addDialogClose() {
				this.$refs.addRolesFormRef.resetFields()
			},
			//点击确定进行表单预校验
			addRoles() {
				this.$refs.addRolesFormRef.validate(async valida => {
					if (!valida) return
					//验证通过，可以发起网络请求
					const {
						data: res
					} = await this.$http.post('roles', this.addRolesForm)
					console.log(res)
					if (res.meta.status !== 201) {
						return this.$message.error('添加角色信息失败！')
					}
					this.$message.success('添加角色信息成功！')
					//隐藏添加用户对话框
					this.addDialogVisble = false
					//重新获取用户的列表
					this.getRolesList()
				})
			},
			//展示编辑用户的对话框
			async showEditDialog(id) {
				// console.log(id)
				const {
					data: res
				} = await this.$http.get('roles/' + id)
				console.log(res)
				if (res.meta.status !== 200) {
					return this.$message.error('查询角色信息失失败！')
				}
				this.editRolesForm = res.data
				this.editDialogVisble = true
			},
			// 监听修改用户对话框的关闭事件
			editDialogClosed() {
				this.$refs.editRolesFormRef.resetFields()
			},
			editRolesinfo() {
				this.$refs.editRolesFormRef.validate(async valid => {
					// console.log(valid)
					if (!valid) return
					//发起修改用户信息的数据请求
					const {
						data: res
					} = await this.$http.put('roles/' + this.editRolesForm.roleId, {
						roleName: this.editRolesForm.roleName,
						roleDesc: this.editRolesForm.roleDesc
					})
					// console.log(res)
					if (res.meta.status !== 200) {
						return this.$message.error('更新用户信息失败！')
					}
					//关闭对话框
					this.editDialogVisble = false
					//刷新数据列表
					this.getRolesList()
					//显示修改成功
					this.$message.success('用户信息修改成功！')
				})
			},
			// 根据id删除对应的用户id
			async removeUserById(id) {
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
				} = await this.$http.delete('roles/' + id)
				if (res.meta.status !== 200) {
					return this.$message.error('删除角色信息失败！')
				}
				this.$message.success('删除角色信息成功！')
				this.getRolesList()
			},
			// 根据ID删除对应的权限
			async removeRightById(role, rightId) {
				//弹框提示用户是否要删除
				const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).catch(err => err)

				if (confirmResult !== 'confirm') {
					return this.$message.info('取消了删除...')
				}
				const {
					data: res
				} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
				if (res.meta.status !== 200) {
					return this.$message.error('删除权限失败！')
				}
				// this.getRolesList()
				role.children = res.data
				this.$message.success('删除权限成功！')
			},
			// 展示分配权限的对话框
			async showSetRightDialog(role) {
				this.roleId = role.id
				//获取所有权限的数据
				const {data:res} = await this.$http.get('rights/tree')
				if(res.meta.status !== 200){
					return this.$message.error('获取权限数据失败！')
				}
				//把获取到的权限数据保存到data中
				this.rightsList  = res.data
				console.log(this.rightsList)
				
				// 递归获取三级节点的id
				this.getLeafKeys(role,this.defKeys)
				
				this.setRightDialogVisible = true
			},
			//通过递归的形式获取当前角色下三级权限的id值，并保存到defKrys数组中
			getLeafKeys(node,arr){
				//如果当前node节点不包含childre属性，则是3级节点
				if(!node.children){
					return arr.push(node.id)
				}
				
				node.children.forEach(item =>
				this.getLeafKeys(item,arr)
				)
			},
			//监听分配权限对话框的关闭事件
			setRightDialogClose(){
				this.defKeys = []
			},
			//点击为角色分配权限
			async allotRights(){
				const keys = [
					...this.$refs.treeRef.getCheckedKeys(),
					...this.$refs.treeRef.getHalfCheckedKeys()
				]
				const idStr = keys.join(',')
				
				const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
				if(res.meta.status !== 200){
					return this.$message.error('分配权限失败哦~')
				}
				
				this.$message.success('分配权限成功！！！')
				this.getRolesList()
				this.setRightDialogVisible = false
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	.el-tag {
		margin: 7px;
	}

	.bdtop {
		border-top: 1px solid #eee;
	}

	.bdbottom {
		border-bottom: 1px solid #eee;
	}

	.vcenter {
		display: flex;
		align-items: center;
	}
</style>
