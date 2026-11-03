const HotelProperty = require('../model/HotelProperty');
const { uploadHotelImage } = require('../common/multerConfig');
const { isDbConnected } = require('../common/db/connection');
const { memoryStore } = require('../common/inMemoryStore');

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const parseJsonSafely = (val, fallback = null) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// GET /api/v1/hotels - list all hotel properties
const getHotels = async (req, res) => {
  try {
    const { search, isActive, city, page = 1, limit = 50 } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (isActive !== undefined && isActive !== '') {
        query.isActive = isActive === 'true' || isActive === true;
      }
      if (city) {
        query['location.city'] = { $regex: city, $options: 'i' };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'location.area': { $regex: search, $options: 'i' } },
          { 'location.city': { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
        ];
      }

      const hotels = await HotelProperty.find(query)
        .sort({ order: 1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await HotelProperty.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: hotels,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Fallback: In-memory store
    let filtered = [...memoryStore.hotels];

    if (isActive !== undefined && isActive !== '') {
      const activeBool = isActive === 'true' || isActive === true;
      filtered = filtered.filter((h) => h.isActive === activeBool);
    }

    if (city) {
      filtered = filtered.filter((h) =>
        h.location?.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name?.toLowerCase().includes(s) ||
          h.subtitle?.toLowerCase().includes(s) ||
          h.location?.city?.toLowerCase().includes(s) ||
          h.location?.area?.toLowerCase().includes(s)
      );
    }

    // Sort by order ascending
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    const total = filtered.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({
      success: true,
      data: paginated,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    // On unexpected error, return memory store gracefully
    return res.status(200).json({
      success: true,
      data: memoryStore.hotels,
      total: memoryStore.hotels.length,
      page: 1,
      limit: 50,
    });
  }
};

// GET /api/v1/hotels/slug/:slug
const getHotelBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      const hotel = await HotelProperty.findOne({ slug });
      if (hotel) {
        return res.status(200).json({ success: true, data: hotel });
      }
    }

    // Fallback: in-memory store
    const memHotel = memoryStore.hotels.find((h) => h.slug === slug);
    if (memHotel) {
      return res.status(200).json({ success: true, data: memHotel });
    }

    return res.status(404).json({ success: false, message: 'Hotel not found' });
  } catch (error) {
    console.error('Error fetching hotel by slug:', error);
    const memHotel = memoryStore.hotels.find((h) => h.slug === req.params.slug);
    if (memHotel) {
      return res.status(200).json({ success: true, data: memHotel });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/v1/hotels/:id
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        let hotel = null;
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          hotel = await HotelProperty.findById(id);
        }
        if (!hotel) {
          hotel = await HotelProperty.findOne({ slug: id });
        }
        if (hotel) {
          return res.status(200).json({ success: true, data: hotel });
        }
      } catch {
        // continue to memory store
      }
    }

    const memHotel = memoryStore.hotels.find((h) => String(h._id) === String(id) || h.id === id || h.slug === id);
    if (memHotel) {
      return res.status(200).json({ success: true, data: memHotel });
    }

    return res.status(404).json({ success: false, message: 'Hotel not found' });
  } catch (error) {
    console.error('Error fetching hotel by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/hotels - Create a new hotel property
const createHotel = async (req, res) => {
  try {
    const {
      name,
      slug: customSlug,
      subtitle,
      description,
      accommodationInfo,
      price,
      rating,
      reviewsCount,
      location,
      amenities,
      features,
      restaurant,
      reviews,
      policies,
      contact,
      mapUrl,
      nearbyPlaces,
      seo,
      isActive,
      order,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Hotel name is required' });
    }

    const slug = customSlug ? generateSlug(customSlug) : generateSlug(name);

    let imageUrl = req.body.image || '';
    if (req.file) {
      const uploadRes = await uploadHotelImage(req.file);
      imageUrl = uploadRes.url;
    }

    const hotelPayload = {
      name: name.trim(),
      slug,
      subtitle: subtitle || '',
      description: description || '',
      accommodationInfo: accommodationInfo || '',
      price: price ? Number(price) : 2999,
      rating: rating ? Number(rating) : 4.8,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 100,
      image: imageUrl,
      gallery: parseJsonSafely(req.body.gallery, []),
      location: parseJsonSafely(location, {
        area: '',
        city: '',
        state: '',
        country: 'India',
        distance: '',
        accessibility: '',
        address: '',
      }),
      amenities: parseJsonSafely(amenities, []),
      features: parseJsonSafely(features, []),
      restaurant: parseJsonSafely(restaurant, {
        name: '',
        description: '',
        cuisine: [],
        timings: '',
        image: '',
      }),
      reviews: parseJsonSafely(reviews, []),
      policies: parseJsonSafely(policies, {
        checkIn: '1:00 PM',
        checkOut: '11:00 AM',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        rules: [],
      }),
      contact: parseJsonSafely(contact, {
        phone: '+91 8130622279',
        email: 'info@hestiahotels.com',
        address: '',
      }),
      mapUrl: mapUrl || '',
      nearbyPlaces: parseJsonSafely(nearbyPlaces, []),
      seo: parseJsonSafely(seo, { metaTitle: '', metaDescription: '' }),
      isActive: isActive === undefined ? true : isActive === 'true' || isActive === true,
      order: order ? Number(order) : 0,
    };

    if (isDbConnected()) {
      try {
        let counter = 1;
        while (await HotelProperty.findOne({ slug })) {
          slug = `${generateSlug(customSlug || name)}-${counter++}`;
        }
        hotelPayload.slug = slug;

        const createdHotel = await HotelProperty.create(hotelPayload);
        memoryStore.hotels.unshift(createdHotel.toObject());
        return res.status(201).json({ success: true, data: createdHotel, message: 'Hotel property created successfully' });
      } catch (dbErr) {
        console.error('DB hotel create error:', dbErr);
        return res.status(400).json({ success: false, message: dbErr.message || 'Failed to save hotel to database' });
      }
    }

    // In-memory store fallback when MongoDB is not connected
    const memHotel = {
      ...hotelPayload,
      _id: 'hotel-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStore.hotels.unshift(memHotel);
    return res.status(201).json({ success: true, data: memHotel, message: 'Hotel property created successfully' });
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// PUT /api/v1/hotels/:id - Update hotel property (all A-Z fields)
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    let imageUrl = req.body.image;
    if (req.file) {
      const uploadRes = await uploadHotelImage(req.file);
      imageUrl = uploadRes.url;
    }

    const {
      name,
      slug: customSlug,
      subtitle,
      description,
      accommodationInfo,
      price,
      rating,
      reviewsCount,
      gallery,
      location,
      amenities,
      features,
      restaurant,
      reviews,
      policies,
      contact,
      mapUrl,
      nearbyPlaces,
      seo,
      isActive,
      order,
    } = req.body;

    if (isDbConnected()) {
      try {
        let hotel = null;
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          hotel = await HotelProperty.findById(id);
        }
        if (!hotel) {
          hotel = await HotelProperty.findOne({ slug: id });
        }
        if (hotel) {
          if (imageUrl !== undefined && imageUrl !== '') hotel.image = imageUrl;
          if (name) hotel.name = name.trim();
          if (customSlug) hotel.slug = generateSlug(customSlug);
          if (subtitle !== undefined) hotel.subtitle = subtitle;
          if (description !== undefined) hotel.description = description;
          if (accommodationInfo !== undefined) hotel.accommodationInfo = accommodationInfo;
          if (price !== undefined) hotel.price = Number(price);
          if (rating !== undefined) hotel.rating = Number(rating);
          if (reviewsCount !== undefined) hotel.reviewsCount = Number(reviewsCount);
          if (mapUrl !== undefined) hotel.mapUrl = mapUrl;
          if (isActive !== undefined) hotel.isActive = isActive === 'true' || isActive === true;
          if (order !== undefined) hotel.order = Number(order);

          if (gallery !== undefined) hotel.gallery = parseJsonSafely(gallery, hotel.gallery);
          if (location !== undefined) hotel.location = parseJsonSafely(location, hotel.location);
          if (amenities !== undefined) hotel.amenities = parseJsonSafely(amenities, hotel.amenities);
          if (features !== undefined) hotel.features = parseJsonSafely(features, hotel.features);
          if (restaurant !== undefined) hotel.restaurant = parseJsonSafely(restaurant, hotel.restaurant);
          if (reviews !== undefined) hotel.reviews = parseJsonSafely(reviews, hotel.reviews);
          if (policies !== undefined) hotel.policies = parseJsonSafely(policies, hotel.policies);
          if (contact !== undefined) hotel.contact = parseJsonSafely(contact, hotel.contact);
          if (nearbyPlaces !== undefined) hotel.nearbyPlaces = parseJsonSafely(nearbyPlaces, hotel.nearbyPlaces);
          if (seo !== undefined) hotel.seo = parseJsonSafely(seo, hotel.seo);

          await hotel.save();
          const memIdx = memoryStore.hotels.findIndex((h) => String(h._id) === String(hotel._id) || h.slug === hotel.slug);
          if (memIdx !== -1) {
            memoryStore.hotels[memIdx] = hotel.toObject();
          }
          return res.status(200).json({ success: true, data: hotel, message: 'Hotel updated successfully' });
        }
      } catch (dbErr) {
        console.error('DB update failed:', dbErr);
        return res.status(400).json({ success: false, message: dbErr.message || 'Failed to update hotel property in database' });
      }
    }

    // In-memory store
    const memIndex = memoryStore.hotels.findIndex((h) => String(h._id) === String(id) || h.id === id);
    if (memIndex === -1) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const h = memoryStore.hotels[memIndex];
    if (imageUrl !== undefined) h.image = imageUrl;
    if (name) h.name = name;
    if (customSlug) h.slug = generateSlug(customSlug);
    if (subtitle !== undefined) h.subtitle = subtitle;
    if (description !== undefined) h.description = description;
    if (accommodationInfo !== undefined) h.accommodationInfo = accommodationInfo;
    if (price !== undefined) h.price = Number(price);
    if (rating !== undefined) h.rating = Number(rating);
    if (reviewsCount !== undefined) h.reviewsCount = Number(reviewsCount);
    if (mapUrl !== undefined) h.mapUrl = mapUrl;
    if (isActive !== undefined) h.isActive = isActive === 'true' || isActive === true;
    if (order !== undefined) h.order = Number(order);

    if (gallery !== undefined) h.gallery = parseJsonSafely(gallery, h.gallery);
    if (location !== undefined) h.location = parseJsonSafely(location, h.location);
    if (amenities !== undefined) h.amenities = parseJsonSafely(amenities, h.amenities);
    if (features !== undefined) h.features = parseJsonSafely(features, h.features);
    if (restaurant !== undefined) h.restaurant = parseJsonSafely(restaurant, h.restaurant);
    if (reviews !== undefined) h.reviews = parseJsonSafely(reviews, h.reviews);
    if (policies !== undefined) h.policies = parseJsonSafely(policies, h.policies);
    if (contact !== undefined) h.contact = parseJsonSafely(contact, h.contact);
    if (nearbyPlaces !== undefined) h.nearbyPlaces = parseJsonSafely(nearbyPlaces, h.nearbyPlaces);
    if (seo !== undefined) h.seo = parseJsonSafely(seo, h.seo);

    h.updatedAt = new Date().toISOString();
    return res.status(200).json({ success: true, data: h, message: 'Hotel updated successfully' });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// DELETE /api/v1/hotels/:id
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        let hotel = null;
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          hotel = await HotelProperty.findByIdAndDelete(id);
        } else {
          hotel = await HotelProperty.findOneAndDelete({ slug: id });
        }
        if (hotel) {
          memoryStore.hotels = memoryStore.hotels.filter((h) => String(h._id) !== String(id) && h.slug !== id);
          return res.status(200).json({ success: true, message: 'Hotel property deleted successfully' });
        }
      } catch (dbErr) {
        console.error('DB delete failed:', dbErr);
        return res.status(400).json({ success: false, message: dbErr.message || 'Failed to delete hotel property' });
      }
    }

    const initialLength = memoryStore.hotels.length;
    memoryStore.hotels = memoryStore.hotels.filter((h) => String(h._id) !== String(id) && h.id !== id);

    if (memoryStore.hotels.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.status(200).json({ success: true, message: 'Hotel property deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/hotels/upload-image - Upload an image to ImageKit
const uploadHotelMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const uploadRes = await uploadHotelImage(req.file);
    res.status(200).json({ success: true, url: uploadRes.url });
  } catch (error) {
    console.error('Error uploading hotel media:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

module.exports = {
  getHotels,
  getHotelBySlug,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  uploadHotelMedia,
};
