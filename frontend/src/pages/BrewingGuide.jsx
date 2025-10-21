import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCoffee, 
  FaThermometerHalf, 
  FaClock, 
  FaLeaf,
  FaWater,
  FaSearch,
  FaFilter,
  FaPlay,
  FaPause,
  FaRedo,
  FaBell,
  FaStar,
  FaBookmark,
  FaShare,
  FaDownload,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const BrewingGuide = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGuide, setExpandedGuide] = useState(null);
  const [brewingTimer, setBrewingTimer] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [favorites, setFavorites] = useState([]);

  const categories = [
    { id: 'all', name: 'All Teas', icon: FaCoffee },
    { id: 'black', name: 'Black Tea', icon: FaLeaf },
    { id: 'green', name: 'Green Tea', icon: FaLeaf },
    { id: 'white', name: 'White Tea', icon: FaLeaf },
    { id: 'oolong', name: 'Oolong Tea', icon: FaLeaf },
    { id: 'herbal', name: 'Herbal Tea', icon: FaLeaf },
    { id: 'chai', name: 'Chai & Spiced', icon: FaLeaf }
  ];

  const brewingGuides = [
    {
      id: 1,
      name: 'Classic Earl Grey',
      category: 'black',
      difficulty: 'Beginner',
      brewTime: 180, // seconds
      temperature: 95,
      ratio: '1:15',
      servings: 2,
      image: '/images/earl-grey-brewing.jpg',
      description: 'A timeless British favorite with bergamot oil for a citrusy aroma.',
      steps: [
        'Heat water to 95°C (203°F)',
        'Add 1 teaspoon of Earl Grey per cup',
        'Pour hot water over tea leaves',
        'Steep for 3-5 minutes',
        'Remove tea bag or strain leaves',
        'Add milk and sugar to taste'
      ],
      tips: [
        'Don\'t over-steep to avoid bitterness',
        'Use filtered water for best taste',
        'Pre-warm your teapot for optimal brewing'
      ],
      health: ['Rich in antioxidants', 'May help reduce cholesterol', 'Contains bergamot for mood enhancement'],
      pairings: ['Lemon cake', 'Scones with jam', 'Dark chocolate']
    },
    {
      id: 2,
      name: 'Japanese Sencha',
      category: 'green',
      difficulty: 'Intermediate',
      brewTime: 60,
      temperature: 75,
      ratio: '1:12',
      servings: 1,
      image: '/images/sencha-brewing.jpg',
      description: 'Delicate Japanese green tea with fresh, grassy notes.',
      steps: [
        'Heat water to 75°C (167°F)',
        'Add 1 tablespoon of sencha leaves',
        'Pour water in circular motion',
        'Steep for 1-2 minutes',
        'Pour in slow, steady stream',
        'Reserve leaves for second brewing'
      ],
      tips: [
        'Never use boiling water',
        'Use ceramic or glass teapot',
        'Can be brewed 2-3 times with increasing steeping time'
      ],
      health: ['High in antioxidants', 'Boosts metabolism', 'Supports brain health'],
      pairings: ['Sushi', 'Mochi', 'Light salads']
    },
    {
      id: 3,
      name: 'Silver Needle White Tea',
      category: 'white',
      difficulty: 'Advanced',
      brewTime: 240,
      temperature: 80,
      ratio: '1:20',
      servings: 2,
      image: '/images/white-tea-brewing.jpg',
      description: 'Premium white tea with subtle, delicate flavors.',
      steps: [
        'Heat water to 80°C (176°F)',
        'Rinse teapot with hot water',
        'Add 2 teaspoons of white tea',
        'Pour water gently over leaves',
        'Steep for 4-6 minutes',
        'Multiple infusions possible'
      ],
      tips: [
        'Use spring water if possible',
        'Be patient - flavor develops slowly',
        'Can steep up to 5 times'
      ],
      health: ['Highest antioxidant content', 'Anti-aging properties', 'Supports immune system'],
      pairings: ['Fresh fruit', 'Light pastries', 'Mild cheese']
    },
    {
      id: 4,
      name: 'Traditional Masala Chai',
      category: 'chai',
      difficulty: 'Intermediate',
      brewTime: 300,
      temperature: 100,
      ratio: '1:8',
      servings: 4,
      image: '/images/masala-chai-brewing.jpg',
      description: 'Aromatic spiced tea blend perfect for any time of day.',
      steps: [
        'Boil water with whole spices (5 min)',
        'Add black tea leaves',
        'Simmer for 2-3 minutes',
        'Add milk and bring to boil',
        'Add sugar to taste',
        'Strain and serve hot'
      ],
      tips: [
        'Crush spices before adding',
        'Use full-fat milk for creaminess',
        'Adjust spices to your preference'
      ],
      health: ['Digestive benefits from spices', 'Warming properties', 'Natural energy boost'],
      pairings: ['Samosas', 'Biscuits', 'Indian sweets']
    },
    {
      id: 5,
      name: 'Chamomile Herbal Tea',
      category: 'herbal',
      difficulty: 'Beginner',
      brewTime: 300,
      temperature: 100,
      ratio: '1:12',
      servings: 1,
      image: '/images/chamomile-brewing.jpg',
      description: 'Soothing caffeine-free herbal tea perfect for bedtime.',
      steps: [
        'Boil water to 100°C (212°F)',
        'Add 1 tablespoon dried chamomile',
        'Pour hot water over flowers',
        'Cover and steep for 5-7 minutes',
        'Strain and add honey if desired',
        'Enjoy warm before bedtime'
      ],
      tips: [
        'Cover while steeping to preserve oils',
        'Can add honey or lemon',
        'Best enjoyed 30 minutes before sleep'
      ],
      health: ['Promotes relaxation', 'Aids sleep', 'Anti-inflammatory properties'],
      pairings: ['Honey', 'Lavender cookies', 'Chamomile shortbread']
    },
    {
      id: 6,
      name: 'Oolong Dragon Well',
      category: 'oolong',
      difficulty: 'Advanced',
      brewTime: 120,
      temperature: 85,
      ratio: '1:15',
      servings: 2,
      image: '/images/oolong-brewing.jpg',
      description: 'Semi-oxidized tea with complex flavor profile.',
      steps: [
        'Heat water to 85°C (185°F)',
        'Warm teapot with hot water',
        'Add oolong leaves (1 tsp per cup)',
        'First rinse: pour and discard water',
        'Second pour: steep for 2-3 minutes',
        'Multiple short infusions recommended'
      ],
      tips: [
        'Rinse leaves before first proper steeping',
        'Each infusion reveals different notes',
        'Can be steeped 6-8 times'
      ],
      health: ['Balances metabolism', 'Rich in polyphenols', 'May aid weight management'],
      pairings: ['Dim sum', 'Nuts', 'Light seafood']
    }
  ];

  const filteredGuides = brewingGuides.filter(guide => {
    const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
    const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const startTimer = (duration) => {
    if (brewingTimer) {
      clearInterval(brewingTimer);
    }
    
    setTimeRemaining(duration);
    setTimerActive(true);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerActive(false);
          setBrewingTimer(null);
          toast.success('⏰ Brewing time complete! Your tea is ready.');
          // Play notification sound if available
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Tea Timer', { body: 'Your tea is ready!' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setBrewingTimer(timer);
  };

  const pauseTimer = () => {
    if (brewingTimer) {
      clearInterval(brewingTimer);
      setBrewingTimer(null);
      setTimerActive(false);
    }
  };

  const resetTimer = () => {
    if (brewingTimer) {
      clearInterval(brewingTimer);
      setBrewingTimer(null);
    }
    setTimerActive(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = (guideId) => {
    setFavorites(prev => 
      prev.includes(guideId) 
        ? prev.filter(id => id !== guideId)
        : [...prev, guideId]
    );
    const action = favorites.includes(guideId) ? 'removed from' : 'added to';
    toast.success(`Guide ${action} favorites`);
  };

  const shareGuide = (guide) => {
    if (navigator.share) {
      navigator.share({
        title: `${guide.name} Brewing Guide`,
        text: guide.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Guide link copied to clipboard');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-green-200 text-green-800';
      case 'Advanced': return 'bg-green-300 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <FaCoffee className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Perfect Tea Brewing Guide
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Master the art of tea brewing with our comprehensive guides for every type of tea
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timer Widget */}
        {timeRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-20 right-4 bg-white rounded-lg shadow-lg p-4 z-50 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Brewing Timer</h3>
              <button onClick={resetTimer} className="text-gray-400 hover:text-gray-600">
                <FaRedo className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={timerActive ? pauseTimer : () => startTimer(timeRemaining)}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  {timerActive ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search brewing guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Quick Access */}
            <div className="flex items-center gap-3">
              <button className="flex items-center px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50">
                <FaBookmark className="w-4 h-4 mr-2" />
                Favorites ({favorites.length})
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaDownload className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brewing Guides Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <motion.div
              key={guide.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Image */}
              <div className="relative h-48">
                <img
                  src={guide.image}
                  alt={guide.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => toggleFavorite(guide.id)}
                    className={`p-2 rounded-full transition-colors ${
                      favorites.includes(guide.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-white bg-opacity-90 text-gray-600 hover:bg-opacity-100'
                    }`}
                  >
                    <FaBookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => shareGuide(guide)}
                    className="p-2 bg-white bg-opacity-90 rounded-full text-gray-600 hover:bg-opacity-100 transition-colors"
                  >
                    <FaShare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{guide.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{guide.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaThermometerHalf className="w-4 h-4 mr-2 text-green-500" />
                    {guide.temperature}°C
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="w-4 h-4 mr-2 text-green-500" />
                    {formatTime(guide.brewTime)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaWater className="w-4 h-4 mr-2 text-green-500" />
                    {guide.ratio} ratio
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCoffee className="w-4 h-4 mr-2 text-green-500" />
                    {guide.servings} servings
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {expandedGuide === guide.id ? (
                      <>
                        <FaChevronUp className="w-4 h-4 mr-2" />
                        Hide Guide
                      </>
                    ) : (
                      <>
                        <FaChevronDown className="w-4 h-4 mr-2" />
                        View Guide
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => startTimer(guide.brewTime)}
                    className="flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <FaClock className="w-4 h-4 mr-2" />
                    Timer
                  </button>
                </div>

                {/* Expanded Guide Details */}
                {expandedGuide === guide.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    {/* Brewing Steps */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <FaCoffee className="w-4 h-4 mr-2 text-green-500" />
                        Brewing Steps
                      </h4>
                      <ol className="space-y-2">
                        {guide.steps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Pro Tips */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Pro Tips</h4>
                      <ul className="space-y-1">
                        {guide.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <FaStar className="w-3 h-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Health Benefits */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Health Benefits</h4>
                      <ul className="space-y-1">
                        {guide.health.map((benefit, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <FaLeaf className="w-3 h-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Perfect Pairings */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Perfect Pairings</h4>
                      <div className="flex flex-wrap gap-2">
                        {guide.pairings.map((pairing, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {pairing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGuides.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No guides found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Tea Knowledge Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tea Brewing Fundamentals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FaThermometerHalf className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Water Temperature</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• White Tea: 75-80°C (167-176°F)</li>
                <li>• Green Tea: 70-80°C (158-176°F)</li>
                <li>• Oolong Tea: 80-90°C (176-194°F)</li>
                <li>• Black Tea: 90-95°C (194-203°F)</li>
                <li>• Herbal Tea: 95-100°C (203-212°F)</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <FaClock className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Steeping Time</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• White Tea: 4-6 minutes</li>
                <li>• Green Tea: 1-3 minutes</li>
                <li>• Oolong Tea: 2-4 minutes</li>
                <li>• Black Tea: 3-5 minutes</li>
                <li>• Herbal Tea: 5-7 minutes</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center mb-4">
                <FaWater className="w-6 h-6 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Tea to Water Ratio</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Light teas: 1:15-20 ratio</li>
                <li>• Medium teas: 1:12-15 ratio</li>
                <li>• Strong teas: 1:8-12 ratio</li>
                <li>• Herbal teas: 1:10-15 ratio</li>
                <li>• Personal preference varies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrewingGuide;
