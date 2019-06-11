import React, { PropTypes } from 'react'

const One = ({ media, renderItem }) =>
  <div style={{ height: '100%'}}>
    {media.map((mitem) => (
      <div className={'one one-active'} style={{ width: '100%', height: '100%' }} key={`ien-slide-${mitem.url}`}>
        {renderItem(mitem, true)}
      </div>
    ))}
  </div>

One.propTypes = {
  media: PropTypes.array.isRequired,
  current: PropTypes.number,
  renderItem: PropTypes.func,
}

export default One
