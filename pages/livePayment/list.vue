<template>
	<view class="pay_container" :style="isNoData?'background: #fff':''">
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<block v-if="!isNoData">
			<view class="pay_item" v-for="(item, index) in listsItem" :key="index">
				<view class="date_box">
					<text>{{item.year}}年</text>
				</view>
				<view class="pay_box">
					<view class="box_left">
						<image class="pay_img" :src="fromID==0?'/static/common/icon_wuyefei.png':'/static/common/icon_chefei.png'">
						</image>
						<view class="pay_date_box">
							<text class="text1">缴费周期：12个月</text>
							<text class="text2">{{item.updateTime}}</text>
						</view>
					</view>
					<text class="money_text">{{item.payedMoney}}元</text>
				</view>
			</view>
			<uni-load-more v-if="!isNoData&&isShowLoadMore" :status="status"></uni-load-more>
		</block>
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
				emptyText: '暂无缴费数据...',
				status: 'more',
				fromID: 0, //0:物业费；1:停车费
				listsItem: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				isShowLoadMore: false,
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.fromID = options.fromID
			uni.setNavigationBarTitle({
				title: options.fromID == 0 ? '物业费' : '停车费'
			})
			this.getFeeListRequest(1, true)
		},
		methods: {
			async getFeeListRequest(pageNo, override) {
				var that = this
				return await that.$http(this.fromID == 0 ? that.$api.getEstateFeeListUrl : that.$api.getParkingFeeListUrl, {
					method: 'GET',
					data: {
						roomId: uni.getStorageSync('data').roomId,
						limit: '10',
						page: pageNo,
						payStatus: 1
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data.list
						that.status = list.length == 0 ? 'noMore' : 'more'
						that.isNoData = list.length == 0 ? true : false,
						that.page = pageNo, //当前的页号
						that.pages = res.data.totalPage, //总页数
						that.listsItem = override ? list : that.listsItem.concat(list)
						that.isShowLoadMore = that.listsItem.length < 10 ? false : true
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
		},
		/**
		 * 监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading()
			this.getFeeListRequest(1, true).then(() => {
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
				this.getFeeListRequest(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.pay_container {
		width: 100%;
		height: 100%;
		background: #F6F8FA;
		padding: 0 32rpx;
	}

	.pay_item {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.date_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 30rpx 0;
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
	}

	.pay_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 30rpx 24rpx;
		background: #fff;
		border-radius: 8rpx;
	}

	.box_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.pay_img {
		width: 56rpx;
		height: 56rpx;
		margin-right: 20rpx;
	}

	.pay_date_box {
		display: flex;
		flex-direction: column;
	}

	.text1 {
		font-size: 32rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #00172F;
		line-height: 32rpx;
		margin-bottom: 18rpx;
	}

	.text2 {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 26rpx;
	}

	.money_text {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #00172F;
		line-height: 36rpx;
	}
</style>
