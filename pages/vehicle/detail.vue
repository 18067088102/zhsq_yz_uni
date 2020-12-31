<template>
	<view class="detail-list">
		<view class="list-item solid-bottom">
			<text class="title-text">车主姓名</text>
			<text class="detail-text">{{dataDic.ownerName}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">车主电话</text>
			<text class="detail-text">{{dataDic.ownerPhone}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">车辆类型</text>
			<text class="detail-text">{{dataDic.carTypeName?dataDic.carTypeName:'无'}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">车牌号</text>
			<text class="detail-text">{{dataDic.cardNumber}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">车牌颜色</text>
			<text class="detail-text">{{dataDic.cardColorName?dataDic.cardColorName:'无'}}</text>
		</view>
		<view class="list-item solid-bottom">
			<text class="title-text">车身颜色</text>
			<text class="detail-text">{{dataDic.carColorName?dataDic.carColorName:'无'}}</text>
		</view>
		<view class="list-item">
			<text class="title-text">车辆品牌</text>
			<text class="detail-text">{{dataDic.carBrandName?dataDic.carBrandName:'无'}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				dataDic: {}
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.dataDic = JSON.parse(options.dataDic)
		}
	}
</script>

<style>
	@import "../../common/css/list-detail.css";
</style>
