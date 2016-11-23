var __nextElementNr = 1000;

class HtmlRender {
    constructor( element, model, controller ) {
        if ( element != null && model == null && controller == null ) {
            this.element = null;
            this.model = null;
            this.controller = element;
        } else {
            this.element = element;
            this.model = model;
            this.controller = controller;
        }

        this.children = {}
        this.old_html = null;

        if ( this.controller == null ) throw "HtmlRender needs a controller in the constructor.";
    }

    render( force = false ) {
        if ( this.element == null ) throw 'Attempting to render with unset element';
        //Mark current children
        for ( let id in this.children ) {
            this.children[id].__viewUsed = false;
        }
        let new_html = this.html();
        //Delete unused children
        for ( let id in this.children ) {
            if ( ! this.children[id].__viewUsed ) {
                delete this.children[id];
            }
        }

        if ( this.old_html != new_html || force ) {
            force = true;

            this.element.html( new_html );
            this.old_html = new_html;

            if ( this.postinit_element ) this.postinit_element();
            if ( this.tick ) this.tick();
        }

        for ( let id in this.children ) {
            let view = this.children[ id ];
            if ( view.element == null || force ) view.element = $('div#view' + id);
            view.render( force );
        }
    }
    tick() {
        if ( this.on_tick ) this.on_tick()

        for ( let id in this.children ) {
            let view = this.children[ id ];
            view.tick();
        }
    }

    add_child_impl( key, child_model, child_class ) {
        if ( this.children[ key ] ) {
            return this.get_child( key );
        }

        this.children[ key ] = new child_class( null, child_model, this.controller );

        return this.get_child( key );
    }
    add_child( child_model, child_class ) {
        if ( !child_model.__viewId ) {
            __nextElementNr++;
            child_model.__viewId = __nextElementNr;
        }

        return this.add_child_impl( child_model.__viewId, child_model, child_class );
    }
    get_child( key ) {
        this.children[key].__viewUsed = true;
        return `<div id="view${key}">!!!!</div>`;
    }

    render_parts( parts ) {
        let final_html = ''

        for ( let file of parts ) {
            if ( file == null ) continue;
            if ( file.length == 0 ) continue;

            final_html += `<img src="${file}">`
        }

        return final_html;
    }
}
class HtmlChildOnlyRender extends HtmlRender {
    render( force = false ) {
        if ( force ) return super.render( force );
        if ( this.old_html === null ) {
            this.element.empty();
            this.old_html = '';
        }

        if ( this.element == null ) throw 'Attempting to render with unset element';
        //Mark current children
        for ( let id in this.children ) {
            this.children[id].__viewUsed = false;
        }
        let new_html = this.html();
        //Delete unused children
        for ( let id in this.children ) {
            if ( ! this.children[id].__viewUsed ) {
                this.element.children( 'div#view' + id ).remove();
                delete this.children[id];
            }
        }

        for ( let id in this.children ) {
            let view = this.children[ id ];

            if ( view.element == null ) {
                view.element = $(`<div id="view${id}">!!!!</div>`);
                this.element.append( view.element );
            }

            view.render( force );
        }
    }
}

export { HtmlRender, HtmlChildOnlyRender }
