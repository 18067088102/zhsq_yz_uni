<template>
	<view class="community_container">
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">房屋信息</text>
			</view>
		</view>
		<view class="cu-form-group solid-bottom" @click="onSelectVillage">
			<view class="title">社区</view>
			<picker disabled>
				<view class="picker" :class="villageName?'color2':'color1'">
					{{villageName?villageName:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">楼栋号</view>
			<picker @change="buildingChange" :value="index2" :range="picker2">
				<view class="picker" :class="index2!=null?'color2':'color1'">
					{{index2!=null?picker2[index2]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">单元房号</view>
			<picker @change="roomChange" :value="index3" :range="picker3">
				<view class="picker" :class="index3!=null?'color2':'color1'">
					{{index3!=null?picker3[index3]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">验证手机</text>
			</view>
			<view class="action">
				请填写已在物业登记的手机号
			</view>
		</view>
		<view class="login-content">
			<view class="account-container solid-bottom">
				<view class="account-input">
					<text class="input-text">手机号</text>
					<input class='login-input' :value="phoneNo" @input="getValue" @blur="phoneNoBlur" data-id="phoneNo" type='number'
					 maxlength='11' placeholder="请输入手机号" placeholder-class='placeholder1'></input>
				</view>
			</view>
			<view class="account-container solid-bottom">
				<view class="account-input">
					<text class="input-text">验证码</text>
					<input class='login-input' :value="smsCode" @input="getValue" data-id="smsCode" type='number' maxlength='6'
					 placeholder='输入验证码' placeholder-class='placeholder1'></input>
					<text class='vscode-text' @click='onGetCode'>{{getCodeText}}</text>
				</view>
			</view>
		</view>
		<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				villageName: '',
				villageId: '',
				buildingName: '',
				buildingId: '',
				buildingIdArr: [],
				index2: null,
				picker2: [],
				roomName: '',
				roomId: '',
				roomIdArr: [],
				index3: null,
				picker3: [],
				phoneNo: "",
				smsCode: '',
				isLoading: false,
				buttonText: '开始验证',
				isDisable: true,
				getCodeText: '获取验证码',
				isDisabled: true,
				illegalPhoneNum: false
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.villageName = uni.getStorageSync('villageName')
			this.villageId = uni.getStorageSync('villageId')
			this.getBuildingListRequest()
		},
		mounted() {
			var that = this;
			that.$utils.$on('refreshBuildingList', () => {
				that.getBuildingListRequest()
			})
		},
		methods: {
			onSelectVillage() {
				uni.navigateTo({
					url: '/pages/communitySelect/index?fromID=1'
				})
			},

			buildingChange(e) {
				this.index2 = e.detail.value
				this.buildingId = this.buildingIdArr[e.detail.value]
				this.getRoomListRequest()
			},

			roomChange(e) {
				this.index3 = e.detail.value
				this.roomId = this.roomIdArr[e.detail.value]
			},

			async getBuildingListRequest() {
				var that = this
				return await that.$http(that.$api.getBuildingListUrl, {
					method: 'GET',
					data: {
						villageId: that.villageId
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						var nameArr = []
						var idArr = []
						for (let i = 0; i < res.data.length; i++) {
							nameArr.push(res.data[i].name)
							idArr.push(res.data[i].id)
						}
						that.picker2 = nameArr
						that.buildingIdArr = idArr
					}
				}).catch(err => {})
			},

			async getRoomListRequest() {
				var that = this
				return await that.$http(that.$api.getRoomNumListUrl, {
					method: 'GET',
					data: {
						buildingId: that.buildingId
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						var nameArr = []
						var idArr = []
						for (let i = 0; i < res.data.length; i++) {
							nameArr.push(res.data[i].name)
							idArr.push(res.data[i].id)
						}
						that.picker3 = nameArr
						that.roomIdArr = idArr
					}
				}).catch(err => {})
			},

			onGetCode() {
				if (this.phoneNo == '') {
					uni.showToast({
						title: '手机号码不能为空',
						icon: 'none'
					});
					return
				} else {
					if (this.isDisabled == true) {
						uni.showToast({
							title: '加载中…',
							icon: 'loading'
						})
						this.getCodeRequest();
					} else {
						uni.showToast({
							title: '已获取验证码,请稍后再试',
							icon: 'none'
						})
					}
				}
			},
			
			async getCodeRequest() {
				var that = this
				return await that.$http(that.$api.getAuthSMSCodeUrl + "?phone=" + this.phoneNo, {
					method: 'POST',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.handleRequestResult(res);
				}).catch(err => {})
			},
			
			handleRequestResult(res) {
				uni.hideToast()
				if (res.code == 200) {
					uni.showToast({
						title: '获取验证码成功',
						icon: "none"
					})
					var _this = this
					var coden = 60 //定义60秒的倒计时
					var codeV = setInterval(function() {
						//_this这里的作用域不同了
						_this.getCodeText = (--coden) + 's' + '后重试'
						_this.isDisabled = false
						if (coden == -1) { //清除setInterval倒计时，这里可以做很多操作，按钮变回原样等
							clearInterval(codeV)
							_this.getCodeText = '获取验证码'
							_this.isDisabled = true
						}
					}, 1000) //1000是1秒
				} else {
					uni.showToast({
						title: res.msg,
						icon: "none"
					})
				}
			},
			
			phoneNoBlur(event) {
				let phoneNo = event.detail.value || event.detail.text;
				if (!phoneNo) {
					phoneNo = ''
				}
				if (phoneNo.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phoneNo))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					this.illegalPhoneNum = true
				} else {
					this.illegalPhoneNum = false
				}
			},
			
			getValue(e) {
				let type = e.currentTarget.dataset.id;
				if (type == 'phoneNo') {
					this.phoneNo = e.detail.value.replace(/\s+/g, '')
				}
				if (type == "smsCode") {
					this.smsCode = e.detail.value.replace(/\s+/g, '')
				}
				this.validateEmpty();
			},
			
			validateEmpty() {
				if (this.phoneNo == '' || this.smsCode == '') {
					this.isDisable = true
				} else {
					this.isDisable = false
				}
			},
			
			submitHandler() {
				if (this.villageId == '' || this.buildingId == '' || this.roomId == '') {
					uni.showToast({
						title: '请完善房屋信息',
						icon: 'none'
					})
					return
				} else if (this.illegalPhoneNum) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				} else {
					this.isLoading = true
					this.buttonText = '验证中...'
					this.isDisable = true
					this.onAuthEvent()
				}
			},
			
			async onAuthEvent() {
				var that = this
				return await that.$http(that.$api.roomAuthUrl1, {
					method: 'PUT',
					data: {
						buildingId: that.buildingId,
						mobile: that.phoneNo,
						roomId: that.roomId,
						verifyCode: that.smsCode,
						villageId: that.villageId
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '开始验证'
					that.isDisable = false
					if (res.code == 200) {
						uni.showToast({
							title: '验证成功',
							icon: "none",
							success: (res) => {
								uni.navigateTo({
									url: `/pages/communityRegister/validation1?&villageName=${that.villageName}&villageId=${that.villageId}&buildingName=${that.picker2[that.index2]}&buildingId=${that.buildingId}&roomName=${that.picker3[that.index3]}&roomId=${that.roomId}`,
								})
							}
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '开始验证'
					that.isDisable = false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.community_container {
		width: 100%;
		height: 100%;
		background: #F6F8FA;
	}

	.login-content {
		display: flex;
		flex-direction: column;
	}

	.account-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 100rpx;
		background: #fff;
	}

	.account-input {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0 32rpx;
		position: relative;
	}

	.input-text {
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(121, 121, 121, 1);
		line-height: 48rpx;
		margin-right: 70rpx;
	}

	.login-input {
		width: 330rpx;
		font-size: 30rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(47, 45, 44, 1);
		line-height: 48rpx;
	}

	.placeholder1 {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(186, 186, 186, 1);
		line-height: 48rpx;
	}

	.vscode-text {
		line-height: 40rpx;
		font-size: 30rpx;
		color: #218EFF;
		position: absolute;
		right: 32rpx;
	}

	.submit-btn {
		margin-top: 100rpx;
	}
</style>
