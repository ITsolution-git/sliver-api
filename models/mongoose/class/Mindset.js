class Mindset {

    static UpdateOrCreate(obj) {
        return this.update({userId: obj.userId}, obj, {upsert: true, setDefaultsOnInsert: true});
    }

    static load(options) {
        return this.findOne({userId: options.userId})
            .select(options.select)
            .exec();
    }
}

module.exports = Mindset;