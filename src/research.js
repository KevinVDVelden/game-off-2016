let RESEARCH_LIST = {};
let RESEARCH_TREE = {};

let researchIndexList = 0;

class Research {
    constructor( name, display_name, description ) {
        this.name = 'research_' + name;
        this.description = description;
        this.display_name = display_name;

        this.set_research_at( 'research_station' );
        this.index = researchIndexList;
        researchIndexList++;

        this.requirements = [];
        this.requirements_fail = [];

        this.material_cost = { 'resource_energy': -0.25 };

        RESEARCH_LIST[ this.name ] = this;
        RESEARCH_TREE[ this.name ] = [];
    }

    tick( base ) {
        this.progress += 1;
    }

    set_research_at( name ) { this.research_at = name; return this; }
    require( list ) {
        for ( let n = 0; n < list.length; n++ ) {
            if ( typeof( list[n] ) == 'string' ) {
                if ( list[n].startsWith( 'research_' ) == false ) list[n] = 'research_' + list[n];

                list[n] = RESEARCH_LIST[ list[n] ] || list[n];
            }
            if ( list[n] instanceof Research ) {
                RESEARCH_TREE[ this.name ].push( list[n].name );
            }
        }

        this.requirements.push( list );
        return this;
    }

    finalize() {
        let requirements = this.requirements;
        this.requirements = [];

        for ( let i = 0; i < requirements.length; i++ ) this.require( requirements[i] );
    }

    is_available( model ) {
        if ( this.requirements.length == 0 ) return true;

        for ( let i = 0; i < this.requirements.length; i++ ) {
            this.requirements_fail[i] = [];
            let isAllowed = true;

            for ( let n = 0; n < this.requirements[i].length; n++ ) {
                let requirement = this.requirements[i][n];
                let matches = false;

                if ( requirements instanceof Research ) {
                    matches = model.finished_researches.indexOf( requirement ) != -1;
                } else {
                    matches = requirement( this, model );
                }

                this.requirements_fail[i][n] = [ requirement, matches ];
                if ( !matches ) {
                    isAllowed = false;
                    break;
                }
            }

            if ( isAllowed ) {
                this.requirements_fail = [];
                return true;
            }
        }

        return false;
    }
}

new Research( 'basement', 'Basement area', 'Open up a basement level to expand your base' );
new Research( 'basement2', 'Sub-basement', 'Open up more space to expand your base' ).require( [ 'basement', 'mining_1' ] );

new Research( 'mining_1', 'Mining techniques', 'Research how to mine for metal without causing too much attention' ).require( [ 'basement' ] );
new Research( 'mining_2', 'Advanced mining techniques', 'Research how to mine more metal without causing attention' ).require( [ 'basement', 'mining_1' ] );

new Research( 'power_1', 'Power generation', 'Research how to use these drones to power your base.' ).require( [ 'basement' ] );
new Research( 'power_2', 'Advanced power generation', 'Research improved hamster wheel construction ' ).require( [ 'basement', 'power_1' ] );

export { RESEARCH_TREE, RESEARCH_LIST };
