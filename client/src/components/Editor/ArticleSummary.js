import React, {Component} from 'react'
import {Grid, Segment, Image} from 'semantic-ui-react'
import request from 'superagent'

class ArticleSummary extends Component {

    constructor(props) {
        super(props);
        let state = {};
        if (props['position']) {
            state['position'] = props['position'];
        }

        let title = props['title'];
        if (title) {
            state['title'] = title;
        }
        state['article'] = {image: '', articleText: ''};
        state['loading'] = false;
        this.state = state;
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentWillMount() {
        if (this.state['title']) {
            this.setState({loading: true});            
            this.loadArticleInfo(this.state['title']);   
        }
    }

    loadArticleInfo(title) {
        console.log('lading article')
        request
         .get('/api/wiki/article/summary')
         .query({title: title})
         .end((err, res) => {
             console.log(err, res);
             if (this._isMounted)
                this.setState({loading: false, article: res.body});
         })

    }

    _renderContent() {
        if (this.state.loading) {
            return (
                <Image src="/img/paragraph.png" />                
            );
        }

        return (
            <div>
                <Image floated='left' src={this.state.article.image} />
                <p className="description">
                    {this.state.article.articleText}...
                </p>    
            </div>
        )
    }
    render() {

        let x = this.props.position['x'] + 10;
        let y = this.props.position['y'] - 120 ;
        console.log(this.props)

        // Setting max offsets for X and Y to avoid overflow 
        if (y > 45) {
            y = 35
        }
        if (x > 250) {
            x = 250
        }

        return (
            <Segment
                inverted
                className="article-summary"
                 style={{
                'left': x,
                'top': y, 
                }} loading={this.state.loading}>
                {this._renderContent()}
                
            </Segment>
        );
    }
}

export default ArticleSummary;