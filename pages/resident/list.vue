<template>
	<view>
		<view class="nav">
			<view class="nav_item" v-for="(item,index) in Tabs" :key='index' @click="tabSelect" :data-id="index">
				<view class="item_content" :class="index==TabCur?'text-theme cur':'text-gray'">
					{{Tabs[index]}}
				</view>
			</view>
		</view>
		<view class="list_container cu-list" :style="residentsArr.length==0?'background: #fff;':''" v-if="TabCur==0">
			<view class="list_item cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart='ListTouchStart'
			 @touchmove='ListTouchMove' @touchend='ListTouchEnd' :data-target="'move-box-' + index" v-for="(item,index) in residentsArr"
			 :key="index" @click="onClickItem" :data-index="index">
				<image class="item_img" :src="residentsFaces[index]?residentsFaces[index]:'/static/mine/icon_avator.png'"></image>
				<view class="item_right">
					<view class="right_top">
						<text class="name_text">{{item.name}}</text>
						<view class="type_box">
							<text>{{item.relationName}}</text>
						</view>
					</view>
					<text class="phone_text" style="margin-top: 17rpx;">{{item.mobile}}</text>
				</view>
				<view class="move" :data-id="index" @click.stop="onDeleteItem">
					<view class="bg-red">删除</view>
				</view>
			</view>
			<view class="empty_container" v-if="residentsArr.length==0">
				<uni-empty :emptyText="emptyText"></uni-empty>
			</view>
		</view>
		<view class="list_container cu-list" :style="retentsArr.length==0?'background: #fff;':''" v-if="TabCur==1">
			<view class="list_item cu-item" :class="modalName=='move-box-'+ index?'move-cur':''" @touchstart='ListTouchStart'
			 @touchmove='ListTouchMove' @touchend='ListTouchEnd' :data-target="'move-box-' + index" v-for="(item,index) in retentsArr"
			 :key="index" @click="onClickItem" :data-index="index">
				<image class="item_img" mode="aspectFill" :src="retentsFaces[index]?retentsFaces[index]:'/static/mine/icon_avator.png'"></image>
				<view class="item_right">
					<view class="right_top">
						<text class="name_text">{{item.name}}</text>
						<view class="type_box">
							<text>{{item.relationName}}</text>
						</view>
					</view>
					<text class="phone_text" style="margin-top: 17rpx;">{{item.mobile}}</text>
				</view>
				<view class="move" :data-id="index" @click.stop="onDeleteItem">
					<view class="bg-red">删除</view>
				</view>
			</view>
			<view class="empty_container" v-if="retentsArr.length==0">
				<uni-empty :emptyText="emptyText"></uni-empty>
			</view>
		</view>
		<view class="add_right" @click="onAddResident">
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
				emptyText: '暂无住户信息...',
				TabCur: 0,
				Tabs: ['我的住户', '我的租客'],
				residentsArr: [],
				retentsArr: [],
				residentsFaces: [],
				retentsFaces: [],
				modalName: null,
				listTouchStart: 0,
				listTouchDirection: null,
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onShow: function(options) {
			this.getPersonListRequest()
		},
		methods: {
			async getPersonListRequest() {
				var that = this
				return await that.$http(that.$api.getPersonListUrl, {
					method: 'GET',
					data: {
						roomId: uni.getStorageSync('data').roomId
					},
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						const list = res.data
						var residents = []
						var retents = []
						var residentsFaces = []
						var retentsFaces = []
						for (let i = 0; i < list.length; i++) {
							const relation = list[i].relationName
							var imgPath = that.$common.combineImageUrl(list[i].faceImg)
							if (relation == '租客') {
								retents.push(list[i])
								retentsFaces.push(imgPath)
							} else {
								residents.push(list[i])
								residentsFaces.push(imgPath)
							}
						}
						that.residentsFaces = residentsFaces
						that.retentsFaces = retentsFaces
						that.residentsArr = residents
						that.retentsArr = retents
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
						that.isNoData = true
					}
				}).catch(err => {
					that.isNoData = true
				})
			},

			tabSelect(e) {
				if (uni.pageScrollTo) {
					uni.pageScrollTo({
						scrollTop: 0
					})
				} else {
					uni.showModal({
						title: '提示',
						content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
					})
				}
				this.TabCur = e.currentTarget.dataset.id
			},

			onClickItem(e) {
				var arr = this.TabCur == 0 ? this.residentsArr : this.retentsArr
				const idx = e.currentTarget.dataset.index
				const personId = arr[idx].id
				uni.navigateTo({
					url: '/pages/resident/detail?personId=' + personId,
				})
			},

			onAddResident() {
				uni.navigateTo({
					url: '/pages/communityRegister/validation1?fromID=1',
				})
			},

			onDeleteItem(e) {
				var arr = this.TabCur == 0 ? this.residentsArr : this.retentsArr
				var personId = arr[e.currentTarget.dataset.id].id
				var that = this
				uni.showModal({
					content: that.TabCur == 0 ? '确定删除该住户?' : '确定删除该租客?',
					cancelText: '再想想',
					cancelColor: '#797979',
					confirmText: '删除',
					confirmColor: '#218EFF',
					success(res) {
						if (res.confirm) {
							that.deletePersonRequest(personId)
						}
					}
				})
			},

			async deletePersonRequest(personId) {
				var that = this
				var personIds = []
				personIds.push(personId)
				return await that.$http(that.$api.deletePersonRecordUrl, {
					method: 'DELETE',
					data: personIds,
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						uni.showToast({
							title: '删除成功',
							icon: 'none',
							success: (res) => {
								that.getPersonListRequest()
							}
						})
					} else {
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}).catch(err => {})
			},
			
			// ListTouch触摸开始
			ListTouchStart(e) {
				this.listTouchStart = e.touches[0].pageX
			},
			
			// ListTouch计算方向
			ListTouchMove(e) {
				this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left'
			},
			
			// ListTouch计算滚动
			ListTouchEnd(e) {
				if (this.listTouchDirection == 'left') {
					this.modalName = e.currentTarget.dataset.target
				} else {
					this.modalName = null
				}
				this.listTouchDirection = null
			}
		},
		/**
		 * 页面相关事件处理函数--监听用户下拉动作
		 */
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading();
			this.getPersonListRequest().then(() => {
				uni.hideNavigationBarLoading()
				// 处理完成后，终止下拉刷新
				uni.stopPullDownRefresh()
			})
		},
	}
