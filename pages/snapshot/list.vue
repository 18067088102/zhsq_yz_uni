<template>
	<view>
		<view class="snap_head">
			<view class="navbar" :style="'height:' + navHeight + 'rpx'">
				<view class="backImg_box" @click="onNavBack">
					<image class="back_img" src="/static/common/icon_back.png"></image>
				</view>
				<view class="snap_type_box" :style="'margin-top:' + (navTop-8) + 'rpx'" v-for="(item, index) in typeArr" :key="index"
				 @click="onSelectType(index)">
					<text class="type_text" :class="index==typeIndex?'active_color':'normal_color'">{{item}}</text>
				</view>
			</view>
			<view class="nav">
				<view class="nav_item" v-for="(item, index) in Tabs" :key='index' @click="tabSelect(index)">
					<view class="item_content" :class="index==TabCur?'text-theme cur':'text-gray'">
						{{Tabs[index]}}
					</view>
				</view>
			</view>
		</view>
		<view class="snap_container" :style="{'background':(isNoData?'#fff':''),'padding':(navHeight+90) + 'rpx' + ' 32rpx 30rpx'}">
			<view class="empty_container" v-if="isNoData">
				<uni-empty :emptyText="emptyText"></uni-empty>
			</view>
			<view class="cu-list" v-if="!isNoData">
				<view class="snap_item cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart="ListTouchStart" @touchmove="ListTouchMove" @touchend="ListTouchEnd"
				 :data-target="'move-box-' + index" v-for="(item, index) in listsItem" :key="index" @click="onSelectItem(index)">
					<view class="date_status solid-bottom">
						<text class="date_text">{{typeIndex==0?item.repairTime:item.uploadTime}}</text>
						<view class="status_box" :class="item.handleStatus=='0'?'red_bg':'green_bg'">
							<text>{{item.handleStatus=='0'?'待处理':'已处理'}}</text>
						</view>
					</view>
					<view class="snap_content" :class="item.handleStatus=='0'?'solid-bottom':''">
						<text class="content_text">{{typeIndex==0?item.repairDescription:item.convenientDescription}}</text>
						<view class="tag_box" style="margin-bottom: 20rpx;" v-if="typeIndex==0">
							<text class="tag_text">{{item.repairType=="0"?'公共区域报修':'私人区域报修'}}</text>
						</view>
						<view class="bg-white">
							<view class="grid col-4 grid-square">
								<view class="bg-img" v-for="(item, index) in repiarsArr[index]" :key="index" :style="'background-image:url(' + item + ')'"></view>
							</view>
						</view>
					</view>
					<view class="operation_box" v-if="item.handleStatus=='0'">
						<view class="operation_btn" @click.stop="onDeleteItem(index)">
							<text>撤销</text>
						</view>
					</view>
					<view class="move" @click.stop="onDeleteItem(index)">
						<view class="bg-red">删除</view>
					</view>
				</view>
				<uni-load-more v-if="!isNoData&&isShowLoadMore" :status="status"></uni-load-more>
			</view>
		</view>
		<view class="add_right" @click="onAddSnap">
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
				emptyText: '暂无数据...',
				status: 'more',
				navHeight: this.navHeight * (750 / this.windowWidth),
				navTop: this.navTop * (750 / this.windowWidth),
				typeIndex: 0,
				typeArr: ['物业报修', '随手拍'],
				TabCur: 0,
				Tabs: ['全部', '待处理', '已处理'],
				imgs: [],
				listsItem: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				isShowLoadMore: false,
				repiarsArr: [],
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.getRepairListRequest(1, true)
		},
		mounted() {
			var that = this;
			that.$utils.$on('refreshRepairList', () => {
				that.TabCur = 0
				that.getRepairListRequest(1, true)
			})
		},
		methods: {
			async getRepairListRequest(pageNo, override) {
				var that = this
				return await that.$http(that.typeIndex == 0 ? that.$api.getRepairListUrl : that.$api.getConvenientListUrl, {
					method: 'GET',
					data: that.typeIndex == 0 ? {
						repairmanId: uni.getStorageSync('userId'),
						handleStatus: that.TabCur == 0 ? '' : that.TabCur == 1 ? '0' : '1',
						villageId: uni.getStorageSync('villageId'),
						limit: '10',
						page: pageNo
					} : {
						uploaderId: uni.getStorageSync('userId'),
						handleStatus: that.TabCur == 0 ? '' : that.TabCur == 1 ? '0' : '1',
						villageId: uni.getStorageSync('villageId'),
						limit: '10',
						page: pageNo
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data.list
						var repiarsArr = []
						for (var i = 0; i < list.length; i++) {
							var repairList = list[i].repairList
							var urls = []
							for (let j = 0; j < repairList.length; j++) {
								var imgPath = that.$common.combineImageUrl(repairList[j])
								urls.push(imgPath)
							}
							repiarsArr.push(urls)
						}
						that.status = list.length == 0 ? 'noMore' : 'more'
						that.isNoData = list.length == 0 ? true : false,
							that.page = pageNo //当前的页号
						that.pages = res.data.totalPage //总页数
						that.listsItem = override ? list : that.listsItem.concat(list)
						that.isShowLoadMore = that.listsItem.length < 10 ? false : true
						that.repiarsArr = repiarsArr
					} else {
						wx.showToast({
							title: res.msg,
							icon: 'none'
						})
						that.isNoData = true
					}
				}).catch(err => {
					that.isNoData = true
				})
			},

			tabSelect(index) {
				this.scrollToTop()
				this.TabCur = index
				this.getRepairListRequest(1, true)
			},

			onSelectType(idx) {
				this.scrollToTop()
				this.typeIndex = idx
				this.TabCur = 0
				this.getRepairListRequest(1, true)
			},

			scrollToTop() {
				if (uni.pageScrollTo) {
					uni.pageScrollTo({
						scrollTop: 0
					})
				} else {
					uni.showModal({
						title: '提示',
						content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
					})
				}
			},

			onNavBack() {
				uni.navigateBack()
			},

			onSelectItem(idx) {
				var dataDic = this.listsItem[idx]
				uni.navigateTo({
					url: `/pages/snapshot/detail?typeIndex=${this.typeIndex}&dataDic=${JSON.stringify(dataDic)}`
				})
			},

			onAddSnap() {
				uni.navigateTo({
					url: '/pages/snapshot/add?typeIndex=' + this.typeIndex,
				})
			},

			onDeleteItem(idx) {
				var Id = this.listsItem[idx].id
				var that = this
				uni.showModal({
					content: that.typeIndex == 0 ? '确定删除该报修记录?' : '确定删除该随手拍记录?',
					cancelText: '再想想',
					cancelColor: '#797979',
					confirmText: '删除',
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.deleteRepairRequest(Id)
						}
					}
				})
			},

			async deleteRepairRequest(Id) {
				var that = this
				var url = that.typeIndex == 0 ? (that.$api.deleteRepairRecordUrl + '?repairId=') : (that.$api.deleteConvenientRecordUrl +
					'?convenientId=')
				return await that.$http(url + Id, {
					method: 'DELETE',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'none',
							success: (res) => {
								that.getRepairListRequest(1, true)
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
				var str = e.currentTarget.dataset.target
				var index = str.split('-')[2] - 0
				var handleStatus = this.listsItem[index].handleStatus
				if(handleStatus == '0') {
					return
				}
				this.listTouchStart = e.touches[0].pageX
			},

			// ListTouch计算方向
			ListTouchMove(e) {
				var str = e.currentTarget.dataset.target
				var index = str.split('-')[2] - 0
				var handleStatus = this.listsItem[index].handleStatus
				if(handleStatus == '0') {
					return
				}  
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
			},

			// ListTouch计算滚动
			ListTouchEnd(e) {
				var str = e.currentTarget.dataset.target
				var index = str.split('-')[2] - 0
				var handleStatus = this.listsItem[index].handleStatus
				if(handleStatus == '0') {
					return
				}
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
			this.getRepairListRequest(1, true).then(() => {
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
				this.getRepairListRequest(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		},
	}
</script>

<style lang="scss" scoped>
	.snap_head {
		width: 100%;
		position: fixed;
		top: 0;
		z-index: 99;
	}

	.navbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 100%;
		background: #fff;
		position: relative;
	}

	.backImg_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 44rpx;
		height: 44rpx;
		position: absolute;
		left: 15rpx;
		bottom: 15rpx;
	}

	.back_img {
		width: 18rpx;
		height: 32rpx;
	}

	.snap_type_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-right: 56rpx;
	}

	.type_text {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		line-height: 36rpx;
	}

	.active_color {
		color: #00172F;
	}

	.normal_color {
		color: #9EA0A7;
	}

	.nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 90rpx;
		background: #fff;
	}

	.nav_item {
		width: 50%;
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.item_content {
		font-size: 30rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 400;
		line-height: 90rpx;
	}

	.item_content.cur {
		border-bottom: 6rpx solid;
		border-radius: 3rpx;
	}

	.snap_container {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 100%;
		background: #F6F8FA;
		overflow-x: hidden;
	}

	.snap_item {
		display: flex;
		flex-direction: column;
		width: 100%;
		background: #fff;
		border-radius: 8rpx;
		margin-top: 30rpx;
	}

	.date_status {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 26rpx 24rpx;
	}

	.date_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
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

	.snap_content {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 24rpx 24rpx 10rpx;
	}

	.content_text {
		font-size: 32rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 500;
		color: #00172F;
		line-height: 48rpx;
		margin-bottom: 10rpx;
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
		word-wrap: break-word;
		white-space: normal !important;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.tag_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 180rpx;
		padding: 6rpx 16rpx;
		background: rgba(33, 142, 255, 0.16);
		border-radius: 4rpx;
	}

	.tag_text {
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #218EFF;
		line-height: 24rpx;
	}

	.operation_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		padding: 24rpx 30rpx;
	}

	.operation_btn {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 12rpx 30rpx;
		background: #218EFF;
		border-radius: 26rpx;
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #fff;
		line-height: 28rpx;
	}
</style>
