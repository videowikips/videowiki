import React, {
  PropTypes,
} from 'react';

import { withRouter } from 'react-router-dom'

import { Icon, Popup, Dropdown } from 'semantic-ui-react';
import AuthModal from '../common/AuthModal';

class ExportArticleVideo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      updating: false,
      submitLoadingPercentage: 0,
      isLoginModalVisible: false,
    }
  }

  onClose() {
    this.setState({ open: false });
  }

  onOptionSelect(value) {
    this.setState({ exportVal: value })
    if (value === 'history') {
      this.props.history.push(`/videos/history/${this.props.title}?wikiSource=${this.props.wikiSource}`);
    } else if (value === 'export' && !this.props.authenticated) {
      this.setState({ isLoginModalVisible: true })
    }
  }

  render() {
    const { authenticated } = this.props;

    console.log('authenticated', authenticated)
    return (
      <a onClick={() => this.setState({ open: true })} className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link " >
        <Dropdown
          className="import-dropdown"
          inline
          compact
          direction="left"
          onChange={this.onOptionSelect.bind(this)}
          options={[
            {
              text: (
                <p onClick={() => this.onOptionSelect('history')}>
                  Export History
                </p>
              ),
              value: 'history',
            }, {
              text: (
                <p onClick={() => this.onOptionSelect('export')} >
                  Export video to Commons
                </p>
              ),
              value: 'export',
            },
          ]}
          icon={
            <Popup
              position="top right"
              trigger={
                <Icon inverted color="grey" name="video" />
              }
              content={
                <p>Export Video</p>
              }
            />
          }
        />
        <AuthModal open={this.state.isLoginModalVisible} heading="Only logged in users can export videos to Commons" onClose={() => this.setState({ isLoginModalVisible: false })} />
      </a>
    )
  }
}

ExportArticleVideo.propTypes = {
  title: PropTypes.string.isRequired,
  wikiSource: PropTypes.string.isRequired,
  authenticated: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
}

export default withRouter(ExportArticleVideo);