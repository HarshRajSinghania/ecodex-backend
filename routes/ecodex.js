const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const EcoDEXEntry = require('../models/EcoDEXEntry');
const User = require('../models/User');
const OpenAI = require('openai');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Initialize OpenAI-compatible client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL
});

// Helper function to convert buffer to base64
const bufferToBase64 = (buffer) => {
  return buffer.toString('base64');
};

// Helper function to determine rarity based on conservation status and commonality
const determineRarity = (conservationStatus, commonality) => {
  if (conservationStatus === 'critically_endangered' || conservationStatus === 'extinct') {
    return 'legendary';
  } else if (conservationStatus === 'endangered') {
    return 'epic';
  } else if (conservationStatus === 'vulnerable' || conservationStatus === 'near_threatened') {
    return 'rare';
  } else if (commonality && commonality.toLowerCase().includes('uncommon')) {
    return 'uncommon';
  } else {
    return 'common';
  }
};

// @route   POST /api/ecodex/identify
// @desc    Upload image and identify species using AI
// @access  Private
router.post('/identify', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file provided' });
    }

    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64Image = bufferToBase64(processedImage);
    const originalBase64 = bufferToBase64(req.file.buffer);

    // Prepare the prompt for OpenAI Vision
    const prompt = `You are an expert biologist and naturalist. Analyze this image and identify the plant or animal species.
    Provide a detailed response in the following JSON format:

    {
      "name": "Common name of the species",
      "scientificName": "Scientific name (Genus species)",
      "type": "plant" or "animal",
      "description": "Detailed description (2-3 sentences)",
      "habitat": "Natural habitat description",
      "region": "Geographic region where commonly found",
      "stats": {
        "size": "Size range (e.g., '10-15 cm' or '2-3 meters')",
        "weight": "Weight range (if applicable)",
        "lifespan": "Typical lifespan",
        "diet": "Diet type (for animals) or growth requirements (for plants)"
      },
      "abilities": [
        {
          "name": "Special ability or characteristic",
          "description": "Description of the ability"
        }
      ],
      "funFacts": [
        "Interesting fact 1",
        "Interesting fact 2",
        "Interesting fact 3"
      ],
      "conservationStatus": "least_concern|near_threatened|vulnerable|endangered|critically_endangered",
      "commonality": "very common|common|uncommon|rare|very rare",
      "confidence": "High|Medium|Low"
    }

    Make the description engaging and Pokemon-style without being too childish. Focus on the species' unique characteristics, behaviors, and ecological importance. If you cannot identify the species with confidence, indicate this in the confidence field and provide your best guess with appropriate caveats.`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const text = response.choices[0].message.content;

    // Parse the JSON response
    let speciesData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        speciesData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        msg: 'Error processing AI response',
        aiResponse: text 
      });
    }

    // Determine rarity
    const rarity = determineRarity(speciesData.conservationStatus, speciesData.commonality);

    // Check if this is the user's first discovery of this species
    const existingEntry = await EcoDEXEntry.findOne({
      user: req.user.id,
      scientificName: speciesData.scientificName
    });

    const isFirstDiscovery = !existingEntry;

    // Create EcoDEX entry
    const ecodexEntry = new EcoDEXEntry({
      user: req.user.id,
      name: speciesData.name,
      scientificName: speciesData.scientificName,
      description: speciesData.description,
      type: speciesData.type,
      rarity: rarity,
      habitat: speciesData.habitat,
      region: speciesData.region,
      image: base64Image,
      originalImage: originalBase64,
      stats: speciesData.stats,
      abilities: speciesData.abilities || [],
      funFacts: speciesData.funFacts || [],
      conservationStatus: speciesData.conservationStatus,
      location: {
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        address: req.body.address || null
      },
      isFirstDiscovery: isFirstDiscovery
    });

    await ecodexEntry.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (!user.discoveries) {
      user.discoveries = [];
    }
    
    user.discoveries.push(ecodexEntry._id);
    
    // Add experience points
    const xpGained = ecodexEntry.experiencePoints * (isFirstDiscovery ? 2 : 1);
    user.experience = (user.experience || 0) + xpGained;
    
    // Calculate level (every 100 XP = 1 level)
    user.level = Math.floor(user.experience / 100) + 1;
    
    await user.save();

    res.json({
      success: true,
      entry: ecodexEntry,
      xpGained: xpGained,
      isFirstDiscovery: isFirstDiscovery,
      confidence: speciesData.confidence,
      newLevel: user.level,
      totalXP: user.experience
    });

  } catch (error) {
    console.error('Error in species identification:', error);
    res.status(500).json({ 
      msg: 'Server error during species identification',
      error: error.message 
    });
  }
});

