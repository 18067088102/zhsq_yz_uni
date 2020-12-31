<template>
	<view class="vehicle_container" :style="isNoData?'background: #fff':''">
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view class="cu-list" v-if="!isNoData">
			<view class="vehicle_item cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart='ListTouchStart'
			 @touchmove='ListTouchMove' @touchend='ListTouchEnd' :data-target="'move-box-' + index" v-for="(item, index) in listsItem"
			 :key="index" @click="onDetail(index)">
				<text class="num_text">{{item.cardNumber}}</text>
				<text class="date_text">车主姓名：{{item.ownerName}}</text>
				<text class="date_text">车主电话：{{item.ownerPhone}}</text>
				<view class="move" @click.stop="onDeleteItem(index)">
					<view class="bg-red">删除</view>
				</view>
			</view>
			<uni-load-more v-if="!isNoData&&isShowLoadMore" :status="status"></uni-load-more>
		</view>
		<view class="add_right" @click="onAddVehicle">
			<image class="add_img" src="/static/common/icon_add.png"></image>
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
				emptyText: '暂无车辆数据...',
				status: 'more',
				listsItem: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				isShowLoadMore: false,
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.getVehicleListRequest(1, true)
		},
		mounted() {
			var that = this;
			that.$utils.$on('refreshVehicleList', () => {
				that.getVehicleListRequest(1, true);
			})
		},
		methods: {
			async getVehicleListRequest(pageNo, override) {
				var that = this
				return await that.$http(that.$api.getVehicleListUrl, {
					method: 'GET',
					data: {
						roomId: uni.getStorageSync('data').roomId,
						limit: '10',
						page: pageNo
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data.list
						that.status = list.length == 0 ? 'noMore' : 'more'
						that.isNoData = list.length == 0 ? true : false
						that.page = pageNo //当前的页号
						that.pages = res.data.totalPage //总页数
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

			onDetail(idx) {
				var dataDic = this.listsItem[idx]
				uni.navigateTo({
					url: '/pages/vehicle/detail?dataDic=' + JSON.stringify(dataDic),
				})
			},

			onAddVehicle() {
				uni.navigateTo({
					url: '/pages/vehicle/add',
				})
			},

			onDeleteItem(idx) {
				var carId = this.listsItem[idx].id
				var that = this
				uni.showModal({
					content: '确定删除该车辆?',
					cancelText: '再想想',
					cancelColor: '#797979',
					confirmText: '删除',
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.deleteCarRequest(carId)
						}
					}
				})
			},

			async deleteCarRequest(carId) {
				var that = this
				var carIds = []
				carIds.push(carId)
				return await that.$http(that.$api.deleteVehicleUrl, {
					method: 'DELETE',
					data: carIds,
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'none',
							success: (res) => {
								that.getVehicleListRequest(1, true)
							}
						})
					} else {
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}).catch(err => {})
			},

			// ListTouch触摸开始
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX
			},
			
			// ListTouch计算方向
			ListTouchMove(e) {
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
			},
			
			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			}
		},
		/**
		 * 监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading()
			this.getVehicleListRequest(1, true).then(() => {
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
				this.getVehicleListRequest(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		},
	}
</script>

<style lang="scss" scoped>
	.vehicle_container {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100%;
		background: #F6F8FA;
		padding: 0 32rpx;
		overflow-x: hidden;
	}

	.vehicle_item {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 200rpx;
		background: #fff;
		padding: 0 32rpx;
		border-radius: 10rpx;
		margin-top: 24rpx;
	}

	.num_text {
		font-size: 30rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 30rpx;
		margin-top: 34rpx;
	}

	.date_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
		margin-top: 24rpx;
	}

	.status_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 98rpx;
		padding: 6rpx 12rpx;
		border-radius: 4rpx;
		background: rgba(33, 142, 255, 0.16);
		margin-top: 24rpx;
	}

	.status_text {
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(33, 142, 255, 1);
		line-height: 24rpx;
	}
</style>
