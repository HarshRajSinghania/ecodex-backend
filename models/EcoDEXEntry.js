const mongoose = require('mongoose');

const EcoDEXEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  scientificName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['plant', 'animal'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  habitat: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  image: {
    type: String, // Base64 encoded image or URL
    required: true
  },
  originalImage: {
    type: String, // User's original photo
    required: true
  },
  stats: {
    size: {
      type: String,
      required: true
    },
    weight: {
      type: String
    },
    lifespan: {
      type: String
    },
    diet: {
      type: String
    }
  },
  abilities: [{
    name: String,
    description: String
  }],
  funFacts: [String],
  conservationStatus: {
    type: String,
    enum: ['least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct'],
    default: 'least_concern'
  },
  experiencePoints: {
    type: Number,
    default: function() {
      const rarityXP = {
        common: 10,
        uncommon: 25,
        rare: 50,
        epic: 100,
        legendary: 200
      };
      return rarityXP[this.rarity] || 10;
    }
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  discoveredAt: {
    type: Date,
    default: Date.now
  },
  isFirstDiscovery: {
    type: Boolean,
    default: false
  }
});

// Index for efficient queries
EcoDEXEntrySchema.index({ user: 1, discoveredAt: -1 });
EcoDEXEntrySchema.index({ type: 1, rarity: 1 });
EcoDEXEntrySchema.index({ name: 'text', scientificName: 'text', description: 'text' });

module.exports = mongoose.model('EcoDEXEntry', EcoDEXEntrySchema);