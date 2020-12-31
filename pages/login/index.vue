<template>
	<scroll-view class="login_container" scroll-y="false">
		<view class="login_head">
			<text class="login_type" :class="loginType==2?'active':''" @click="changeActive" data-id="2">验证码登录</text>
			<text class="middle_line"></text>
			<text class="login_type" :class="loginType==1?'active':''" @click="changeActive" data-id="1">账号登录</text>
		</view>
		<view class="login-content" v-if="loginType==1">
			<view class="account-container">
				<view class="account-input">
					<text class="input-text">账号</text>
					<input class='login-input' :value="phoneNo" @input="getValue" @blur="phoneNoBlur" data-id="phoneNo" type='number'
					 maxlength='11' placeholder="请输入手机号" placeholder-class='placeholder1' focus='true'></input>
				</view>
				<view class="input-line"></view>
			</view>
			<view class="account-container">
				<view class="account-input">
					<text class="input-text">密码</text>
					<input class='login-input' :value="password" @input="getValue" data-id="password" type='default' maxlength='20'
					 placeholder="请输入密码" placeholder-class='placeholder1' :password='!seePsw'></input>
					<view class="seePsw-view" @click="onSeePsw">
						<image class="seePsw-img" :src="seePsw?'/static/common/notsee.png':'/static/common/see.png'"></image>
					</view>
				</view>
				<view class="input-line"></view>
			</view>
		</view>
		<view class="login-content" v-else>
			<view class="account-container">
				<view class="account-input">
					<text class="input-text">手机号</text>
					<input class='login-input' :value="phoneNo" @input="getValue" data-id="phoneNo" type='number' maxlength='11'
					 placeholder="请输入手机号" placeholder-class='placeholder1' focus='true'></input>
				</view>
				<view class="input-line"></view>
			</view>
			<view class="account-container">
				<view class="account-input">
					<text class="input-text">验证码</text>
					<input class='login-input' :value="smsCode" @input="getValue" data-id="smsCode" type='number' maxlength='6'
					 placeholder='输入验证码' placeholder-class='placeholder1'></input>
					<text class='vscode-text' @click='onGetCode'>{{getCodeText}}</text>
				</view>
				<view class="input-line"></view>
			</view>
		</view>
		<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
		<view class="tips">
			<text class="com">还没有账号？</text>
			<text class="blueColor" @click="toRegister">去注册</text>
			<text class="line"></text>
			<text class="com" @click="toForget">忘记密码</text>
		</view>
		<view class="third_login" v-if="false">
			<view class="third_head">
				<view class="head_line"></view>
				<text class="head_text">其他登录方式</text>
				<view class="head_line"></view>
			</view>
			<view class="wx_login" @click="onWXLogin">
				<image class="wx_img" src="/static/common/icon_weixin.png"></image>
				<text>微信登录</text>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		data() {
			return {
				loginType: 1,
				phoneNo: '',
				password: '',
				smsCode: '',
				seePsw: false,
				isLoading: false,
				buttonText: '登录',
				isDisable: true,
				getCodeText: '获取验证码',
				isDisabled: true,
			}
		},
		onLoad() {
			this.phoneNo = uni.getStorageSync('phoneNo')
		},
		mounted() {
			var that = this;
			that.$utils.$on('validateEmpty', () => {
				that.validateEmpty();
			})
		},
		methods: {
			changeActive(e) {
				this.loginType = e.currentTarget.dataset.id
			},
			onGetCode() {
				if (this.phoneNo == '') {
					uni.showToast({
						title: '手机号码不能为空',
						icon: 'none'
					});
					return
				}else if (this.phoneNo.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.phoneNo))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
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
			/**
			 * 获取短信验证码
			 */
			async getCodeRequest() {
				var that = this
				return await that.$http(that.$api.getLoginSMSCodeUrl + "?phone=" + that.phoneNo, {
					method: 'POST',
					data: {},
					token: ''
				}).then(res => {
					that.handleRequestResult(res)
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
			submitHandler: function submitHandler(e) {
				if (this.phoneNo.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.phoneNo))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				}
				if (this.loginType == 1 && (this.password.length < 6 || this.password.length > 20)) {
					uni.showToast({
						title: '请输入6-20字符长度的密码',
						icon: 'none'
					})
					return
				}
				if (this.loginType == 1 && !this.$common.isPsd(this.password)) {
					uni.showToast({
						title: '密码只可以为数字或字母',
						icon: 'none'
					})
					return
				}
				this.isLoading = true
				this.buttonText = '登录中...'
				this.isDisable = true
				this.onLoginEvent()
			},

			async onLoginEvent() {
				var that = this
				return await that.$http(that.$api.loginUrl, {
					method: 'POST',
					data: {
						account: that.phoneNo,
						loginType: that.loginType,
						secret: that.loginType == 1 ? that.password : that.smsCode,
						userType: '3'
					},
					token: ''
				}).then(res => {
					this.isLoading = false
					this.buttonText = '登录'
					this.isDisable = false
					if (res.code == 200) {
						uni.setStorageSync('phoneNo', that.phoneNo)
						uni.setStorageSync('token', res.data.token)
						uni.setStorageSync('userId', res.data.userId)
						uni.showToast({
							title: '登录成功',
							icon: 'none',
							success: (res) => {
								uni.navigateBack({
									delta: 1
								});
							}
						})
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						})
					}
				}).catch(err => {
					this.isLoading = false
					this.buttonText = '登录'
					this.isDisable = false
				})
			},
			toRegister() {
				uni.navigateTo({
					url: '/pages/register/index',
				})
			},
			toForget() {
				uni.navigateTo({
					url: '/pages/register/index?fromID=1',
				})
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
				if (type == "password") {
					this.password = e.detail.value.replace(/\s+/g, '')
				}
				this.validateEmpty();
			},
			validateEmpty() {
				if (this.loginType == 1) {
					if (this.phoneNo == '' || this.password == '') {
						this.isDisable = true
					} else {
						this.isDisable = false
					}
				} else {
					if (this.phoneNo == '' || this.smsCode == '') {
						this.isDisable = true
					} else {
						this.isDisable = false
					}
				}
			},
			onSeePsw() {
				this.seePsw = !this.seePsw
			},
		}
	}