</script>

<style lang="scss" scoped>
	.nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 90rpx;
		background: #fff;
		position: fixed;
		top: 0;
		z-index: 99;
	}

	.nav_item {
		width: 50%;
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.item_content {
		font-size: 30rpx;
		font-family: PingFangSC-Medium, PingFang SC;
		font-weight: 400;
		line-height: 90rpx;
	}

	.item_content.cur {
		border-bottom: 6rpx solid;
		border-radius: 3rpx;
	}

	.list_container {
		display: flex;
		flex-direction: column;
		padding: 93rpx 32rpx 24rpx;
		background: #F6F8FA;
		width: 750rpx;
		min-height: 100%;
		overflow-x: hidden;
	}

	.list_item {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 148rpx;
		background: #fff;
		border-radius: 10rpx;
		margin-top: 24rpx;
	}

	.item_img {
		width: 88rpx;
		height: 88rpx;
		margin-left: 24rpx;
		margin-right: 20rpx;
		border-radius: 50%;
	}

	.item_right {
		display: flex;
		flex-direction: column;
		width: calc(100% - 132rpx);
	}

	.right_top {
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

	.type_box {
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

	.relation_text {
		font-size: 28rpx;
		font-family: PingFangSC-Regular, PingFang SC;
		font-weight: 400;
		color: #63656B;
		line-height: 28rpx;
	}
</style>
