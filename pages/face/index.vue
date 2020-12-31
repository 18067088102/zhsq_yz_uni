<template>
	<view>
		<view class="face_head">
			<image class="face_img" mode="aspectFill" :src="faceImgPath?faceImgUrl:'/static/mine/icon_avator.png'" @click="onPreviewTap"></image>
			<text class="face_title">已开通刷脸开门</text>
			<text class="face_detail">已成功开通刷脸开门 通过小区门禁</text>
		</view>
		<view class="line-view"></view>
		<view class="about_list">
			<view class="about_list_item solid-bottom" @click="onChangePhoto">
				<text class="title_text">更换照片</text>
				<image class="right_img" src="/static/mine/icon_mine_right.png"></image>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				faceImgPath: '',
				faceImgUrl: ''
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			var imgPath = uni.getStorageSync('data').faceImg
			this.faceImgPath = imgPath
			this.faceImgUrl = this.$common.combineImageUrl(imgPath)
		},
		methods: {
			onChangePhoto() {
				uni.navigateTo({
					url: '/pages/face/change',
				})
			},

			// 预览 preview
			onPreviewTap() {
				if (this.faceImgPath) {
					const tempFilePath = this.faceImgUrl
					uni.previewImage({
						current: tempFilePath, // 当前显示图片的http链接
						urls: [tempFilePath] // 需要预览的图片http链接列表
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.face_head {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 50rpx 0 40rpx;
	}

	.face_img {
		width: 186rpx;
		height: 186rpx;
		border-radius: 50%;
	}

	.face_title {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 70rpx;
		margin-top: 30rpx;
	}

	.face_detail {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 40rpx;
	}

	.about_list {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: 0 32rpx;
		background: #fff;
	}

	.about_list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 106rpx;
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
</style>
