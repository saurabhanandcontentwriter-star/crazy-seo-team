
DROP POLICY IF EXISTS "Admins can read all posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.blog_posts;

CREATE POLICY "Public can read all posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public can insert posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update posts" ON public.blog_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete posts" ON public.blog_posts FOR DELETE USING (true);

ALTER TABLE public.blog_posts ALTER COLUMN created_by DROP NOT NULL;
