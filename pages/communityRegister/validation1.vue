<template>
	<view class="add_container">
		<view class="cu-bar bg-commonGray">
			<view class="action">
				<text class="action1">基本信息</text>
			</view>
			<view class="action" style="font-size:24rpx;">
				所有信息仅供小区物业登记住户和绑定房产使用
			</view>
		</view>
		<view class="detail-list" v-if="fromID==1">
			<view class="list-item solid-bottom">
				<text class="title-text">选择房屋</text>
				<text class="detail-text">{{currentHouse}}</text>
			</view>
		</view>
		<view class="cu-form-group solid-bottom" v-if="fromID==0">
			<view class="title">居住类型</view>
			<picker @change="liveChange" :value="index2" :range="picker2">
				<view class="picker" :class="index2!=null?'color2':'color1'">
					{{index2!=null?picker2[index2]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">人口类型</view>
			<picker @change="registerChange" :value="index1" :range="picker1">
				<view class="picker" :class="index1!=null?'color2':'color1'">
					{{index1!=null?picker1[index1]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">与户主关系</view>
			<picker @change="relationChange" :value="index3" :range="picker3">
				<view class="picker" :class="index3!=null?'color2':'color1'">
					{{index3!=null?picker3[index3]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">姓名</view>
			<input :value="userName" @input="userNameInput" placeholder="请输入" placeholder-class='placeholder' maxlength="15"></input>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">证件类型</view>
			<picker @change="cardChange" :value="index4" :range="picker4">
				<view class="picker" :class="index4!=null?'color2':'color1'">
					{{index4!=null?picker4[index4]:'请选择'}}
				</view>
			</picker>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">证件号</view>
			<input :value="idCardNum" @input="idNumInput" @blur="idNumBlur" placeholder="请输入" placeholder-class='placeholder'
			 type="idcard" maxlength="18"></input>
		</view>
		<view class="detail-list">
			<view class="list-item solid-bottom">
				<text class="title-text">出生日期</text>
				<text class="detail-text">{{birthDate}}</text>
			</view>
			<view class="list-item solid-bottom">
				<text class="title-text">性别</text>
				<text class="detail-text">{{sex}}</text>
			</view>
		</view>
		<view class="cu-form-group solid-bottom">
			<view class="title">手机号码</view>
			<input :value="phoneNum" @input="phoneNumInput" @blur="phoneNumBlur" placeholder="请输入" placeholder-class='placeholder'
			 maxlength="11" type="number"></input>
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
		<uni-upload-image maxLength="1" @getPictures="onGetPictures" @deletePicture="onDeletePicture" />
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
				isLoading: false,
				buttonText: '提交',
				isDisable: false,
				imgList: [],
				userName: '',
				idCardNum: '',
				phoneNum: '',
				birthDate: '',
				sex: '',
				index1: 0,
				picker1: [],
				registerCodeArr: [],
				index2: 0,
				picker2: ['常住', '暂住', '出租'],
				index3: null,
				picker3: [],
				relationCodeArr: [],
				index4: 0,
				picker4: [],
				cradCodeArr: [],
				villageName: '',
				villageId: '',
				buildingName: '',
				buildingId: '',
				roomName: '',
				roomId: '',
				isLegalIdNum: true,
				illegalPhoneNum: false,
				fromID: 0, //0:社区登记第二个页面；1:新增住户页面
				currentHouse: ''
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			if (options.fromID) {
				this.fromID = options.fromID,
					this.index2 = 0,
					this.currentHouse = uni.getStorageSync('villageName') + uni.getStorageSync('data').buildingName + '栋' + uni.getStorageSync(
						'data').roomName + '室'
				uni.setNavigationBarTitle({
					title: '新增住户'
				})
			} else {
				this.villageName = options.villageName
				this.villageId = options.villageId
				this.buildingName = options.buildingName
				this.buildingId = options.buildingId
				this.roomName = options.roomName
				this.roomId = options.roomId
			}
			this.getDictionaryListRequest("RKLX")
			this.getDictionaryListRequest("HZGX")
			this.getDictionaryListRequest("ZJLX")
		},
		methods: {
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
						if (code == 'RKLX') {
							that.picker1 = nameArr
							that.registerCodeArr = codeArr
						} else if (code == 'HZGX') {
							that.picker3 = nameArr
							that.relationCodeArr = codeArr
						} else if (code == 'ZJLX') {
							that.picker4 = nameArr
							that.cradCodeArr = codeArr
						}
					}
				}).catch(err => {})
			},

			registerChange(e) {
				this.index1 = e.detail.value
			},

			liveChange(e) {
				this.index2 = e.detail.value
			},

			relationChange(e) {
				this.index3= e.detail.value
			},

			cardChange(e) {
				this.index4 = e.detail.value
			},

			userNameInput(event) {
				let userName = event.detail.value || event.detail.text;
				if (!userName) {
					userName = ''
				}
				this.userName = userName.replace(/\s+/g, '')
			},

			idNumInput(event) {
				let idCardNum = event.detail.value || event.detail.text;
				if (!idCardNum) {
					idCardNum = ''
				}
				this.idCardNum = idCardNum.replace(/\s+/g, '')
			},

			idNumBlur(event) {
				let idNum = event.detail.value || event.detail.text;
				var idCardReg = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i;
				if (!idCardReg.test(idNum)) {
					this.isLegalIdNum = false
					uni.showToast({
						title: '身份证号码格式有误',
						icon: "none"
					})
				} else {
					this.birthDate = idNum.substring(6, 10) + "-" + idNum.substring(10, 12) + "-" + idNum.substring(12, 14),
					this.sex = parseInt(idNum.substr(16, 1)) % 2 == 1 ? '男' : '女',
					this.isLegalIdNum = true
				}
			},

			phoneNumInput(event) {
				let phoneNum = event.detail.value || event.detail.text;
				if (!phoneNum) {
					phoneNum = ''
				}
				this.phoneNum = phoneNum.replace(/\s+/g, '')
			},

			phoneNumBlur(event) {
				let phoneNum = event.detail.value || event.detail.text;
				if (!phoneNum) {
					phoneNum = ''
				}
				if (phoneNum.length != 11 || !(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phoneNum))) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					this.illegalPhoneNum = true
				} else {
					this.illegalPhoneNum = false
				}
			},

			submitHandler() {
				if (this.index1 == null || this.index2 == null || this.index3 == null || this.index4 == null || this.userName == '' || this.idCardNum == '') {
					uni.showToast({
						title: '请完善基本信息',
						icon: 'none'
					})
					return
				} else if (!this.isLegalIdNum) {
					uni.showToast({
						title: '身份证号码格式有误',
						icon: 'none'
					})
					return
				} else if (this.phoneNum == '' || this.birthDate == '' || this.sex == '') {
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
					this.onAuthEvent()
				}
			},

			async onAuthEvent() {
				var that = this
				var imgUrl = that.imgList[0]
				var str1 = imgUrl.split('?')[1]
				var str2 = str1.split('&')[0]
				var imgPath = str2.split('=')[1]
				return await that.$http(that.fromID == 0 ? that.$api.roomAuthUrl2 : that.$api.addPersonRecordUrl, {
					method: that.fromID == 0 ? 'PUT' : 'POST',
					data: that.fromID == 0 ? {
						userId: uni.getStorageSync('userId'),
						userType: '3',
						birthDay: that.birthDate,
						buildingId: that.buildingId,
						buildingName: that.buildingName,
						faceImg: imgPath,
						idCardNumber: that.idCardNum,
						idCardType: that.picker4[that.index4],
						liveTypeName: that.picker2[that.index2],
						mobile: that.phoneNum,
						name: that.userName,
						registerTypeName: that.picker1[that.index1],
						relationCode: that.relationCodeArr[that.index3],
						relationName: that.picker3[that.index3],
						roomId: that.roomId,
						roomName: that.roomName,
						sex: that.sex,
						villageId: that.villageId,
						villageName: that.villageName
					} : {
						roomId: uni.getStorageSync('data').roomId,
						liveType: '1',
						relationName: that.picker3[that.index3],
						relationCode: that.relationCodeArr[that.index3],
						mobile: that.phoneNum,
						name: that.userName,
						sexName: that.sex,
						sexCode: that.sex == '男' ? '1' : '2',
						nationName: "汉",
						nationCode: "01",
						birthDay: that.birthDate,
						idCardTypeName: that.picker4[that.index4],
						idCardTypeCode: that.cradCodeArr[that.index4],
						idCardNumber: that.idCardNum,
						faceImg: imgPath,
						registerTypeName: that.picker1[that.index1],
						registerTypeCode: that.registerCodeArr[that.index1]
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
					if (res.code == 200) {
						uni.showToast({
							title: '提交成功',
							icon: "none",
							success: (res) => {
								that.fromID == 0 ? uni.navigateBack({
									delta: 2,
								}) : uni.navigateBack({
									delta: 1,
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
					that.buttonText = '提交'
					that.isDisable = false
				})
			},

			onGetPictures(e) {
				this.imgList = e.detail
			},

			onDeletePicture(e) {
				this.imgList = e.detail
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "../../common/css/list-detail.css";

	.add_container {
		background: #F6F8FA;
	}
</style>
