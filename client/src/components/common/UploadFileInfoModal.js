import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import request from 'superagent'
import { NotificationManager } from 'react-notifications';
import { Progress, Modal, Form, Button, Icon, Search, Grid, Label, Dropdown, TextArea, Popup, Loader, Input, Checkbox } from 'semantic-ui-react'
import { ownworkLicenceOptions, othersworkLicenceOptions } from './licenceOptions'
import wikiActions from '../../actions/WikiActionCreators'
import articleActions from '../../actions/ArticleActionCreators';

const uploadFormFields = {
  fileType: '',

  tempLoading: false,
  submitLoading: false,
  submitLoadingInterval: null,
  submitLoadingPercentage: 0,

  fileSrc: null,
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
  saveTemplate: false,

  titleDirty: false,
  descriptionDirty: false,
  categoriesDirty: false,
  sourceUrlDirty: false,
  sourceAuthorsDirty: false,
  dateDirty: false,

  titleError: '',
  titleLoading: false,
}

const styles = {
  successCheckmark: {
    color: 'green',
  },
  errorCheckmark: {
    color: 'red',
  },
}

const stringTextLimit = 5

const sourceOptions = [
  {
    text: 'Own Work',
    value: 'own',
  },
  {
    text: 'I did not create this media file',
    value: 'others',
  },
]
class UploadFileInfoModal extends Component {
  constructor(props) {
    super(props)

    this._handleResultSelect = this._handleResultSelect.bind(this)
    this._handleSearchChange = this._handleSearchChange.bind(this)
    this._handleSourceChange = this._handleSourceChange.bind(this)
  }

  componentWillMount() {
    // If this slide is opened for the first time,
    // create a new form
    if (!this.props.uploadForms[this.props.articleId] || !this.props.uploadForms[this.props.articleId][this.props.currentSlideIndex]) {
      this.props.dispatch(wikiActions.updateCommonsUploadFormField(this.props.articleId, this.props.currentSlideIndex, uploadFormFields))
    }
  }

  componentDidMount() {
    if (this.props.file && !this.props.isUploadResume) {
      this._handleLoadFilePreview(this.props.file, () => {
        this.uploadTempFile()
      })
    }
    console.log('article title is ', this.props.title)
    this.props.dispatch(wikiActions.getArticleForms({ title: this.props.title }))
  }

  getFormFields() {
    return (this.props.uploadForms[this.props.articleId] && this.props.uploadForms[this.props.articleId][this.props.currentSlideIndex]) || false;
  }

  updateField(updateObject) {
    const { dispatch, articleId, currentSlideIndex } = this.props;
    dispatch(wikiActions.updateCommonsUploadFormField(articleId, currentSlideIndex, updateObject));
  }

  uploadTempFile() {
    const { dispatch, currentSlideIndex, wikiSource, title, file } = this.props

    dispatch(articleActions.uploadContentRequest())
    this.updateField({ tempLoading: true });

    request
      .post('/api/wiki/article/uploadTemp')
      .field('wikiSource', wikiSource)
      .field('title', title)
      .field('slideNumber', currentSlideIndex)
      .attach('file', file)
      .on('progress', (event) => {
        dispatch(articleActions.updateProgress({ progress: event.percent }))
      })
      .end((err, { body }) => {
        this.updateField({ tempLoading: false })

        if (err) {
          dispatch(articleActions.uploadContentFailed())
        } else {
          this.updateField({ fileSrc: body.filepath });
        }
        dispatch(articleActions.uploadContentReceive({ uploadStatus: body }));
      })
  }

