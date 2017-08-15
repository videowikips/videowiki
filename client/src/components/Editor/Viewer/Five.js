import React, { PropTypes } from 'react'

const Five = ({ media, current, renderItem }) => 
  <div className='five-container' style={{height: '400px'}}>
    <div className={current === 0 ? 'five-active' : 'five'} style={calculateStyleForFive(0, current)}>
      {renderItem(media[0], current === 0)}
    </div>
    <div className={current === 1 ? 'five-active' : 'five'}  style={calculateStyleForFive(1, current)}>
      {renderItem(media[1], current === 1)}
    </div>
    <div style={{width: `${current === 2 || current === 3 ? '60%' : '15%'}`, WebkitTransition: 'width 2s' , display: 'inline-block', height: '100%', verticalAlign: 'top'}}>
      <div className={current === 2 ? 'five-small-active' : 'five-small'} style={calculateStyleForFive(2, current)}>{renderItem(media[2], current === 2)}</div>
      <div className={current === 3 ? 'five-small-active' : 'five-small'} style={calculateStyleForFive(3, current)}>{renderItem(media[3], current === 3)}</div>
    </div>
    <div className={current === 4 ? 'five-super-small-active' : 'five-super-small'}  style={calculateStyleForFive(4, current)}>
      {renderItem(media[4], current === 4)}
    </div>
  </div>

Five.propTypes = {
  media: PropTypes.array.isRequired,
  current: PropTypes.number,
  renderItem: PropTypes.func,
}

export default Five

const calculateStyleForFive = (index, current) => {
  let style = {}

  if (index === 2) {
    style = Object.assign({}, style, { height: `${current === 3 ? '20%' : ''}` })
  } else if (index === 3) {
    style = Object.assign({}, style, { height: `${current === 2 ? '20%' : ''}`, marginTop: '-4px' })
  }

  return style
}
