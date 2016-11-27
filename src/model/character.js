import { ASSET_LIST, ASSET_GROUPS } from 'data'
import { Model } from 'model/util';

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
    'hat': new PartFactory( 'hat', 'assets/character/hat', 0.2 ),

    'drone_pants': new PartFactory( 'drone_pants', 'assets/character/drone_pants', 1 ),
}

function get_part( name ) {
    if ( part_factories[ name ] === undefined ) {
        if ( ASSET_LIST.indexOf( name ) != -1 ) {
            return name;
        } else {
            return null;
        }
    }

    return part_factories[ name ].get();
}

class BaseCharacter extends Model {
    constructor( parts ) {
        super();
        this.parts = []
        this.part_names = []

        for ( let partI in parts ) {
            let part_name = parts[ partI ];

            this.add_part( partI, part_name );
        }

        this.isMale = this.parts[0].indexOf( '_f' ) == -1;
    }

    serialize( _ ) {
        _( this, { construct: 'BaseCharacter', args: [ 'parts' ] }, [ 'posX', 'posY', 'part_names', 'isMale' ] );
    }

    add_part( partI, part_name ) {
        if ( partI == -1 ) partI = this.parts.length;

        this.part_names[partI] = part_name;
        this.parts[partI] = get_part( part_name );
    }

    set_parent( p ) {
        super.set_parent( p );
        this.base = this;
    }

    set_position( x, y ) {
        this.posX = x;
        this.posY = y;
    }
    get_position() {
        return [ this.posX, this.posY ];
    }

    get_jobs() {
        return [];
    }

    floorY() {
        return this.posY % 250;
    }
}

class NPCCharacter extends BaseCharacter {
    constructor( ) {
        super( [ 'base', 'pants', 'clothes' ] );

        this.type = 'unconverted';

        if ( this.isMale ) this.add_part( -1, 'beard' );
        this.add_part( -1, 'hair' );
        this.add_part( -1, 'hat' );
    }

    serialize( _ ) {
        super.serialize( _ );
        _( this, { construct: 'NPCCharacter' }, [ 'type' ] );
    }
}

class BaseDrone extends BaseCharacter {
    constructor( converted_from ) {
        super( [ converted_from.parts[0] ] );
        this.converted_from = converted_from;

        this.type = 'drone';

        if ( this.isMale ) {
            this.add_part( -1, 'assets/character/drone_clothes/1_m.png' );
        } else {
            this.add_part( -1, 'assets/character/drone_clothes/1_f.png' );
        }
        this.add_part( -1, 'drone_pants' );

        this.walkingY = ( Math.random() * 30 + 200 ) | 0;
        this.state = null;
    }

    serialize( _ ) {
        super.serialize( _ );
        _( this, { construct: 'BaseDrone', args: [ 'converted_from' ] }, [ 'type', 'walkingY', 'state' ] );
    }

    tick() {
        switch ( this.state ) {
            case null:
                this.state = 'falling';
                break;
            case 'falling':
                let delta = this.walkingY - this.floorY();
                if ( delta > 5 ) {
                    this.posY += 5;
                } else if ( delta > 0 ) {
                    this.posY += delta;
                    this.state = 'idle';
                }
                this.call_listeners();
                break;
            case 'idle':
                let closestJob = null;
                let closestPath = null;

                for ( let job of this.base.get_jobs() ) {
                    console.log( job );
                    let curPath = this.base.path( this, job );
                    if ( closestPath == null || curPath.total_dist() < closestPath.total_dist() ) {
                        closestPath = curPath;
                        closestJob = job;
                    }
                }

                if ( closestPath != null ) {
                    this.state = 'move';
                    this.move_target = closestPath;
                    this.move_job = closestJob;
                }
        }

    }
}

export { get_part, BaseCharacter, NPCCharacter, BaseDrone }
