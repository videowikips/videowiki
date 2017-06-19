import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Table } from 'semantic-ui-react'

import StateRenderer from '../common/StateRenderer'

import actions from '../../actions/UserActionCreators'

class Leaderboard extends Component {
  componentWillMount () {
    this.props.dispatch(actions.fetchLeaderboard())
  }

  _renderRows () {
    const { leaderboard } = this.props
    return leaderboard.map((user, index) => {
      const rank = index + 1
      const name = `${user.firstName} ${user.lastName}`
      return (
        <Table.Row textAlign="center" key={user.email}>
          <Table.Cell>{ rank }</Table.Cell>
          <Table.Cell>{ name }</Table.Cell>
          <Table.Cell>{ user.articlesEditCount }</Table.Cell>
        </Table.Row>
      )
    })
  }

  _renderList () {
    return (
      <div className="c-leaderboard">
        <h2>Leaderboard</h2>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={6} textAlign="center">Rank</Table.HeaderCell>
              <Table.HeaderCell width={5} textAlign="center">Name</Table.HeaderCell>
              <Table.HeaderCell width={5} textAlign="center">Articles Edited</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            { this._renderRows() }
          </Table.Body>
        </Table>
      </div>
    )
  }

  _render () {
    const { leaderboard } = this.props
    return leaderboard.length > 0 ? this._renderList(leaderboard)
      : (
        <h2>There is no one in the leaderboard yet!</h2>
      )
  }

  render () {
    const { fetchLeaderboardState } = this.props
    return (
      <StateRenderer
        componentState={fetchLeaderboardState}
        loaderMessage="Hold Tight! Loading leaderboard..."
        errorMessage="Error while loading leaderboard! Please try again later!"
        onRender={() => this._render()}
      />
    )
  }
}

Leaderboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fetchLeaderboardState: PropTypes.string,
  leaderboard: PropTypes.array,
}

const mapStateToProps = (state) =>
  Object.assign({}, state.user)

export default connect(mapStateToProps)(Leaderboard)
