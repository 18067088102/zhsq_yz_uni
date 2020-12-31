<template>
	<scroll-view scroll-y="true" style="min-height: 100%;">
		<view class="content">
			<view class="title">{{info.title}}</view>
			<view class="ql-container" style="padding:0 30rpx;">
				<view class="ql-editor">
					<u-parse :content="article" @preview="preview" @navigate="navigate" noData="正在加载中..." />
				</view>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	import uParse from '@/components/gaoyia-parse/parse.vue'
	
	export default {
		components: {
			uParse
		},
		data() {
			return {
				info: {},
				fromID: '', //0:小区头条；1:小区风采
				article: ''
			}
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			let noticeId = options.id
			if (options.original) { //轮播图进入
				this.addBannerClickRequest(noticeId)
			}
			let fromID = options.fromID
			uni.setNavigationBarTitle({
				title: options.fromID == 0 ? '公告详情' : '风采详情'
			})
			this.noticeId = noticeId
			this.fromID = fromID
			this.getDetailInfo()
		},
		methods: {
			async getDetailInfo() {
				var that = this
				return await that.$http((that.fromID == 0 ? that.$api.getHeadLinesInfoUrl : that.$api.getElegantInfoUrl) + "/" + that.noticeId, {
					method: 'GET',
					token: uni.getStorageSync('token')
				}).then(res => {
					if (res.code == 200) {
						that.info = res.data
						that.article = res.data.content
					}
				})
			},

			async addBannerClickRequest(id) {
				return await this.$http(this.$api.addBannerTapCountUrl + '/' + id, {
					method: 'PUT',
					token: uni.getStorageSync('token')
				}).then(res => {})
			},
			
			preview(src, e) { //事件：点击富文本里的图片
				// do something
			},
			
			navigate(href, e) { //事件：点击富文本里的链接
				// do something
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #FFFFFF;
	}

	.title {
		width: 600rpx;
		font-size: 34rpx;
		color: #000;
		font-weight: 600;
		text-align: center;
		margin: 30rpx 0;
	}

	.ql-container {
		height: calc(100% - 94rpx);
	}

	.ql-editor image {
		width: 100% !important;
	}
</style>
