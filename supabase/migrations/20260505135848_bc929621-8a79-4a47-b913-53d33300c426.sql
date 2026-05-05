-- Add image alt text for SEO
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS hero_image_alt text;

-- Create public storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read + public upload/update/delete (admin panel is unauthenticated)
DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;
CREATE POLICY "Public can read blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Public can upload blog images" ON storage.objects;
CREATE POLICY "Public can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Public can update blog images" ON storage.objects;
CREATE POLICY "Public can update blog images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Public can delete blog images" ON storage.objects;
CREATE POLICY "Public can delete blog images" ON storage.objects
  FOR DELETE USING (bucket_id = 'blog-images');