<template>
	<view class="home_container">
		<view class="community_container" @click="pageToVillage">
			<view class="community_name">
				<image class="location_img" src="/static/common/icon_weizhi.png"></image>
				<text class="name_text">{{villageName}}</text>
				<image class="right_arrow" src="/static/common/icon_right.png"></image>
			</view>
			<text class="room_text" v-if="isLogin&&isAuth">{{buildNum}}栋{{roomNum}}室</text>
		</view>
		<view class="banner">
			<swiper :indicator-dots="indicatorDots" :current="index" :autoplay="autoplay" :interval="interval" :duration="duration"
			 :circular="true" style="height:240rpx;width:686rpx">
				<block v-for="(item, index) in bannerList" :key="item.id">
					<swiper-item @click="onClickBanner(index)">
						<image :src="item" style="width:100%;height:100%;"></image>
					</swiper-item>
				</block>
			</swiper>
		</view>
		<view class="first-container">
			<view class="upload-item" v-for="(item, index) in uploadMaps" :key="item.id" @click="onSwitchClick(index)">
				<image class="upload-img" :src="`/static/common/${item.img}.png`"></image>
				<text class="upload-text">{{item.title}}</text>
			</view>
		</view>
		<view class="notice" v-if="!hiddenNotice">
			<view class="notice_head">
				<image class="head_img" src="/static/common/icon_notice.png"></image>
			</view>
			<view style="flex-grow:1">
				<swiper :indicator-dots="false" :circular="true" :autoplay="autoplay" :interval="interval" :duration="duration"
				 :vertical="true" style="height:40rpx;">
					<block v-for="(item, index) in headlinesArr" :key="item.id">
						<swiper-item @click="onHeadLinesDetail(index)">
							<view class="notice_content">{{item.title}}</view>
						</swiper-item>
					</block>
				</swiper>
			</view>
			<image class="close_img" src="/static/common/home_icon_cuowu.png" @click="onCloseNotice"></image>
		</view>
		<view class="line-view" style="margin-top:30rpx;"></view>
		<view class="noticeList">
			<view class="list_top">
				<view class="top_left">
					<image src="/static/common/icon_gobggao.png" style="width:36rpx;height:34rpx;margin-right:12rpx;"></image>
					<text class="new_notice_text">小区风采</text>
				</view>
				<view style="display:flex;align-items:center" @click="onLookAll">
					<text class="notice_more">查看全部</text>
					<image src="/static/common/home_icon_arrow_right.png" style="width:10rpx;height:18rpx;margin-left:9rpx;">
					</image>
				</view>
			</view>
			<view style="margin-top: 70rpx;" v-if="isNoData">
				<uni-empty :bgColor="bgColor" :emptyText="emptyText"></uni-empty>
			</view>
			<view v-if="!isNoData" class="noticeItem" :class="index+1<elegantsArr.length?'solid-bottom':''" v-for="(item,index) in elegantsArr"
			 :key="item.id" @click="onElegantDetail(index)">
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
	import uniEmpty from '@/components/uni-empty/uni-empty.vue'
	export default {
		components: {
			uniEmpty
		},
		data() {
			return {
				villageName: '',
				villageId: '',
				indicatorDots: true,
				vertical: false,
				autoplay: true,
				index: 0,
				interval: 5000,
				duration: 1000,
				bannerList: ["/static/common/icon_banner.png"],
				// bannerList1: [],
				bannerData: [],
				uploadMaps: [{
						img: "home_icon_fangke",
						title: "访客管理"
					},
					{
						img: "home_icon_jiaofei",
						title: "生活缴费"
					},
					{
						img: "home_icon_suipai",
						title: "随手拍"
					},
					{
						img: "home_icon_renzheng",
						title: "社区认证"
					}
				],
				hiddenNotice: false,
				headlinesArr: [],
				elegantsArr: [],
				showLoginPopup: true,
				buildNum: '',
				roomNum: '',
				isLogin: true,
				isAuth: true,
				isNoData: true,
				emptyText: '暂无小区风采...',
				bgColor: '#FFFFFF',
				animation: ''
			}
		},
		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow() {
			var token = uni.getStorageSync('token')
			this.villageName = uni.getStorageSync('villageName')
			if (token) {
				this.getUserInfoRequest()
			} else {
				this.isLogin = false
				this.isNoData = true
				this.hiddenNotice = true
				this.bannerList1 = []
			}
		},
		methods: {
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
							that.villageName = res.data.villageName
							that.buildNum = res.data.buildingName
							that.roomNum = res.data.roomName
							that.getBannerListRequest()
							that.getNoticeListRequest('headlines')
							that.getNoticeListRequest('elegant')
						} else {
							that.isLogin = true
							that.isAuth = false
							that.isNoData = true
							that.hiddenNotice = true
						}
					}
				}).catch(err => {
					that.isNoData = true
					that.hiddenNotice = true
				})
			},

			async getBannerListRequest() {
				var that = this
				return await that.$http(that.$api.getBannerListUrl, {
					method: 'GET',
					data: {
						status: '1',
						villageId: uni.getStorageSync('villageId')
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						var bannerData = res.data
						if (bannerData.length != 0) {
							var imgs = []
							for (let i = 0; i < bannerData.length; i++) {
								var imgPath = bannerData[i].img;
								var imgUrl = that.$common.combineImageUrl(imgPath)
								imgs.push(imgUrl)
							}
							while (that.bannerList.legnth > 0) {
								that.bannerList.splice(0, 1);
							}
							that.bannerList = imgs
							that.bannerData = bannerData
						} else {
							// that.bannerList = []
							that.bannerData = []
						}
					}
				}).catch(err => {})
			},

			async getNoticeListRequest(source) {
				var that = this
				return await that.$http(source == 'headlines' ? that.$api.getHeadLinesListUrl : that.$api.getElegantListUrl, {
					method: 'GET',
					data: {
						limit: '5',
						page: '1',
						status: '1',
						villageId: uni.getStorageSync('villageId')
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data.list
						if (source == 'headlines') {
							that.hiddenNotice = list.length == 0 ? true : false
							that.headlinesArr = list
						} else {
							that.isNoData = list.length == 0 ? true : false
							that.elegantsArr = list
						}
					} else {
						that.isNoData = true
					}
				}).catch(err => {})
			},
			/**
			 * 切换小区  id为1：切换房产；为2：重新选择社区
			 */
			pageToVillage() {
				var url = ''
				if (!this.isLogin) {
					url = '/pages/communitySelect/index?fromID=2'
				} else {
					if (this.isAuth) {
						url = '/pages/house/index?fromID=1'
					} else {
						url = '/pages/communitySelect/index?fromID=2'
					}
				}
				uni.navigateTo({
					url: url,
				})
			},
			/**
			 * 关闭首页滚动公告
			 */
			onCloseNotice() {
				this.hiddenNotice = true
			},
			/**
			 * 全部小区风采
			 */
			onLookAll() {
				var loginStatus = this.judgeLoginStatus()
				var authStatus
				if (loginStatus) {
					authStatus = this.judgeAuthStatus()
				}
				if (loginStatus && authStatus) {
					uni.navigateTo({
						url: '/pages/notice/index',
					})
				}
			},
			/**
			 * 登录、认证事件
			 */
			getUserInfo: function(e) {
				console.log('111')
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
			/**
			 * 访客管理等四个按钮点击事件
			 */
			onSwitchClick(index) {
				var path = ''
				var loginStatus = this.judgeLoginStatus()
				var authStatus
				if (loginStatus) {
					authStatus = this.judgeAuthStatus(index)
					if (!authStatus && index == 3) {
						uni.navigateTo({
							url: '/pages/communityRegister/validation',
						})
					}
				}
				if (loginStatus && authStatus) {
					switch (index) {
						case 0:
							path = '/pages/visitorManager/list'
							break;
						case 1:
							path = '/pages/livePayment/index'
							break;
						case 2:
							path = '/pages/snapshot/list'
							break;
						case 3:
							path = '/pages/communityRegister/validation'
							break;
						default:
							break;
					}
					uni.navigateTo({
						url: path,
					})
				}
			},
			/**
			 * 轮播图详情
			 */
			onClickBanner(idx) {
				if (this.bannerList.length != 0) {
					const id = this.bannerData[idx].linkId
					const linkType = this.bannerData[idx].linkType
					switch (linkType) {
						case '1':
							uni.navigateTo({
								url: `/pages/notice/detail?id=${id}&fromID=0&original=0`
							})
							break;
						case '2':
							uni.navigateTo({
								url: `/pages/notice/detail?id=${id}&fromID=1&original=0`
							})
							break;

						default:
							break;
					}
				}
			},

			/**
			 * 小区头条详情
			 */
			onHeadLinesDetail(idx) {
				const id = this.headlinesArr[idx].id
				uni.navigateTo({
					url: `/pages/notice/detail?id=${id}&fromID=0`
				})
			},

			/**
			 * 小区风采详情
			 */
			onElegantDetail(idx) {
				const id = this.elegantsArr[idx].id
				uni.navigateTo({
					url: `/pages/notice/detail?id=${id}&fromID=1`
				})
			},
			/**
			 * 判断是否登录
			 */
			judgeLoginStatus() {
				if (!this.isLogin) {
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					})
					this.animationEvent()
					return false
				}
				return true
			},

			/**
			 * 判断是否认证
			 */
			judgeAuthStatus(index) {
				if (index == 3) {
					return true
				}
				if (!this.isAuth) {
					this.onShowModal('您还未进行社区认证，认证后即可使用该功能?', '去认证', '/pages/communityRegister/validation')
					this.animationEvent()
					return false
				}
				return true
			},

			/**
			 * 按钮抖动动画
			 */
			animationEvent() {
				var that = this
				that.animation = 'shake'
				setTimeout(function() {
					that.animation = ''
				}, 1000)
			},

			/**
			 * 弹框事件
			 */
			onShowModal(content, confirmText, url) {
				uni.showModal({
					content: content,
					cancelText: '关闭',
					cancelColor: '#797979',
					confirmText: confirmText,
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							if (url != '') {
								uni.navigateTo({
									url: url,
								})
							}
						}
					}
				})
			}
		},
		// computed: {
		// 	getImageUrl() {
		// 		return function(imgStr) {
		// 			return `/static/common/${imgStr}.png`
		// 		}
		// 	}
		// }
	}
