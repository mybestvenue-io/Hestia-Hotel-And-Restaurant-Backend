const fs = require('fs');
const path = require('path');
const { uploadProcessedImage } = require('../common/imageProcessor');

/**
 * Migrate existing images from local uploads to ImageKit with WebP conversion
 */
const migrateExistingImages = async () => {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    try {
        if (!fs.existsSync(uploadsDir)) {
            console.log('No uploads directory found');
            return;
        }

        const files = fs.readdirSync(uploadsDir);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(file)
        );

        if (imageFiles.length === 0) {
            console.log('No images found to migrate');
            return;
        }

        console.log(`Found ${imageFiles.length} images to migrate`);
        
        const results = [];
        
        for (const file of imageFiles) {
            try {
                const filePath = path.join(uploadsDir, file);
                const buffer = fs.readFileSync(filePath);
                
                console.log(`Processing ${file}...`);
                
                const result = await uploadProcessedImage(buffer, file, 'migrated');
                
                results.push({
                    originalFile: file,
                    newUrl: result.url,
                    originalSize: result.originalSize,
                    compressedSize: result.compressedSize,
                    compressionRatio: result.compressionRatio
                });
                
                console.log(`✓ ${file} -> ${result.name} (${result.compressionRatio}% compression)`);
                
            } catch (error) {
                console.error(`✗ Failed to process ${file}:`, error.message);
            }
        }
        
        // Save migration report
        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: imageFiles.length,
            successfulMigrations: results.length,
            totalOriginalSize: results.reduce((sum, r) => sum + r.originalSize, 0),
            totalCompressedSize: results.reduce((sum, r) => sum + r.compressedSize, 0),
            results
        };
        
        fs.writeFileSync(
            path.join(__dirname, '../migration-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n=== Migration Complete ===');
        console.log(`Successfully migrated: ${results.length}/${imageFiles.length} images`);
        console.log(`Total size reduction: ${((report.totalOriginalSize - report.totalCompressedSize) / 1024 / 1024).toFixed(2)} MB`);
        console.log('Migration report saved to migration-report.json');
        
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

// Run migration if called directly
if (require.main === module) {
    migrateExistingImages();
}

module.exports = { migrateExistingImages };