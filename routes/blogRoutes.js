const express = require('express');
const router = express.Router();
const { upload } = require('../common/multerConfig');
const authMiddleware = require('../common/Auth/authMiddleware');
const {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  uploadBlogContentImage,
} = require('../controller/blogController');

router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);
router.post('/create-blog', upload.single('image'), createBlog);
router.post('/upload-image', upload.single('image'), uploadBlogContentImage);
router.put('/:id', upload.single('image'), updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