</script>

<style lang="scss" scoped>
	.home_container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: #fff;
	}

	.community_container {
		display: flex;
		flex-direction: column;
		background: #fff;
		width: 100%;
		padding: 16rpx 32rpx 5rpx;
	}

	.community_name {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 15rpx;
	}

	.location_img {
		width: 30rpx;
		height: 36rpx;
		margin-right: 10rpx;
	}

	.name_text {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 36rpx;
	}

	.right_arrow {
		width: 14rpx;
		height: 22rpx;
		margin-left: 10rpx;
	}

	.room_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
		margin-left: 40rpx;
	}

	.banner {
		flex-shrink: 0;
		display: flex;
		justify-content: center;
		background: #fff;
		margin-top: 14rpx;
	}

	.banner .swiper-item {
		width: 100%;
		height: 100%;
	}

	.first-container {
		display: flex;
		flex-direction: row;
		padding: 0 45rpx;
		width: 100%;
		height: 143rpx;
		margin-top: 30rpx;
		background: rgba(255, 255, 255, 1);
	}

	.upload-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: calc((100% - 75rpx)/4);
		height: 143rpx;
		background: #fff;
		border-radius: 8rpx;
		margin-right: 25rpx;
		position: relative;
	}

	.upload-item:nth-child(4n) {
		margin-right: 0;
	}

	.upload-img {
		width: 94rpx;
		height: 94rpx;
		margin-bottom: 17rpx;
	}

	.upload-text {
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #2A2C2F;
		line-height: 32rpx;
	}

	.notice {
		display: flex;
		flex-direction: row;
		align-items: center;
		background: #fff;
		padding: 31rpx 32rpx 0;
	}

	.notice .swiper-item {
		width: 100%;
		height: 100%;
	}

	.notice_head {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 44rpx;
		height: 32rpx;
		background: #FC692C;
		border-radius: 4rpx;
		margin-right: 10rpx;
	}

	.head_img {
		width: 37rpx;
		height: 16rpx;
	}

	.close_img {
		width: 16rpx;
		height: 16rpx;
		margin: 0 8rpx;
	}

	.notice_content {
		height: 40rpx;
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #2A2C2F;
		line-height: 40rpx;
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
		word-wrap: break-word;
		white-space: normal !important;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}

	.noticeList {
		background: #fff;
		padding: 0 32rpx;
		display: flex;
		flex-direction: column;
	}

	.list_top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 35rpx 0rpx 6rpx;
	}

	.top_left {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.new_notice_text {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 36rpx;
	}

	.notice_more {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 37rpx;
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
