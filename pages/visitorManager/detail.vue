<template>
	<view class="detail_container">
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">访客信息</text>
			</view>
		</view>
		<view class="detail-list">
			<view class="list-item solid-bottom">
				<text class="title-text">访客姓名</text>
				<text class="detail-text">{{dataDic.visitorName}}</text>
			</view>
			<view class="list-item solid-bottom">
				<text class="title-text">手机号码</text>
				<text class="detail-text">{{dataDic.visitorPhone}}</text>
			</view>
			<view class="list-item solid-bottom">
				<text class="title-text">来访人数</text>
				<text class="detail-text">{{dataDic.visitorNum}}</text>
			</view>
			<view class="list-item solid-bottom">
				<text class="title-text">来访时间</text>
				<text class="detail-text">{{dataDic.visitTime}}</text>
			</view>
			<view class="list-item solid-bottom">
				<text class="title-text">来访事由</text>
				<text class="detail-text">{{dataDic.visitReason}}</text>
			</view>
		</view>
		<view class="line-view"></view>
		<view class="cu-bar bg-white">
			<view class="action">
				<text class="action1">人脸照片</text>
			</view>
		</view>
		<view class="bg-white padding-left padding-right">
			<view class="grid col-4 grid-square">
				<view class="bg-img" v-for="(item, index) in imgs" :key="index" :style="'background-image:url(' + item + ')'" @click.stop="onPreviewTap(index)"></view>
			</view>
		</view>
		<view class="btn-view" v-if="dataDic.visitStatus=='0'">
			<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dataDic: {},
				isLoading: false,
				buttonText: '同意',
				isDisable: false,
				imgs: []
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.dataDic = JSON.parse(options.data)
			var imgs = []
			var imgUrl = this.$common.combineImageUrl(this.dataDic.visitorFaceImg)
			imgs.push(imgUrl)
			this.imgs = imgs
		},
		methods: {
			// 预览 preview
			onPreviewTap(index) {
				uni.previewImage({
					current: this.imgs[index], // 当前显示图片的http链接
					urls: this.imgs // 需要预览的图片http链接列表
				})
			},

			submitHandler() {
				var that = this
				uni.showModal({
					content: '是否同意该访客的来访请求？',
					cancelText: '关闭',
					cancelColor: '#797979',
					confirmText: '同意',
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.isLoading = true
							that.buttonText = '同意中...'
							that.isDisable = true
							that.verifyVisitorRequest()
						}
					}
				})
			},

			async verifyVisitorRequest() {
				var that = this
				return await that.$http(that.$api.reviewVisitorUrl, {
					method: 'POST',
					data: {
						id: that.dataDic.id,
						roomId: that.dataDic.roomId,
						source: that.dataDic.source,
						villageId: that.dataDic.villageId,
						visitReason: that.dataDic.visitReason,
						visitTime: that.dataDic.visitTime,
						visitorFaceImg: that.dataDic.visitorFaceImg,
						visitorName: that.dataDic.visitorName,
						visitorNum: that.dataDic.visitorNum,
						visitorPhone: that.dataDic.visitorPhone
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
					if (res.code == 200) {
						that.$utils.$emit('demo')
						uni.showToast({
							title: '已同意',
							icon: 'none',
							success: (res) => {
								uni.navigateBack({
									delta: 1
								});
							}
						})
					} else {
						uni.showToast({
							title: '同意失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
				})
			}
		}
	}
</script>

<style>
	@import "../../common/css/list-detail.css";
</style>
