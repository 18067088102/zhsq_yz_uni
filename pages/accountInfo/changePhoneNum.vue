<template>
	<view class='login-container'>
		<!-- 原手机号 -->
		<view class='phone-view common-view'>
			<input class='login-input' :value="phoneNo" :disabled="true"></input>
		</view>
		<!-- 新手机号 -->
		<view class='phone-view common-view' style="margin-top: 32rpx;">
			<input class='login-input' :value="newPhoneNo" @input="getValue" @blur="newPhoneNoBlur" data-id="newPhoneNo"
			 type='number' maxlength='11' placeholder='请输入新手机号' placeholder-class='placeholder'></input>
		</view>
		<!-- 验证码 -->
		<view class='vscode-view common-view'>
			<input class='login-input' :value="smsCode" @input="getValue" data-id="smsCode" maxlength='6' placeholder='输入验证码'
			 placeholder-class='placeholder'></input>
			<view class='line'></view>
			<text class='vscode-text' @click='onGetCode'>{{getCodeText}}</text>
		</view>
		<!-- 修改按钮 -->
		<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				getCodeText: '获取验证码',
				isLoading: false,
				buttonText: '修改',
				isDisable: true,
				phoneNo: "",
				smsCode: "",
				newPhoneNo: "",
				isDisabled: true
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.phoneNo = uni.getStorageSync('phoneNo')
		},
		methods: {
			phoneNoBlur(event) {
				let phoneNo = event.detail.value || event.detail.text
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

			newPhoneNoBlur(event) {
				let newPhoneNo = event.detail.value || event.detail.text
				if (!newPhoneNo) {
					newPhoneNo = ''
				}
				if (newPhoneNo.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(newPhoneNo))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
				}
			},

			getValue(e) {
				let type = e.currentTarget.dataset.id
				if (type == 'phoneNo') {
					this.phoneNo = e.detail.value.replace(/\s+/g, '')
				}
				if (type == "smsCode") {
					this.smsCode = e.detail.value.replace(/\s+/g, '')
				}
				if (type == "newPhoneNo") {
					this.newPhoneNo = e.detail.value.replace(/\s+/g, '')
				}
				this.validateEmpty()
			},

			validateEmpty() {
				if (this.phoneNo == '' || this.smsCode == '' || this.newPhoneNo == '') {
					this.isDisable = true
				} else {
					this.isDisable = false
				}
			},

			onGetCode() {
				if (this.newPhoneNo.length == 0) {
					uni.showToast({
						title: '新手机号不能为空',
						icon: "none"
					})
				} else {
					if (this.isDisabled == true) {
						uni.showToast({
							title: '加载中…',
							icon: 'loading'
						})
						this.getCodeRequest()
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
				return await that.$http(that.$api.getAuthSMSCodeUrl + "?phone=" + this.newPhoneNo, {
					method: 'POST',
					data: {},
					token: uni.getStorageSync('token')
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
						title: res.message,
						icon: "none"
					})
				}
			},

			submitHandler: function submitHandler() {
				if (this.newPhoneNo.length == 0) {
					uni.showToast({
						title: '新手机号不能为空',
						icon: 'none'
					})
					return
				}
				if (this.smsCode.length == 0) {
					uni.showToast({
						title: '验证码不能为空',
						icon: 'none'
					})
					return
				}
				this.isLoading = true
				this.buttonText = '修改中...'
				this.isDisable = true
				this.onChangePhoneNumRequest()
			},

			async onChangePhoneNumRequest() {
				var that = this
				return await that.$http(that.$api.changePhoneNumUrl, {
					method: 'PUT',
					data: {
						id: uni.getStorageSync('data').id,
						mobile: that.phoneNo,
						newMobile: that.newPhoneNo,
						verifyCode: that.smsCode
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '修改'
					that.isDisable = false
					if (res.code == 200) {
						var pages = getCurrentPages();
						var currPage = pages[pages.length - 1]; //当前页面
						var prevPage = pages[pages.length - 2];
						prevPage.$vm.listItems[2].detail_text = that.newPhoneNo
						uni.showToast({
							title: '修改成功',
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
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '修改'
					that.isDisable = false
				})
			}
		}
	}
</script>

<style>
	@import "../../common/css/fr.css";
</style>
