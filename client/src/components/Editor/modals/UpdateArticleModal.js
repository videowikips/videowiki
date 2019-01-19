import React, {
  PropTypes,
} from 'react';

import { Button, Icon, Popup, Modal, Progress } from 'semantic-ui-react';
import { NotificationManager } from 'react-notifications';
import request from '../../../utils/requestAgent';

class UpdateArticleModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      updating: false,
      submitLoadingPercentage: 0,
    }
  }

  onClose() {
    this.setState({ open: false });
  }

  onUpdate() {
    this.setState({ submitLoadingPercentage: 10, updating: true })
    this.updateInterval = setInterval(() => {
      this.setState((state) => ({
        submitLoadingPercentage: state.submitLoadingPercentage >= 90 ? state.submitLoadingPercentage : state.submitLoadingPercentage + 10,
      }))
    }, 5000)
    request.get(`/api/wiki/updateArticle?title=${this.props.title}&wikiSource=${this.props.wikiSource}`)
    .then(() => {
      this.setState({ updating: false, submitLoadingPercentage: 0 });
      clearInterval(this.updateInterval);
      NotificationManager.success('Article updated successfully');
      this.onClose()
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    })
    .catch(() => {
      this.setState({ updating: false, submitLoadingPercentage: 0 });
      NotificationManager.error('Error updating article');
    })
  }

  render() {
    const { title } = this.props;
    return (
      <a onClick={() => this.setState({ open: true })} className="c-editor__footer-wiki c-editor__footer-sidebar c-editor__toolbar-publish c-app-footer__link " >
        <Popup
          trigger={
            <Icon name="refresh" inverted color="grey" />
          }
        onClick={() => this.setState({ open: true })}
        >
          Update article
        </Popup>
        <Modal size="small" open={this.state.open} onClose={() => this.onClose()} >
          <Modal.Header>Update {title.split('_').join(' ')}</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <p>Do you want to update the article "{title.split('_').join(' ')}" now?</p>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            {this.state.updating ? (
              <div style={{ marginBottom: '5rem !important' }}>
                <Progress
                  // className="c-upload-progress"
                  percent={Math.floor(this.state.submitLoadingPercentage)}
                  progress
                  indicating
                >
                      Hold on tight! We are updating the article for you
                </Progress>
              </div>
            ) : (
              <div>
                <Button onClick={() => this.onClose()}>Cancel</Button>
                <Button primary onClick={() => this.onUpdate()} >
                  Yes
                </Button>
              </div>
            )}
          </Modal.Actions>
        </Modal>
      </a>
    )
  }
}

UpdateArticleModal.propTypes = {
  title: PropTypes.string.isRequired,
  wikiSource: PropTypes.string.isRequired,
}

export default UpdateArticleModal;
