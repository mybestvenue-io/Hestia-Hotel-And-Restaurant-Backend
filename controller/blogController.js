const Blog = require('../model/blogModel');
const { uploadBlogImage } = require('../common/multerConfig');
const { isDbConnected } = require('../common/db/connection');
const { memoryStore } = require('../common/inMemoryStore');

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug: customSlug,
      description,
      content,
      category,
      tags,
      published,
      author,
      authorName,
      readTime,
      metaTitle,
      metaDescription,
      featured,
    } = req.body;
    const authorId = req.user?.id || req.user?._id || author || null;

    let image = 'https://ik.imagekit.io/tqbrtvygh/HestiaHotel/view%20of%20best%20hotel%20in%20knowledge%20part%203.webp';

    if (req.file) {
      const uploadResult = await uploadBlogImage(req.file);
      image = uploadResult.url;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const slug = customSlug ? generateSlug(customSlug) : generateSlug(title);

    const blogData = {
      _id: 'blog-' + Date.now(),
      title,
      slug,
      description: description || '',
      content: content || '',
      image,
      author: authorId,
      authorName: authorName || 'Hestia Editorial Team',
      readTime: readTime || '4 min read',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      featured: featured === 'true' || featured === true,
      category: category || 'Hotels',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      published: published === undefined ? true : published === 'true' || published === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
          return res.status(400).json({ message: 'Blog with this title or slug already exists' });
        }
        const blog = new Blog(blogData);
        await blog.save();
        if (authorId) {
          try {
            await blog.populate('author', 'name email profile_picture');
          } catch {}
        }
        memoryStore.blogs.unshift(blog.toObject());
        return res.status(201).json({ data: blog, message: 'Blog created successfully' });
      } catch (dbErr) {
        console.warn('DB blog create failed, saving to memory store:', dbErr.message);
      }
    }

    memoryStore.blogs.unshift(blogData);
    return res.status(201).json({ data: blogData, message: 'Blog created successfully' });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, published, search, category } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (published !== undefined) {
        query.published = published === 'true';
      }
      if (search) {
        query.$or = [{ title: { $regex: search, $options: 'i' } }];
      }
      if (category && category !== 'All') {
        query.category = category;
      }

      const blogs = await Blog.find(query)
        .populate('author', 'name email profile_picture')
        .select('-content')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Blog.countDocuments(query);
      return res.status(200).json({ data: blogs, total, page: parseInt(page), limit: parseInt(limit) });
    }

    // In-memory fallback
    let filtered = [...memoryStore.blogs];

    if (published !== undefined) {
      const pubBool = published === 'true' || published === true;
      filtered = filtered.filter((b) => b.published === pubBool);
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (b) => b.title?.toLowerCase().includes(s) || b.description?.toLowerCase().includes(s)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = filtered.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.status(200).json({ data: paginated, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(200).json({
      data: memoryStore.blogs,
      total: memoryStore.blogs.length,
      page: 1,
      limit: 10,
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      try {
        const blog = await Blog.findOne({ slug }).populate('author', 'name email profile_picture');
        if (blog) {
          return res.status(200).json({ data: blog });
        }
      } catch (dbErr) {
        console.warn('DB getBlogBySlug failed:', dbErr.message);
      }
    }

    const memBlog = memoryStore.blogs.find((b) => b.slug === slug);
    if (memBlog) {
      return res.status(200).json({ data: memBlog });
    }

    return res.status(404).json({ message: 'Blog not found' });
  } catch (error) {
    console.error('Error fetching blog:', error);
    const memBlog = memoryStore.blogs.find((b) => b.slug === req.params.slug);
    if (memBlog) {
      return res.status(200).json({ data: memBlog });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const blog = await Blog.findById(id).populate('author', 'name email profile_picture');
        if (blog) {
          return res.status(200).json({ data: blog });
        }
      } catch {}
    }

    const memBlog = memoryStore.blogs.find((b) => String(b._id) === String(id) || b.id === id);
    if (memBlog) {
      return res.status(200).json({ data: memBlog });
    }

    return res.status(404).json({ message: 'Blog not found' });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug: customSlug,
      description,
      content,
      category,
      tags,
      published,
      authorName,
      readTime,
      metaTitle,
      metaDescription,
      featured,
    } = req.body;

    let imageUrl = req.body.image;
    if (req.file) {
      const uploadResult = await uploadBlogImage(req.file);
      imageUrl = uploadResult.url;
    }

    if (isDbConnected()) {
      try {
        const blog = await Blog.findById(id);
        if (blog) {
          if (imageUrl !== undefined) blog.image = imageUrl;
          if (customSlug) blog.slug = generateSlug(customSlug);
          else if (title && title !== blog.title) {
            blog.title = title;
            blog.slug = generateSlug(title);
          } else if (title) {
            blog.title = title;
          }

          if (description !== undefined) blog.description = description;
          if (content !== undefined) blog.content = content;
          if (category !== undefined) blog.category = category;
          if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
          if (published !== undefined) blog.published = published === 'true' || published === true;
          if (authorName !== undefined) blog.authorName = authorName;
          if (readTime !== undefined) blog.readTime = readTime;
          if (metaTitle !== undefined) blog.metaTitle = metaTitle;
          if (metaDescription !== undefined) blog.metaDescription = metaDescription;
          if (featured !== undefined) blog.featured = featured === 'true' || featured === true;

          await blog.save();
          return res.status(200).json({ data: blog, message: 'Blog updated successfully' });
        }
      } catch (dbErr) {
        console.warn('DB blog update failed, falling back to memory store:', dbErr.message);
      }
    }

    const memIndex = memoryStore.blogs.findIndex((b) => String(b._id) === String(id) || b.id === id);
    if (memIndex === -1) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const b = memoryStore.blogs[memIndex];
    if (imageUrl !== undefined) b.image = imageUrl;
    if (customSlug) b.slug = generateSlug(customSlug);
    else if (title) {
      b.title = title;
      b.slug = generateSlug(title);
    }
    if (description !== undefined) b.description = description;
    if (content !== undefined) b.content = content;
    if (category !== undefined) b.category = category;
    if (tags !== undefined) b.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    if (published !== undefined) b.published = published === 'true' || published === true;
    if (authorName !== undefined) b.authorName = authorName;
    if (readTime !== undefined) b.readTime = readTime;
    if (metaTitle !== undefined) b.metaTitle = metaTitle;
    if (metaDescription !== undefined) b.metaDescription = metaDescription;
    if (featured !== undefined) b.featured = featured === 'true' || featured === true;
    b.updatedAt = new Date().toISOString();

    return res.status(200).json({ data: b, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const blog = await Blog.findByIdAndDelete(id);
        if (blog) {
          memoryStore.blogs = memoryStore.blogs.filter((b) => String(b._id) !== String(id));
          return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
        }
      } catch (dbErr) {
        console.warn('DB blog delete failed:', dbErr.message);
      }
    }

    const initLen = memoryStore.blogs.length;
    memoryStore.blogs = memoryStore.blogs.filter((b) => String(b._id) !== String(id) && b.id !== id);

    if (memoryStore.blogs.length === initLen) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const uploadBlogContentImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const uploadResult = await uploadBlogImage(req.file);
    return res.status(200).json({ url: uploadResult.url, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading blog content image:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  uploadBlogContentImage,
};
