<template>
	<view class="add_container">
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">基本信息</text>
			</view>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">访客姓名</view>
			<input :value="visitorName" @input="visitorNameInput" placeholder="请输入" placeholder-class='placeholder' maxlength="5"></input>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">手机号码</view>
			<input :value="visitorPhone" @input="visitorPhoneInput" @blur="visitorPhoneBlur" placeholder="请输入" placeholder-class='placeholder'
			 type="number" maxlength="11"></input>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">来访人数</view>
			<input :value="visitorNum" @input="visitorNumInput" placeholder="请输入" placeholder-class='placeholder' type="number"
			 maxlength="5"></input>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">来访时间</view>
			<picker mode="date" :value="date1" @change="DateChange">
				<view class="picker" :class="date1?'color2':'color1'">
					{{date1?date1:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group">
			<view class="title">来访事由</view>
		</view>
		<view class="cu-form-group solid-bottom">
			<textarea maxlength="-1" :value="textArea" @input="textareaAInput" placeholder="请输入来访事由"
			 placeholder-class='placeholder'></textarea>
		</view>
		<view class="line-view"></view>
		<view class="cu-bar bg-white">
			<view class="action">
				<text class="action1">人脸照片</text>
			</view>
			<view class="action">
				{{imgList.length}}/1
			</view>
		</view>
		<uni-upload-image maxLength="1" class="upload_view" @getPictures="onGetPictures" @deletePicture="onDeletePicture" />
		<view class="tip_view">
			<text class="tip_text">注：请拍照或上传本人清晰头像，以确保刷脸开门的通过率</text>
		</view>
		<view class="btn-view">
			<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
		</view>
	</view>
</template>

<script>
	import UniUploadImage from "@/components/uni-upload-image/uni-upload-image.vue"

	export default {
		components: {
			UniUploadImage
		},
		data() {
			return {
				textArea: '',
				isLoading: false,
				buttonText: '提交',
				isDisable: false,
				imgList: [],
				visitorName: '',
				visitorPhone: '',
				visitorNum: '',
				date1: null,
				source: '',
				illegalPhoneNum: false,
				roomId: '', //访客添加时使用
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			if (options.source) {
				uni.setStorageSync('villageName', options.villageName)
				uni.setStorageSync('villageId', options.villageId)
				this.roomId = options.roomId
			}
			var nowDate = new Date();
			var year = nowDate.getFullYear(),
				month = nowDate.getMonth() + 1,
				day = nowDate.getDate()
			this.date1 = `${year}-${month}-${day}`,
			this.source = options.source ? options.source : '1'
		},
		methods: {
			visitorNameInput(event) {
				let visitorName = event.detail.value || event.detail.text;
				if (!visitorName) {
					visitorName = ''
				}
				this.visitorName = visitorName.replace(/\s+/g, '')
			},

			visitorPhoneInput(event) {
				let visitorPhone = event.detail.value || event.detail.text;
				if (!visitorPhone) {
					visitorPhone = ''
				}
				this.visitorPhone = visitorPhone.replace(/\s+/g, '')
			},

			visitorPhoneBlur(event) {
				let visitorPhone = event.detail.value || event.detail.text;
				if (!visitorPhone) {
					visitorPhone = ''
				}
				if (visitorPhone.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(visitorPhone))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					this.illegalPhoneNum = true
				} else {
					this.illegalPhoneNum = false
				}
			},

			visitorNumInput(event) {
				let visitorNum = event.detail.value || event.detail.text;
				if (!visitorNum) {
					visitorNum = ''
				}
				this.visitorNum = visitorNum.replace(/\s+/g, '')
			},

			DateChange(e) {
				this.date1 = e.detail.value
			},

			textareaAInput(e) {
				this.textArea = e.detail.value.replace(/\s+/g, '')
			},

			submitHandler() {
				if (this.visitorName == '' || this.visitorPhone == '' || this.visitorNum == '' || this.textArea ==
					'') {
					uni.showToast({
						title: '请完善基本信息',
						icon: 'none'
					})
					return
				} else if (this.illegalPhoneNum) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return
				} else if (this.imgList.length == 0) {
					uni.showToast({
						title: '请上传人脸照片',
						icon: 'none'
					})
					return
				} else {
					this.isLoading = true
					this.buttonText = '提交中...'
					this.isDisable = true
					this.addVisitorRequest()
				}
			},

			async addVisitorRequest() {
				var that = this
				var imgUrl = that.imgList[0]
				var str1 = imgUrl.split('?')[1]
				var str2 = str1.split('&')[0]
				var imgPath = str2.split('=')[1]
				return await that.$http(that.source == '1' ? that.$api.addVisitorRecordUrl : that.$api.addVisitorRecordUrl1, {
					method: 'POST',
					data: {
						roomId: that.source == '1' ? uni.getStorageSync('data').roomId : that.roomId,
						source: that.source,
						villageId: uni.getStorageSync('villageId'),
						visitReason: that.textArea,
						visitTime: that.date1,
						visitorFaceImg: imgPath,
						visitorName: that.visitorName,
						visitorNum: that.visitorNum,
						visitorPhone: that.visitorPhone
					},
					token: that.source == '1' ? uni.getStorageSync('token') : ''
				}).then(res => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
					if (res.code == 200) {
						if (that.source == '1') {
							that.$utils.$emit('refreshVisitorList')
							uni.showToast({
								title: '提交成功',
								icon: 'none',
								success: (res) => {
									uni.navigateBack({
										delta: 1
									});
								}
							})
						} else {
							uni.switchTab({
								url: '/pages/home/index',
							})
						}
					} else {
						uni.showToast({
							title: '提交失败',
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
				})
			},

			onGetPictures(e) {
				this.imgList = e.detail
			},

			onDeletePicture(e) {
				this.imgList = e.detail
			},

			onShareAppMessage() {
				return {
					title: '智慧社区访客登记',
					imageUrl: '/images/mine/icon_logo.png',
					path: `/pages/visitorManager/add?source=2&roomId=${uni.getStorageSync('data').roomId}&villageId=${uni.getStorageSync('villageId')}&villageName=${uni.getStorageSync('villageName')}`
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.add_container {
		background: #F6F8FA;
	}
</style>
