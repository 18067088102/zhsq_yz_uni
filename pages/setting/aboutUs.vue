<template>
	<view>
		<view class="about_head">
			<image class="head_img" src='/static/mine/icon_logo.png'></image>
			<text class="head_text">智慧社区</text>
		</view>
		<view class="about_list">
			<view class="about_list_item" :class="index==0?'solid-bottom':''" v-for="(item, index) in listItem" :key="index" @click="onSelectItem"
			 :data-index="index">
				<text class="title_text">{{item.title_text}}</text>
				<text class="detail_text">{{item.detail_text}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				listItem: [{
						title_text: '公司官网',
						detail_text: 'www.cncqs.cn'
					},
					{
						title_text: '联系我们',
						detail_text: '0551-68168050'
					}
				]
			}
		},
		methods: {
			onSelectItem(e) {
				const idx = e.currentTarget.dataset.index
				if (idx == 0) {

				} else {
					uni.makePhoneCall({
						phoneNumber: this.listItem[idx].detail_text,
						complete: {}
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.about_head {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 380rpx;
	}

	.head_img {
		width: 180rpx;
		height: 180rpx;
		margin: 47rpx 0 30rpx;
	}

	.head_text {
		font-size: 36rpx;
		font-family: SourceHanSansCN-Bold, SourceHanSansCN;
		font-weight: bold;
		color: #63656B;
		line-height: 54rpx;
	}

	.about_list {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0 32rpx;
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

	.detail_text {
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #2A2C2F;
		line-height: 42rpx;
	}
</style>
