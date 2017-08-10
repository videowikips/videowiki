import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Dimmer, Loader, Message, Grid, Icon, Card, Popup } from 'semantic-ui-react'

import actions from '../../actions/ArticleActionCreators'

class Contributors extends Component {
  componentWillMount () {
    const { title } = this.props
    this.props.dispatch(actions.fetchContributors({ title }))
  }

  _renderLoading () {
    return null
  }

  _renderFailure () {
    return (
      <Message negative>
        <p>Failed to load contributors!</p>
      </Message>
    )
  }

  _renderIcons (numIcons) {
    return _.times(numIcons, (i) => (
      <Grid.Column key={i}>
        <Icon name="user" />
      </Grid.Column>
    ))
  }

  _renderContributorsCount () {
    return (
      <span className="c-contributors__count">{ this.props.contributors.length }</span>
    )
  }

  _renderContributorsNames () {
    const { contributors } = this.props

    return contributors.map((person, i) =>
      (
        <div key={i}>{ person }</div>
      ))
  }

  _render () {
    const { contributors } = this.props

    const numIcons = contributors.length > 5 ? 5
      : contributors.length

    return (
      <Card className="c-contributors">
        <Card.Content header="Contributors" className="c-contributors__header" />
        <Card.Content className="c-contributors__description">
          <Popup
            trigger={ this._renderContributorsCount() }
            hoverable
            position="bottom right"
            size="large"
            className="c-contributors__popup"
          >
            { this._renderContributorsNames() }
          </Popup>
          <Grid className="c-contributors__icons">{ this._renderIcons(numIcons) }</Grid>
        </Card.Content>
      </Card>
    )
  }

  render () {
    const { fetchContributorsState } = this.props

    switch (fetchContributorsState) {
      case 'done':
        return this._render()
      case 'loading':
        return this._renderLoading()
      case 'failed':
        return this._renderFailed()
      default:
        return this._render()
    }
  }
}

const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(Contributors)

Contributors.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  fetchContributorsState: PropTypes.string,
  contributors: PropTypes.array,
}
