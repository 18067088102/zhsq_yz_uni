<template>
	<view class='login-container'>
		<!-- 昵称 -->
		<view class='phone-view common-view'>
			<input class='login-input' :value="nickName" @input="getValue" data-id="nickName" maxlength='15' placeholder='请输入昵称'
			 placeholder-class='placeholder'></input>
		</view>
		<!-- 修改按钮 -->
		<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLoading: false,
				buttonText: '修改',
				isDisable: true,
				nickName: ""
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad() {
			this.nickName = uni.getStorageSync('data').nickname
			this.validateEmpty()
		},
		methods: {
			getValue(e) {
				let type = e.currentTarget.dataset.id
				if (type == 'nickName') {
					this.nickName = e.detail.value.replace(/\s+/g, '')
				}
				this.validateEmpty()
			},

			validateEmpty() {
				if (this.nickName == '') {
					this.isDisable = true
				} else {
					this.isDisable = false
				}
			},

			submitHandler() {
				if (this.nickName.length == 0) {
					uni.showToast({
						title: '昵称不能为空',
						icon: 'none'
					})
					return
				}
				this.isLoading = true
				this.buttonText = '修改中...'
				this.isDisable = true
				this.onChangeNickNameRequest()
			},

			async onChangeNickNameRequest() {
				var that = this
				return await that.$http(that.$api.setNickNameUrl +
					`?id=${uni.getStorageSync('data').id}&nickName=${that.nickName}`, {
						method: 'PUT',
						data: {},
						token: uni.getStorageSync('token')
					}).then(res => {
					that.isLoading = false
					that.buttonText = '修改'
					that.isDisable = false
					if (res.code == 200) {
						var pages = getCurrentPages();
						var currPage = pages[pages.length - 1]; //当前页面
						var prevPage = pages[pages.length - 2];
						prevPage.$vm.listItems[1].detail_text = that.nickName
						uni.showToast({
							title: '修改成功',
							icon: 'none',
							success: (res) => {
								uni.navigateBack({
									delta: 1
								});
							}
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '修改'
					that.isDisable = false
				})
			}
		}
	}
</script>

<style>
	@import "../../common/css/fr.css";
</style>
