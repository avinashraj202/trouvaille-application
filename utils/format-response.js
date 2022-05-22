const _ = require('lodash')

const {
    LINK, 
    TEXT,
    S3_BUCKET_ENDPOINT,
} = require('./constant')

const formatResponse = (response) => {
    const indexMap = new Map()

    let mFormattedResponse = response.map((v) => {
        const {coords, uri, type, uuid, link_title, link_img, parent_id, updated_at, id} = v
        return {id: uuid, type, parent_id, updated_at, idd: id, data: {link_title, link_img, coords, uri: `${type == LINK || type == TEXT ? '' : S3_BUCKET_ENDPOINT}${uri}`}}
      })
  
      mFormattedResponse.forEach((v, index) => {
        const {parent_id} = v
  
        if(parent_id && parent_id.length > 0) {
          let mParentIndex;
          if(indexMap.has(parent_id)) mParentIndex = indexMap.get(parent_id)
          else {
            mParentIndex = mFormattedResponse.findIndex((v1) => v1 && v1.id == parent_id)
            indexMap.set(parent_id, mParentIndex)
          }
  
          if(mFormattedResponse[mParentIndex]['children'] === undefined) mFormattedResponse[mParentIndex].children = [v]
          else mFormattedResponse[mParentIndex].children.unshift(v)
  
          delete mFormattedResponse[index]
        }
      })
  
      // _.sortBy(mFormattedResponse, ['updated_at'])
      mFormattedResponse = _.compact(mFormattedResponse)
      mFormattedResponse = _.orderBy(mFormattedResponse, [(obj) => new Date(obj.updated_at)], ['desc'])
      
      return mFormattedResponse
}

module.exports = formatResponse