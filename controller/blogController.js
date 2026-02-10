const Blog = require('../model/blogModel');
const { uploadBlogImage } = require('../common/multerConfig');

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
    const { title, description, content, category, tags, published ,author} = req.body;
    const authorId = req.user?.id || req.user?._id || author || null;
    console.log('Author ID:', authorId);

    let image = null;

    if (req.file) {
      const uploadResult = await uploadBlogImage(req.file);
      image = uploadResult.url;
      console.log('Blog image uploaded:', image);
    }

    const slug = generateSlug(title);
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return res.status(400).json({ message: 'Blog with this title already exists' });
    }

    const blog = new Blog({
      title,
      slug,
      description,
      content,
      image,
      author: authorId,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      published: published === 'true' || published === true,
    });

    await blog.save();
    if (authorId) {
      await blog.populate('author', 'name email profile_picture');
    }
    console.log('Blog saved with image:', blog.image);
    res.status(201).json({ data: blog, message: 'Blog created successfully' });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, published, search, category } = req.query;
    const query = {};

    if (published !== undefined) {
      query.published = published === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name email profile_picture')
      .select('-content') // Exclude content for performance
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({ data: blogs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug }).populate('author', 'name email profile_picture');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('author', 'name email profile_picture');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json({ data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, category, tags, published } = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (req.file) {
      const uploadResult = await uploadBlogImage(req.file);
      blog.image = uploadResult.url;
      console.log('Blog image updated:', blog.image);
    }

    if (title && title !== blog.title) {
      blog.title = title;
      blog.slug = generateSlug(title);
    }
    if (description !== undefined) blog.description = description;
    if (content) blog.content = content;
    if (category !== undefined) blog.category = category;
    if (tags) blog.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (published !== undefined) blog.published = published === 'true' || published === true;

    if (req.user?.id || req.user?._id) {
      blog.author = req.user.id || req.user._id;
    }

    await blog.save();
    await blog.populate('author', 'name email profile_picture');
    console.log('Blog updated with image:', blog.image);
    res.status(200).json({ data: blog, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
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