</script>

<style lang="scss" scoped>
	.login_container {
		width: 100%;
		height: 100%;
		background: #fff;
		position: relative;
	}

	.login_head {
		display: flex;
		margin-left: 41rpx;
		margin-top: 39rpx;
		align-items: center;
	}

	.login_head .login_type {
		font-size: 48rpx;
		color: #B2BAB9;
		line-height: 70rpx;
		letter-spacing: 1rpx;
	}

	.login_head .middle_line {
		width: 2rpx;
		height: 22rpx;
		background: #979797;
		margin: 0 22rpx;
	}

	.login_head .active {
		color: #2A2F2E;
	}

	.login-content {
		display: flex;
		flex-direction: column;
		padding: 0 32rpx;
		margin-top: 75rpx;
	}

	.account-container {
		display: flex;
		flex-direction: column;
	}

	.account-input {
		display: flex;
		flex-direction: row;
		align-items: center;
		position: relative;
	}

	.input-text {
		font-size: 34rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(121, 121, 121, 1);
		line-height: 48rpx;
		margin-right: 70rpx;
	}

	.login-input {
		width: 330rpx;
		font-size: 32rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(47, 45, 44, 1);
		line-height: 48rpx;
	}

	.placeholder1 {
		font-size: 32rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: rgba(186, 186, 186, 1);
		line-height: 48rpx;
	}

	.input-line {
		margin: 28rpx 0;
		height: 2rpx;
		background-color: #eee;
	}

	.seePsw-view {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 50rpx;
		height: 50rpx;
		position: absolute;
		right: 0;
	}

	.seePsw-img {
		width: 36rpx;
		height: 36rpx;
	}

	.vscode-text {
		line-height: 40rpx;
		font-size: 30rpx;
		color: #218EFF;
		position: absolute;
		right: 0;
	}

	.submit-btn {
		margin-top: 124rpx;
	}

	.tips {
		display: flex;
		justify-content: center;
		margin-top: 56rpx;
		align-items: center;
	}

	.tips .com {
		font-size: 30rpx;
		color: #BABEC1;
	}

	.blueColor {
		color: #218EFF;
	}

	.tips .line {
		display: inline-block;
		flex-shrink: 0;
		width: 2rpx;
		background: #979797;
		height: 22rpx;
		margin: 0 31rpx;
	}

	.third_login {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 279rpx;
		position: absolute;
		left: 0;
		bottom: 0;
	}

	.third_head {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.head_line {
		width: 160rpx;
		height: 2rpx;
		background: #EEEEEE;
	}

	.head_text {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 37rpx;
		margin: 0 20rpx;
	}

	.wx_login {
		margin-top: 30rpx;
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 26rpx;
	}

	.wx_img {
		width: 101rpx;
		height: 100rpx;
		margin-bottom: 16rpx;
	}
</style>
