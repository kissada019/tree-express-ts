-- Create tree_images table for storing multiple images per tree
CREATE TABLE IF NOT EXISTS tree_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tree_images_tree_id ON tree_images(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_images_is_primary ON tree_images(tree_id, is_primary);