  uploadFileToWikiCommons(data) {
    const { dispatch } = this.props

    const submitInterval = setInterval(() => {
      this.updateField({
        submitLoadingPercentage: this.getFormFields().submitLoadingPercentage <= 70 ? this.getFormFields().submitLoadingPercentage + 20 : this.getFormFields().submitLoadingPercentage,
      })
    }, 3000)
    this.updateField({ submitLoading: true, submitLoadingPercentage: 10, submitLoadingInterval: submitInterval })

    const uploadRequest = request
      .post('/api/wiki/article/uploadCommons')
      .field('title', this.props.title)
      .field('wikiSource', this.props.wikiSource)
      .field('slideNumber', this.props.currentSlideIndex)
      .field('file', this.getFormFields().fileSrc)
      .timeout({ deadline: 5 * 60 * 1000 })
    // attach given fields in the request
    Object.keys(data).forEach((key) => {
      uploadRequest.field(key, data[key])
    })

    uploadRequest
      .end((err, { text, body }) => {
        if (!err) {
          NotificationManager.success('Success', 'File uploaed successfully!')
          dispatch(articleActions.uploadContentReceive({ uploadStatus: body }))
          this.props.onClose()
        } else if (err) {
          const reason = text || 'Something went wrong, please try again!'
          NotificationManager.error('Error', reason)
          this.updateField({ submitLoading: false })
        }
        clearInterval(this.getFormFields().submitLoadingInterval)
      })
  }

  _handleFileUploadModalClose() {
    this.props.onClose && this.props.onClose()
  }

  _onSubmit(e) {
    e.preventDefault()
    if (this._isFormValid()) {
      const {
        title: fileTitle,
        description,
        categories,
        licence,
        source,
        sourceUrl,
        sourceAuthors,
        date,
        saveTemplate,
      } = this.getFormFields();

      const formValues = {
        fileTitle,
        description,
        categories: categories.map((category) => category.title).join(','),
        licence,
        source,
        sourceUrl,
        sourceAuthors,
        date,
        saveTemplate,
      }
      this.uploadFileToWikiCommons(formValues)
    }
  }

  onRemoveCategory(index) {
    const categories = this.getFormFields().categories
    categories.splice(index, 1)
    this.updateField({ categories })
  }

