import React, { Component, PropTypes } from 'react'
import { Sidebar, Menu, Progress } from 'semantic-ui-react'
import { Scrollbars } from 'react-custom-scrollbars'

export default class EditorSidebar extends Component {
  _renderMenuItem () {
    const { toc, currentSlideIndex, navigateToSlide } = this.props
    return toc.map((item, index) => {
      const title = `${item['tocnumber']} ${item['title']}`
      const { numSlides, slideStartPosition } = item

      let active = false
      let percent = 0

      if (currentSlideIndex >= slideStartPosition &&
        currentSlideIndex < (slideStartPosition + numSlides)) {
        active = true
        percent = Math.floor(100 * (currentSlideIndex - slideStartPosition) / numSlides)
      }

      return active ? (
        <Progress percent={percent} className="c-menu-progress">
          <div className="c-menu-progress-item">
            <Menu.Item
              name={ title }
              content={ title }
              active={ active }
              className={ `c-sidebar__menu-item--level-${item['toclevel']}` }
              key= { index }
              link={true}
              onClick={() => navigateToSlide(slideStartPosition)}
            />
          </div>
        </Progress>
      ) : (
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
