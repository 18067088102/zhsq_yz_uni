<template>
	<view class="detail-list">
		<view class="list-item solid-bottom" style="min-height: 162rpx;">
			<text class="title-text">人员照片</text>
			<image class="photo_img" mode="aspectFill" :src="imgPath?imgPath:'/static/mine/icon_avator.png'" @click="onPreviewTap"></image>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">姓名</text>
			<text class="detail-text">{{dataDic.name}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">手机号</text>
			<text class="detail-text">{{dataDic.mobile}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">证件类型</text>
			<text class="detail-text">{{dataDic.idCardType?dataDic.idCardType:'无'}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">证件号</text>
			<text class="detail-text">{{dataDic.idCardNumber}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">与户主关系</text>
			<text class="detail-text">{{dataDic.relationName?dataDic.relationName:'无'}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dataDic: {},
				imgPath: ''
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.getPersonDetailRequest(options.personId)
		},
		methods: {
			async getPersonDetailRequest(personId) {
				var that = this
				return await that.$http(that.$api.getPersonDetailUrl + '/' + personId, {
					method: 'GET',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						this.dataDic = res.data
						if (this.dataDic.faceImg) {
							var imgUrl = that.$common.combineImageUrl(this.dataDic.faceImg)
							this.imgPath = imgUrl
						}
					}
				}).catch(err => {})
			},

			// 预览 preview
			onPreviewTap() {
				const tempFilePath = this.imgPath
				wx.previewImage({
					current: tempFilePath, // 当前显示图片的http链接
					urls: [tempFilePath] // 需要预览的图片http链接列表
				})
			}
		}
	}
</script>

<style>
	@import "../../common/css/list-detail.css";
</style>
