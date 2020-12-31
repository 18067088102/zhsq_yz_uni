<template>
	<view class="noticeList" :style="isNoData?'background: #fff':''">
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view v-if="!isNoData" class="noticeItem" :class="index+1<elegantsArr.length?'solid-bottom':''" v-for="(item, index) in elegantsArr"
		 :key="item.id" :data-index="index" @click="onElegantDetail">
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
	import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
	import uniEmpty from '@/components/uni-empty/uni-empty.vue'

	export default {
		components: {
			uniLoadMore,
			uniEmpty
		},
		data() {
			return {
				emptyText: '暂无小区风采...',
				status: 'more',
				elegantsArr: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				isShowLoadMore: false
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onShow: function(options) {
			this.getElegantListRequest(1, true)
		},
		methods: {
			async getElegantListRequest(pageNo, override) {
				var that = this
				return await that.$http(that.$api.getElegantListUrl, {
					method: 'GET',
					data: {
						limit: '10',
						page: pageNo,
						status: '1',
						villageId: uni.getStorageSync('villageId')
					},
					token: wx.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data.list
						that.status = list.length == 0 ? 'noMore' : 'more'
						that.isNoData = list.length == 0 ? true : false
						that.page = pageNo //当前的页号
						that.pages = res.data.totalPage //总页数
						that.elegantsArr = override ? list : that.elegantsArr.concat(list)
						that.isShowLoadMore = that.elegantsArr.length < 10 ? false : true
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						that.isNoData = true
					}
				}).catch(err => {
					that.isNoData = true
				})
			},

			/**
			 * 小区风采详情
			 */
			onElegantDetail(e) {
				const idx = e.currentTarget.dataset.index
				const id = this.elegantsArr[idx].id
				uni.navigateTo({
					url: `/pages/notice/detail?id=${id}&fromID=1`
				})
			},
		},
		/**
		 * 监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading()
			this.getElegantListRequest(1, true).then(() => {
				uni.hideNavigationBarLoading()
				// 处理完成后，终止下拉刷新
				uni.stopPullDownRefresh()
			})
		},
		/**
		 * 监听页面上拉触底事件
		 */
		onReachBottom: function() {
			if (this.loading && this.page < this.pages) {
				this.status = 'loading'
				this.getElegantListRequest(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		},
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
