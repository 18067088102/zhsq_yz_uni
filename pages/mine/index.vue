<template>
	<view class="mine_container">
		<view class="account_info" @click="onClickAccount">
			<view class="account_box">
				<image class="avator_img" mode="aspectFill" :src="faceImgPath?faceImgUrl:'/static/mine/icon_avator.png'"></image>
				<view class="account_detail">
					<text class="account_text">{{nameTitle}}</text>
					<text class="account_detail">{{detailTitle}}</text>
				</view>
			</view>
			<view class="review_box">
				<image class="review_img" src="/static/mine/icon_renzheng.png"></image>
				<text class="review_text">{{isAuth?'已认证':'未认证'}}</text>
			</view>
		</view>
		<view class="list_container" v-for="item1 in mineListPics" :key="item1.id">
			<view class="mine_list_item" v-for="(item2, index) in item1.items" :key="item2.id" @click="onClickItem(item1, index)">
				<view class="item_left">
					<image class="left_img" :src="`/static/mine/${item2.pic}.png`"></image>
					<text class="left_text">{{item2.title}}</text>
				</view>
				<view class="item_right">
					<text class="right_text" v-if="item2.tip&&item2.tip!='0'">{{item2.tip}}</text>
					<image class="right_img" src="/static/mine/icon_mine_right.png"></image>
				</view>
			</view>
		</view>
		<view class="popup_box" :style="!isLogin?'':'background: #FCFAE5;'" v-if="!isLogin||!isAuth">
			<view class="box_left">
				<image :style="!isLogin?'':'width: 29rpx;'" class="popup_img" :src="!isLogin?'/static/common/icon_logo.png':'/static/common/icon_renzheng.png'"></image>
				<text class="popup_text" :style="!isLogin?'':'color: #FF7A05;'">{{!isLogin?'请登录，登录后查看更多信息':'您还未进行社区认证，请认证'}}</text>
			</view>
			<view>
				<button :style="!isLogin?'':'background: #FF7A05;color: #FCFAE5;'" class="popup_btn shadow" :class="[animation == 'shake' ? 'animation-shake' : '']"
				 @click="getUserInfo">{{!isLogin?'去登录':'去认证'}}</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				showLoginPopup: true,
				detailsArr: ['登录/注册', '登录后可查看更多信息', '请登记社区信息'],
				mineListPics: [{
						id: '1',
						items: [{
								pic: 'icon_shualian',
								title: '刷脸开门',
								tip: ''
							},
							{
								pic: 'icon_fangchan',
								title: '房产信息',
								tip: ''
							},
							{
								pic: 'icon_cheliang',
								title: '车辆信息',
								tip: ''
							},
							{
								pic: 'icon_fangwu',
								title: '住户信息',
								tip: ''
							}
						]
					},
					{
						id: '2',
						items: [{
								pic: 'icon_fankui',
								title: '意见反馈',
								tip: ''
							},
							{
								pic: 'icon_shezhi',
								title: '设置',
								tip: ''
							}
						]
					}
				],
				isLogin: true,
				isAuth: true,
				nameTitle: '',
				detailTitle: '',
				faceImgPath: '',
				faceImgUrl: '',
				animation: ''
			}
		},
		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow() {
			var token = uni.getStorageSync('token')
			if (token) {
				this.getUserInfoRequest()
			} else {
				this.mineListPics[0].items[0].tip = ''
				this.mineListPics[0].items[1].tip = ''
				this.mineListPics[0].items[2].tip = ''
				this.mineListPics[0].items[3].tip = ''

				this.faceImgPath = ''
				this.faceImgUrl = ''
				this.nameTitle = this.detailsArr[0]
				this.detailTitle = this.detailsArr[1]
				this.isLogin = false
				this.isAuth = false
			}
		},
		methods: {
			async getUserInfoRequest() {
				var that = this
				var phoneNo = uni.getStorageSync('phoneNo')
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
							
							that.mineListPics[0].items[0].tip = '已认证'

							var name = uni.getStorageSync('data').name
							var imgPath = uni.getStorageSync('data').faceImg
							that.faceImgPath = imgPath
							that.faceImgUrl = that.$common.combineImageUrl(imgPath)
							that.nameTitle = name
							that.detailTitle = phoneNo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
							that.isLogin = true
							that.isAuth = true
						} else {
							that.faceImgPath = ''
							that.faceImgUrl = ''
							that.nameTitle = phoneNo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
							that.detailTitle = that.detailsArr[2]
							that.isLogin = true
							that.isAuth = false
						}
						that.getMineCountNumRequest()
					}
				}).catch(err => {
					that.faceImgPath = ''
					that.faceImgUrl = ''
					that.nameTitle = '用户姓名'
					that.detailTitle = phoneNo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
				})
			},

			async getMineCountNumRequest() {
				var that = this
				return await that.$http(that.$api.getMineCountNumUrl, {
					method: 'GET',
					data: {
						personId: uni.getStorageSync('data').archiveId,
						roomId: uni.getStorageSync('data').roomId,
						relationCode: uni.getStorageSync('data').relationCode
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						that.mineListPics[0].items[1].tip = res.data.houseNum.toString()
						that.mineListPics[0].items[2].tip = res.data.carNum.toString()
						that.mineListPics[0].items[3].tip = res.data.householdsNum.toString()
					}
				}).catch(err => {})
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

			/**
			 * 头部个人资料
			 */
			onClickAccount() {
				if (!this.isLogin) {
					uni.navigateTo({
						url: '/pages/login/index',
					})
				}else if (!this.isAuth) {
					uni.navigateTo({
						url: '/pages/communityRegister/validation',
					})
				}else if (this.isLogin && this.isAuth) {
					uni.navigateTo({
						url: '/pages/accountInfo/index',
					})
				}
			},

			/**
			 * 刷脸开门等六个Cell-Item点击事件
			 */
			onClickItem(item1, index) {
				var idx = item1.id + '-' + (index + 1)
				console.log(idx)
				var path = ''
				var loginStatus = this.judgeLoginStatus()
				var authStatus
				if (loginStatus) {
					authStatus = this.judgeAuthStatus(idx)
					if (!authStatus && idx == '2-2') {
						uni.navigateTo({
							url: '/pages/setting/index',
						})
					}
				}
				if (loginStatus && authStatus) {
					switch (idx) {
						case '1-1':
							path = '/pages/face/index'
							break;
						case '1-2':
							path = '/pages/house/index'
							break;
						case '1-3':
							path = '/pages/vehicle/list'
							break;
						case '1-4':
							path = '/pages/resident/list'
							break;
						case '2-1':
							path = '/pages/feedBack/index'
							break;
						case '2-2':
							path = '/pages/setting/index'
							break;

						default:
							break;
					}
					if (uni.getStorageSync('data') != null) {
						const relationName = uni.getStorageSync('data').relationName
						if (idx == '1-4' && relationName == '租客') {
							uni.showToast({
								title: '租客暂无权限访问该功能',
								icon: 'none'
							})
							return
						}
					}
					uni.navigateTo({
						url: path,
					})
				}
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
			judgeAuthStatus(idx) {
				if (idx == '2-2') {
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
				var that = this;
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
		computed: {
			
		}
	}
</script>

<style lang="scss" scoped>
	.mine_container {
		width: 100%;
		height: 100%;
		background: #F6F8FA;
	}

	.account_info {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		background: #218EFF;
		width: 100%;
		padding: 33rpx 0 33rpx 32rpx;
	}

	.account_box {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.avator_img {
		width: 120rpx;
		height: 120rpx;
		margin-right: 24rpx;
		border-radius: 50%;
	}

	.account_detail {
		display: flex;
		flex-direction: column;
	}

	.account_text {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #FFFFFF;
		line-height: 50rpx;
		margin-bottom: 10rpx;
	}

	.account_detail {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #FFFFFF;
		line-height: 28rpx;
	}

	.review_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 18rpx 24rpx;
		background: #FFE7BC;
		border-radius: 30rpx 0px 0px 30rpx;
	}

	.review_img {
		width: 24rpx;
		height: 28rpx;
		margin-right: 8rpx;
	}

	.review_text {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #975D17;
		line-height: 24rpx;
	}

	.list_container {
		padding: 0 32rpx;
		margin-top: 30rpx;
	}

	.mine_list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 104rpx;
		padding: 0 30rpx;
		background: #fff;
	}

	.mine_list_item:first-child {
		border-radius: 8rpx 8rpx 0rpx 0rpx;
	}

	.mine_list_item:last-child {
		border-radius: 0rpx 0rpx 8rpx 8rpx;
	}

	.item_left,
	.item_right {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.left_img {
		width: 44rpx;
		height: 44rpx;
		margin-right: 16rpx;
	}

	.left_text {
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #00172F;
		line-height: 42rpx;
	}

	.right_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
		margin-right: 10rpx;
	}

	.right_img {
		width: 15rpx;
		height: 24rpx;
	}

	.center {
		height: 500rpx;
		width: 500rpx;
		background: #fff;
		text-align: center;
		line-height: 500rpx;
		color: #555;
		border-radius: 8rpx;
		font-size: 28rpx;
	}
</style>
