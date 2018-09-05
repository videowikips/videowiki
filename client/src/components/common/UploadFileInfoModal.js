import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import request from 'superagent'
import { NotificationManager } from 'react-notifications';
import { Progress, Modal, Form, Button, Icon, Search, Grid, Label, Dropdown, TextArea, Popup, Loader, Input, } from 'semantic-ui-react'
import { ownworkLicenceOptions, othersworkLicenceOptions } from './licenceOptions'
import actions from '../../actions/ArticleActionCreators'

const styles = {
  successCheckmark: {
    color: 'green',
  },
  errorCheckmark: {
    color: 'red',
  },
}

const stringTextLimit = 5

class UploadFileInfoModal extends Component {

  constructor (props) {
    super(props)

    this.sourceOptions = [
      {
        text: 'Own Work',
        value: 'own',
      },
      {
        text: 'I did not create this media file',
        value: 'others',
      },
    ]

    this.state = {
      fileSrc: null,
      fileType: '',

      submitLoading: false,
      submitLoadingInterval: null,
      submitLoadingPercentage: 0,
      title: '',
      description: '',
      categoriesSearchText: '',
      categories: [],
      licence: ownworkLicenceOptions[0].value,
      licenceText: ownworkLicenceOptions[0].value,
      licenceSection: '',
      source: 'own',
      sourceUrl: '',
      sourceAuthors: '',
      date: '',

      titleDirty: false,
      descriptionDirty: false,
      categoriesDirty: false,
      sourceUrlDirty: false,
      sourceAuthorsDirty: false,
      dateDirty: false,

      titleError: '',
      titleLoading: false,
    }

    this._handleResultSelect = this._handleResultSelect.bind(this)
    this._handleSearchChange = this._handleSearchChange.bind(this)
    this._handleSourceChange = this._handleSourceChange.bind(this)
  }

  componentWillMount () {
    console.log(this.props)
    if (this.props.file) {
      this._handleLoadFilePreview(this.props.file)
      this.uploadTempFile()
    }
  }

  uploadTempFile () {
    const { dispatch, currentSlideIndex, wikiSource, title, file } = this.props

    dispatch(actions.uploadContentRequest())

    request
      .post('/api/wiki/article/uploadTemp')
      .field('wikiSource', wikiSource)
      .field('title', title)
      .field('slideNumber', currentSlideIndex)
      .attach('file', file)
      .on('progress', (event) => {
        console.log(event.percent)
        dispatch(actions.updateProgress({ progress: event.percent }))
      })
      .end((err, { body }) => {
        console.log(err, body)
        if (err) {
          console.log(err)
          dispatch(actions.uploadContentFailed())
        } else {
          this.setState({ fileSrc: body.filepath })
        }
        dispatch(actions.uploadContentReceive({ uploadStatus: body }))
      })
  }

  uploadFileToWikiCommons (data) {
    const { dispatch } = this.props
    const submitInterval = setInterval(() => {
      this.setState((state) => ({
        submitLoadingPercentage: state.submitLoadingPercentage < 90 ? state.submitLoadingPercentage + 5 : state.submitLoadingPercentage,
      }))
    }, 5000)

    this.setState({ submitLoading: true, submitLoadingPercentage: 5, submitLoadingInterval: submitInterval })

    const uploadRequest = request
      .post('/api/wiki/article/uploadCommons')
      .field('title', this.props.title)
      .field('wikiSource', this.props.wikiSource)
      .field('slideNumber', this.props.currentSlideIndex)
      .field('file', this.state.fileSrc)
      .timeout({ deadline: 5 * 60 * 1000 })
    // attach given fields in the request
    Object.keys(data).forEach((key) => {
      uploadRequest.field(key, data[key])
    })

    // finally attach the file to the form
    uploadRequest
    .end((err, { text, body }) => {
      if (!err) {
        NotificationManager.success('Success', 'File uploaed successfully!')
        dispatch(actions.uploadContentReceive({ uploadStatus: body }))
        this.props.onClose()
      } else if (err) {
        const reason = text || 'Something went wrong, please try again!'
        NotificationManager.error('Error', reason)
        this.setState({ submitLoading: false })
      }
      clearInterval(this.state.submitLoadingInterval)
    })
  }

  _handleFileUploadModalClose () {
    this.props.onClose && this.props.onClose()
  }

  _onSubmit (e) {
    e.preventDefault()
    if (this._isFormValid()) {
      console.log('submitting')
      const {
        title: fileTitle,
        description,
        categories,
        licence,
        source,
        sourceUrl,
        sourceAuthors,
        date,
        } = this.state

      const formValues = {
        fileTitle,
        description,
        categories: categories.map((category) => `[[${category.title}]]`).join(' '),
        licence,
        source,
        sourceUrl,
        sourceAuthors,
        date,
      }
      this.uploadFileToWikiCommons(formValues)
    }
  }

