<template>
	<view class="about_list">
		<view class="about_list_item" :class="index==0?'solid-bottom':''" v-for="(item, index) in listItem" :key="index" @click="onSelectItem"
		 :data-index="index">
			<text class="title_text">{{item}}</text>
			<image class="right_img" src="/static/mine/icon_mine_right.png"></image>
		</view>
		<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				listItem: ['设置密码', '关于我们'],
				isLoading: false,
				buttonText: '退出登录',
				isDisable: false,
			}
		},
		methods: {
			onSelectItem(e) {
				const idx = e.currentTarget.dataset.index
				switch (idx) {
					case 0:
						uni.navigateTo({
							url: '/pages/register/index?fromID=2',
						})
						break;
					case 1:
						uni.navigateTo({
							url: '/pages/setting/aboutUs',
						})
						break;

					default:
						break;
				}
			},

			submitHandler() {
				this.onShowModal('您确定要退出登录吗?', '退出', '')
			},

			onShowModal(content, confirmText, url) {
				var that = this
				uni.showModal({
					content: content,
					cancelText: '关闭',
					cancelColor: '#797979',
					confirmText: confirmText,
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.isLoading = true
							that.buttonText = '退出中...'
							that.isDisable = true
							that.onLogoutRequest()
						}
					}
				})
			},

			async onLogoutRequest() {
				var that = this
				return await that.$http(that.$api.logoutUrl, {
					method: 'POST',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '退出登录'
					that.isDisable = false
					if (res.code == 200) {
						uni.removeStorageSync('token')
						uni.removeStorageSync('userId')
						uni.showToast({
							title: '退出成功',
							icon: 'none',
							success: (res) => {
								uni.navigateBack({
									delta: 1,
								})
							}
						})
					} else {
						uni.showToast({
							title: '退出失败，请重试',
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '退出登录'
					that.isDisable = false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.about_list {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background: #F6F8FA;
	}

	.about_list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 106rpx;
		padding: 0 32rpx;
		background: #fff;
	}

	.title_text {
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 42rpx;
	}

	.right_img {
		width: 15rpx;
		height: 24rpx;
	}

	.submit-btn {
		margin-top: 100rpx;
	}
</style>
