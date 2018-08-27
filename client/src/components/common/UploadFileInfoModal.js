import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import {
    Modal,
    Form,
    Button,
    Icon,
    Image,
    Search,
    Grid,
    Label,
    Radio,
    Dropdown,
    TextArea,
    Popup
} from 'semantic-ui-react';
import { ownworkLicenceOptions, othersworkLicenceOptions } from './licenceOptions';
import actions from '../../actions/ArticleActionCreators'

class UploadFileInfoModal extends Component {

    constructor(props) {
        super(props);

        this.sourceOptions = [
            {
                text: 'Own Work',
                value: 'own'
            },
            {
                text: 'I did not create this media file',
                value: 'others'
            }
        ];

        this.state = {
            fileSrc: null,
            fileType: '',
            title: '',
            description: '',
            categoriesSearchText: '',
            selectedCategories: [],
            licence: ownworkLicenceOptions[0].value,
            licenceText: ownworkLicenceOptions[0].value,
            source: 'own',
            sourceUrl: '',
            sourceAuthors: ''
        }

        this._handleResultSelect = this._handleResultSelect.bind(this)
        this._handleSearchChange = this._handleSearchChange.bind(this)
        this._handleSourceChange = this._handleSourceChange.bind(this)

    }

    componentWillMount() {
        if (this.props.file) {
            this._handleLoadFilePreview(this.props.file)
        }
    }

    _isFormValid() {
        const { title, description, selectedCategories } = this.state;
        let sourceValid = false;
        // if ()
        return title.length > 5 && description.length > 5 && selectedCategories.length > 0;
    }

    _handleFileUploadModalClose() {
        this.props.onClose && this.props.onClose();
    }

    _onSubmit(e) {
        e.preventDefault();
        if (this._isFormValid() && this.props.onSubmit) {
            const { title, description } = this.state;
            this.props.onSubmit({ title, description });
        }
    }

    onRemoveCategory(index) {
        let selectedCategories = this.state.selectedCategories;
        selectedCategories.splice(index, 1);
        this.setState({ selectedCategories });
    }

    _handleLoadFilePreview(file) {
        var reader = new FileReader();
        console.log(file)
        reader.onload = (e) => {
            this.setState({ fileSrc: e.target.result, fileType: file.type })
        };

        reader.readAsDataURL(file);
    }

    _handleResultSelect(e, result) {
        let selectedCategories = this.state.selectedCategories;
        let resultIndex = selectedCategories.findIndex(category => category.title == result.title);
        if (resultIndex == -1) {
            selectedCategories.push(result);
            this.setState({ categoriesSearchText: '', selectedCategories })
        }
    }

    _handleSearchChange(e, value) {
        this.setState({ categoriesSearchText: value });
        this.props.dispatch(actions.fetchCategoriesFromWikimediaCommons({ searchText: value }));
    }

    _handleSourceChange(e, { value }) {
        if (value == 'own') {
            this.setState({ source: value, licence: ownworkLicenceOptions[0].value })
        } else if (value == 'others') {
            this.setState({ source: value, licence: othersworkLicenceOptions[1].value, licenceText: othersworkLicenceOptions[1].text })
        }
    }

    _renderSourceInfo() {
        return (
            <div style={{ marginTop: '1rem' }} >

                <h4>Source</h4>
                <p>Where this digital file came from — could be a URL, or a book or publication.</p>
                <Form.Input
                    fluid
                    value={this.state.sourceUrl} onChange={(e) => this.setState({ sourceUrl: e.target.value })}
                />

                <h4>Author(s)</h4>
                <p>The name of the person who took the photo, or painted the picture, drew the drawing, etc.</p>
                <Form.Input
                    fluid
                    value={this.state.sourceAuthors}
                    onChange={(e) => this.setState({ sourceAuthors: e.target.value })}
                />

            </div>

        );
    }

