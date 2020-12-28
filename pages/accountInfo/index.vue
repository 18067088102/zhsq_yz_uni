<template>
	<view class="account_container">
		<view class="avator_container">
			<text class="left_text">头像</text>
			<image class="avator_img" mode="aspectFill" :src="faceImg?faceImgPath:'/static/mine/icon_avator.png'" @click="onPreviewTap"></image>
		</view>
		<view class="line-view"></view>
		<view class="list_container">
			<view class="info_list" :class="index+1<listItems.length?'solid-bottom':''" v-for="(item, index) in listItems" :key="item" @click="onClickItem(index)">
				<text class="left_text">{{item.title_text}}</text>
				<view class="rigth_info">
					<text class="right_text">{{item.detail_text?item.detail_text:'无'}}</text>
					<image class="right_img" src="/static/mine/icon_mine_right.png" v-if="item.isShowArrow"></image>
				</view>
			</view> 
		</view> 
	</view>
</template>

<script>
	export default {
		data() {
			return {
				listItems: [{
						title_text: '姓名',
						detail_text: '',
						isShowArrow: false
					},
					{
						title_text: '昵称',
						detail_text: '',
						isShowArrow: true
					},
					{
						title_text: '手机号码',
						detail_text: '',
						isShowArrow: true
					},
					{
						title_text: '性别',
						detail_text: '',
						isShowArrow: false
					},
					{
						title_text: '出生日期',
						detail_text: '',
						isShowArrow: false
					}
				],
				faceImg: '',
				faceImgPath: ''
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad() {
			this.listItems[0].detail_text = uni.getStorageSync('data').name
			this.listItems[1].detail_text = uni.getStorageSync('data').nickname
			this.listItems[2].detail_text = uni.getStorageSync('data').mobile
			this.listItems[3].detail_text = uni.getStorageSync('data').sex
			this.listItems[4].detail_text = uni.getStorageSync('data').birthDay
			this.faceImg = uni.getStorageSync('data').faceImg
			this.faceImgPath = this.$common.combineImageUrl(uni.getStorageSync('data').faceImg)
		},
		methods: {
			onClickItem(idx) {
				if (idx == 1) {
					uni.navigateTo({
						url: '/pages/changeNickname/index',
					})
				} else if (idx == 2) {
					uni.navigateTo({
						url: '/pages/accountInfo/changePhoneNum',
					})
				}
			},

			// 预览 preview
			onPreviewTap() {
				const tempFilePath = this.faceImgPath
				uni.previewImage({
					current: tempFilePath, // 当前显示图片的http链接
					urls: [tempFilePath] // 需要预览的图片http链接列表
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.account_container {
		width: 100%;
		height: 100%;
		background: #F6F8FA;
	}

	.avator_container {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 200rpx;
		padding: 0 32rpx;
		background: #fff;
	}

	.left_text {
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #00172F;
		line-height: 42rpx;
	}

	.avator_img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
	}

	.list_container {
		padding: 0 32rpx;
		background: #fff;
	}

	.info_list {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 104rpx;
	}

	.rigth_info {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.right_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
		margin-right: 10rpx;
	}

	.right_img {
		width: 15rpx;
		height: 24rpx;
	}
</style>