  onRemoveCategory (index) {
    const categories = this.state.categories
    categories.splice(index, 1)
    this.setState({ categories })
  }

  onTitleBlur () {
    let state = { titleDirty: true }
    if (this.state.title.length >= stringTextLimit) {
      state = Object.assign(state, { titleLoading: true, titleError: '' })
      const commonsApi = 'https://commons.wikimedia.org/w/api.php'
      const fileExtension = this.props.file.name.split('.')[this.props.file.name.split('.').length - 1];
      const filename = `File:${this.state.title}.${fileExtension}`

      request.get(`/api/wiki/search?searchTerm=${filename}&wikiSource=${commonsApi}`)
        .then((res) => {
          let isValid = true
          if (res && res.body && res.body.searchResults) {
            res.body.searchResults.forEach((result) => {
              if (result.title.toLowerCase() === filename.toLowerCase() && result.description === commonsApi) {
                isValid = false
              }
            })
          }

          if (!isValid) {
            this.setState({ titleError: 'A file with this name exists already. please try another title', titleLoading: false })
          } else {
            this.setState({ titleError: '', titleLoading: false })
          }
        }, () => {
          this.setState({ titleError: '', titleLoading: false })
        })
    }

    this.setState(state)
  }

  _handleLoadFilePreview (file) {
    const reader = new FileReader()
    console.log(file)
    reader.onload = (e) => {
      this.setState({ fileSrc: e.target.result, fileType: file.type })
    }

    reader.readAsDataURL(file)
  }

  _handleResultSelect (e, result) {
    const categories = this.state.categories
    const resultIndex = categories.findIndex((category) => category.title === result.title)
    if (resultIndex === -1) {
      categories.push(result)
      this.setState({ categoriesSearchText: '', categories })
    }
  }

  _handleSearchChange (e, value) {
    this.setState({ categoriesSearchText: value });
    this.props.dispatch(actions.fetchCategoriesFromWikimediaCommons({ searchText: value }))
  }

  _handleSourceChange (e, { value }) {
    if (value == 'own') {
      this.setState({ source: value, licence: ownworkLicenceOptions[0].value })
    } else if (value == 'others') {
      this.setState({
        source: value,
        licence: othersworkLicenceOptions[1].value,
        licenceText: othersworkLicenceOptions[1].text,
        licenceSection: othersworkLicenceOptions[1].section,
      })
    }
  }

  _renderSourceInfo () {
    return (
      <div style={{ marginTop: '1rem' }} >

        <h4>Source</h4>
        <p>Where this digital file came from — could be a URL, or a book or publication.</p>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14} >
              <Form.Input
                fluid
                value={this.state.sourceUrl}
                onBlur={() => this.setState({ sourceUrlDirty: true })}
                onChange={(e) => this.setState({ sourceUrl: e.target.value, sourceUrlDirty: true })}
              />
            </Grid.Column>
            <Grid.Column width={2}>

              {this.state.sourceUrlDirty && this.state.sourceUrl.length >= stringTextLimit &&
                <Icon name="check circle" style={styles.successCheckmark} />
              }

              {this.state.sourceUrlDirty && this.state.sourceUrl.length < stringTextLimit &&
                <Icon name="close circle" style={styles.errorCheckmark} />
              }
            </Grid.Column>

          </Grid.Row>
        </Grid>
        <h4>Author(s)</h4>
        <p>The name of the person who took the photo, or painted the picture, drew the drawing, etc.</p>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14} >
              <Form.Input
                fluid
                value={this.state.sourceAuthors}
                onBlur={() => this.setState({ sourceAuthorsDirty: true })}
                onChange={(e) => this.setState({ sourceAuthors: e.target.value, sourceAuthorsDirty: true })}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              {this.state.sourceAuthorsDirty && this.state.sourceAuthors.length >= stringTextLimit &&
                <Icon name="check circle" style={styles.successCheckmark} />
              }

              {this.state.sourceAuthorsDirty && this.state.sourceAuthors.length < stringTextLimit &&
                <Icon name="close circle" style={styles.errorCheckmark} />
              }
            </Grid.Column>