    _renderTitleField() {
        return (
            <Grid.Row>
                <Grid.Column width={3}>
                    Title
                    </Grid.Column>
                <Grid.Column width={12}>

                    <Form.Input
                        type="text"
                        value={this.state.title}
                        onChange={(e) => this.setState({ title: e.target.value })}
                        required
                        fluid
                    />
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

    _renderDescriptionField() {
        return (
            <Grid.Row>
                <Grid.Column width={3}>
                    Description
                    </Grid.Column>
                <Grid.Column width={12}>
                    <TextArea
                        rows={4}
                        value={this.state.description}
                        onChange={(e) => this.setState({ description: e.target.value })}
                    />

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

                        </div>} />
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
                        <a style={{ color: "black" }} href="https://commons.wikimedia.org/wiki/Commons:Licensing" target="_blank" >
                            <Icon name='question circle' />
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

    _renderLicenceDropdown() {
        if (this.state.source == 'own') {
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
                                <h5 style={{ padding: '10px', margin: 0, boxSizing: 'border-box' }} key={item.text + index} >{item.text}</h5>
                            )
                        }

                        return (
                            <Dropdown.Item
                                key={item.text + index}
                                value={item.value}
                                active={this.state.licence == item.value}
                                onClick={() => this.setState({ licence: item.value, licenceText: item.text })}
                            >
                                <span dangerouslySetInnerHTML={{ __html: item.text }} ></span>
                            </Dropdown.Item>
                        )
                    })}
                </Dropdown.Menu>
            </Dropdown>
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

    _renderCategoriesField() {
        return (
            <Grid.Row>
                <Grid.Column width={3}>
                    Categories
                    </Grid.Column>
                <Grid.Column width={13}>

                    <Search
                        loading={this.props.fetchCategoriesFromWikimediaCommonsState == 'loading'}
                        onResultSelect={this._handleResultSelect}
                        onSearchChange={this._handleSearchChange}
                        results={this.props.searchCategories}
                        value={this.state.categoriesSearchText}
                        placeholder='categories search provided by commons'
                    />

                    <div style={{ marginTop: '.8rem' }} >
                        {this.state.selectedCategories.map((category, index) =>

                            <Label key={category.title} style={{ marginBottom: '.6rem' }}>
                                {category.title}
                                <Icon name='delete' onClick={() => this.onRemoveCategory(index)} />
                            </Label>
                        )}
                    </div>
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
                <Grid.Row style={{ display: 'flex', justifyContent: 'center' }} >
                    <Form.Button
                        primary
                        disabled={!this._isFormValid()}
                        onClick={(e) => this._onSubmit(e)}
                    >
                        Upload To Commons
                    </Form.Button>
                </Grid.Row>
            </Grid >
        );
    }

    _renderFilePreview() {

        const { fileSrc, fileType } = this.state;
        if (!fileSrc || !fileType) return;

        let content = '';

        if (fileType.indexOf('image') > -1) {
            content = <img src={fileSrc} alt={'File image'} style={{ width: '100%', height: '100%' }} />;
        } else if (fileType.indexOf('video') > -1) {
            content = <video src={fileSrc} controls autoPlay muted height={'100%'} width={'100%'} />
        } else {
            return '';
        }

        return (
            <div style={{ margin: '1.5rem auto', width: '40%' }} >
                {content}
            </div>
        );
    }

    render() {

        return (
            <Modal
                style={{
                    marginTop: '0px !important',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
                open={this.props.visible}
                onClose={() => this._handleFileUploadModalClose()}
                size="small"
            >

                <Modal.Header style={{ textAlign: 'center', backgroundColor: '#1678c2', color: 'white' }} >
                    Wikimedia Commons Upload Wizard
                    <Popup
                        position={"bottom right"}
                        trigger={
                            <a style={{ float: 'right', color: 'white' }} href="https://commons.wikimedia.org/wiki/Commons:Project_scope" target="_blank" >
                                <Icon name='info circle' />
                            </a>
                        }
                        content={
                            <a href="https://commons.wikimedia.org/wiki/Commons:Project_scope" target="_blank" >
                                https://commons.wikimedia.org/wiki/Commons:Project_scope
                            </a>
                        } />
                </Modal.Header>

                <Modal.Content>
                    {this._renderFilePreview()}
                    {this._renderFileForm()}
                </Modal.Content>
            </Modal>
        );
    }
}

UploadFileInfoModal.propTypes = {
    visible: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    file: PropTypes.object
}
const mapStateToProps = (state) =>
    Object.assign({}, state.article)

export default connect(mapStateToProps)(UploadFileInfoModal);