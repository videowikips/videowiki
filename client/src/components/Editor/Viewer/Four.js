import React from 'react'

const Four = ({media, current, renderItem}) => 
  <div className='four-container' style={{height: '400px'}}>
    <div className={current === 0 ? 'four-active' : 'four'}>
      {renderItem(media[0], current === 0)}
    </div>
    <div className={current === 1 ? 'four-active' : 'four'}>
      {renderItem(media[1], current === 1)}
    </div>
    <div style={{width: `${current === 2 || current === 3 ? '70%' : '15%'}`, WebkitTransition: 'width 2s' , display: 'inline-block', height: '100%', verticalAlign: 'top'}}>
      <div className={current === 2 ? 'four-small-active' : 'four-small'} style={calculateStyleForFour(2, current)}>{renderItem(media[2], current === 2)}</div>
      <div className={current === 3 ? 'four-small-active' : 'four-small'} style={calculateStyleForFour(3, current)}>{renderItem(media[3], current === 3)}</div>
    </div>
  </div>

export default Four

const calculateStyleForFour = (index, current) => {
  let style = {}

  if (index === 2 && current === 3) {
    style = { height: '20%'}
  } else if (index === 3) {
    style = { height: `${current === 2 ? '20%' : ''}`, marginTop: '-4px'}
  }
  
  return style
}