<template>
	<view class="add_container">
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">车主信息</text>
			</view>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title"><text style="color: #FF2553;">*</text> 车主姓名</view>
			<input :value="ownerName" @input="ownerNameInput" placeholder="请输入" placeholder-class='placeholder' maxlength="5"></input>
		</view>
		<view class="cu-form-group">
			<view class="title"><text style="color: #FF2553;">*</text> 车主电话</view>
			<input :value="ownerPhone" @input="ownerPhoneInput" @blur="ownerPhoneBlur" placeholder="请输入" placeholder-class='placeholder'
			 maxlength="11" type="number"></input>
		</view>
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">车辆信息</text>
			</view>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">车辆类型</view>
			<picker @change="TypeChange" :value="index1" :range="picker1">
				<view class="picker" :class="index1!=null?'color2':'color1'">
					{{index1!=null?picker1[index1]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom" @click="onVehicleNum">
			<view class="title"><text style="color: #FF2553;">*</text> 车牌号</view>
			<picker :value="item.detail_title" disabled>
				<view class="picker" :class="vehicleNum!=''?'color2':'color1'">
					{{vehicleNum!=''?vehicleNum:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">车牌颜色</view>
			<picker @change="CPYSChange" :value="index2" :range="picker2">
				<view class="picker" :class="index2!=null?'color2':'color1'">
					{{index2!=null?picker2[index2]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">车身颜色</view>
			<picker @change="CSYSChange" :value="index3" :range="picker3">
				<view class="picker" :class="index3!=null?'color2':'color1'">
					{{index3!=null?picker3[index3]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">车辆品牌</view>
			<picker @change="CLPPChange" :value="index4" :range="picker4">
				<view class="picker" :class="index4!=null?'color2':'color1'">
					{{index4!=null?picker4[index4]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="btn-view">
			<button class='submit-btn' :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLoading: false,
				buttonText: '提交',
				isDisable: false,
				vehicleNum: '',
				ownerName: '',
				ownerPhone: '',
				index1: null,
				picker1: [],
				CLLXCodeArr: [],
				index2: null,
				picker2: [],
				CPYSCodeArr: [],
				index3: null,
				picker3: [],
				CSYSCodeArr: [],
				index4: null,
				picker4: [],
				CLPPCodeArr: [],
				illegalPhoneNum: false,
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.getDictionaryListRequest("CLLX")
			this.getDictionaryListRequest("CPYS")
			this.getDictionaryListRequest("CLYS")
			this.getDictionaryListRequest("CLPP")
		},
		methods: {
			TypeChange(e) {
				this.index1 = e.detail.value
			},

			CPYSChange(e) {
				this.index2 = e.detail.value
			},

			CSYSChange(e) {
				this.index3 = e.detail.value
			},

			CLPPChange(e) {
				this.index4 = e.detail.value
			},

			async getDictionaryListRequest(code) {
				var that = this
				return await that.$http(that.$api.dictionaryListUrl + "?code=" + code, {
					method: 'GET',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						var nameArr = []
						var codeArr = []
						for (let i = 0; i < res.data.length; i++) {
							nameArr.push(res.data[i].zdz)
							codeArr.push(res.data[i].zdx)
						}
						if (code == 'CLLX') {
							that.picker1 = nameArr
							that.CLLXCodeArr = codeArr
						} else if (code == 'CPYS') {
							that.picker2 = nameArr
							that.CPYSCodeArr = codeArr
						} else if (code == 'CLYS') {
							that.picker3 = nameArr
							that.CSYSCodeArr = codeArr
						} else if (code == 'CLPP') {
							that.picker4 = nameArr
							that.CLPPCodeArr = codeArr
						}
					}
				}).catch(err => {})
			},

			submitHandler() {
				if (this.ownerName == '' || this.ownerPhone == '' || this.vehicleNum == '') {
					uni.showToast({
						title: '请完善必填信息',
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
					this.buttonText = '提交中...'
					this.isDisable = true
					this.addVehicleRequest()
				}
			},

			async addVehicleRequest() {
				var that = this
				return await that.$http(that.$api.addVehicleListUrl, {
					method: 'POST',
					data: {
						ownerId: uni.getStorageSync('data').archiveId,
						ownerName: that.ownerName,
						ownerPhone: that.ownerPhone,
						hasParking: '0',
						cardNumber: that.vehicleNum,
						carTypeCode: that.CLLXCodeArr[that.index1],
						carTypeName: that.picker1[that.index1],
						carColorCode: that.CSYSCodeArr[that.index2],
						carColorName: that.picker2[that.index2],
						cardColorCode: that.CPYSCodeArr[that.index3],
						cardColorName: that.picker3[that.index3],
						carBrandCode: that.CLPPCodeArr[that.index4],
						carBrandName: that.picker4[that.index4],
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
					if (res.code == 200) {
						that.$utils.$emit('refreshVehicleList')
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

			ownerNameInput(event) {
				let ownerName = event.detail.value || event.detail.text;
				if (!ownerName) {
					ownerName = ''
				}
				this.ownerName = ownerName.replace(/\s+/g, '')
			},

			ownerPhoneInput(event) {
				let ownerPhone = event.detail.value || event.detail.text;
				if (!ownerPhone) {
					ownerPhone = ''
				}
				this.ownerPhone = ownerPhone.replace(/\s+/g, '')
			},

			ownerPhoneBlur(event) {
				let ownerPhone = event.detail.value || event.detail.text;
				if (!ownerPhone) {
					ownerPhone = ''
				}
				if (ownerPhone.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(ownerPhone))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					this.illegalPhoneNum = true
				} else {
					this.illegalPhoneNum = false
				}
			},

			onVehicleNum() {
				uni.navigateTo({
					url: '/pages/vehicle/vehicleNum',
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.add_container {
		width: 100%;
		min-height: 100%;
		background: #F6F8FA;
	}
</style>
