// 导出页面为PDF格式
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'
export default{
  install (Vue, options) {
    Vue.prototype.getPdf = function (pdfDom) {
      var title = this.htmlTitle
      html2canvas(document.querySelector(pdfDom), {
        allowTaint: true,
        useCORS: true
      }).then(function (canvas) {
        let contentWidth = canvas.width
        let contentHeight = canvas.height
        let pageHeight = contentWidth / 592.28 * 841.89 - 199.28
        let leftHeight = contentHeight
        // let position = 0
        let imgWidth = 595.28
        let imgHeight = 595.28 / contentWidth * contentHeight
        let pageData = canvas.toDataURL('image/jpeg', 1.0)
        let PDF = new JsPDF('', 'pt', 'a4')
        if (leftHeight < pageHeight) {
          PDF.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
        } else {
          while (leftHeight > 0) {
            // 分解成一个个页面图片
            let height = pageHeight
            if (leftHeight < pageHeight) height = leftHeight
            var targetctx = canvas.getContext('2d')
            var targetctxImageData = targetctx.getImageData(0, contentHeight - leftHeight, contentWidth, height)
            var c = document.createElement('canvas')
            var ctx = c.getContext('2d')
            c.width = contentWidth
            c.height = height
            ctx.rect(0, 0, contentWidth, height)
            ctx.fillStyle = 'white'
            ctx.fill()
            ctx.putImageData(targetctxImageData, 0, 0)
            let singlepagedata = c.toDataURL('image/jpeg', 1.0)
            imgHeight = 595.28 / contentWidth * height
            PDF.addImage(singlepagedata, 'JPEG', 0, 40, imgWidth, imgHeight)
            // PDF.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
            leftHeight -= height
            // position -= 841.89
            if (leftHeight > 0) {
              PDF.addPage()
            }
          }
        }
        PDF.save(title + '.pdf')
      })
    }
    Vue.prototype.downloadData = function (itemtype, itemid, filename) {
      // const ServerAddress = 'http://134.175.142.102:8090'
      // var url = ServerAddress + '/api/services/DownloadHandle.ashx'
      var url = '/api/services/DownloadHandle.ashx'
      var fd = new FormData()
      fd.append('itemtype', itemtype)
      fd.append('itemid', itemid)
      fd.append('filename', filename)
      const req = new XMLHttpRequest()
      req.open('POST', url, true)
      req.responseType = 'blob'
      // req.setRequestHeader('Authorization', globe_user.Tokenstring)

      req.onload = function () {
        const data = req.response
        const a = document.createElement('a')
        const blob = new Blob([data])
        const blobUrl = window.URL.createObjectURL(blob)
        a.style.display = 'none'
        a.download = filename
        a.href = blobUrl
        a.click()
      }
      req.send(fd)
    }
    Vue.prototype.by = function (name) {
      return function (o, p) {
        var a, b
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
          a = o[name]
          b = p[name]
          if (typeof a === 'string') {
            return a.localeCompare(b)
          } else {
            if (a === b) {
              return 0
            }
            if (typeof a === typeof b) {
              return a < b ? -1 : 1
            }
            return typeof a < typeof b ? -1 : 1
          }
          /*
          if (a === b) {
            return 0
          }
          if (typeof a === typeof b) {
            return a < b ? -1 : 1
          }
          return typeof a < typeof b ? -1 : 1
          */
        } else {
          return 1
          // throw ('error')
        }
      }
    }
    Vue.prototype.bydesc = function (name) {
      return function (o, p) {
        var a, b
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
          a = o[name]
          b = p[name]
          if (typeof a === 'string') {
            return b.localeCompare(a)
          } else {
            if (a === b) {
              return 0
            }
            if (typeof a === typeof b) {
              return a > b ? -1 : 1
            }
            return typeof a > typeof b ? -1 : 1
          }
          /*
          if (a === b) {
            return 0
          }
          if (typeof a === typeof b) {
            return a > b ? -1 : 1
          }
          return typeof a > typeof b ? -1 : 1
          */
        } else {
          return 1
          // throw ("error");
        }
      }
    }
  }
}
