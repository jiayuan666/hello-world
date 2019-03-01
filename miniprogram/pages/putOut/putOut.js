// pages/putOut/putOut.js

Page({

  /**
   * 页面的初始数据
   */
	data: {
		goodImgUrl:[],

		detailInputNum: 0,
		detailInputNumLimit: 150,
		imgFiles: [],
		imgFilesMaxNum: 9,

		category: ["其他闲置", "农用物资", "生鲜水果"],
		goodCategoryIndex: null,

		meansOfTrade: [
			{ value: "self", name: "自提", checked: false },
			{ value: "meet", name: "面交", checked: false  },
			{ value: "post", name: "邮寄", checked: false  }
		],

		requestResult: ''

	},
	onStrLengthChanging: function (e) {
		this.setData({
			detailInputNum: e.detail.value.length
		})
	},
	chooseImage: function (e) {
		var that = this;
		wx.chooseImage({
			count: that.data.imgFilesMaxNum - that.data.imgFiles.length,
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				that.setData({
					imgFiles: that.data.imgFiles.concat(res.tempFilePaths)
				});
			}
		})
	},
	previewImage: function (e) {
		wx.previewImage({
			current: e.currentTarget.id, // 当前显示图片的http链接
			urls: this.data.imgFiles // 需要预览的图片http链接列表
		})
	},
	bindCategoryChange: function (e) {
		console.log('picker category 发生选择改变，携带值为', e.detail.value)
		this.setData({
			goodcategoryIndex: e.detail.value
		})
	},
	checkboxChange: function (e) {
		console.log('checkbox发生change事件，携带value值为：', e.detail.value)
		var meansOfTrade = this.data.meansOfTrade, values = e.detail.value
		for (var i = 0; i < meansOfTrade.length; i++) {
			meansOfTrade[i].checked = false;

			for (var j = 0, lenJ = values.length; j < lenJ; j++) {
				if (meansOfTrade[i].value == values[j]) {
					meansOfTrade[i].checked = true
					break
				}
			}

		}
		this.setData({
			meansOfTrade: meansOfTrade
		});
	},
	formSubmit: function (e) {
		var that = this, value = e.detail.value
		console.log('form发生了submit事件，携带数据为：', value)
  
		// if (value.goodTitle == '' || value.goodDetail == '' || value.goodPrice == null || value.goodExPrice == null || value.goodCategoryIndex == null || value.goodMOT == [] || this.data.imgFiles == []) {
    //   console.log("信息填写不全")
    //   util.showModel("提示","请将信息填写完整哦~")
    //   return
    // } 
    // else {
			//上传图片
		var imgFiles = that.data.imgFiles
		var imgUrls = []


		for (var i = 0; i < imgFiles.length; i++) {

			wx.uploadFile({
				url: config.service.uploadUrl,
				filePath: imgFiles[i],
				header: {
					"content-type": "multipart/form-data"
				},
				name: 'file',

				success: function (res) {
					res = JSON.parse(res.data)
					that.data.goodImgUrl.push(res.data.imgUrl)
				},
				fail: function () {
					console.log("上传图片时失败")
				}
			})

		}
		
		//发起request 储存表单数据
		qcloud.request({
			url: `${config.service.host}/weapp/Putout`,
			data: {
				goodTitle: value.goodTitle,
				goodDetail: value.goodDetail,
				goodPrice: value.goodPrice,
				goodExPrice: value.goodExPrice,
				goodCategoryIndex: value.goodCategoryIndex,
				goodMOT: value.goodMOT
			},
			method: "GET",
			login: false,
			success(result) {
				util.showSuccess('表单提交成功')
				that.setData({
					requestResult: JSON.stringify(result.data)
				})
				console.log(that.data.requestResult)
			},
			fail(error) {
				util.showModel('表单提交失败', error);
				console.log('request fail', error);
			}
		})
		

    //}

	},
	formReset: function (e) {
		console.log('form发生了reset事件，携带数据为：', e.detail.value)
		this.setData({
			imgFiles: []
		})
	},
	

})