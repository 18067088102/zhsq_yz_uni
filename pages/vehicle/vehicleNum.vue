<template>
	<view class="keyboard-box">
		<view class="car-num">
			<view class="title margin-bottom-sm flex justify-between">
				<view>车牌号</view>
				<view class="flex justify-between align-center">
					<image class="switch-car-num" src="/static/common/icon_qiehuan.png"></image>
					<text @click="changeCarType">{{carType==2?"切换为普通车牌号":"切换为新能源车牌号"}}</text>
				</view>
			</view>
			<view class="car-number">
				<view class="car-block" v-for="(itm, idx) in carBoxNum" :key="idx" @click="openCarBoard">{{carNumStr[idx]}}</view>
			</view>
		</view>
		<uni-keyboard :isCarBoard="isCarBoard" @carValue="carValue" @myevent="onMyEvent"></uni-keyboard>
	</view>
</template>

<script>
	import uniKeyboard from "@/components/uni-keyboard/uni-keyboard.vue"

	export default {
		components: {
			uniKeyboard
		},
		data() {
			return {
				isCarBoard: false,
				carNumStr: [],
				carType: 1, // 车牌类型默认为1普通车牌,2为新能源车牌
				carBoxNum: 7,
				abc: false
			}
		},
		methods: {
			// 打开车牌号键盘
			openCarBoard(e) {
				if (this.carNumStr.length > 0) {
					this.abc = true
				} else {
					this.abc = false
				}
				this.isCarBoard = true
			},
			// 关闭遮罩键盘
			closeMask() {
				this.isCarBoard = false
			},
			// 车牌号键盘点击事件
			onMyEvent(e) {
				var type = e.detail
				switch (type) {
					case "confirm":
						this.isCarBoard = false
						console.log("输出结果", this.carNumStr.join(""))
						this.goBack(this.carNumStr.join(""))
						break;
					case "cancel":
						this.isCarBoard = false
						break;
					case "backspace":
						if (this.carNumStr.length > 0) {
							this.carNumStr.pop()
							if (this.carNumStr.length < 2) {
								this.abc = false
							}
						}
						break;
					default:
						break;
				}
			},
			// 车牌号选择
			carValue(e) {
				var value = e.detail
				if (this.carNumStr.length < this.carBoxNum) {
					this.carNumStr.push(value)
				}
			},
			// 切换车牌
			changeCarType(e) {
				if (this.carType == 1) {
					this.carType = 2
					this.carBoxNum = 8
				} else {
					this.carType = 1
					this.carBoxNum = 7
					if (this.carNumStr && this.carNumStr.length == 8) {
						this.carNumStr.pop()
					}
				}
			},
			goBack(numStr) { //返回上一页并刷新
				var pages = getCurrentPages();
				var currPage = pages[pages.length - 1]; //当前页面
				var prevPage = pages[pages.length - 2];
				prevPage.$vm.vehicleNum = numStr
				uni.navigateBack({ //返回上一个页面
					delta: 1
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.keyboard-box {
		background-color: #fff;
		min-height: 100vh;
		padding: 30rpx 30rpx;
	}

	.switch-car-num {
		width: 28rpx;
		height: 26rpx;
		margin-right: 10rpx;
	}

	.car-number {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.car-block {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 1rpx solid #e6e6e6;
		margin: 0 10rpx;
	}
</style>
