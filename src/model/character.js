import { ASSET_GROUPS } from 'data'

class PartFactory {
    constructor( name, asset_group, chance_include ) {
        this.name = name
        this.file_list = ASSET_GROUPS[ asset_group ]
        this.asset_group = asset_group

        this.chance_include = chance_include

        if ( this.file_list === undefined ) throw `PartFactory created with non existing asset_group (${asset_group})`
    }

    get() {
        if ( Math.random() > this.chance_include ) return '';

        let index = ( Math.random() * this.file_list.length ) | 0;
        return this.file_list[ index ];
    }
}

let part_factories = {
    'base': new PartFactory( 'base', 'assets/character/base', 1 ),
    'pants': new PartFactory( 'pants', 'assets/character/pants', 1 ),
    'clothes': new PartFactory( 'clothes', 'assets/character/clothes', 1 ),
    'beard': new PartFactory( 'beard', 'assets/character/beard', 0.3 ),
    'hair': new PartFactory( 'hair', 'assets/character/hair', 0.9 ),
    'hat': new PartFactory( 'hat', 'assets/character/hat', 0.2 ) }

function get_part( name ) {
    if ( part_factories[ name ] === undefined ) return null;

    return part_factories[ name ].get();
}

class BaseCharacter {
    constructor( parts ) {
        this.parts = []
        this.part_names = []

        for ( let partI in parts ) {
            let part_name = parts[ partI ];

            this.add_part( partI, part_name );
        }
    }

    add_part( partI, part_name ) {
        if ( partI == -1 ) partI = this.parts.length;

        this.part_names[partI] = part_name;
        this.parts[partI] = get_part( part_name );
    }
}

class NPCCharacter extends BaseCharacter {
    constructor( ) {
        super( [ 'base', 'pants', 'clothes' ] );

        this.isMale = this.parts[0].indexOf( '_f' ) == -1;
        if ( this.isMale ) this.add_part( -1, 'beard' );
        this.add_part( -1, 'hair' );
        this.add_part( -1, 'hat' );
    }

}

export { get_part, BaseCharacter, NPCCharacter }
