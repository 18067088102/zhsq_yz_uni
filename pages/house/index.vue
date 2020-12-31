<template>
	<view class="house_container">
		<view class="house_head">
			<view class="head_top">
				<text class="current_text">当前房产</text>
			</view>
			<text class="house_text">{{currentAllName}}</text>
		</view>
		<view class="empty_container" v-if="isNoData">
			<uni-empty :emptyText="emptyText"></uni-empty>
		</view>
		<view class="house_item" v-for="(item, index) in listsItem" :key="index" @click="onChangeHouse" :data-index="index"
		 v-if="!isNoData">
			<view class="house_info" :class="item.householdsNum!=0||item.tenantsNum!=0?'solid-bottom':''">
				<view class="info_top">
					<text class="name_text">{{item.villageName}}</text>
					<view class="house_type">
						<text>{{item.relationName}}</text>
					</view>
				</view>
				<text class="detail_text">{{item.buildingName}}栋{{item.roomName}}室</text>
			</view>
			<view class="item_bottom" v-if="item.householdsNum!=0||item.tenantsNum!=0">
				<view class="owner_type_box" v-if="item.householdsNum!=0">
					<text class="owner_type_text">住户({{item.householdsNum}})</text>
				</view>
				<view class="owner_type_box" v-if="item.tenantsNum!=0" style="margin-left: 24rpx;">
					<text class="owner_type_text">租客({{item.tenantsNum}})</text>
				</view>
			</view>
		</view>
		<view class="add_right" @click="onAddHouse">
			<image class="add_img" src="/static/common/icon_add.png"></image>
		</view>
	</view>
</template>

<script>
	import uniEmpty from '@/components/uni-empty/uni-empty.vue'
	export default {
		components: {
			uniEmpty
		},
		data() {
			return {
				emptyText: '暂无数据...',
				listsItem: [],
				currentAllName: '',
				fromID: 0, //0：我的房产进入；1:首页进入
				isNoData: false
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			if (options.fromID) {
				this.fromID = options.fromID
				uni.setNavigationBarTitle({
					title: '切换房产'
				})
			}
			this.currentAllName = uni.getStorageSync('data').villageName + uni.getStorageSync('data').buildingName + '栋' + uni.getStorageSync(
				'data').roomName + '室'
		},

		onShow() {
			this.getRoomList()
		},

		methods: {
			async getRoomList() {
				var that = this
				return await that.$http(that.$api.getRoomListUrl, {
					method: 'GET',
					data: {
						limit: '100',
						page: 1,
						userId: uni.getStorageSync('userId')
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data.list
						var currentAllNameStr = ''
						for (let i = 0; i < list.length; i++) {
							const markedStr = list[i].marked
							if (markedStr == '1') {
								currentAllNameStr = list[i].villageName + list[i].buildingName + '栋' + list[i].roomName + '室'
							}
						}
						that.currentAllName = currentAllNameStr
						that.listsItem = list
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}
				}).catch(err => {
					that.isNoData = true
				})
			},

			onChangeHouse(e) {
				const idx = e.currentTarget.dataset.index
				const roomId = this.listsItem[idx].roomId
				var that = this
				uni.showModal({
					content: '确定要切换为该房产吗？',
					cancelText: '取消',
					cancelColor: '#797979',
					confirmText: '切换',
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.changeRoomRequest(roomId)
						}
					}
				})
			},

			async changeRoomRequest(roomId) {
				var that = this
				return await that.$http(that.$api.changeRoomUrl, {
					method: 'GET',
					data: {
						roomId: roomId,
						userId: uni.getStorageSync('userId')
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '切换成功',
							icon: 'none',
							success: (res) => {
								that.fromID == 0 ? that.getRoomList() : uni.navigateBack({
									delta: 1,
								})
							}
						})
					} else {
						uni.showToast({
							title: '切换失败',
							icon: 'none'
						})
					}
				}).catch(err => {})
			},

			onAddHouse() {
				uni.navigateTo({
					url: '/pages/communityRegister/validation',
				})
			}
		},
		/**
		 * 页面相关事件处理函数--监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading();
			this.getRoomList().then(() => {
				uni.hideNavigationBarLoading()
				// 处理完成后，终止下拉刷新
				uni.stopPullDownRefresh()
			})
		}
	}
</script>

<style lang="scss" scoped>
	.house_container {
		background: #F6F8FA;
		width: 100%;
		height: 100%;
		padding: 30rpx 30rpx 0;
	}

	.house_head {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 32rpx 30rpx 26rpx;
		width: 100%;
		background: #FFFFFF;
		border-radius: 20rpx;
	}

	.head_top {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.current_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #919298;
		line-height: 28rpx;
	}

	.change_box {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.change_img {
		width: 28rpx;
		height: 26rpx;
		margin-right: 10rpx;
	}

	.change_text {
		font-size: 26rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #218EFF;
		line-height: 26rpx;
	}

	.house_text {
		width: 100%;
		font-size: 30rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 42rpx;
		margin-top: 18rpx;
		word-wrap: break-word;
		word-break: break-all;
		white-space: pre-line;
	}

	.house_item {
		display: flex;
		flex-direction: column;
		width: 100%;
		background: #fff;
		border-radius: 20rpx;
		margin-top: 30rpx;
	}

	.house_info {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 28rpx 0 36rpx 30rpx;
		border-radius: 20rpx 20rpx 0rpx 0rpx;
	}

	.info_top {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.name_text {
		font-size: 32rpx;
		font-family: PingFangSC-Semibold, PingFang SC;
		font-weight: 600;
		color: #2A2C2F;
		line-height: 32rpx;
	}

	.house_type {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 12rpx 20rpx;
		background: #218EFF;
		border-radius: 24rpx 0rpx 0rpx 24rpx;
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #FFFFFF;
		line-height: 24rpx;
	}

	.detail_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
		margin-top: 12rpx;
	}

	.item_bottom {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		padding: 24rpx 30rpx;
	}

	.owner_type_box {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 12rpx 24rpx;
		height: 48rpx;
		border-radius: 24rpx;
		border: 1rpx solid #218EFF;
	}

	.owner_type_text {
		height: 24rpx;
		font-size: 24rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #218EFF;
		line-height: 24rpx;
	}
</style>