// @route   GET /api/ecodex/entries
// @desc    Get user's EcoDEX entries
// @access  Private
router.get('/entries', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, rarity, sort = '-discoveredAt' } = req.query;
    
    const query = { user: req.user.id };
    
    if (type) query.type = type;
    if (rarity) query.rarity = rarity;

    const entries = await EcoDEXEntry.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await EcoDEXEntry.countDocuments(query);

    res.json({
      entries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching EcoDEX entries:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/ecodex/entries/:id
// @desc    Get specific EcoDEX entry
// @access  Private
router.get('/entries/:id', auth, async (req, res) => {
  try {
    const entry = await EcoDEXEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ msg: 'EcoDEX entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching EcoDEX entry:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/ecodex/stats
// @desc    Get user's EcoDEX statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const totalEntries = await EcoDEXEntry.countDocuments({ user: userId });
    
    const typeStats = await EcoDEXEntry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const rarityStats = await EcoDEXEntry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$rarity', count: { $sum: 1 } } }
    ]);

    const recentEntries = await EcoDEXEntry.find({ user: userId })
      .sort({ discoveredAt: -1 })
      .limit(5)
      .select('name type rarity discoveredAt image');

    res.json({
      totalEntries,
      typeStats,
      rarityStats,
      recentEntries
    });
  } catch (error) {
    console.error('Error fetching EcoDEX stats:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/ecodex/chat
// @desc    Chat with Dr. Maya Chen (AI ecologist)
// @access  Private
router.post('/chat', auth, upload.single('image'), async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message && !req.file) {
      return res.status(400).json({ msg: 'Please provide a message or image' });
    }

    // Prepare the messages array for the conversation
    const messages = [
      {
        role: "system",
        content: `You are Dr. Maya Chen, a friendly and enthusiastic field ecologist with over 15 years of experience studying biodiversity around the world. You're passionate about nature education and love helping people learn about plants, animals, and ecosystems.

Your personality:
- Warm, encouraging, and patient
- Uses emojis occasionally to make conversations engaging
- Explains complex concepts in simple, accessible terms
- Always excited to share interesting facts about nature
- Encourages conservation and environmental awareness
- Sometimes shares personal anecdotes from field research

When users ask questions or share images:
- Provide detailed, educational responses about species, ecosystems, or nature topics
- If they share an image, analyze it and provide insights about what you see
- Always encourage their curiosity and learning
- Suggest related topics they might find interesting
- Keep responses conversational but informative (2-4 paragraphs typically)

Remember: You're not just an AI, you're Dr. Maya Chen, a real person who cares deeply about nature education and conservation.`
      }
    ];

    // Handle different message types
    if (req.file) {
      // If there's an image, use the array format like the identify route
      const processedImage = await sharp(req.file.buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const base64Image = bufferToBase64(processedImage);
      
      const userMessage = {
        role: "user",
        content: [
          {
            type: "text",
            text: message || "What can you tell me about this image?"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      };
      
      messages.push(userMessage);
    } else {
      // For text-only messages, use simple string content
      messages.push({
        role: "user",
        content: message
      });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: messages,
      max_tokens: 800,
      temperature: 0.8
    });

    const aiResponse = response.choices[0].message.content;

    res.json({
      response: aiResponse,
      success: true
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      msg: 'Sorry, I had trouble processing your message. Please try again.',
      error: error.message
    });
  }
});

module.exports = router;