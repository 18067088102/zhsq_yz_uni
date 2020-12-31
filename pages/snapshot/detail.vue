<template>
	<view class="detail_container">
		<view class="snap_info">
			<view class="info_head solid-bottom">
				<text class="info_text">报修信息</text>
			</view>
			<view class="info_content">
				<view class="content_item" v-if="typeIndex==0">
					<text class="item_title">报修类型：</text>
					<text class="item_detail">{{dataDic.repairType=='0'?'公共区域报修':'私人区域报修'}}</text>
				</view>
				<view class="content_item" v-if="typeIndex==0">
					<text class="item_title">报修区域：</text>
					<text class="item_detail">{{dataDic.repairArea}}</text>
				</view>
				<view class="content_item">
					<text class="item_title">问题描述：</text>
					<text class="item_detail">{{typeIndex==0?dataDic.repairDescription:dataDic.convenientDescription}}</text>
				</view>
				<view class="content_item">
					<text class="item_title">图片说明：</text>
				</view>
			</view>
			<view class="bg-white">
				<view class="grid col-4 grid-square">
					<view class="bg-img" v-for="(item, index) in repiarsArr" :key="index" :style="'background-image:url(' + item + ')'" @click.stop="onPreviewTap"
					 :data-index="index"></view>
				</view>
			</view>
		</view>
		<view class="line-view"></view>
		<view class="snap_info">
			<view class="info_head solid-bottom">
				<text class="info_text">处理情况</text>
			</view>
			<view class="info_content">
				<view class="content_item">
					<text class="item_title">处理结果：</text>
					<view class="status_box" :class="status=='1'?'green_bg':'red_bg'">
						<text>{{status=='1'?'已处理':'待处理'}}</text>
					</view>
				</view>
				<view class="content_item" v-if="status=='1'">
					<text class="item_title">处 理 人 ：</text>
					<text class="item_detail">{{dataDic.handlerName}}</text>
				</view>
				<view class="content_item" v-if="status=='1'">
					<text class="item_title">联系电话：</text>
					<text class="item_detail">{{dataDic.handlerPhone}}</text>
				</view>
				<view class="content_item" v-if="status=='1'">
					<text class="item_title">处理时间：</text>
					<text class="item_detail">{{dataDic.handleTime}}</text>
				</view>
				<view class="content_item" v-if="status=='1'">
					<text class="item_title">处理反馈：</text>
					<text class="item_detail">{{dataDic.handleFeedback}}</text>
				</view>
				<view class="content_item" v-if="status=='1'">
					<text class="item_title">现场照片：</text>
				</view>
			</view>
			<view class="bg-white" v-if="status=='1'">
				<view class="grid col-4 grid-square">
					<view class="bg-img" v-for="(item, index) in handlesArr" :key="index" :style="'background-image:url(' + item + ')'" @click.stop="onPreviewTap1"
					 :data-index="index"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				status: '',
				typeIndex: 0,
				dataDic: {},
				repiarsArr: [],
				handlesArr: []
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			var dataDic = JSON.parse(options.dataDic)
			for (let i = 0; i < dataDic.handleList.length; i++) {
				dataDic.handleList[i] = this.$common.combineImageUrl(dataDic.handleList[i])
			}
			for (let j = 0; j < dataDic.repairList.length; j++) {
				dataDic.repairList[j] = this.$common.combineImageUrl(dataDic.repairList[j])
			}
			this.dataDic = dataDic
			this.status = dataDic.handleStatus
			this.typeIndex = options.typeIndex
			this.repiarsArr = dataDic.repairList
			this.handlesArr = dataDic.handleList
			uni.setNavigationBarTitle({
				title: this.typeIndex == 0 ? '报修详情' : '随手拍详情'
			})
		},
		methods: {
			// 预览 preview
			onPreviewTap(e) {
				const index = e.currentTarget.dataset.index
				const tempFilePath = this.repiarsArr[index]
				uni.previewImage({
					current: tempFilePath, // 当前显示图片的http链接
					urls: this.repiarsArr // 需要预览的图片http链接列表
				})
			},

			// 预览 preview
			onPreviewTap1(e) {
				const index = e.currentTarget.dataset.index
				const tempFilePath = this.handlesArr[index]
				uni.previewImage({
					current: tempFilePath, // 当前显示图片的http链接
					urls: this.handlesArr // 需要预览的图片http链接列表
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.detail_container {
		width: 100%;
		min-height: 100%;
		background: #F6F8FA;
	}

	.snap_info {
		display: flex;
		flex-direction: column;
		padding: 0 28rpx 10rpx;
		background: #fff;
	}

	.info_head {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0 15rpx;
	}

	.info_text {
		font-size: 32rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #00172F;
		line-height: 45rpx;
	}

	.info_content {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding-top: 22rpx;
	}

	.content_item {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		margin-bottom: 13rpx;
		width: 100%;
	}

	.item_title {
		width: 140rpx;
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 42rpx;
		margin-right: 10rpx;
	}

	.item_detail {
		width: calc(100% - 150rpx);
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #00172F;
		line-height: 42rpx;
	}

	.status_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 8rpx 16rpx;
		border-radius: 4rpx;
		font-size: 20rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #FFFFFF;
		line-height: 20rpx;
	}

	.red_bg {
		background: #FF2553;
	}

	.green_bg {
		background: #00CAB6;
	}
</style>
