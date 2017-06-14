import React, { Component, PropTypes } from 'react'
import { Sidebar, Menu } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

export default class EditorSidebar extends Component {
  _renderMenuItem () {
    const { toc, currentSlideIndex, navigateToSlide } = this.props
    return toc.map((item, index) => {
      const title = `${item['tocnumber']} ${item['title']}`
      const { numSlides, slideStartPosition } = item

      let active = false

      if (currentSlideIndex >= slideStartPosition &&
        currentSlideIndex < (slideStartPosition + numSlides)) {
        active = true
      }

      return (
        <Menu.Item
          name={ title }
          content={ title }
          active={ active }
          className={ `c-sidebar__menu-item--level-${item['toclevel']}` }
          key= { index }
          link={true}
          onClick={() => navigateToSlide(slideStartPosition)}
        />
      )
    })
  }

  render () {
    const { visible } = this.props
    return (
      <Sidebar
        as={Menu}
        animation="slide along"
        width="thin"
        visible={visible}
        icon="labeled"
        vertical
        inverted
        className="c-sidebar"
      >
        <Scrollbars>
          { this._renderMenuItem() }
        </Scrollbars>
      </Sidebar>
    )
  }
}

EditorSidebar.propTypes = {
  toc: PropTypes.array.isRequired,
  visible: PropTypes.bool.isRequired,
  currentSlideIndex: PropTypes.number.isRequired,
  navigateToSlide: PropTypes.func.isRequired,
}
