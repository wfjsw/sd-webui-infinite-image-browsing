;(() => {
  const html = `__built_html__`
  const asyncCheck = async (getter, checkSize = 100, timeout = 1000) => {
    return new Promise((x) => {
      const check = (num = 0) => {
        const target = getter()
        if (target !== undefined && target !== null) {
          x(target)
        } else if (num > timeout / checkSize) {
          // 超时
          x(target)
        } else {
          setTimeout(() => check(++num), checkSize)
        }
      }
      check()
    })
  }
  asyncCheck(
    // eslint-disable-next-line no-undef
    () => gradioApp().querySelector('#infinite_image_browsing_container_wrapper'),
    500,
    Infinity
  ).then((el) => {
    /**
     * @type {HTMLDivElement}
     */
    const wrap = el
    wrap.childNodes.forEach((v) => wrap.removeChild(v))
    const iframe = document.createElement('iframe')
    iframe.srcdoc = html
    iframe.style = `width: 100%;height:100vh`
    wrap.appendChild(iframe)
  })
})()
