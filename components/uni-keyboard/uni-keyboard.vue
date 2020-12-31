<template>
	<view class="keyboard-box" :hidden="!isCarBoard">
		<view class="u-tooltip">
			<view class="u-tooltip-item u-tooltip-cancel" hover-class="u-tooltip-cancel-hover" @click="onCancel">
				取消
			</view>
			<view class="u-tooltip-item u-tooltip-tips">
				车牌号键盘
			</view>
			<view @click="onConfirm" class="u-tooltip-item u-tooltips-submit" hover-class="u-tooltips-submit-hover">
				完成
			</view>
		</view>
		<view class="u-keyboard">
			<view class="u-keyboard-grids">
				<block>
					<view class="u-keyboard-grids-item" v-for="(group, i) in abc ? EngKeyBoardList : areaList" :key="i">
						<view :data-i="i" :data-j="j" hover-class="u-carinput-hover" class="u-keyboard-grids-btn" v-for="(item, j) in group"
						 :key="j" @click="carInputClick">
							{{ item }}
						</view>
					</view>
					<view @touchstart="backspaceClick" @touchend="clearTimer" class="u-keyboard-back" hover-class="u-hover-class">
						<image class="backward" src="https://img.zhxcxmall.com//1589448172314-3193"></image>
					</view>
					<view class="u-keyboard-change" hover-class="u-carinput-hover" @click="changeCarInputMode">
						<text class="zh" :class="!abc ? 'active' : 'inactive'">中</text>
						/
						<text class="en" :class="abc ? 'active' : 'inactive'">英</text>
					</view>
				</block>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "UniKeyboard",
		/**
		 * 组件的属性列表
		 */
		props: {
			// 是否显示车牌号键盘
			isCarBoard: {
				type: Boolean,
				value: false
			}
		},
		data() {
			return {
				abc: false, // 车牌号中英切换
				// 车牌输入时，abc=true为输入车牌号码，bac=false为输入省份中文简称
				areaList: [
					['京',
						'沪',
						'粤',
						'津',
						'冀',
						'豫',
						'云',
						'辽',
						'黑',
						'湘'
					],
					[
						'皖',
						'鲁',
						'苏',
						'浙',
						'赣',
						'鄂',
						'桂',
						'甘',
						'晋',
						'陕',
					],
					[
						'蒙',
						'吉',
						'闽',
						'贵',
						'渝',
						'川',
						'青',
						'琼',
						'宁',
						'挂',
					],
					[
						'藏',
						'港',
						'澳',
						'新',
						'使',
						'学'
					]
				],
				EngKeyBoardList: [
					[1,
						2,
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						0,
					],
					[
						'Q',
						'W',
						'E',
						'R',
						'T',
						'Y',
						'U',
						'I',
						'O',
						'P',
					],
					[
						'A',
						'S',
						'D',
						'F',
						'G',
						'H',
						'J',
						'K',
						'L',
						'Z',
					],
					[
						'X',
						'C',
						'V',
						'B',
						'N',
						'M'
					]
				]
			}
		},
		/**
		 * 组件的方法列表
		 */
		methods: {
			carInputClick(e) {
				let {
					i,
					j
				} = e.currentTarget.dataset
				let value = '';
				// 不同模式，获取不同数组的值
				if (this.abc) {
					value = this.EngKeyBoardList[i][j];
				} else {
					value = this.areaList[i][j];
				}
				if (value.length > 0) {
					this.abc = true
				}
				this.$emit('carValue', {
					detail: value
				});
			},
			// 修改汽车牌键盘的输入模式，中文|英文
			changeCarInputMode() {
				this.abc = !this.abc
			},
			// 点击退格键
			backspaceClick() {
				this.$emit('myevent', {
					detail: 'backspace'
				});
				clearInterval(this.timer); //再次清空定时器，防止重复注册定时器
				this.timer = setInterval(() => {
					this.$emit('myevent', {
						detail: 'backspace'
					});
				}, 250);
			},
			clearTimer() {
				clearInterval(this.timer);
			},
			// 输入完成
			onConfirm() {
				this.$emit('myevent', {
					detail: 'confirm'
				});
			},
			// 取消输入
			onCancel() {
				this.$emit('myevent', {
					detail: 'cancel'
				});
			},
		}
	}
</script>

<style lang="scss" scoped>
	.keyboard-box {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 999;
	}

	.u-keyboard {
		position: relative;
		z-index: 1003;
	}

	.u-tooltip {
		display: flex;
		justify-content: space-between;
		background-color: #ffffff;
	}

	.u-tooltip-item {
		color: #333333;
		flex: 0 0 33.333333%;
		text-align: center;
		padding: 20rpx 10rpx;
		font-size: 28rpx;
	}

	.u-tooltips-submit {
		text-align: right;
		flex-grow: 1;
		flex-wrap: 0;
		padding-right: 40rpx;
		color: #2979ff;
	}

	.u-tooltip-cancel {
		text-align: left;
		flex-grow: 1;
		flex-wrap: 0;
		padding-left: 40rpx;
		color: #888888;
	}

	.u-tooltips-submit-hover {
		color: #19be6b;
	}

	.u-tooltip-cancel-hover {
		color: #333333;
	}

	.u-keyboard-grids {
		background: rgb(215, 215, 217);
		padding: 24rpx 0;
		position: relative;
		text-align: center;
	}

	.u-keyboard-grids-item {
		display: inline-block;
	}

	.u-keyboard-grids-btn {
		text-decoration: none;
		width: 62rpx;
		flex: 0 0 64rpx;
		height: 80rpx;
		display: inline-block;
		font-size: 36rpx;
		text-align: center;
		line-height: 80rpx;
		background-color: #fff;
		margin: 8rpx 5rpx;
		border-radius: 8rpx;
		box-shadow: 0 2rpx 0rpx #888992;
		font-weight: 500;
	}

	.u-carinput-hover {
		background-color: rgb(185, 188, 195) !important;
	}

	.u-keyboard-back {
		position: absolute;
		width: 96rpx;
		right: 22rpx;
		bottom: 32rpx;
		height: 80rpx;
		background-color: rgb(185, 188, 195);
		display: flex;
		align-items: center;
		border-radius: 8rpx;
		justify-content: center;
		box-shadow: 0 2rpx 0rpx #888992;
	}

	.u-keyboard-change {
		font-size: 24rpx;
		box-shadow: 0 2rpx 0rpx #888992;
		position: absolute;
		width: 96rpx;
		left: 22rpx;
		line-height: 1;
		bottom: 32rpx;
		height: 80rpx;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		border-radius: 8rpx;
		justify-content: center;
	}

	.u-keyboard-change .inactive.zh {
		transform: scale(0.85) translateY(-10rpx);
	}

	.u-keyboard-change .inactive.en {
		transform: scale(0.85) translateY(10rpx);
	}

	.u-keyboard-change .active {
		color: rgb(237, 112, 64);
		font-size: 30rpx;
	}

	.u-keyboard-change .zh {
		transform: translateY(-10rpx);
	}

	.u-keyboard-change .en {
		transform: translateY(10rpx);
	}

	.backward {
		width: 60%;
		height: 70%;
		filter: contrast(50%);
	}
</style>
