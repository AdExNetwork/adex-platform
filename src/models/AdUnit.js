import Helper from './../helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes } from './../constants/itemsTypes'
import { Sizes, Images, AdTypes, Locations, Genders } from './DummyData'

class AdUnit extends Item {
    constructor(owner, id, name, { img, description, size, adType, location, gender }) {
        super(owner, id, ItemsTypes.AdUnit.id, name, img, description)
        let meta = this._meta
        meta.size = size
        meta.adType = adType
        meta.gender = gender
    }

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get size() { return this._meta.size }
    set size(value) { this._meta.size = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    get gender() { return this._meta.gender }
    set gender(value) { this._meta.gender = value }

    static getRandomInstance(owner, id) {
        let unit = new AdUnit(
            owner,
            id,
            'AdUnit ' + id,
            {
                img: Images[Helper.getRandomInt(0, Images.length - 1)],
                description: 'AdUnit Description ' + id,
                size: Helper.getRandomPropFromObj(Sizes),
                adType: Helper.getRandomPropFromObj(AdTypes),
                location: Helper.getRandomPropFromObj(Locations),
                gender: Helper.getRandomPropFromObj(Genders)
            }
        )

        return unit
    }

}

export default AdUnit
