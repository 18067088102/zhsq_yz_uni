<template>
	<view class="add_snap">
		<view class="line-view" v-if="idx==0"></view>
		<view class="cu-form-group solid-bottom" v-if="idx==0">
			<view class="title">报修类型</view>
			<view class="type_box">
				<view class="type_box_item" :class="index==typeIndex?'active_bg':'normal_bg'" v-for="(item, index) in typeArr" :key="index" @click="onSelectType(index)">
					<text :class="index==typeIndex?'active_color':'normal_color'">{{item}}</text>
				</view>
			</view>
		</view>
		<view class="cu-form-group solid-bottom" v-if="idx==0">
			<view class="title">报修区域</view>
			<input :value="repairArea" @input="repairAreaInput" placeholder="请输入" placeholder-class='placeholder' maxlength="20"></input>
		</view>
		<view class="line-view"></view>
		<view class="cu-form-group">
			<view class="title">问题描述</view>
		</view>
		<view class="cu-form-group">
			<textarea maxlength="-1" :value="textArea" :disabled="modalName!=null" @input="textareaAInput" placeholder="请输入你的问题..."
			 placeholder-class='placeholder'></textarea>
		</view>
		<uni-upload-image maxLength="8" class="upload_view" @getPictures="onGetPictures" @deletePicture="onDeletePicture" />
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
				idx: 0, //0:物业报修；1:随手拍
				typeIndex: 1, //报修类型
				typeArr: ['公共区域报修', '私人区域报修'],
				repairArea: ''
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			var idx = options.typeIndex
			if (idx == 1) {
				uni.setNavigationBarTitle({
					title: '添加随手拍',
				})
			}
			this.idx = idx
		},
		methods: {
			onSelectType(idx) {
				this.typeIndex = idx
			},

			submitHandler() {
				if (this.idx == 0 && this.repairArea.length == 0) {
					uni.showToast({
						title: '请填写报修区域',
						icon: 'none'
					})
					return
				}
				if (this.textArea.length == 0) {
					uni.showToast({
						title: '请填写问题描述',
						icon: 'none'
					})
					return
				}
				if (this.imgList.length == 0) {
					uni.showToast({
						title: '请上传图片',
						icon: 'none'
					})
					return
				}
				this.isLoading = true
				this.buttonText = '提交中...'
				this.isDisable = true
				this.addRepairRecordRequest()
			},

			async addRepairRecordRequest() {
				var that = this
				var imgs = []
				for (let i = 0; i < that.imgList.length; i++) {
					const imgUrl = that.imgList[i]
					var str1 = imgUrl.split('?')[1]
					var str2 = str1.split('&')[0]
					var imgPath = str2.split('=')[1]
					imgs.push(imgPath)
				}
				return await that.$http(that.idx == 0 ? that.$api.addRepairRecordUrl : that.$api.addConvenientRecordUrl, {
					method: 'POST',
					data: that.idx == 0 ? {
						villageId: uni.getStorageSync('villageId'),
						repairDescription: that.textArea,
						repairList: imgs,
						repairType: that.typeIndex.toString(),
						repairArea: that.repairArea
					} : {
						villageId: uni.getStorageSync('villageId'),
						convenientDescription: that.textArea,
						repairList: imgs
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '提交'
					that.isDisable = false
					if (res.code == 200) {
						that.$utils.$emit('refreshRepairList')
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

			onGetPictures(e) {
				this.imgList = e.detail
			},

			onDeletePicture(e) {
				this.imgList = e.detail
			},

			textareaAInput(e) {
				this.textArea = e.detail.value.replace(/\s+/g, '')
			},

			repairAreaInput(event) {
				let repairArea = event.detail.value || event.detail.text;
				if (!repairArea) {
					repairArea = ''
				}
				this.repairArea = repairArea.replace(/\s+/g, '')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.add_snap {
		width: 100%;
		height: 100%;
		background: #F6F8FA;
	}

	.type_box {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.type_box_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		border-radius: 26rpx;
		padding: 12rpx 24rpx;
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		line-height: 28rpx;
		margin-left: 19rpx;
	}

	.active_bg {
		background: #208EFF;
	}

	.active_color {
		color: #FFFFFF;
	}

	.normal_bg {
		background: #E9EAED;
	}

	.normal_color {
		color: #63656B;
	}
</style>
