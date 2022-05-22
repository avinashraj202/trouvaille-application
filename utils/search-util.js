const {LINK, TEXT} = require('./constant')


getSearchAbleData = ({data: {uri, link_title}, children}) => {
    let mData = []
    mData = [...mData, uri, ...(link_title ? [link_title] : [])]
    if(!children) return mData

    children.map((v) => {
        mData = [...mData, ...getSearchAbleData(v)]
    })

    return mData
}
  
checkForMatch = (a, b) => {
    let c = 0;
    a.map((v) => {
      let d = 0;
      b.map((v1) => {
        if(v1.toLowerCase().includes(v.toLowerCase())) d++
      })
      d > 0 ? c++ : false
    })

    return c >= a.length
}

getSearchType = (type) => {
  switch(type) {
    case 0: return `AND type = '${LINK}'`
    case 1: return '';
    case 2: return `AND type = '${TEXT}'`
  }
}

module.exports = {
  getSearchAbleData,
  checkForMatch,
  getSearchType
}