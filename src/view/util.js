class HtmlRender {
    constructor( element, model ) {
        this.element = element;
        this.model = model;
    }

    render() {
       this.element.html( this.html() );
    }
}

export { HtmlRender }
