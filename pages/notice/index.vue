<template>
	<view class="noticeList" :style="isNoData?'background: #fff':''">
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view v-if="!isNoData" class="noticeItem" :class="index+1<elegantsArr.length?'solid-bottom':''" v-for="(item, index) in elegantsArr" :key="item.id" @click="onElegantDetail">
			<view class="notice_name" style="margin-bottom: 15rpx;">
				<text class="name_text">{{item.title}}</text>
			</view>
			<view class="notice_name">
				<text class="date_text">{{item.updateTime}}</text>
				<view class="see_box">
					<image class="see_img" src="/static/common/see.png"></image>
					<text class="date_text">{{item.clickNumber}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import uniEmpty from '@/components/uni-empty/uni-empty.vue'
	export default {
		components: {
			uniEmpty
		},
		data() {
			return {
				elegantsArr: [{
						title: "测试吃你车i吃喝次和策划出",
						updateTime: "2020-09-15 09:35:12",
						clickNumber: "9"
					},
					{
						title: "哦企鹅后的核武器饿UI哦钱我都欠我的",
						updateTime: "2020-09-20 19:45:32",
						clickNumber: "15"
					}
				],
				emptyText: '暂无小区风采...',
				isNoData: false,
			}
		}
	}
</script>

<style lang="scss" scoped>
	.noticeList {
	  background: #fff;
	  padding: 0 32rpx;
	  display: flex;
	  flex-direction: column;
	  overflow: hidden;
	}
	
	.noticeItem {
	  display: flex;
	  flex-direction: column;
	  padding: 30rpx 0rpx;
	}
	
	.notice_name {
	  display: flex;
	  flex-direction: row;
	  justify-content: space-between;
	}
	
	.name_text {
	  font-size: 30rpx;
	  color: #2A2C2F;
	  overflow: hidden;
	  text-overflow: ellipsis;
	  white-space: nowrap;
	  font-weight: 600;
	  line-height: 42rpx;
	}
	
	.see_box {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	}
	
	.see_img {
	  width: 28rpx;
	  height: 28rpx;
	  margin-right: 8rpx;
	}
	
	.date_text {
	  flex-shrink: 0;
	  font-size: 26rpx;
	  font-family: PingFangSC-Regular, PingFang SC;
	  font-weight: 400;
	  color: #919298;
	  line-height: 37rpx;
	}
</style>