          </Grid.Row>
        </Grid>
      </div>
    )
  }

  _renderTitleField () {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Title
                    </Grid.Column>
        <Grid.Column width={11}>

          <Form.Input
            type="text"
            value={this.state.title}
            onBlur={() => this.onTitleBlur()}
            onChange={(e) => this.setState({ title: e.target.value, titleDirty: true })}
            required
            fluid
          />
          {this.state.titleError &&
            <p style={{ color: 'red' }} >{this.state.titleError}</p>
          }
        </Grid.Column>
        <Grid.Column width={1}>
          {this.state.titleLoading &&

            <Loader active={this.state.titleLoading} className="c-editor__upload-form__title-loader" size={'tiny'} />

          }
          {!this.state.titleLoading && !this.state.titleError && this.state.titleDirty && this.state.title.length >= stringTextLimit &&
            <Icon name="check circle" style={styles.successCheckmark} />
          }

          {((!this.state.titleLoading && this.state.titleDirty && this.state.title.length < stringTextLimit) || this.state.titleError) &&
            <Icon name="close circle" style={styles.errorCheckmark} />
          }
        </Grid.Column>

        <Grid.Column width={1} >
          <Popup trigger={<Icon name='info circle' />} content={
            <div>
              <div>A unique descriptive title for the file which will server as a filename.</div>
              <div>You may use plain language with spaces. Do not include the file extension</div>
            </div>
          } />
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderDescriptionField () {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Description
                    </Grid.Column>
        <Grid.Column width={11}>
          <TextArea
            rows={4}
            value={this.state.description}
            onBlur={() => this.setState({ descriptionDirty: true })}
            onChange={(e) => this.setState({ description: e.target.value, descriptionDirty: true })}
          />

        </Grid.Column>


        <Grid.Column width={1}>

          {this.state.descriptionDirty && this.state.description.length >= stringTextLimit &&
            <Icon name="check circle" style={styles.successCheckmark} />
          }

          {this.state.descriptionDirty && this.state.description.length < stringTextLimit &&
            <Icon name="close circle" style={styles.errorCheckmark} />
          }
        </Grid.Column>

        <Grid.Column width={1} >
          <Popup trigger={<Icon name='info circle' />} content={
            <div>
              <div>
                Please describe the media as much as possible.</div>
              <p></p>
              <div>Where was it taken?</div>
              <div>What does it show?</div>
              <div>What is the context?</div>
              <div>Please describe the object or persons?</div>
              <p></p>
              <div>If the media shows something unusual, please explain what makes it unusual</div>

            </div>
            }
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderLicenceField () {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Licence
                    </Grid.Column>
        <Grid.Column width={12}>
          <Form.Field>
            {this._renderLicenceDropdown()}
          </Form.Field>
        </Grid.Column>

        <Grid.Column width={1} >
          <Popup trigger={
            <a style={{ color: 'black' }} href="https://commons.wikimedia.org/wiki/Commons:Licensing" target="_blank" >
              <Icon name= "question circle" />
            </a>
          } content={
            <a href="https://commons.wikimedia.org/wiki/Commons:Licensing" target="_blank" >
              https://commons.wikimedia.org/wiki/Commons:Licensing
                        </a>
          } />
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderLicenceDropdown () {
    if (this.state.source === 'own') {
      return (
        <Dropdown
          fluid
          selection
          value={this.state.licence}
          options={ownworkLicenceOptions}
          onChange={(e, { value }) => this.setState({ licence: value })}
        />
      )
    }

    return (
      <span>
        <Dropdown
          fluid
          scrolling
          text={this.state.licenceText.replace('<br/>', '')}
          value={this.state.licence}
        >
          <Dropdown.Menu>
            {othersworkLicenceOptions.map((item, index) => {
              if (item.separator) {
                return (
                  <h5 style={{ padding: '10px', margin: 0, boxSizing: 'border-box', color: '#1678c2' }} key={item.text + index} >{item.text}:</h5>
                )
              }

              return (
                <Dropdown.Item
                  key={item.text + index}
                  value={item.value}
                  active={this.state.licence == item.value}
                  onClick={() => this.setState({ licence: item.value, licenceText: item.text, licenceSection: item.section })}
                >
                  <span dangerouslySetInnerHTML={{ __html: item.text }} ></span>
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        </Dropdown>
        <span style={{ color: '#1678c2' }} >{this.state.licenceSection ? `${this.state.licenceSection} .` : ''}</span>
      </span>
    )
  }

  _renderSourceField () {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Source
                </Grid.Column>
        <Grid.Column width={13}>
          <Form.Field>
            <Dropdown
              fluid
              selection
              value={this.state.source}
              options={this.sourceOptions}
              onChange={this._handleSourceChange}
            />
          </Form.Field>
          {this.state.source == 'others' &&
            this._renderSourceInfo()
          }
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderCategoriesField () {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Categories
                    </Grid.Column>
        <Grid.Column width={5}>

          <Search
            loading={this.props.fetchCategoriesFromWikimediaCommonsState === 'loading'}
            onBlur={() => this.setState({ categoriesDirty: true })}
            onResultSelect={this._handleResultSelect}
            onSearchChange={this._handleSearchChange}
            results={this.props.searchCategories}
            value={this.state.categoriesSearchText}
            placeholder="search categories"
          />

          <div style={{ marginTop: '.8rem' }} >
            {this.state.categories.map((category, index) =>

              <Label key={category.title} style={{ marginBottom: '.6rem' }}>
                {category.title}
                <Icon name="delete" onClick={() => this.onRemoveCategory(index)} />
              </Label>
            )}
          </div>
        </Grid.Column>
        <Grid.Column width={1}>

          {this.state.categoriesDirty && this.state.categories.length > 0 &&
            <Icon name="check circle" style={{ color: 'green', marginLeft: '22px' }} />
          }

          {this.state.categoriesDirty && this.state.categories.length === 0 &&
            <Icon name="close circle" style={{ color: 'red', marginLeft: '22px' }} />
          }
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderDateField () {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Date
                </Grid.Column>
        <Grid.Column width={11}>

          <Input
            fluid
            type={'date'}
            value={this.state.date}
            onBlur={() => this.setState({ dateDirty: true })}
            onChange={(e) => this.setState({ date: e.target.value, dateDirty: true }) }
          />
        </Grid.Column>
        <Grid.Column width={1}>
          {this.state.dateDirty && this.state.date &&
            <Icon name="check circle" style={styles.successCheckmark} />
          }

          {this.state.dateDirty && !this.state.date &&
            <Icon name="close circle" style={styles.errorCheckmark} />
          }
        </Grid.Column>
      </Grid.Row>

    )
  }

  _renderFileForm () {
    return (
      <Grid >
        {this._renderTitleField()}

        {this._renderDescriptionField()}

        {this._renderSourceField()}

        {this._renderLicenceField()}

        {this._renderCategoriesField()}

        {this._renderDateField()}

        <Grid.Row style={{ display: 'flex', justifyContent: 'center' }} >

          {!this.state.submitLoading &&
            <Button primary disabled={!this._isFormValid()} onClick={(e) => this._onSubmit(e)} >
              Upload To Commons
            </Button>
          }
          { this.state.submitLoading && this.state.submitLoadingPercentage < 100 &&
            <Progress className="c-upload-progress" percent={Math.floor(this.state.submitLoadingPercentage)} progress indicating />
          }
        </Grid.Row>
      </Grid >
    )
  }

  _isFormValid () {
    const { title, titleError, titleLoading, description, categories, source, sourceAuthors, sourceUrl, date, submitLoading } = this.state
    let sourceInvalid = false
    if ((source == 'others' && (sourceAuthors.length < stringTextLimit || sourceUrl.length < stringTextLimit))) {
      sourceInvalid = true
    }
    return !submitLoading && !titleError && !titleLoading && date && title.length >= stringTextLimit && description.length >= stringTextLimit && categories.length > 0 && !sourceInvalid
  }

  _renderFilePreview () {
    const { fileSrc, fileType } = this.state
    if (!fileSrc || !fileType) return

    let content = ''

    if (fileType.indexOf('image') > -1) {
      content = <img src={fileSrc} alt={'File image'} style={{ width: '100%', height: '100%' }} />
    } else if (fileType.indexOf('video') > -1) {
      content = <video src={fileSrc} controls autoPlay muted height={'100%'} width={'100%'} />
    } else {
      return ''
    }

    return (
      <div style={{ margin: '1.5rem auto', width: '40%' }} >
        {content}
      </div>
    )
  }

  render () {
    return (
      <Modal
        style={{
          marginTop: '0px !important',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
        open={this.props.visible}
        onClose={() => this._handleFileUploadModalClose()}
        size="small"
      >

        <Modal.Header style={{ textAlign: 'center', backgroundColor: '#1678c2', color: 'white' }} >
          Wikimedia Commons Upload Wizard
                    <Popup
                      position="bottom right"
                      trigger={
                        <a style={{ float: 'right', color: 'white' }} href="https://commons.wikimedia.org/wiki/Commons:Project_scope" target="_blank" >
                          <Icon name="info circle" />
                        </a>
                      }
                      content={
                        <a href="https://commons.wikimedia.org/wiki/Commons:Project_scope" target="_blank" >
                          https://commons.wikimedia.org/wiki/Commons:Project_scope
                        </a>
                      }
                    />
        </Modal.Header>

        <Modal.Content>
          {this.props.uploadProgress < 100 && <Progress className="c-upload-progress" percent={Math.floor(this.props.uploadProgress)} progress indicating /> }
          {this._renderFilePreview()}
          {this._renderFileForm()}
        </Modal.Content>
      </Modal>
    )
  }
}

UploadFileInfoModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  wikiSource: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  currentSlideIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  file: PropTypes.object,
  uploadProgress: PropTypes.number.isRequired,
  fetchCategoriesFromWikimediaCommonsState: PropTypes.string.isRequired,

}
const mapStateToProps = (state) =>
  Object.assign({}, state.article)

export default connect(mapStateToProps)(UploadFileInfoModal)
