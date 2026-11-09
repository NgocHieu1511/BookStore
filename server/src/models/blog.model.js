
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        nameBlog: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            required: true,
        },

        publicId: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('blogs', blogSchema);
