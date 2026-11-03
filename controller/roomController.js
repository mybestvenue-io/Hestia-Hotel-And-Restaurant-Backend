const Room = require('../model/Room');
const HotelProperty = require('../model/HotelProperty');
const { uploadToImageKit } = require('../common/multerConfig');
const { isDbConnected } = require('../common/db/connection');
const { memoryStore } = require('../common/inMemoryStore');

const parseJsonSafely = (val, fallback = null) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
};

// GET /api/v1/rooms - list rooms with optional hotel filter & status filter
const getRooms = async (req, res) => {
  try {
    const { hotelSlug, hotelId, status, search, isFeatured, page = 1, limit = 50 } = req.query;

    if (isDbConnected()) {
      const query = {};

      if (hotelSlug && hotelSlug !== 'all') {
        query.hotelSlug = hotelSlug;
      }
      if (hotelId) {
        query.hotelId = hotelId;
      }
      if (status) {
        query.status = status;
      }
      if (isFeatured !== undefined && isFeatured !== '') {
        query.isFeatured = isFeatured === 'true' || isFeatured === true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { roomType: { $regex: search, $options: 'i' } },
          { hotelName: { $regex: search, $options: 'i' } },
        ];
      }

      const rooms = await Room.find(query)
        .sort({ order: 1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Room.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: rooms,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    // Fallback: In-memory store
    let filtered = [...memoryStore.rooms];

    if (hotelSlug && hotelSlug !== 'all') {
      filtered = filtered.filter((r) => r.hotelSlug === hotelSlug || r.hotelSlug === 'all');
    }

    if (hotelId) {
      filtered = filtered.filter((r) => String(r.hotelId) === String(hotelId));
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (isFeatured !== undefined && isFeatured !== '') {
      const featuredBool = isFeatured === 'true' || isFeatured === true;
      filtered = filtered.filter((r) => r.isFeatured === featuredBool);
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(s) ||
          r.roomType?.toLowerCase().includes(s) ||
          r.hotelName?.toLowerCase().includes(s)
      );
    }

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
    console.error('Error fetching rooms:', error);
    return res.status(200).json({
      success: true,
      data: memoryStore.rooms,
      total: memoryStore.rooms.length,
      page: 1,
      limit: 50,
    });
  }
};

// GET /api/v1/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const room = await Room.findById(id);
        if (room) {
          return res.status(200).json({ success: true, data: room });
        }
      } catch {
        // if id is not a mongo ObjectId, continue to memory store
      }
    }

    const memRoom = memoryStore.rooms.find((r) => String(r._id) === String(id) || r.id === id);
    if (memRoom) {
      return res.status(200).json({ success: true, data: memRoom });
    }

    return res.status(404).json({ success: false, message: 'Room not found' });
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/rooms - create a new room
const createRoom = async (req, res) => {
  try {
    const {
      name,
      hotelId,
      hotelSlug,
      hotelName,
      roomType,
      roomNumber,
      description,
      price,
      discountPrice,
      beds,
      bedType,
      guests,
      roomSize,
      amenities,
      features,
      status,
      isFeatured,
      order,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    let imageUrl = req.body.image || '';
    if (req.file) {
      const uploadRes = await uploadToImageKit(req.file, 'rooms');
      imageUrl = uploadRes.url;
    }

    if (!imageUrl) {
      imageUrl = 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/HestiaImage_1/hestia-hotel-&-Restaurant-Knowledge-Park-3/bedroom%20with%20pillow%20and%20lamp.webp';
    }

    let resolvedHotelName = hotelName || 'All Properties';
    let resolvedHotelSlug = hotelSlug || 'all';
    let resolvedHotelId = hotelId || null;

    if (resolvedHotelSlug && resolvedHotelSlug !== 'all' && !hotelName) {
      const memH = memoryStore.hotels.find((h) => h.slug === resolvedHotelSlug);
      if (memH) {
        resolvedHotelName = memH.name;
        resolvedHotelId = memH._id;
      }
    }

    const roomData = {
      _id: 'room-' + Date.now(),
      name,
      hotelId: resolvedHotelId,
      hotelSlug: resolvedHotelSlug,
      hotelName: resolvedHotelName,
      roomType: roomType || 'Deluxe Room',
      roomNumber: roomNumber || '',
      description: description || '',
      price: price ? Number(price) : 2999,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      beds: beds ? Number(beds) : 1,
      bedType: bedType || 'Double Bed',
      guests: guests ? Number(guests) : 2,
      roomSize: roomSize || '250 sq.ft',
      image: imageUrl,
      gallery: parseJsonSafely(req.body.gallery, []),
      amenities: parseJsonSafely(amenities, []),
      features: parseJsonSafely(features, []),
      status: status || 'available',
      isFeatured: isFeatured === undefined ? true : isFeatured === 'true' || isFeatured === true,
      order: order ? Number(order) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const createdRoom = await Room.create(roomData);
        memoryStore.rooms.unshift(createdRoom.toObject());
        return res.status(201).json({ success: true, data: createdRoom, message: 'Room created successfully' });
      } catch (dbErr) {
        console.warn('DB room create failed, persisting to memory store:', dbErr.message);
      }
    }

    memoryStore.rooms.unshift(roomData);
    return res.status(201).json({ success: true, data: roomData, message: 'Room created successfully' });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// PUT /api/v1/rooms/:id - update room
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    let imageUrl = req.body.image;
    if (req.file) {
      const uploadRes = await uploadToImageKit(req.file, 'rooms');
      imageUrl = uploadRes.url;
    }

    const {
      name,
      hotelId,
      hotelSlug,
      hotelName,
      roomType,
      roomNumber,
      description,
      price,
      discountPrice,
      beds,
      bedType,
      guests,
      roomSize,
      gallery,
      amenities,
      features,
      status,
      isFeatured,
      order,
    } = req.body;

    if (isDbConnected()) {
      try {
        const room = await Room.findById(id);
        if (room) {
          if (imageUrl !== undefined) room.image = imageUrl;
          if (name) room.name = name;
          if (hotelId !== undefined) room.hotelId = hotelId || null;
          if (hotelSlug !== undefined) room.hotelSlug = hotelSlug;
          if (hotelName !== undefined) room.hotelName = hotelName;
          if (roomType !== undefined) room.roomType = roomType;
          if (roomNumber !== undefined) room.roomNumber = roomNumber;
          if (description !== undefined) room.description = description;
          if (price !== undefined) room.price = Number(price);
          if (discountPrice !== undefined) room.discountPrice = discountPrice ? Number(discountPrice) : null;
          if (beds !== undefined) room.beds = Number(beds);
          if (bedType !== undefined) room.bedType = bedType;
          if (guests !== undefined) room.guests = Number(guests);
          if (roomSize !== undefined) room.roomSize = roomSize;
          if (status !== undefined) room.status = status;
          if (isFeatured !== undefined) room.isFeatured = isFeatured === 'true' || isFeatured === true;
          if (order !== undefined) room.order = Number(order);

          if (gallery !== undefined) room.gallery = parseJsonSafely(gallery, room.gallery);
          if (amenities !== undefined) room.amenities = parseJsonSafely(amenities, room.amenities);
          if (features !== undefined) room.features = parseJsonSafely(features, room.features);

          await room.save();
          return res.status(200).json({ success: true, data: room, message: 'Room updated successfully' });
        }
      } catch (dbErr) {
        console.warn('DB update room failed, attempting memory store update:', dbErr.message);
      }
    }

    const memIndex = memoryStore.rooms.findIndex((r) => String(r._id) === String(id) || r.id === id);
    if (memIndex === -1) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const r = memoryStore.rooms[memIndex];
    if (imageUrl !== undefined) r.image = imageUrl;
    if (name) r.name = name;
    if (hotelId !== undefined) r.hotelId = hotelId || null;
    if (hotelSlug !== undefined) r.hotelSlug = hotelSlug;
    if (hotelName !== undefined) r.hotelName = hotelName;
    if (roomType !== undefined) r.roomType = roomType;
    if (roomNumber !== undefined) r.roomNumber = roomNumber;
    if (description !== undefined) r.description = description;
    if (price !== undefined) r.price = Number(price);
    if (discountPrice !== undefined) r.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (beds !== undefined) r.beds = Number(beds);
    if (bedType !== undefined) r.bedType = bedType;
    if (guests !== undefined) r.guests = Number(guests);
    if (roomSize !== undefined) r.roomSize = roomSize;
    if (status !== undefined) r.status = status;
    if (isFeatured !== undefined) r.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (order !== undefined) r.order = Number(order);

    if (gallery !== undefined) r.gallery = parseJsonSafely(gallery, r.gallery);
    if (amenities !== undefined) r.amenities = parseJsonSafely(amenities, r.amenities);
    if (features !== undefined) r.features = parseJsonSafely(features, r.features);

    r.updatedAt = new Date().toISOString();
    return res.status(200).json({ success: true, data: r, message: 'Room updated successfully' });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// DELETE /api/v1/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const room = await Room.findByIdAndDelete(id);
        if (room) {
          memoryStore.rooms = memoryStore.rooms.filter((r) => String(r._id) !== String(id));
          return res.status(200).json({ success: true, message: 'Room deleted successfully' });
        }
      } catch (dbErr) {
        console.warn('DB delete room failed, attempting memory store delete:', dbErr.message);
      }
    }

    const initialLength = memoryStore.rooms.length;
    memoryStore.rooms = memoryStore.rooms.filter((r) => String(r._id) !== String(id) && r.id !== id);

    if (memoryStore.rooms.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/v1/rooms/upload-image
const uploadRoomMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }
    const uploadRes = await uploadToImageKit(req.file, 'rooms');
    res.status(200).json({ success: true, url: uploadRes.url });
  } catch (error) {
    console.error('Error uploading room media:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomMedia,
};
