<template>
	<view class="common_container">
		<uni-search-bar class="uniSearchBar" placeholder="搜索社区名称" :radius="100" cancelButton="none" @confirm="onSearch"
		 @clear="onClear"></uni-search-bar>
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view class="list_container" v-if="!isNoData">
			<view class="list_item" v-for="(item, index) in listsItem" :key="item.id" @click="onClickItem(item)">
				<image mode="aspectFill" class="community_image" src="/static/common/icon_xiaoqu.png"></image>
				<view class="community_info">
					<view class="name_distance">
						<text class="name_text">{{item.name}}</text>
						<text class="distance_text">{{item.distance.toFixed(1)}}km</text>
					</view>
					<text class="address_text">{{item.address}}</text>
				</view>
			</view>
			<uni-load-more v-if="!isNoData" :status="status"></uni-load-more>
		</view>
	</view>
</template>

<script>
	import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue"
	import uniSearchBar from '@/components/uni-search-bar/uni-search-bar.vue'
	import uniEmpty from '@/components/uni-empty/uni-empty.vue'

	export default {
		components: {
			uniLoadMore,
			uniSearchBar,
			uniEmpty
		},
		data() {
			return {
				emptyText: '暂无社区数据...',
				status: 'more',
				keyword: '',
				lat: '',
				lng: '',
				listsItem: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				fromID: 0 //0: 刚启动时社区选择；1:社区选择时切换小区；2:首页头部切换房产(未认证)；
			}
		},
		onShow() {
			const villageName = uni.getStorageSync('villageName')
			if (this.fromID == 0) {
				if (villageName) {
					uni.switchTab({
						url: '/pages/home/index',
					})
				} else {
					this.getLatAndLng()
				}
			} else {
				this.getLatAndLng()
			}
		},
		onLoad(options) {
			var fromID = options.fromID
			this.fromID = fromID ? fromID : 0
			if (fromID == 2) {
				uni.setNavigationBarTitle({
					title: '重新选择社区'
				})
			}
		},
		methods: {
			/**
			 * 获取经纬度
			 */
			getLatAndLng() {
				var that = this
				uni.getLocation({
					type: 'wgs84',
					geocode: true, //设置该参数为true可直接获取经纬度及城市信息
					success: (res) => {
						that.lat = res.latitude
						that.lng = res.longitude
						that.getCommunityList(1, true)
					},
					fail: () => {
						uni.showToast({
							title: '获取地址失败',
							icon: 'none'
						});
					}
				});
			},
			/**
			 * 搜索框触发搜索事件
			 */
			onSearch(e) {
				this.keyword = e.value
				this.getCommunityList(1, true)
			},
			/**
			 * 搜索框触发清除搜索内容事件
			 */
			onClear(e) {
				this.keyword = ''
				this.getCommunityList(1, true)
			},
			/**
			 * 点击选择社区事件
			 */
			onClickItem(item) {
				// console.log(item)
				uni.setStorageSync('villageName', item.name)
				uni.setStorageSync('villageId', item.id)
				uni.switchTab({
					url: '/pages/home/index',
				})
			},
			/**
			 * 获取社区列表数据
			 */
			async getCommunityList(pageNo, override) {
				var that = this
				return await that.$http(that.$api.getVillageListUrl, {
					method: 'GET',
					data: {
						lat: that.lat,
						lng: that.lng,
						limit: '10',
						page: pageNo,
						name: that.keyword
					},
					token: ''
				}).then(res => {
					if (res.code == 200) {
						var list = res.data.list
						that.status = list.length == 0 ? 'noMore' : 'more'
						that.isNoData = list.length == 0 ? true : false
						that.page = pageNo //当前的页号
						that.pages = res.data.totalPage //总页数
						that.listsItem = override ? list : that.listsItem.concat(list)
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
			}
		},
		/**
		 * 监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading()
			this.getCommunityList(1, true).then(() => {
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
				this.getCommunityList(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		},
	}
</script>

<style lang="scss" scoped>
	.list_container {
		margin-top: 130rpx;
		padding: 0 32rpx;
	}

	.list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		margin-top: 30rpx;
		padding: 24rpx;
		background-color: #FFFFFF;
		border-radius: 20rpx;
	}

	.community_image {
		width: 70rpx;
		height: 70rpx;
	}

	.community_info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-left: 20rpx;
		width: calc(100% - 90rpx);
	}

	.name_distance {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.name_text {
		font-size: 30rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 30rpx;
	}

	.distance_text {
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #919298;
		line-height: 24rpx;
	}

	.address_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 36rpx;
		margin-top: 16rpx;
	}
</style>
