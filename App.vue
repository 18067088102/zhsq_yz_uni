<script>
	import Vue from 'vue'
	export default {
		onLaunch: function() {
			uni.getSystemInfo({
				success: function(e) {
					// #ifndef MP
					Vue.prototype.StatusBar = e.statusBarHeight;
					if (e.platform == 'android') {
						Vue.prototype.CustomBar = e.statusBarHeight + 50;
					} else {
						Vue.prototype.CustomBar = e.statusBarHeight + 45;
					};
					// #endif

					// #ifdef MP-WEIXIN
					Vue.prototype.StatusBar = e.statusBarHeight;
					let custom = wx.getMenuButtonBoundingClientRect();
					//导航高度
					let statusBarHeight = e.statusBarHeight,
						navTop = custom.top,
						navHeight = statusBarHeight + custom.height + (custom.top - statusBarHeight) * 2;
					Vue.prototype.navHeight = navHeight;
					Vue.prototype.navTop = navTop;
					Vue.prototype.windowWidth = e.windowWidth;
					Vue.prototype.windowHeight = e.windowHeight;
					Vue.prototype.screenHeight = e.screenHeight;

					Vue.prototype.Custom = custom;
					Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif		

					// #ifdef MP-ALIPAY
					Vue.prototype.StatusBar = e.statusBarHeight;
					Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
				}
			})
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import "colorui/main.css";
	@import "colorui/icon.css";
	@import "colorui/animation.css";
	@import "uni.css";
	@import "common/css/custom.css";
	@import url("/components/gaoyia-parse/parse.css");

	page {
		background-color: #F6F8FA;
		height: 100%;
		font-size: 28upx;
		line-height: 1.8;
	}
</style>
