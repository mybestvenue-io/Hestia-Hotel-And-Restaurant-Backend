const UrlContent = require('../model/content');

// Add or update content for a specific URL
const addOrUpdateContent = async (req, res) => {
    try {
        const { url_path, top_content, bottom_content, meta_title, meta_description, is_active } = req.body;

        if (!url_path) {
            return res.status(400).json({ message: 'url_path is required' });
        }

        // Check if content exists for this URL
        let content = await UrlContent.findOne({ url_path });

        if (content) {
            // Update existing content
            if (top_content !== undefined) content.top_content = top_content;
            if (bottom_content !== undefined) content.bottom_content = bottom_content;
            if (meta_title !== undefined) content.meta_title = meta_title;
            if (meta_description !== undefined) content.meta_description = meta_description;
            if (is_active !== undefined) content.is_active = is_active;
            
            await content.save();
            return res.status(200).json({ message: 'Content updated successfully', data: content });
        }

        // Create new content
        content = new UrlContent({
            url_path,
            top_content,
            bottom_content,
            meta_title,
            meta_description,
            is_active: is_active !== undefined ? is_active : true
        });

        await content.save();
        res.status(201).json({ message: 'Content added successfully', data: content });

    } catch (error) {
        console.error('Error managing content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get content by URL
const getContentByUrl = async (req, res) => {
    try {
        const { url_path } = req.params;
        
        if (!url_path) {
            return res.status(400).json({ success: false, message: 'url_path is required' });
        }

        // Only fetch active content for public pages
        const content = await UrlContent.findOne({ url_path, is_active: true });

        if (!content) {
            // Return success with null data if not found, so frontend can handle it gracefully
            return res.status(200).json({ success: true, data: null });
        }

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update content by URL path
const updateContentByUrl = async (req, res) => {
    try {
        const { url_path } = req.params;
        const updateData = {};
        
        // Build the update object dynamically to avoid overwriting fields with undefined
        if (req.body.top_content !== undefined) updateData.top_content = req.body.top_content;
        if (req.body.bottom_content !== undefined) updateData.bottom_content = req.body.bottom_content;
        if (req.body.meta_title !== undefined) updateData.meta_title = req.body.meta_title;
        if (req.body.meta_description !== undefined) updateData.meta_description = req.body.meta_description;
        if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update provided' });
        }

        const content = await UrlContent.findOneAndUpdate({ url_path }, { $set: updateData }, { new: true, runValidators: true });

        if (!content) {
            return res.status(404).json({ message: 'Content not found for this URL path' });
        }
        
        return res.status(200).json({ message: 'Content updated successfully', data: content });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    addOrUpdateContent,
    getContentByUrl,
    updateContentByUrl
};