  onTitleBlur() {
    let state = { titleDirty: true }
    if (this.getFormFields().title.length >= stringTextLimit) {
      state = Object.assign(state, { titleLoading: true, titleError: '' })
      const commonsApi = 'https://commons.wikimedia.org/w/api.php'
      const fileExtension = this.props.file.name.split('.')[this.props.file.name.split('.').length - 1];
      const filename = `File:${this.getFormFields().title}.${fileExtension}`

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
            const titleError = 'A file with this name exists already. please try another title';
            this.updateField({ titleError, titleLoading: false })
          } else {
            this.updateField({ titleError: '', titleLoading: false })
          }
        }, () => {
          this.updateField({ titleError: '', titleLoading: false })
        })
    }

    this.updateField(state)
  }

  _handleLoadFilePreview(file, cb) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.updateField({ fileSrc: e.target.result, fileType: file.type });
      cb && cb()
    }

    reader.readAsDataURL(file)
  }

  _handleResultSelect(e, result) {
    const categories = this.getFormFields().categories.slice();
    const duplicateIndex = categories.findIndex((category) => category.title === result.title)
    if (duplicateIndex === -1) {
      categories.push(result)
      this.updateField({ categoriesSearchText: '', categories })
    }
  }

  _handleSearchChange(e, value) {
    this.updateField({ categoriesSearchText: value });
    this.props.dispatch(articleActions.fetchCategoriesFromWikimediaCommons({ searchText: value }))
  }

  _handleSourceChange(e, { value }) {
    if (value === 'own') {
      this.updateField({ source: value, licence: ownworkLicenceOptions[0].value })
    } else if (value === 'others') {
      this.updateField({
        source: value,
        licence: othersworkLicenceOptions[1].value,
        licenceText: othersworkLicenceOptions[1].text,
        licenceSection: othersworkLicenceOptions[1].section,
      })
    }
  }

  _renderSourceInfo() {
    return (
      <div style={{ marginTop: '1rem' }} >

        <h4>Source</h4>
        <p>Where this digital file came from — could be a URL, or a book or publication.</p>
        <Grid>
          <Grid.Row>
            <Grid.Column width={14} >
              <Form.Input
                fluid
                value={this.getFormFields().sourceUrl}
                onBlur={() => {
                  this.updateField({ sourceUrlDirty: true })
                }}
                onChange={(e) => {
                  this.updateField({ sourceUrl: e.target.value, sourceUrlDirty: true });
                }}
              />
            </Grid.Column>
            <Grid.Column width={2}>

              {this.getFormFields().sourceUrlDirty && this.getFormFields().sourceUrl.length >= stringTextLimit &&
                <Icon name="check circle" style={styles.successCheckmark} />
              }

              {this.getFormFields().sourceUrlDirty && this.getFormFields().sourceUrl.length < stringTextLimit &&
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
                value={this.getFormFields().sourceAuthors}
                onBlur={() => {
                  this.updateField({ sourceAuthorsDirty: true })
                }}
                onChange={(e) => {
                  this.updateField({ sourceAuthors: e.target.value, sourceAuthorsDirty: true })
                }}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              {this.getFormFields().sourceAuthorsDirty && this.getFormFields().sourceAuthors.length >= stringTextLimit &&
                <Icon name="check circle" style={styles.successCheckmark} />
              }

              {this.getFormFields().sourceAuthorsDirty && this.getFormFields().sourceAuthors.length < stringTextLimit &&
                <Icon name="close circle" style={styles.errorCheckmark} />
              }
            </Grid.Column>

          </Grid.Row>
        </Grid>
      </div>
    )
  }

  _renderTitleField() {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Title
        </Grid.Column>
        <Grid.Column width={11}>

          <Form.Input
            type="text"
            value={this.getFormFields().title}
            onBlur={() => this.onTitleBlur()}
            onChange={(e) => {
              this.updateField({ title: e.target.value, titleDirty: true })
            }}
            required
            fluid
          />
          {this.getFormFields().titleError &&
            <p style={{ color: 'red' }} >{this.getFormFields().titleError}</p>
          }
        </Grid.Column>
        <Grid.Column width={1}>
          {this.getFormFields().titleLoading &&

            <Loader active={this.getFormFields().titleLoading} className="c-editor__upload-form__title-loader" size={'tiny'} />

          }
          {!this.getFormFields().titleLoading && !this.getFormFields().titleError && this.getFormFields().titleDirty && this.getFormFields().title.length >= stringTextLimit &&
            <Icon name="check circle" style={styles.successCheckmark} />
          }

          {((!this.getFormFields().titleLoading && this.getFormFields().titleDirty && this.getFormFields().title.length < stringTextLimit) || this.getFormFields().titleError) &&
            <Icon name="close circle" style={styles.errorCheckmark} />
          }
        </Grid.Column>

        <Grid.Column width={1} >
          <Popup trigger={<Icon name="info circle" />} content={
            <div>
              <div>A unique descriptive title for the file which will server as a filename.</div>
              <div>You may use plain language with spaces. Do not include the file extension</div>
            </div>
          }
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderDescriptionField() {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Description
                    </Grid.Column>
        <Grid.Column width={11}>
          <TextArea
            rows={4}
            value={this.getFormFields().description}
            onBlur={() => {
              this.updateField({ descriptionDirty: true })
            }}
            onChange={(e) => {
              this.updateField({ description: e.target.value, descriptionDirty: true })
            }}
          />

        </Grid.Column>

        <Grid.Column width={1}>

          {this.getFormFields().descriptionDirty && this.getFormFields().description.length >= stringTextLimit &&
            <Icon name="check circle" style={styles.successCheckmark} />
          }

          {this.getFormFields().descriptionDirty && this.getFormFields().description.length < stringTextLimit &&
            <Icon name="close circle" style={styles.errorCheckmark} />
          }
        </Grid.Column>

        <Grid.Column width={1} >
          <Popup trigger={<Icon name="info circle" />} content={
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

  _renderLicenceField() {
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
              <Icon name="question circle" />
            </a>
          } content={
            <a href="https://commons.wikimedia.org/wiki/Commons:Licensing" target="_blank" >
              https://commons.wikimedia.org/wiki/Commons:Licensing
            </a>
          }
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderLicenceDropdown() {
    if (this.getFormFields().source === 'own') {
      return (
        <Dropdown
          fluid
          selection
          value={this.getFormFields().licence}
          options={ownworkLicenceOptions}
          onChange={(e, { value }) => {
            this.updateField({ licence: value })
          }}
        />
      )
    }

    return (
      <span>
        <Dropdown
          fluid
          scrolling
          text={this.getFormFields().licenceText.replace('<br/>', '')}
          value={this.getFormFields().licence}
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
                  active={this.getFormFields().licence === item.value}
                  onClick={() => {
                    this.updateField({ licence: item.value, licenceText: item.text, licenceSection: item.section })
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: item.text }} ></span>
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        </Dropdown>
        <span style={{ color: '#1678c2' }} >{this.getFormFields().licenceSection ? `${this.getFormFields().licenceSection} .` : ''}</span>
      </span>
    )
  }

  _renderSourceField() {
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
              value={this.getFormFields().source}
              options={sourceOptions}
              onChange={this._handleSourceChange}
            />
          </Form.Field>
          {this.getFormFields().source === 'others' &&
            this._renderSourceInfo()
          }
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderCategoriesField() {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Categories
      </Grid.Column>
        <Grid.Column width={5}>

          <Search
            loading={this.props.fetchCategoriesFromWikimediaCommonsState === 'loading'}
            onBlur={() => {
              this.updateField({ categoriesDirty: true })
            }}
            onResultSelect={this._handleResultSelect}
            onSearchChange={this._handleSearchChange}
            results={this.props.searchCategories}
            value={this.getFormFields().categoriesSearchText}
            placeholder="search categories"
          />

          <div style={{ marginTop: '.8rem' }} >
            {this.getFormFields().categories.map((category, index) => (
              <Label key={category.title} style={{ marginBottom: '.6rem' }}>
                {category.title}
                <Icon name="delete" onClick={() => this.onRemoveCategory(index)} />
              </Label>
            ),
            )}
          </div>
        </Grid.Column>
        <Grid.Column width={1}>

          {this.getFormFields().categoriesDirty && this.getFormFields().categories.length > 0 &&
            <Icon name="check circle" style={{ color: 'green', marginLeft: '22px' }} />
          }

          {this.getFormFields().categoriesDirty && this.getFormFields().categories.length === 0 &&
            <Icon name="close circle" style={{ color: 'red', marginLeft: '22px' }} />
          }
        </Grid.Column>
      </Grid.Row>
    )
  }

  _renderDateField() {
    return (
      <Grid.Row>
        <Grid.Column width={3}>
          Date
                </Grid.Column>
        <Grid.Column width={11}>

          <Input
            fluid
            type={'date'}
            value={this.getFormFields().date}
            onBlur={() => {
              this.updateField({ dateDirty: true })
            }}
            onChange={(e) => {
              this.updateField({ date: e.target.value, dateDirty: true })
            }}
          />
        </Grid.Column>
        <Grid.Column width={1}>
          {this.getFormFields().dateDirty && this.getFormFields().date &&
            <Icon name="check circle" style={styles.successCheckmark} />
          }

          {this.getFormFields().dateDirty && !this.getFormFields().date &&
            <Icon name="close circle" style={styles.errorCheckmark} />
          }
        </Grid.Column>
      </Grid.Row>

    )
  }

  _renderSaveTemplateField() {
    return (
      <Grid.Row>
        <Grid.Column width={3} />
        <Grid.Column width={12}>

          <Checkbox
            label={{ children: 'Save this form as a template' }}
            checked={this.getFormFields().saveTemplate}
            onChange={(e, { checked }) => this.updateField({ saveTemplate: checked })}
          />

        </Grid.Column>
        <Grid.Column width={1} >
          <Popup trigger={<Icon name="info circle" />} content={
            <div>
              By selecting this field, you'll be able to import this form values directly into other forms using the import button above
            </div>
          }
          />
        </Grid.Column>
      </Grid.Row>

    )
  }

  _renderFileForm() {
    return (
      <Grid >
        {this._renderTitleField()}

        {this._renderDescriptionField()}

        {this._renderSourceField()}

        {this._renderLicenceField()}

        {this._renderCategoriesField()}

        {this._renderDateField()}

        {this._renderSaveTemplateField()}

        <Grid.Row style={{ display: 'flex', justifyContent: 'center' }} >

          {!this.getFormFields().submitLoading &&
            <Button primary disabled={!this._isFormValid()} onClick={(e) => this._onSubmit(e)} >
              Upload To Commons
            </Button>
          }
          {this.getFormFields().submitLoading && this.getFormFields().submitLoadingPercentage < 100 &&
            <Progress
              style={{ marginBottom: '3rem !important' }}
              className="c-upload-progress"
              percent={Math.floor(this.getFormFields().submitLoadingPercentage)}
              progress
              indicating
            >
              Hold on tight! We are uploading your media directly to Wikimedia Commons
            </Progress>
          }
        </Grid.Row>
      </Grid >
    )
  }

  _isFormValid() {
    const { title, titleError, titleLoading, description, categories, source, sourceAuthors, sourceUrl, date, submitLoading, tempLoading } = this.getFormFields();
    let sourceInvalid = false
    if ((source === 'others' && (sourceAuthors.length < stringTextLimit || sourceUrl.length < stringTextLimit))) {
      sourceInvalid = true
    }
    return !tempLoading && !submitLoading && !titleError && !titleLoading && date && title.length >= stringTextLimit && description.length >= stringTextLimit && categories.length > 0 && !sourceInvalid
  }

  _renderFilePreview() {
    const { fileSrc, fileType } = this.getFormFields()
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

  render() {
    if (!this.getFormFields()) return <div>Loading...</div>;

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
          <Popup
            position="bottom right"
            trigger={
              <Dropdown
                className="import-dropdown"
                inline
                direction="left"
                options={
                  this.props.articleForms.length > 0
                    ? this.props.articleForms.map(({ form }) => ({
                      text: (
                        <Popup
                          position="bottom right"
                          trigger={
                            <div onClick={() => {
                              this.updateField({ ...form, title: form.fileTitle, categories: form.categories.map((category) => ({ title: category })) })
                            }}
                            >
                              <h4>{form.fileTitle.length > 30 ? `${form.fileTitle.substring(0, 30)}...` : form.fileTitle}</h4>
                              <p style={{ fontWeight: 200 }} >{form.description.length > 30 ? `${form.description.substring(0, 30)}...` : form.description}</p>
                            </div>
                          }
                          content={form.fileTitle}
                        />
                      ),
                      value: form,
                      key: form.fileTitle,
                    }))
                    : [{
                      text: 'Nothing here to show yet',
                      value: '',
                    }]}
                icon="share"
              />
            }
            content={
              <p>Import a previous form</p>
            }
          />
        </Modal.Header>

        <Modal.Content>
          {this.props.uploadProgress < 100 && <Progress className="c-upload-progress" percent={Math.floor(this.props.uploadProgress)} progress indicating />}
          {this._renderFilePreview()}
          {this._renderFileForm()}
        </Modal.Content>
      </Modal>
    )
  }
}

UploadFileInfoModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  articleId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  wikiSource: PropTypes.string.isRequired,
  visible: PropTypes.bool,
  currentSlideIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  file: PropTypes.object,
  uploadProgress: PropTypes.number.isRequired,
  fetchCategoriesFromWikimediaCommonsState: PropTypes.string.isRequired,
  uploadForms: PropTypes.object,
  isUploadResume: PropTypes.bool.isRequired,
  searchCategories: PropTypes.any,
  articleForms: PropTypes.array,
}

UploadFileInfoModal.defaultProps = {
  articleForms: [],
}

const mapStateToProps = ({ wiki, article }) => ({
  uploadForms: wiki.uploadToCommonsForms,
  articleForms: wiki.forms,
  ...{ ...article },
})

export default connect(mapStateToProps)(UploadFileInfoModal)
