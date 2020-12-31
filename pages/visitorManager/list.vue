<template>
	<view class="visitor_container" :style="isNoData?'background: #fff':''">
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view class="cu-list" v-if="!isNoData">
			<view class="visitor_item cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart='ListTouchStart'
			 @touchmove='ListTouchMove' @touchend='ListTouchEnd' :data-target="'move-box-' + index" v-for="(item, index) in listsItem"
			 :key="index" @click="onDetail(index)">
				<image class="avator_img" mode="aspectFill" :src="faceImgArr[index]?faceImgArr[index]:'/static/mine/icon_avator.png'"></image>
				<view class="visitor_right">
					<view class="visitor_name">
						<text class="name_text">{{item.visitorName}}</text>
						<text class="status_text">{{item.visitStatus=='0'?'待审核':''}}</text>
					</view>
					<text class="phone_date">手机号码：{{item.visitorPhone}}</text>
					<text class="phone_date">访问时间：{{item.visitTime}}</text>
				</view>
				<view class="move" @click.stop="onDeleteItem(index)">
					<view class="bg-red">删除</view>
				</view>
			</view>
			<uni-load-more v-if="!isNoData&&isShowLoadMore" :status="status"></uni-load-more>
		</view>
		<view class="add_right" @click="onAddVisitor">
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
				emptyText: '暂无访客数据...',
				status: 'more',
				listsItem: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				isShowLoadMore: false,
				faceImgArr: [],
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.getVisitorListRequest(1, true)
		},
		mounted() {
			var that = this;
			that.$utils.$on('refreshVisitorList', () => {
				that.getVisitorListRequest(1, true);
			})
		},
		methods: {
			async getVisitorListRequest(pageNo, override) {
				var that = this
				return await that.$http(that.$api.getVisitorListUrl, {
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
						var faceImgArr = []
						for (var i = 0; i < list.length; i++) {
							var imgPath = that.$common.combineImageUrl(list[i].visitorFaceImg)
							faceImgArr.push(imgPath)
						}
						that.faceImgArr = faceImgArr
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
				const dataDic = this.listsItem[idx]
				uni.navigateTo({
					url: '/pages/visitorManager/detail?data=' + JSON.stringify(dataDic),
				})
			},

			onAddVisitor() {
				uni.navigateTo({
					url: '/pages/visitorManager/add',
				})
			},

			onDeleteItem(idx) {
				var visitorId = this.listsItem[idx].id
				var that = this
				uni.showModal({
					content: '确定删除该访客记录?',
					cancelText: '再想想',
					cancelColor: '#797979',
					confirmText: '删除',
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.deleteVisitorRequest(visitorId)
						}
					}
				})
			},

			async deleteVisitorRequest(visitorId) {
				var that = this
				var ids = []
				ids.push(visitorId)
				return await that.$http(that.$api.deleteVisitorRecordUrl, {
					method: 'DELETE',
					data: ids,
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'none',
							success: (res) => {
								that.getVisitorListRequest(1, true)
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
			this.getVisitorListRequest(1, true).then(() => {
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
				this.getVisitorListRequest(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		},
	}
</script>

<style lang="scss" scoped>
	.visitor_container {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100%;
		padding: 0 32rpx;
		background: #F6F8FA;
		overflow-x: hidden;
		position: relative;
	}

	.visitor_item {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		width: 100%;
		height: 183rpx;
		padding: 0 24rpx;
		border-radius: 10rpx;
		background: #fff;
		margin-top: 24rpx;
	}

	.avator_img {
		width: 88rpx;
		height: 88rpx;
		margin-top: 30rpx;
		margin-right: 24rpx;
		border-radius: 50%;
	}

	.visitor_right {
		display: flex;
		flex-direction: column;
		width: calc(100% - 112rpx);
		margin-top: 30rpx;
	}

	.visitor_name {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.name_text {
		font-size: 32rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 500;
		color: #00172F;
		line-height: 32rpx;
	}

	.status_text {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #FF2553;
		line-height: 26rpx;
	}

	.phone_date {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
		margin-top: 17rpx;
	}
</style>
