<template>
	<view class="feed_container">
		<view class="cu-form-group solid-bottom">
			<view class="title">反馈类型</view>
			<picker @change="TypeChange" :value="index1" :range="picker1">
				<view class="picker" :class="index1!=null?'color2':'color1'">
					{{index1!=null?picker1[index1]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group">
			<textarea maxlength="-1" :value="textArea" @input="textareaAInput" placeholder="请输入来访事由"
			 placeholder-class='placeholder'></textarea>
		</view>
		<view class="line-view"></view>
		<view class="cu-form-group solid-bottom">
			<view class="title">手机/邮箱(选填)</view>
			<input :value="reportPhone" @input="reportPhoneInput" @blur="reportPhoneBlur" placeholder="请输入"
			 placeholder-class='placeholder' type="number"></input>
		</view>
		<view class="cu-bar bg-white">
			<view class="action">
				<text class="action1">上传图片</text>
			</view>
			<view class="action">
				{{imgList.length}}/8
			</view>
		</view>
		<uni-upload-image maxLength="8" @getPictures="onGetPictures" @deletePicture="onDeletePicture" />
		<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
	</view>
</template>

<script>
	import UniUploadImage from "@/components/uni-upload-image/uni-upload-image.vue"

	export default {
		data() {
			return {
				textArea: '',
				imgList: [],
				isLoading: false,
				buttonText: '提交',
				isDisable: false,
				reportPhone: '',
				index1: null,
				picker1: ['物业服务', '门岗保安', '电梯安全', '设备维护', '楼道卫生', '机动车道', '其他问题'],
				valueArr1: ['11', '12', '13', '14', '15', '16', '99']
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			const phone = uni.getStorageSync('phoneNo')
			this.reportPhone = phone
		},
		methods: {
			TypeChange(e) {
				this.index1 = e.detail.value
			},
			
			textareaAInput(e) {
				this.textArea = e.detail.value.replace(/\s+/g, '')
			},

			reportPhoneInput(event) {
				let reportPhone = event.detail.value || event.detail.text;
				if (!reportPhone) {
					reportPhone = ''
				}
				this.reportPhone = reportPhone.replace(/\s+/g, '')
			},

			reportPhoneBlur(event) {
				let reportPhone = event.detail.value || event.detail.text
				if (!reportPhone) {
					reportPhone = ''
				}
				if (reportPhone.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(reportPhone))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
				}
			},

			onGetPictures(e) {
				this.imgList = e.detail
			},

			onDeletePicture(e) {
				this.imgList = e.detail
			},

			submitHandler: function submitHandler() { //提交
				if (this.index1 == null || this.textArea == '' || this.imgList.length == 0) {
					uni.showToast({
						title: '有必填信息未填写',
						icon: 'none'
					})
				} else {
					this.isLoading = true
					this.buttonText = '提交中...'
					this.isDisable = true
					this.onUploadFeed()
				}
			},

			async onUploadFeed() {
				var that = this
				return await that.$http(that.$api.uploadFeedBackUrl, {
					method: 'POST',
					data: {
						villageId: uni.getStorageSync('villageId'),
						complaintDescription: that.textArea,
						complaintImages: that.imgList,
						complaintType: that.valueArr1[that.index1]
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
					uni.showToast({
						title: res.code == 200 ? '意见反馈提交成功' : '意见反馈提交失败',
						icon: 'none'
					})
					if (res.code == 200) {
						uni.navigateBack({ //返回上一个页面
							delta: 1
						})
					}
				}).catch(err => {
					console.log("==> [ERROR]", err)
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.feed_container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background: #F6F8FA;
	}

	.textarea_wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 30rpx 10rpx;
		background-color: #fff;
	}
</style>
