<template>
	<view class="common_container" style="padding: 0 32rpx;">
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view class="list_container" v-if="!isNoData">
			<view class="common_list_item" v-for="(item, index) in listsItem" :key="item.id">
				<view class="common_left">
					<text class="phone_text">{{item.phone}}</text>
					<text class="name_text">{{item.name}}</text>
				</view>
				<image class="phone_img" src="/static/common/icon_hujiao.png" @click="onClickItem(item)"></image>
			</view>
			<uni-load-more v-if="!isNoData&&isShowLoadMore" :status="status"></uni-load-more>
		</view>
		<view class="popup_box" :style="!isLogin?'':'background: #FCFAE5'" v-if="!isLogin||!isAuth">
			<view class="box_left">
				<image :style="!isLogin?'':'width: 29rpx'" class="popup_img" :src="!isLogin?'/static/common/icon_logo.png':'/static/common/icon_renzheng.png'"></image>
				<text class="popup_text" :style="!isLogin?'':'color: #FF7A05'">{{!isLogin?'请登录，登录后查看更多信息':'您还未进行社区认证，请认证'}}</text>
			</view>
			<view>
				<button :style="!isLogin?'':'background: #FF7A05;color: #FCFAE5;'" class="popup_btn shadow" :class="[animation == 'shake' ? 'animation-shake' : '']"
				 @click="getUserInfo">{{!isLogin?'去登录':'去认证'}}</button>
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
				emptyText: '暂无常用电话数据...',
				status: 'more',
				listsItem: [],
				loading: true,
				page: 1,
				pages: 0,
				isNoData: false,
				isShowLoadMore: false,
				isLogin: true,
				isAuth: true
			}
		},
		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow() {
			var token = wx.getStorageSync('token')
			if (token) {
				this.getUserInfoRequest()
			} else {
				this.isLogin = false
				this.isAuth = false
			}
		},
		methods: {
			/**
			 * 获取账号信息
			 */
			async getUserInfoRequest() {
				var that = this
				return await that.$http(that.$api.queryUserInfoUrl, {
					method: 'GET',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						var data = res.data
						uni.setStorageSync('data', data)
						if (data != null) {
							uni.setStorageSync('villageName', res.data.villageName)
							uni.setStorageSync('villageId', res.data.villageId)
							that.isLogin = true
							that.isAuth = true
							that.getCommonPhoneListRequest(1, true)
						} else {
							that.isLogin = true
							that.isAuth = false
						}
					}
				}).catch(err => {
					that.isNoData = true
				})
			},
			/**
			 * 拨打电话事件
			 */
			onClickItem(item) {
				uni.makePhoneCall({
					phoneNumber: item.phone,
					complete: {}
				})
			},
			/**
			 * 获取常用电话列表数据
			 */
			async getCommonPhoneListRequest(pageNo, override) {
				var that = this
				return await that.$http(that.$api.getCommonPhoneUrl, {
					method: 'GET',
					data: {
						villageId: uni.getStorageSync('villageId'),
						limit: '10',
						page: pageNo
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						var list = res.data.list
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
			/**
			 * 登录、认证事件
			 */
			getUserInfo: function(e) {
				if (!this.isLogin) {
					uni.navigateTo({
						url: '/pages/login/index',
					})
				} else {
					uni.navigateTo({
						url: '/pages/communityRegister/validation',
					})
				}
			},
		},
		/**
		 * 监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading()
			this.getCommonPhoneListRequest(1, true).then(() => {
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
				this.getCommonPhoneListRequest(this.page + 1)
			}
			if (this.loading && this.page == this.pages) {
				this.status = 'noMore'
			}
		},
	}
</script>

<style lang="scss" scoped>
	.common_list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 140rpx;
		padding: 0 24rpx;
		background: #fff;
		border-radius: 8rpx;
		margin-top: 24rpx;
	}

	.common_left {
		display: flex;
		flex-direction: column;
	}

	.phone_text {
		font-size: 32rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #00172F;
		line-height: 45rpx;
		margin-bottom: 11rpx;
	}

	.name_text {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #919298;
		line-height: 26rpx;
	}

	.phone_img {
		width: 58rpx;
		height: 58rpx;
	}
</style>
