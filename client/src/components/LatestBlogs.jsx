import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Newspaper } from "lucide-react";
import { requestGetBlogs } from "../config/blogRequest";
import TimeAgo from "../utils/TimeAgo";

// Bỏ thẻ HTML của TinyMCE để lấy đoạn trích ngắn
const getExcerpt = (html = "", max = 140) => {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max) + "..." : text;
};

function LatestBlogs() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await requestGetBlogs({ limit: 4 });
        setBlogs(res.metadata || []);
      } catch (error) {
        console.error("Error fetching latest blogs:", error);
      }
    })();
  }, []);

  if (blogs.length === 0) return null;   // chưa có bài viết thì ẩn cả khối

  const [featured, ...others] = blogs;

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="flex items-center gap-2 text-lg font-bold uppercase text-gray-900">
          <Newspaper className="text-[#c92127]" size={26} />
          Bài viết mới
        </h2>
        <Link
          to="/blogs"
          className="flex items-center text-sm font-semibold text-[#c92127] hover:underline"
        >
          Xem tất cả <ChevronRight size={18} />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-5">
        {/* Bài nổi bật */}
        <Link
          to={`/blog/${featured._id}`}
          className="group md:col-span-3 overflow-hidden rounded-lg border border-gray-100 transition hover:shadow-md"
        >
          <div className="aspect-[16/9] overflow-hidden bg-gray-100">
            <img
              src={featured.image}
              alt={featured.nameBlog}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 text-lg font-bold group-hover:text-[#c92127]">
              {featured.nameBlog}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm text-gray-600">
              {getExcerpt(featured.content, 200)}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              <TimeAgo createdAt={featured.createdAt} />
            </p>
          </div>
        </Link>

        {/* Các bài còn lại */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {others.map((blog) => (
            <Link
              key={blog._id}
              to={`/blog/${blog._id}`}
              className="group flex gap-3 rounded-lg border border-gray-100 p-2 transition hover:shadow-md"
            >
              <div className="h-24 w-32 shrink-0 overflow-hidden rounded bg-gray-100">
                <img
                  src={blog.image}
                  alt={blog.nameBlog}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-bold group-hover:text-[#c92127]">
                  {blog.nameBlog}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {getExcerpt(blog.content, 90)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  <TimeAgo createdAt={blog.createdAt} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestBlogs;