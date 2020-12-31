<template>
	<view>
		<view class="change_face">
			<view class="face_head" v-if="type==0">
				<text class="face_title" style="margin-top: 100rpx;">请拍照或上传本人正面免冠头像照片</text>
				<text class="face_detail">保证照片清晰，以确保刷脸开门的通过率</text>
				<view class="upload_face" @click="imgPath?ViewImage():ChooseImage()">
					<image v-if="!imgPath" class="face_img" src="/static/mine/icon_mine_add.png"></image>
					<image v-if="imgPath" class="face_img1" :src="imgUrl"></image>
					<view v-if="imgPath" class="delete_box bg-black" @click.stop="DelImg">
						<text class="cuIcon-close"></text>
					</view>
				</view>
			</view>
			<view class="face_head" v-if="type==1">
				<view class="upload_success">
					<image class="success_img" src="/static/mine/icon_mine_success.png"></image>
				</view>
				<text class="face_title" style="margin-top: 50rpx;">上传成功</text>
				<text class="face_detail">已成功开通刷脸开门 通过小区门禁</text>
			</view>
			<button class="submit-btn" :class="type==0?'':'submit-btn1'" :loading="isLoading" @click="submitHandler" :disabled="isDisable">{{buttonText}}</button>
		</view>
		<canvas class="canvas" :style="'width:' + cw0 + 'px; height:' + ch0 + 'px;'" canvas-id="myCanvas1"></canvas>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isLoading: false,
				buttonText: '',
				isDisable: false,
				type: 0,
				imgPath: '',
				imgUrl: '',

				scale: 0.5,
				cw0: "",
				ch0: ""
			}
		},

		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			this.imgPath = uni.getStorageSync('data').faceImg
			this.imgUrl = this.$common.combineImageUrl(uni.getStorageSync('data').faceImg)
			this.buttonText = this.type == 0 ? '上传' : '返回'
		},
		methods: {
			submitHandler() {
				if (this.type == 0) {
					if (this.imgPath == '') {
						uni.showToast({
							title: '请选择人脸图片',
							icon: 'none'
						})
						return
					}
					this.isLoading = true
					this.buttonText = '上传中...'
					this.isDisable = true
					this.changeFaceImgRequest()
				} else {
					uni.navigateBack({
						delta: 2,
					})
				}
			},

			async changeFaceImgRequest() {
				var that = this
				return await that.$http(that.$api.changeFaceImageUrl + '?faceImg=' + that.imgPath + '&id=' + uni.getStorageSync('data').id, {
					method: 'PUT',
					data: {},
					token: uni.getStorageSync('token')
				}).then(res => {
					that.isLoading = false
					that.buttonText = '上传'
					that.isDisable = false
					if (res.code == 200) {
						uni.showToast({
							title: '上传成功',
							icon: 'none'
						})
						that.type = 1
						that.buttonText = '返回'
						var pages = getCurrentPages();
						var currPage = pages[pages.length - 1]; //当前页面
						var prevPage = pages[pages.length - 2];
						prevPage.$vm.faceImgPath = that.imgPath
						prevPage.$vm.faceImgUrl = that.$common.combineImageUrl(that.imgPath)
					} else {
						uni.showToast({
							title: '上传失败，请重试',
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isLoading = false
					that.buttonText = '上传'
					that.isDisable = false
				})
			},

			ChooseImage() {
				var that = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'],
					success: (res) => {
						let path = res.tempFilePaths[0];
						let size = res.tempFiles[0].size / 1024;
						if (size > 1024) { //大于1MB压缩
							console.log('大于1MB')
							uni.getImageInfo({
								src: path,
								success(res) {
									console.log('获得原始图片大小', res.width)
									let originWidth, originHeight;
									originHeight = res.height;
									originWidth = res.width;
									console.log(originWidth);
									//压缩比例
									// 最大尺寸限制
									let maxWidth = originWidth * that.scale,
										maxHeight = originHeight * that.scale;
									// 目标尺寸
									let targetWidth = originWidth,
										targetHeight = originHeight;
									//等比例压缩，如果宽度大于高度，则宽度优先，否则高度优先
									if (originWidth > maxWidth || originHeight > maxHeight) {
										if (originWidth / originHeight > maxWidth / maxHeight) {
											// 要求宽度*(原生图片比例)=新图片尺寸
											targetWidth = maxWidth;
											targetHeight = Math.round(maxWidth * (originHeight / originWidth));
										} else {
											targetHeight = maxHeight;
											targetWidth = Math.round(maxHeight * (originWidth / originHeight));
										}
									}
									//更新canvas大小
									that.setData({
										cw0: targetWidth,
										ch0: targetHeight
									});
									let id = "myCanvas1";
									//尝试压缩文件，创建 canvas
									let ctx = uni.createCanvasContext(id, that);
									ctx.clearRect(0, 0, targetWidth, targetHeight);
									ctx.drawImage(path, 0, 0, targetWidth, targetHeight);
									ctx.draw(false, setTimeout(() => {
										uni.canvasToTempFilePath({
											canvasId: id,
											success: (res) => {
												console.log(res)
												uni.hideLoading()
												//写入图片数组
												let uploadFile = res.tempFilePath;
												that.onUploadImage(uploadFile); //向服务器上传图片
											},
											fail: (err) => {
												console.error(err)
												uni.hideLoading()
											}
										}, that)
									}), 500)
								}
							})
						} else {
							console.log('小于1MB')
							that.onUploadImage(path); //向服务器上传图片
						}
					}
				});
			},

			//向服务器上传图片的方法类
			onUploadImage(filePath) {
				var that = this
				uni.showLoading({
					title: '正在上传...',
					mask: true
				})
				//调用服务器上传图片接口，将图片上传至服务器
				uni.uploadFile({
					url: that.$api.uploadImageUrl, //上传图片接口的url
					filePath: filePath,
					name: 'file',
					formData: {},
					header: {
						"Content-Type": "multipart/form-data",
						'token': uni.getStorageSync('token') //携带token请求
					},
					success: function(res) {
						uni.hideLoading()
						var result = JSON.parse(res.data)
						if (result.code == 200) {
							//上传成功后取到服务器回传的网络地址
							var imgUrl = that.$common.combineImageUrl(result.data)
							that.imgPath = result.data
							that.imgUrl = imgUrl
						}
					},
					fail: function(res) {
						//上传失败则进行相应提示
						uni.hideLoading()
						uni.showToast({
							title: '上传图片失败',
							icon: 'none'
						})
					}
				});
			},

			ViewImage() {
				uni.previewImage({
					urls: [this.imgUrl],
					current: this.imgUrl
				});
			},

			DelImg() {
				uni.showModal({
					title: '温馨提示',
					content: '确定要删除此人脸照片吗？',
					cancelText: '再想想',
					cancelColor: '#797979',
					confirmText: '删除',
					confirmColor: '#218EFF',
					success: res => {
						if (res.confirm) {
							this.imgPath = ''
							this.imgUrl = ''
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.change_face,
	.face_head {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.face_title {
		font-size: 36rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 70rpx;
	}

	.face_detail {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 40rpx;
	}

	.upload_face {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 324rpx;
		height: 324rpx;
		background: #F6F8FA;
		border-radius: 8rpx;
		margin-top: 42rpx;
		position: relative;
	}

	.face_img {
		width: 140rpx;
		height: 140rpx;
	}

	.face_img1 {
		width: 324rpx;
		height: 324rpx;
	}

	.delete_box {
		font-size: 24rpx;
		vertical-align: middle;
		position: absolute;
		top: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		padding: 0rpx 16rpx;
		height: 48rpx;
		font-family: Helvetica Neue, Helvetica, sans-serif;
		white-space: nowrap;
	}

	.upload_success {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		width: 186rpx;
		height: 186rpx;
		background: #1CC6A1;
		border-radius: 50%;
		margin-top: 90rpx;
	}

	.success_img {
		width: 100rpx;
		height: 71rpx;
	}

	.submit-btn {
		margin-top: 145rpx;
	}

	.submit-btn1 {
		margin-top: 298rpx;
	}

	.canvas {
		position: absolute;
		left: -4000px;
	}
</style>
