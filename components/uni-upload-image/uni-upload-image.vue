<template>
	<view>
		<view class="cu-form-group" :style="customBgColor?'background-color: rgba(246, 246, 246, 1);':''">
			<view class="grid col-4 grid-square flex-sub">
				<view class="bg-img" v-for="(item, index) in imgList" :key="index" @click="ViewImage" :data-url="imgList[index]">
					<image :src='imgList[index]' mode='aspectFill'></image>
					<view class="cu-tag bg-red" @click.stop="DelImg(index)" v-if="!disabled">
						<text class="cuIcon-close"></text>
					</view>
				</view>
				<view class="solids" @click="ChooseImage" v-if="!disabled&&imgList.length<maxLength">
					<text class="cuIcon-cameraadd"></text>
				</view>
			</view>
		</view>
		<canvas class="canvas" :style="'width:' + cw0 + 'px; height:' + ch0 + 'px;'" canvas-id="myCanvas0"></canvas>
	</view>
</template>

<script>
	export default {
		name: "UniUploadImage",
		/**
		 * 组件的属性列表
		 */
		props: {
			maxLength: { //最多上传图片的张数
				type: Number,
				value: 4
			},
			disabled: { //图片是否可编辑
				type: Boolean,
				value: false
			},
			customBgColor: { //是否自定义背景色
				type: Boolean,
				value: false
			}
		},
		data() {
			return {
				scale: 0.5,
				cw0: "",
				ch0: "",
				imgList: [],
				pictures: []
			}
		},
		/**
		 * 组件的方法列表
		 */
		methods: {
			ChooseImage() { //选择图片进行上传
				let that = this;
				uni.chooseImage({
					count: 1, //一次最多可以选择图片的张数
					sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album', 'camera'], //图片的来源（相册或者拍照）
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
									let maxWidth = originWidth * that.data.scale,
										maxHeight = originHeight * that.data.scale;
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
									that.cw0 = targetWidth
									that.ch0 = targetHeight
									let id = "myCanvas0";
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
						if (that.pictures.length != 0) {
							//拿到图片地址同时进行本地展示
							that.imgList = that.pictures.concat(res.tempFilePaths)
						} else {
							that.imgList = res.tempFilePaths
						}
					}
				});
			},

			//向服务器上传图片的方法类
			onUploadImage(filePath) {
				console.log(filePath)
				var that = this
				uni.showLoading({
					title: '正在上传...',
					mask: true
				})
				var token = uni.getStorageSync('token')
				//调用服务器上传图片接口，将图片上传至服务器
				uni.uploadFile({
					url: token ? that.$api.uploadImageUrl : that.$api.noTokenUploadImageUrl, //上传图片接口的url
					filePath: filePath,
					name: 'file',
					formData: {},
					header: {
						"Content-Type": "multipart/form-data",
						token //携带token请求
					},
					success: function(res) {
						// console.log(res)
						uni.hideLoading()
						var result = JSON.parse(res.data)
						if (result.code == 401 || result.code == 403) {
							uni.showModal({
								content: '请先去登录',
								cancelText: '再想想',
								cancelColor: '#797979',
								confirmText: '去登录',
								confirmColor: '#218EFF',
								success(res) {
									if (res.confirm) {
										uni.navigateTo({
											url: '/pages/login/index',
										})
									}
								}
							})
						}
						if (result.code == 200) {
							//上传成功后取到服务器回传的网络地址
							var imgUrl = that.$common.combineImageUrl(result.data)
							that.pictures = that.pictures.concat(imgUrl)
						}
						//上传成功后取到服务器回传的网络地址，传到组件外供外部操作使用
						that.$emit("getPictures", {
							detail: that.pictures
						})
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

			//点击放大预览图片，支持多张图片左右滑动，长按保存图片等功能
			ViewImage(e) {
				uni.previewImage({
					urls: this.imgList, //预览图片的数组
					current: e.currentTarget.dataset.url //当前图片的url
				});
			},

			//编辑时删除图片的操作
			DelImg(index) {
				uni.showModal({ //先进行弹框提示，用户点确认后再进行删除操作
					content: '确定要删除该图片吗？',
					cancelText: '再想想',
					cancelColor: '#797979',
					confirmText: '删除',
					confirmColor: '#218EFF',
					success: res => {
						if (res.confirm) { //删除本地展示图片及后台返回的已上传图片的地址
							this.imgList.splice(index, 1);
							this.pictures.splice(index, 1);
							//删除成功后及时刷新展示区域
							this.imgList = this.imgList
							this.pictures = this.pictures
							//通知组件外部图片删除了
							this.$emit("deletePicture", {
								detail: this.pictures
							})
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.canvas {
		position: absolute;
		left: -4000px;
	}
</style>
