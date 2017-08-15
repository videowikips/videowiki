import React from 'react'

const Three = ({media, current, renderItem}) => 
 <div style={{height: '400px' }}>
    {media.map((item, index) => {
      const isActive = index === current

      return (
        <div className={isActive ? 'three-active' : 'three'} key={index}>
          {renderItem(item, isActive)}        
        </div>
      )     
    })}
  </div>

export default Three
