<template>
	<view class="pay_container">
		<view class="pay_list_item" v-for="(item, index) in payListPics" :key="index" @click="onPayment(index)">
			<view class="item_left">
				<image class="left_img" :src="item.pic"></image>
				<text class="left_text">{{item.title}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				payListPics: [{
						pic: '/static/common/icon_wuyefei.png',
						title: '物业费'
					},
					{
						pic: '/static/common/icon_chefei.png',
						title: '停车费'
					},
					{
						pic: '/static/common/icon_dianfei.png',
						title: '电费'
					},
					{
						pic: '/static/common/icon_shuifei.png',
						title: '水费'
					},
					{
						pic: '/static/common/icon_ranqi.png',
						title: '燃气费'
					}
				]
			}
		},
		methods: {
			onPayment(idx) {
				if (idx == 0 || idx == 1) {
					uni.navigateTo({
						url: '/pages/livePayment/list?fromID=' + idx,
					})
				}
				if (idx == 2 || idx == 3 || idx == 4) {
					uni.navigateToMiniProgram({ //跳转到微信生活缴费小程序
						appId: 'wxd2ade0f25a874ee2',
						// path: 'packquery/pages/query-guide/query-guide?navigateId=' + navigateId,
						path: '',
						extraData: {
							foo: 'bar'
						},
						envVersion: 'release',
						success(res) {
							// 打开成功
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pay_container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		padding: 0 32rpx;
		background: #F6F7FA;
	}

	.pay_list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 116rpx;
		padding: 0 30rpx;
		background: #fff;
		border-radius: 8rpx;
		margin-top: 24rpx;
	}

	.item_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.left_img {
		width: 56rpx;
		height: 56rpx;
		margin-right: 20rpx;
	}

	.left_text {
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #00172F;
		line-height: 42rpx;
	}
</style>
